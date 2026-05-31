import { FormEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import PhaseStepItem from '../components/roadmap/PhaseStepItem';
import { PRIORITY_META } from '../data';
import { Phase, PhaseId, PhaseTaskItem, Step, TaskPriority, TrackMeta } from '../types';

type StepNoteMap = Record<string, string>;

const normalizePhaseName = (value: string): string => value.trim().replace(/\s+/g, ' ');

const getPhaseNameKey = (value: string): string => normalizePhaseName(value).toLocaleLowerCase('vi-VN');

const getPhaseNameError = (value: string, phaseId: PhaseId, phases: Phase[]): string => {
  const normalizedName = normalizePhaseName(value);

  if (!normalizedName) {
    return 'Tên phase không được để trống.';
  }

  const isDuplicate = phases.some(
    (phase) => phase.id !== phaseId && getPhaseNameKey(phase.label) === getPhaseNameKey(normalizedName),
  );

  if (isDuplicate) {
    return 'Tên phase đã tồn tại. Hãy chọn tên khác.';
  }

  return '';
};

interface PhaseDraftShape {
  title: string;
  note: string;
  studyMinutes: string;
  priority: TaskPriority;
}

interface PhasePageProps {
  phase: Phase;
  phases: Phase[];
  tracks: Record<string, TrackMeta>;
  trackColors: { value: string; label: string }[];
  canDeletePhase: boolean;
  doneSet: Set<string>;
  stepNotes: StepNoteMap;
  phaseTasksByPhase: Record<PhaseId, PhaseTaskItem[]>;
  phaseDrafts: Record<PhaseId, PhaseDraftShape>;
  phaseProgress: (phase: Phase) => { done: number; total: number; percent: number };
  onUpdatePhase: (phaseId: PhaseId, patch: Partial<Omit<Phase, 'id' | 'tracks'>>) => void;
  onDeletePhase: (phaseId: PhaseId) => void;
  onAddTrack: (phaseId: PhaseId) => void;
  onUpdateTrack: (trackKey: string, patch: Partial<TrackMeta>) => void;
  onDeleteTrack: (phaseId: PhaseId, trackKey: string) => void;
  onAddStep: (phaseId: PhaseId, trackKey: string) => void;
  onUpdateStep: (phaseId: PhaseId, trackKey: string, stepId: string, patch: Partial<Pick<Step, 'title' | 'detail'>>) => void;
  onDeleteStep: (phaseId: PhaseId, trackKey: string, stepId: string) => void;
  onToggleStep: (stepId: string) => void;
  onStepNoteChange: (stepId: string, note: string) => void;
  onAddPhaseTask: (event: FormEvent<HTMLFormElement>, phaseId: PhaseId) => void;
  onUpdatePhaseDraft: (phaseId: PhaseId, patch: Partial<PhaseDraftShape>) => void;
  onUpdatePhaseTask: (
    taskId: string,
    patch: Partial<Omit<PhaseTaskItem, 'id' | 'phaseId' | 'createdAt'>>,
  ) => void;
  onDeletePhaseTask: (taskId: string) => void;
  normalizeMinutes: (rawMinutes: string | number) => number;
  formatStamp: (value: string) => string;
}

function PhasePage({
  phase,
  phases,
  tracks,
  trackColors,
  canDeletePhase,
  doneSet,
  stepNotes,
  phaseTasksByPhase,
  phaseDrafts,
  phaseProgress,
  onUpdatePhase,
  onDeletePhase,
  onAddTrack,
  onUpdateTrack,
  onDeleteTrack,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onToggleStep,
  onStepNoteChange,
  onAddPhaseTask,
  onUpdatePhaseDraft,
  onUpdatePhaseTask,
  onDeletePhaseTask,
  normalizeMinutes,
  formatStamp,
}: PhasePageProps) {
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const [phaseNameDraft, setPhaseNameDraft] = useState<string>(phase.label);
  const [phaseNameTouched, setPhaseNameTouched] = useState<boolean>(false);
  const colorPickerCloseTimer = useRef<number | null>(null);
  const skipPhaseNameCommit = useRef<boolean>(false);
  const progress = phaseProgress(phase);
  const phaseTaskList = phaseTasksByPhase[phase.id] ?? [];
  const currentDraft = phaseDrafts[phase.id] ?? {
    title: '',
    note: '',
    studyMinutes: '60',
    priority: 'medium' as TaskPriority,
  };

  useEffect(() => {
    return () => {
      if (colorPickerCloseTimer.current !== null) {
        window.clearTimeout(colorPickerCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setPhaseNameDraft(phase.label);
    setPhaseNameTouched(false);
    setOpenColorPicker(null);
  }, [phase.id]);

  useEffect(() => {
    if (!phaseNameTouched) {
      setPhaseNameDraft(phase.label);
    }
  }, [phase.label, phaseNameTouched]);

  const clearColorPickerCloseTimer = (): void => {
    if (colorPickerCloseTimer.current !== null) {
      window.clearTimeout(colorPickerCloseTimer.current);
      colorPickerCloseTimer.current = null;
    }
  };

  const scheduleColorPickerClose = (): void => {
    clearColorPickerCloseTimer();
    colorPickerCloseTimer.current = window.setTimeout(() => {
      setOpenColorPicker(null);
      colorPickerCloseTimer.current = null;
    }, 180);
  };

  const toggleColorPicker = (event: MouseEvent<HTMLElement>, pickerId: string): void => {
    event.preventDefault();
    clearColorPickerCloseTimer();
    setOpenColorPicker((current) => (current === pickerId ? null : pickerId));
  };

  const phaseNameError = getPhaseNameError(phaseNameDraft, phase.id, phases);
  const showPhaseNameError = phaseNameTouched && Boolean(phaseNameError);

  const commitPhaseName = (): void => {
    if (skipPhaseNameCommit.current) {
      skipPhaseNameCommit.current = false;
      return;
    }

    setPhaseNameTouched(true);
    if (phaseNameError) {
      return;
    }

    const nextName = normalizePhaseName(phaseNameDraft);
    setPhaseNameDraft(nextName);
    setPhaseNameTouched(false);

    if (nextName !== phase.label) {
      onUpdatePhase(phase.id, { label: nextName });
    }
  };

  const handlePhaseNameKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitPhaseName();
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      skipPhaseNameCommit.current = true;
      setPhaseNameDraft(phase.label);
      setPhaseNameTouched(false);
      event.currentTarget.blur();
    }
  };

  return (
    <section className="section fade-in">
      <div>
        <div className="phase-header">
          <div>
            <p className="kicker" style={{ color: phase.color }}>
              {phase.sublabel}
            </p>
            <h2>
              {phase.label} - {phase.desc}
            </h2>
            <p className="hero-copy">{phase.goal}</p>
          </div>
          <div className="phase-summary" style={{ color: phase.color }}>
            <strong>{progress.percent}%</strong>
            <span>
              {progress.done}/{progress.total}
            </span>
          </div>
        </div>

        <section className="phase-editor-panel">
          <div className="phase-editor-head">
            <div>
              <h3>Tùy chỉnh phase</h3>
              <p>Chỉnh nội dung phase, thêm track và step ngay tại màn hình này.</p>
            </div>

            <div className="phase-editor-actions">
              <button type="button" className="ghost-btn" onClick={() => onAddTrack(phase.id)}>
                + Add Track
              </button>
              <button
                type="button"
                className="ghost-btn danger-btn"
                disabled={!canDeletePhase}
                onClick={() => onDeletePhase(phase.id)}
              >
                Xóa phase
              </button>
            </div>
          </div>

          <div className="phase-editor-grid">
            <label>
              Tên phase
              <input
                type="text"
                value={phaseNameDraft}
                className={showPhaseNameError ? 'field-invalid' : ''}
                aria-invalid={showPhaseNameError}
                aria-describedby={showPhaseNameError ? 'phase-name-error' : undefined}
                onChange={(event) => {
                  setPhaseNameDraft(event.target.value);
                  setPhaseNameTouched(true);
                }}
                onBlur={commitPhaseName}
                onKeyDown={handlePhaseNameKeyDown}
              />
              {showPhaseNameError && (
                <span id="phase-name-error" className="field-error">
                  {phaseNameError}
                </span>
              )}
            </label>

            <label>
              Nhãn thời gian
              <input
                type="text"
                value={phase.sublabel}
                onChange={(event) => onUpdatePhase(phase.id, { sublabel: event.target.value })}
                placeholder="Ví dụ: Tuần 4-6"
              />
            </label>

            <label>
              Mô tả ngắn
              <input
                type="text"
                value={phase.desc}
                onChange={(event) => onUpdatePhase(phase.id, { desc: event.target.value })}
              />
            </label>

            <label>
              Màu phase
              <details
                className="compact-color-picker"
                open={openColorPicker === 'phase'}
                onMouseEnter={clearColorPickerCloseTimer}
                onMouseLeave={scheduleColorPickerClose}
              >
                <summary aria-label="Chọn màu phase" title="Chọn màu phase" onClick={(event) => toggleColorPicker(event, 'phase')}>
                  <span className="selected-color-swatch" style={{ backgroundColor: phase.color }} />
                </summary>

                <div className="compact-color-palette">
                  {trackColors.map((colorItem) => (
                    <button
                      key={colorItem.value}
                      type="button"
                      className={`schedule-color-swatch ${phase.color === colorItem.value ? 'active' : ''}`}
                      style={{ backgroundColor: colorItem.value }}
                      onClick={() => {
                        clearColorPickerCloseTimer();
                        onUpdatePhase(phase.id, { color: colorItem.value });
                        setOpenColorPicker(null);
                      }}
                      aria-label={`Chọn màu ${colorItem.label}`}
                      title={`${colorItem.label} (${colorItem.value})`}
                    />
                  ))}
                </div>
              </details>
            </label>
          </div>

          <label className="phase-editor-goal">
            Mục tiêu phase
            <textarea
              rows={3}
              value={phase.goal}
              onChange={(event) => onUpdatePhase(phase.id, { goal: event.target.value })}
              placeholder="Tóm tắt mục tiêu, kết quả mong muốn sau phase..."
            />
          </label>
        </section>

        <div className="track-grid">
          {phase.tracks.length === 0 && (
            <p className="empty">Phase này chưa có track. Bấm Add Track để bắt đầu thêm roadmap step.</p>
          )}

          {phase.tracks.map((track) => {
            const meta = tracks[track.track] ?? { label: track.track, color: '#61dafb' };
            const doneCount = track.steps.filter((step) => doneSet.has(step.id)).length;
            const trackPickerId = `track:${track.track}`;

            return (
              <article key={track.track} className={`track-card ${openColorPicker === trackPickerId ? 'color-picker-open' : ''}`}>
                <header className="track-card-head editable">
                  <div className="track-title-edit">
                    <input
                      type="text"
                      value={meta.label}
                      onChange={(event) => onUpdateTrack(track.track, { label: event.target.value })}
                      style={{ color: meta.color }}
                      aria-label="Tên track"
                    />
                  </div>

                  <details
                    className="compact-color-picker track-color-picker"
                    open={openColorPicker === trackPickerId}
                    onMouseEnter={clearColorPickerCloseTimer}
                    onMouseLeave={scheduleColorPickerClose}
                  >
                    <summary
                      aria-label={`Chọn màu cho ${meta.label}`}
                      title={`Chọn màu cho ${meta.label}`}
                      onClick={(event) => toggleColorPicker(event, trackPickerId)}
                    >
                      <span className="selected-color-swatch" style={{ backgroundColor: meta.color }} />
                    </summary>

                    <div className="compact-color-palette">
                      {trackColors.map((colorItem) => (
                        <button
                          key={colorItem.value}
                          type="button"
                          className={`schedule-color-swatch ${meta.color === colorItem.value ? 'active' : ''}`}
                          style={{ backgroundColor: colorItem.value }}
                          onClick={() => {
                            clearColorPickerCloseTimer();
                            onUpdateTrack(track.track, { color: colorItem.value });
                            setOpenColorPicker(null);
                          }}
                          aria-label={`Chọn màu ${colorItem.label}`}
                          title={`${colorItem.label} (${colorItem.value})`}
                        />
                      ))}
                    </div>
                  </details>

                  <div className="track-inline-actions">
                    <span>
                      {doneCount}/{track.steps.length}
                    </span>
                    <button type="button" className="ghost-btn mini-action-btn" onClick={() => onAddStep(phase.id, track.track)}>
                      +
                    </button>
                    <button
                      type="button"
                      className="ghost-btn mini-action-btn danger-btn"
                      onClick={() => onDeleteTrack(phase.id, track.track)}
                    >
                      -
                    </button>
                  </div>
                </header>
                <div className="track-steps">
                  {track.steps.length === 0 && (
                    <p className="empty inline-empty">Track này chưa có step. Bấm + Step để thêm nội dung học.</p>
                  )}

                  {track.steps.map((step) => {
                    const isDone = doneSet.has(step.id);
                    const noteValue = stepNotes[step.id] ?? '';

                    return (
                      <PhaseStepItem
                        key={step.id}
                        step={step}
                        isDone={isDone}
                        noteValue={noteValue}
                        onToggle={() => onToggleStep(step.id)}
                        onNoteChange={(note) => onStepNoteChange(step.id, note)}
                        onStepChange={(patch) => onUpdateStep(phase.id, track.track, step.id, patch)}
                        onDeleteStep={() => onDeleteStep(phase.id, track.track, step.id)}
                      />
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <section className="phase-extra">
          <h3 className="phase-extra-title">Thêm task trong {phase.label}</h3>

          <form className="task-form" onSubmit={(event) => onAddPhaseTask(event, phase.id)}>
            <label>
              Tên task phase
              <input
                type="text"
                placeholder={`Ví dụ: Hoàn thành mini feature cho ${phase.label}`}
                value={currentDraft.title}
                onChange={(event) => onUpdatePhaseDraft(phase.id, { title: event.target.value })}
                required
              />
            </label>

            <label>
              Note task phase
              <textarea
                rows={3}
                value={currentDraft.note}
                onChange={(event) => onUpdatePhaseDraft(phase.id, { note: event.target.value })}
                placeholder="Ghi chú mục tiêu, blocker, link tài liệu..."
              />
            </label>

            <div className="task-form-row">
              <label>
                Thời gian học (phút)
                <input
                  type="number"
                  min={0}
                  step={15}
                  value={currentDraft.studyMinutes}
                  onChange={(event) => onUpdatePhaseDraft(phase.id, { studyMinutes: event.target.value })}
                />
              </label>

              <label>
                Ưu tiên
                <select
                  value={currentDraft.priority}
                  onChange={(event) =>
                    onUpdatePhaseDraft(phase.id, { priority: event.target.value as TaskPriority })
                  }
                >
                  {Object.entries(PRIORITY_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button className="primary-btn" type="submit">
              + Thêm task cho phase
            </button>
          </form>

          <div className="task-meta">
            <span>{phaseTaskList.length} task phase</span>
            <span>{phaseTaskList.filter((task) => !task.done).length} chưa xong</span>
            <span>{phaseTaskList.reduce((sum, task) => sum + task.studyMinutes, 0)} phút dự kiến</span>
          </div>

          <div className="task-list">
            {phaseTaskList.length === 0 && (
              <p className="empty">Phase này chưa có task riêng. Bạn có thể thêm ngay ở form phía trên.</p>
            )}

            {phaseTaskList.map((task) => (
              <article style={{ borderColor: PRIORITY_META[task.priority].color }} key={task.id} className={`task-card ${task.done ? 'done' : ''}`}>
                <header>
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(event) => onUpdatePhaseTask(task.id, { done: event.target.checked })}
                    />
                    <input
                      className="task-title-input"
                      value={task.title}
                      onChange={(event) => onUpdatePhaseTask(task.id, { title: event.target.value })}
                    />
                  </label>

                  <button type="button" className="ghost-btn" onClick={() => onDeletePhaseTask(task.id)}>
                    Xóa
                  </button>
                </header>

                <div className="task-controls">
                  <label>
                    Ưu tiên
                    <select
                      value={task.priority}
                      onChange={(event) =>
                        onUpdatePhaseTask(task.id, { priority: event.target.value as TaskPriority })
                      }
                      style={{ borderColor: PRIORITY_META[task.priority].color }}
                    >
                      {Object.entries(PRIORITY_META).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Thời gian học (phút)
                    <input
                      type="number"
                      min={0}
                      step={15}
                      value={task.studyMinutes}
                      onChange={(event) =>
                        onUpdatePhaseTask(task.id, {
                          studyMinutes: normalizeMinutes(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>

                <label>
                  Note
                  <textarea
                    rows={3}
                    value={task.note}
                    onChange={(event) => onUpdatePhaseTask(task.id, { note: event.target.value })}
                    placeholder="Ghi chú cho task phase..."
                  />
                </label>

                <footer>
                  <span style={{ color: PRIORITY_META[task.priority].color }}>{PRIORITY_META[task.priority].label}</span>
                  <span>Cập nhật: {formatStamp(task.updatedAt)}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default PhasePage;
