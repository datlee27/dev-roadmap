import { FormEvent } from 'react';
import PhaseStepItem from '../components/roadmap/PhaseStepItem';
import { PHASES, PRIORITY_META, TRACKS } from '../data';
import { Phase, PhaseId, PhaseTaskItem, TaskPriority } from '../types';

type StepNoteMap = Record<string, string>;

interface PhaseDraftShape {
  title: string;
  note: string;
  studyMinutes: string;
  priority: TaskPriority;
}

interface PhasePageProps {
  activePhaseId: PhaseId;
  doneSet: Set<string>;
  stepNotes: StepNoteMap;
  phaseTasksByPhase: Record<PhaseId, PhaseTaskItem[]>;
  phaseDrafts: Record<PhaseId, PhaseDraftShape>;
  phaseProgress: (phase: Phase) => { done: number; total: number; percent: number };
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
  activePhaseId,
  doneSet,
  stepNotes,
  phaseTasksByPhase,
  phaseDrafts,
  phaseProgress,
  onToggleStep,
  onStepNoteChange,
  onAddPhaseTask,
  onUpdatePhaseDraft,
  onUpdatePhaseTask,
  onDeletePhaseTask,
  normalizeMinutes,
  formatStamp,
}: PhasePageProps) {
  return (
    <section className="section fade-in">
      {PHASES.filter((phase) => phase.id === activePhaseId).map((phase) => {
        const progress = phaseProgress(phase);
        const phaseTaskList = phaseTasksByPhase[phase.id];
        const currentDraft = phaseDrafts[phase.id];

        return (
          <div key={phase.id}>
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

            <div className="track-grid">
              {phase.tracks.map((track) => {
                const meta = TRACKS[track.track];
                const doneCount = track.steps.filter((step) => doneSet.has(step.id)).length;

                return (
                  <article key={track.track} className="track-card">
                    <header>
                      <h3 style={{ color: meta.color }}>{meta.label}</h3>
                      <span>
                        {doneCount}/{track.steps.length}
                      </span>
                    </header>
                    <div className="track-steps">
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
                  <article key={task.id} className={`task-card ${task.done ? 'done' : ''}`}>
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
        );
      })}
    </section>
  );
}

export default PhasePage;
