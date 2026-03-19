import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';
import { PHASES, PRIORITY_META, RULES, SCHEDULE, TRACKS } from './data';
import { Phase, PhaseId, PhaseTaskItem, Step, TaskItem, TaskPriority } from './types';

const ROADMAP_STORAGE_KEY = 'dev-roadmap-v2-progress';
const LEGACY_ROADMAP_STORAGE_KEY = 'dev-roadmap-v1';
const TASK_STORAGE_KEY = 'dev-roadmap-v2-tasks';
const PHASE_TASK_STORAGE_KEY = 'dev-roadmap-v2-phase-tasks';
const STEP_NOTE_STORAGE_KEY = 'dev-roadmap-v2-step-notes';
const GENERAL_NOTE_STORAGE_KEY = 'dev-roadmap-v2-general-note';

type NavSection = 'overview' | PhaseId | 'schedule' | 'tasks' | 'notes';
type StepNoteMap = Record<string, string>;

interface TaskDraft {
  title: string;
  note: string;
  studyMinutes: string;
  priority: TaskPriority;
}

interface PhaseNoteItem {
  id: string;
  source: 'step' | 'phase-task';
  title: string;
  note: string;
  detail: string;
  updatedAt?: string;
}

const ALL_STEPS = PHASES.flatMap((phase) => phase.tracks.flatMap((track) => track.steps));

const makeDefaultDraft = (): TaskDraft => ({
  title: '',
  note: '',
  studyMinutes: '60',
  priority: 'medium',
});

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeMinutes = (rawMinutes: string | number): number => Math.max(0, Number(rawMinutes) || 0);

const sortTaskLikeItems = <T extends Pick<TaskItem, 'done' | 'priority' | 'updatedAt'>>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    const priorityDelta = PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

const makeTask = (draft: TaskDraft): TaskItem => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: draft.title.trim(),
    note: draft.note.trim(),
    studyMinutes: normalizeMinutes(draft.studyMinutes),
    priority: draft.priority,
    done: false,
    createdAt: now,
    updatedAt: now,
  };
};

const makePhaseTask = (phaseId: PhaseId, draft: TaskDraft): PhaseTaskItem => {
  const baseTask = makeTask(draft);
  return {
    ...baseTask,
    phaseId,
  };
};

const formatStamp = (value: string): string =>
  new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface PhaseStepItemProps {
  step: Step;
  isDone: boolean;
  noteValue: string;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
}

function PhaseStepItem({ step, isDone, noteValue, onToggle, onNoteChange }: PhaseStepItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showNote, setShowNote] = useState(Boolean(noteValue.trim()));

  useEffect(() => {
    if (noteValue.trim() && !showNote) {
      setShowNote(true);
    }
  }, [noteValue, showNote]);

  return (
    <article className={`phase-step-item ${isDone ? 'done' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="phase-step-head">
        <label className="phase-step-main">
          <input type="checkbox" checked={isDone} onChange={onToggle} />
          <span>{step.title}</span>
        </label>

        <div className="phase-step-actions">
          <button
            type="button"
            className={`mini-icon-btn ${showNote || noteValue.trim() ? 'active' : ''}`}
            onClick={() => setShowNote((prev) => !prev)}
            aria-label="Bật/tắt ghi chú"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 8.5h11M6.5 12h11M6.5 15.5h7" />
            </svg>
          </button>

          <button
            type="button"
            className={`mini-icon-btn ${expanded ? 'active' : ''}`}
            onClick={() => setExpanded((prev) => !prev)}
            aria-label="Mở rộng nội dung"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={expanded ? 'rotated' : ''}>
              <path d="M7 10l5 5 5-5" />
            </svg>
          </button>
        </div>
      </div>

      {(expanded || showNote) && (
        <div className="phase-step-body">
          {expanded && <p className="phase-step-detail">{step.detail}</p>}

          {showNote && (
            <label className="phase-step-note">
              <span>GHI CHU</span>
              <textarea
                rows={4}
                value={noteValue}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Ghi insight, link tài liệu, câu hỏi cần hỏi senior..."
              />
            </label>
          )}
        </div>
      )}
    </article>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [notesPhaseId, setNotesPhaseId] = useState<PhaseId>('p1');

  const [doneSet, setDoneSet] = useState<Set<string>>(() => {
    try {
      const newData = localStorage.getItem(ROADMAP_STORAGE_KEY);
      if (newData) {
        return new Set<string>(JSON.parse(newData) as string[]);
      }

      const legacyData = localStorage.getItem(LEGACY_ROADMAP_STORAGE_KEY);
      return legacyData ? new Set<string>(JSON.parse(legacyData) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const raw = localStorage.getItem(TASK_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TaskItem[]) : [];
    } catch {
      return [];
    }
  });

  const [phaseTasks, setPhaseTasks] = useState<PhaseTaskItem[]>(() => {
    try {
      const raw = localStorage.getItem(PHASE_TASK_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PhaseTaskItem[]) : [];
    } catch {
      return [];
    }
  });

  const [stepNotes, setStepNotes] = useState<StepNoteMap>(() => {
    try {
      const raw = localStorage.getItem(STEP_NOTE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StepNoteMap) : {};
    } catch {
      return {};
    }
  });

  const [generalNote, setGeneralNote] = useState<string>(() => {
    try {
      return localStorage.getItem(GENERAL_NOTE_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const [draft, setDraft] = useState<TaskDraft>(makeDefaultDraft);

  const [phaseDrafts, setPhaseDrafts] = useState<Record<PhaseId, TaskDraft>>({
    p1: makeDefaultDraft(),
    p2: makeDefaultDraft(),
    p3: makeDefaultDraft(),
  });

  useEffect(() => {
    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify([...doneSet]));
  }, [doneSet]);

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(PHASE_TASK_STORAGE_KEY, JSON.stringify(phaseTasks));
  }, [phaseTasks]);

  useEffect(() => {
    localStorage.setItem(STEP_NOTE_STORAGE_KEY, JSON.stringify(stepNotes));
  }, [stepNotes]);

  useEffect(() => {
    localStorage.setItem(GENERAL_NOTE_STORAGE_KEY, generalNote);
  }, [generalNote]);

  const toggleStep = (stepId: string): void => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const updateStepNote = (stepId: string, note: string): void => {
    setStepNotes((prev) => {
      const trimmed = note.trim();
      if (!trimmed) {
        const next = { ...prev };
        delete next[stepId];
        return next;
      }

      return {
        ...prev,
        [stepId]: note,
      };
    });
  };

  const allRoadmapDone = ALL_STEPS.filter((step) => doneSet.has(step.id)).length;
  const roadmapProgress = Math.round((allRoadmapDone / ALL_STEPS.length) * 100);

  const sortedTasks = useMemo(() => sortTaskLikeItems(tasks), [tasks]);
  const sortedPhaseTasks = useMemo(() => sortTaskLikeItems(phaseTasks), [phaseTasks]);

  const phaseTasksByPhase = useMemo(() => {
    const base: Record<PhaseId, PhaseTaskItem[]> = {
      p1: [],
      p2: [],
      p3: [],
    };

    sortedPhaseTasks.forEach((task) => {
      base[task.phaseId].push(task);
    });

    return base;
  }, [sortedPhaseTasks]);

  const openTasksTotal =
    tasks.filter((task) => !task.done).length + phaseTasks.filter((task) => !task.done).length;

  const totalStudyMinutes =
    tasks.reduce((sum, task) => sum + task.studyMinutes, 0) +
    phaseTasks.reduce((sum, task) => sum + task.studyMinutes, 0);

  const totalNotesCount =
    Object.keys(stepNotes).length +
    phaseTasks.filter((task) => task.note.trim().length > 0).length +
    tasks.filter((task) => task.note.trim().length > 0).length +
    (generalNote.trim() ? 1 : 0);

  const upsertTask = (taskId: string, patch: Partial<Omit<TaskItem, 'id' | 'createdAt'>>): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
            ...task,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
          : task,
      ),
    );
  };

  const deleteTask = (taskId: string): void => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const upsertPhaseTask = (
    taskId: string,
    patch: Partial<Omit<PhaseTaskItem, 'id' | 'phaseId' | 'createdAt'>>,
  ): void => {
    setPhaseTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
            ...task,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
          : task,
      ),
    );
  };

  const deletePhaseTask = (taskId: string): void => {
    setPhaseTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleAddTask = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    setTasks((prev) => [makeTask(draft), ...prev]);
    setDraft((prev) => ({ ...prev, title: '', note: '', studyMinutes: '60' }));
    setActiveSection('tasks');
  };

  const handleAddPhaseTask = (event: FormEvent<HTMLFormElement>, phaseId: PhaseId): void => {
    event.preventDefault();
    const currentDraft = phaseDrafts[phaseId];
    if (!currentDraft.title.trim()) {
      return;
    }

    setPhaseTasks((prev) => [makePhaseTask(phaseId, currentDraft), ...prev]);
    setPhaseDrafts((prev) => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        title: '',
        note: '',
        studyMinutes: '60',
      },
    }));
  };

  const updatePhaseDraft = (phaseId: PhaseId, patch: Partial<TaskDraft>): void => {
    setPhaseDrafts((prev) => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        ...patch,
      },
    }));
  };

  const phaseProgress = (phase: Phase): { done: number; total: number; percent: number } => {
    const phaseSteps = phase.tracks.flatMap((track) => track.steps);
    const staticDone = phaseSteps.filter((step) => doneSet.has(step.id)).length;

    const customTasks = phaseTasksByPhase[phase.id];
    const customDone = customTasks.filter((task) => task.done).length;

    const total = phaseSteps.length + customTasks.length;
    const done = staticDone + customDone;

    return {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  };

  const phaseNotes = useMemo(() => {
    const phase = PHASES.find((item) => item.id === notesPhaseId);
    if (!phase) {
      return [];
    }

    const stepNoteItems: PhaseNoteItem[] = phase.tracks.flatMap((track) => {
      return track.steps
        .map((step) => ({
          id: step.id,
          source: 'step' as const,
          title: step.title,
          note: stepNotes[step.id] ?? '',
          detail: `${TRACKS[track.track].label} · ${phase.label}`,
        }))
        .filter((item) => item.note.trim().length > 0);
    });

    const phaseTaskNoteItems: PhaseNoteItem[] = phaseTasksByPhase[notesPhaseId]
      .filter((task) => task.note.trim().length > 0)
      .map((task) => ({
        id: task.id,
        source: 'phase-task' as const,
        title: task.title,
        note: task.note,
        detail: `${phase.label} · ${PRIORITY_META[task.priority].label} · ${task.studyMinutes} phút`,
        updatedAt: task.updatedAt,
      }));

    return [...phaseTaskNoteItems, ...stepNoteItems];
  }, [notesPhaseId, phaseTasksByPhase, stepNotes]);

  const sections: { id: NavSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'p1', label: 'Phase 1' },
    { id: 'p2', label: 'Phase 2' },
    { id: 'p3', label: 'Phase 3' },
    { id: 'schedule', label: 'Lịch học' },
    { id: 'tasks', label: 'Task List' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">DAT DEV MAP</div>
        <nav className="topnav">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="progress-chip">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${roadmapProgress}%` }} />
          </div>
          <span>{roadmapProgress}%</span>
        </div>
      </header>

      <main className="content">
        {activeSection === 'overview' && (
          <section className="section fade-in">
            <div className="hero">
              <p className="kicker">Lộ trình học + theo dõi task thực chiến</p>
              <h1>
                React + Vite + TSX
                <br />
                <span>Roadmap 3 tháng có theo dõi tiến độ thật.</span>
              </h1>
              <p className="hero-copy">
                Đánh dấu roadmap, thêm task trong từng phase, ghi chú theo từng bước và gom toàn bộ ghi chú ở tab
                Notes để ôn lại nhanh.
              </p>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <strong>{PHASES.length}</strong>
                <p>Phases</p>
              </article>
              <article className="stat-card">
                <strong>{ALL_STEPS.length}</strong>
                <p>Bước roadmap</p>
              </article>
              <article className="stat-card">
                <strong>{phaseTasks.length}</strong>
                <p>Task trong phase</p>
              </article>
              <article className="stat-card">
                <strong>{openTasksTotal}</strong>
                <p>Tổng task mở</p>
              </article>
              <article className="stat-card">
                <strong>{(totalStudyMinutes / 60).toFixed(1)}h</strong>
                <p>Tổng giờ học</p>
              </article>
              <article className="stat-card">
                <strong>{totalNotesCount}</strong>
                <p>Tổng ghi chú</p>
              </article>
            </div>

            <div className="phase-grid">
              {PHASES.map((phase) => {
                const progress = phaseProgress(phase);
                return (
                  <button
                    key={phase.id}
                    className="phase-card"
                    type="button"
                    onClick={() => setActiveSection(phase.id)}
                    style={{ '--phase-color': phase.color } as CSSProperties}
                  >
                    <p className="phase-week">{phase.sublabel}</p>
                    <h3>{phase.label}</h3>
                    <p className="phase-desc">{phase.desc}</p>
                    <p className="phase-goal">{phase.goal}</p>
                    <div className="phase-progress">
                      <div className="phase-progress-track">
                        <div className="phase-progress-fill" style={{ width: `${progress.percent}%` }} />
                      </div>
                      <span>
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rule-grid">
              {RULES.map((rule) => (
                <article key={rule.title} className="rule-card">
                  <span>{rule.emoji}</span>
                  <div>
                    <h4>{rule.title}</h4>
                    <p>{rule.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {(activeSection === 'p1' || activeSection === 'p2' || activeSection === 'p3') && (
          <section className="section fade-in">
            {PHASES.filter((phase) => phase.id === activeSection).map((phase) => {
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
                                  onToggle={() => toggleStep(step.id)}
                                  onNoteChange={(note) => updateStepNote(step.id, note)}
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

                    <form className="task-form" onSubmit={(event) => handleAddPhaseTask(event, phase.id)}>
                      <label>
                        Tên task phase
                        <input
                          type="text"
                          placeholder={`Ví dụ: Hoàn thành mini feature cho ${phase.label}`}
                          value={currentDraft.title}
                          onChange={(event) => updatePhaseDraft(phase.id, { title: event.target.value })}
                          required
                        />
                      </label>

                      <label>
                        Note task phase
                        <textarea
                          rows={3}
                          value={currentDraft.note}
                          onChange={(event) => updatePhaseDraft(phase.id, { note: event.target.value })}
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
                            onChange={(event) =>
                              updatePhaseDraft(phase.id, { studyMinutes: event.target.value })
                            }
                          />
                        </label>

                        <label>
                          Ưu tiên
                          <select
                            value={currentDraft.priority}
                            onChange={(event) =>
                              updatePhaseDraft(phase.id, { priority: event.target.value as TaskPriority })
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
                      <span>
                        {phaseTaskList.reduce((sum, task) => sum + task.studyMinutes, 0)} phút dự kiến
                      </span>
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
                                onChange={(event) =>
                                  upsertPhaseTask(task.id, { done: event.target.checked })
                                }
                              />
                              <input
                                className="task-title-input"
                                value={task.title}
                                onChange={(event) =>
                                  upsertPhaseTask(task.id, { title: event.target.value })
                                }
                              />
                            </label>

                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={() => deletePhaseTask(task.id)}
                            >
                              Xóa
                            </button>
                          </header>

                          <div className="task-controls">
                            <label>
                              Ưu tiên
                              <select
                                value={task.priority}
                                onChange={(event) =>
                                  upsertPhaseTask(task.id, { priority: event.target.value as TaskPriority })
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
                                  upsertPhaseTask(task.id, {
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
                              onChange={(event) => upsertPhaseTask(task.id, { note: event.target.value })}
                              placeholder="Ghi chú cho task phase..."
                            />
                          </label>

                          <footer>
                            <span style={{ color: PRIORITY_META[task.priority].color }}>
                              {PRIORITY_META[task.priority].label}
                            </span>
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
        )}

        {activeSection === 'schedule' && (
          <section className="section fade-in">
            <p className="kicker">Lịch học cố định</p>
            <h2>Lịch hàng ngày</h2>
            <div className="schedule-grid">
              {SCHEDULE.map((day) => (
                <article key={day.day} className="schedule-card" style={{ '--day-color': day.color } as CSSProperties}>
                  <h3>{day.day}</h3>
                  {day.slots.map((slot) => (
                    <div key={`${day.day}-${slot.time}-${slot.label}`} className="slot-row">
                      <p className="slot-time" style={{ color: slot.color }}>
                        {slot.time}
                      </p>
                      <div>
                        <strong>{slot.label}</strong>
                        <p>{slot.desc}</p>
                      </div>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'tasks' && (
          <section className="section fade-in">
            <p className="kicker">Task Manager</p>
            <h2>Thêm và quản lý task học tập</h2>

            <form className="task-form" onSubmit={handleAddTask}>
              <label>
                Tên task
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàn thành API login"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>

              <label>
                Note
                <textarea
                  placeholder="Ghi chú nhanh, link tài liệu, blockers..."
                  value={draft.note}
                  onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
                  rows={3}
                />
              </label>

              <div className="task-form-row">
                <label>
                  Thời gian học (phút)
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={draft.studyMinutes}
                    onChange={(event) => setDraft((prev) => ({ ...prev, studyMinutes: event.target.value }))}
                  />
                </label>

                <label>
                  Ưu tiên
                  <select
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
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
                + Thêm task
              </button>
            </form>

            <div className="task-meta">
              <span>{tasks.length} task</span>
              <span>{tasks.filter((task) => !task.done).length} chưa xong</span>
              <span>{tasks.reduce((sum, task) => sum + task.studyMinutes, 0)} phút dự kiến</span>
            </div>

            <div className="task-list">
              {sortedTasks.length === 0 && <p className="empty">Chưa có task nào. Thêm task đầu tiên để bắt đầu.</p>}

              {sortedTasks.map((task) => (
                <article key={task.id} className={`task-card ${task.done ? 'done' : ''}`}>
                  <header>
                    <label className="task-check">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(event) => upsertTask(task.id, { done: event.target.checked })}
                      />
                      <input
                        className="task-title-input"
                        value={task.title}
                        onChange={(event) => upsertTask(task.id, { title: event.target.value })}
                      />
                    </label>

                    <button type="button" className="ghost-btn" onClick={() => deleteTask(task.id)}>
                      Xóa
                    </button>
                  </header>

                  <div className="task-controls">
                    <label>
                      Ưu tiên
                      <select
                        value={task.priority}
                        onChange={(event) => upsertTask(task.id, { priority: event.target.value as TaskPriority })}
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
                          upsertTask(task.id, {
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
                      onChange={(event) => upsertTask(task.id, { note: event.target.value })}
                      placeholder="Ghi chú cho task này..."
                    />
                  </label>

                  <footer>
                    <span style={{ color: PRIORITY_META[task.priority].color }}>
                      {PRIORITY_META[task.priority].label}
                    </span>
                    <span>Cập nhật: {formatStamp(task.updatedAt)}</span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'notes' && (
          <section className="section fade-in">
            <p className="kicker">Notes Hub</p>
            <h2>Tổng hợp ghi chú theo phase</h2>

            <div className="notes-layout">
              <article className="notes-panel">
                <label className="notes-select">
                  Chọn phase để xem tất cả ghi chú
                  <select
                    value={notesPhaseId}
                    onChange={(event) => setNotesPhaseId(event.target.value as PhaseId)}
                  >
                    {PHASES.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.label} - {phase.sublabel}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="notes-helper">{phaseNotes.length} ghi chú trong phase đang chọn.</p>

                <div className="notes-list">
                  {phaseNotes.length === 0 && (
                    <p className="empty">Phase này chưa có ghi chú. Hãy thêm note tại bước học hoặc task phase.</p>
                  )}

                  {phaseNotes.map((item) => (
                    <article key={item.id} className="note-item">
                      <header>
                        <strong>{item.title}</strong>
                        <span className={`note-tag ${item.source}`}>
                          {item.source === 'phase-task' ? 'Task phase' : 'Step note'}
                        </span>
                      </header>
                      <p>{item.note}</p>
                      <footer>
                        <span>{item.detail}</span>
                        {item.updatedAt && <span>{formatStamp(item.updatedAt)}</span>}
                      </footer>
                    </article>
                  ))}
                </div>
              </article>

              <article className="notes-panel">
                <h3>Ghi chú chung</h3>
                <p className="notes-helper">Nơi ghi mục tiêu tuần, blockers tổng, plan ôn tập chung.</p>
                <textarea
                  className="general-note"
                  rows={16}
                  value={generalNote}
                  onChange={(event) => setGeneralNote(event.target.value)}
                  placeholder="Ví dụ: Tuần này tập trung hoàn tất auth flow + 5 bài LeetCode..."
                />
                <p className="notes-helper">
                  {generalNote.trim() ? 'Đã lưu tự động vào localStorage.' : 'Chưa có ghi chú chung.'}
                </p>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
