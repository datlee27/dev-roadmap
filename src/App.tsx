import { CSSProperties, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import AppFooter from './components/layout/AppFooter';
import AppHeader from './components/layout/AppHeader';
import LeftDashboard from './components/layout/LeftDashboard';
import { NavItem, NavSection } from './@types/navigation';
import { ScheduleDayId, ScheduleDraft, ScheduleEventItem, ScheduleTimelineItem, WeekDayItem } from './@types/schedule';
import { DEFAULT_ROADMAP_CONFIG, PRIORITY_META } from './data';
import AppLayout from './layouts/AppLayout';
import NotesPage from './pages/NotesPage';
import OverviewPage from './pages/OverviewPage';
import PhasePage from './pages/PhasePage';
import SchedulePage from './pages/SchedulePage';
import TasksPage from './pages/TasksPage';
import { Phase, PhaseId, PhaseTaskItem, RoadmapConfig, TaskItem, TaskPriority, TrackMeta } from './types';

const ROADMAP_STORAGE_KEY = 'dev-roadmap-v2-progress';
const LEGACY_ROADMAP_STORAGE_KEY = 'dev-roadmap-v1';
const TASK_STORAGE_KEY = 'dev-roadmap-v2-tasks';
const PHASE_TASK_STORAGE_KEY = 'dev-roadmap-v2-phase-tasks';
const STEP_NOTE_STORAGE_KEY = 'dev-roadmap-v2-step-notes';
const GENERAL_NOTE_STORAGE_KEY = 'dev-roadmap-v2-general-note';
const SCHEDULE_STORAGE_KEY = 'dev-roadmap-v3-schedule';
const SCHEDULE_TIMELINE_STORAGE_KEY = 'dev-roadmap-v3-schedule-timeline';
const ROADMAP_CONFIG_STORAGE_KEY = 'dev-roadmap-v4-config';
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

const WEEK_DAYS: WeekDayItem[] = [
  { id: 'mon', label: 'Thứ 2', shortLabel: 'Mon' },
  { id: 'tue', label: 'Thứ 3', shortLabel: 'Tue' },
  { id: 'wed', label: 'Thứ 4', shortLabel: 'Wed' },
  { id: 'thu', label: 'Thứ 5', shortLabel: 'Thu' },
  { id: 'fri', label: 'Thứ 6', shortLabel: 'Fri' },
  { id: 'sat', label: 'Thứ 7', shortLabel: 'Sat' },
  { id: 'sun', label: 'Chủ nhật', shortLabel: 'Sun' },
];

const DAY_ORDER: Record<ScheduleDayId, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

const CALENDAR_START_HOUR = 6;
const CALENDAR_END_HOUR = 23;
const CALENDAR_SLOT_MINUTES = 30;
const CALENDAR_START_MINUTE = CALENDAR_START_HOUR * 60;
const CALENDAR_END_MINUTE = CALENDAR_END_HOUR * 60;
const CALENDAR_SLOT_COUNT = (CALENDAR_END_MINUTE - CALENDAR_START_MINUTE) / CALENDAR_SLOT_MINUTES;
const CALENDAR_HOUR_MARKERS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, index) => CALENDAR_START_HOUR + index,
);
const SCHEDULE_COLORS: { value: string; label: string }[] = [
  { value: '#61dafb', label: 'Sky' },
  { value: '#f89820', label: 'Orange' },
  { value: '#ff6b35', label: 'Coral' },
  { value: '#34d399', label: 'Mint' },
  { value: '#c084fc', label: 'Violet' },
  { value: '#f0da48', label: 'Amber' },
  { value: '#ff7a90', label: 'Rose' },
];

const DEFAULT_SCHEDULE_EVENTS: Omit<ScheduleEventItem, 'id' | 'updatedAt'>[] = [
  { title: 'Ở công ty (intern)', day: 'mon', startMinute: 10 * 60, endMinute: 17 * 60, color: '#61dafb', note: 'React task + học từ codebase.' },
  { title: 'Backend thực hành', day: 'mon', startMinute: 19 * 60, endMinute: 20 * 60 + 30, color: '#f89820', note: 'Lý thuyết 30p + code 60p.' },
  { title: 'LeetCode', day: 'mon', startMinute: 20 * 60 + 30, endMinute: 21 * 60 + 15, color: '#ff6b35', note: '1 bài/ngày.' },
  { title: 'Intern + học tại công ty', day: 'tue', startMinute: 10 * 60, endMinute: 17 * 60, color: '#61dafb', note: '' },
  { title: 'Backend API', day: 'wed', startMinute: 19 * 60, endMinute: 20 * 60 + 30, color: '#f89820', note: 'Test Postman sau mỗi API.' },
  { title: 'React side project', day: 'thu', startMinute: 21 * 60 + 15, endMinute: 22 * 60 + 30, color: '#61dafb', note: 'Build feature thực chiến.' },
  { title: 'IELTS', day: 'fri', startMinute: 21 * 60 + 15, endMinute: 21 * 60 + 45, color: '#c084fc', note: 'Listening + shadowing.' },
  { title: 'Deep work project', day: 'sat', startMinute: 8 * 60, endMinute: 12 * 60, color: '#34d399', note: 'Build từ BE -> FE -> test.' },
  { title: 'Docker', day: 'sat', startMinute: 14 * 60, endMinute: 15 * 60, color: '#2496ed', note: 'Dockerfile / Compose.' },
  { title: 'Review tuần + IELTS', day: 'sun', startMinute: 9 * 60, endMinute: 11 * 60, color: '#c084fc', note: 'Ôn tập, không học mới.' },
];

const DEFAULT_TRACK_COLOR = '#61dafb';

const makeDefaultDraft = (): TaskDraft => ({
  title: '',
  note: '',
  studyMinutes: '60',
  priority: 'medium',
});

const makeDefaultScheduleDraft = (): ScheduleDraft => ({
  title: '',
  day: 'mon',
  start: '19:00',
  end: '20:30',
  color: SCHEDULE_COLORS[0].value,
  note: '',
});

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeMinutes = (rawMinutes: string | number): number => Math.max(0, Number(rawMinutes) || 0);

const parseClockTime = (value: string): number | null => {
  const normalized = value.trim();
  const matches = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!matches) {
    return null;
  }

  const hours = Number(matches[1]);
  const minutes = Number(matches[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatClockTime = (minutes: number): string => {
  const safeMinutes = Math.max(0, minutes);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const sortScheduleItems = (items: ScheduleEventItem[]): ScheduleEventItem[] => {
  return [...items].sort((a, b) => {
    const dayDelta = DAY_ORDER[a.day] - DAY_ORDER[b.day];
    if (dayDelta !== 0) {
      return dayDelta;
    }

    if (a.startMinute !== b.startMinute) {
      return a.startMinute - b.startMinute;
    }

    if (a.endMinute !== b.endMinute) {
      return a.endMinute - b.endMinute;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

const sortScheduleTimelineItems = (items: ScheduleTimelineItem[]): ScheduleTimelineItem[] => {
  return [...items].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeRoadmapConfig = (value: unknown): RoadmapConfig | null => {
  if (!isRecord(value) || !Array.isArray(value.phases)) {
    return null;
  }

  const rawTracks = isRecord(value.tracks) ? value.tracks : {};
  const normalizedTracks: Record<string, TrackMeta> = {};
  Object.entries(rawTracks).forEach(([trackKey, trackMeta]) => {
    if (!isRecord(trackMeta)) {
      return;
    }

    const label = typeof trackMeta.label === 'string' ? trackMeta.label.trim() : '';
    const color = typeof trackMeta.color === 'string' ? trackMeta.color.trim() : '';
    if (!label) {
      return;
    }

    normalizedTracks[trackKey] = {
      label,
      color: color || DEFAULT_TRACK_COLOR,
    };
  });

  const uniquePhaseIds = new Set<string>();
  const normalizedPhases: Phase[] = value.phases
    .map((phaseItem) => {
      if (!isRecord(phaseItem)) {
        return null;
      }

      const id = typeof phaseItem.id === 'string' ? phaseItem.id.trim() : '';
      const label = typeof phaseItem.label === 'string' ? phaseItem.label.trim() : '';
      const sublabel = typeof phaseItem.sublabel === 'string' ? phaseItem.sublabel.trim() : '';
      const desc = typeof phaseItem.desc === 'string' ? phaseItem.desc.trim() : '';
      const goal = typeof phaseItem.goal === 'string' ? phaseItem.goal.trim() : '';
      const color = typeof phaseItem.color === 'string' ? phaseItem.color.trim() : '';
      const rawTrackPlans = Array.isArray(phaseItem.tracks) ? phaseItem.tracks : [];

      if (!id || !label || uniquePhaseIds.has(id)) {
        return null;
      }

      const trackPlans = rawTrackPlans
        .map((trackPlanItem) => {
          if (!isRecord(trackPlanItem)) {
            return null;
          }

          const track = typeof trackPlanItem.track === 'string' ? trackPlanItem.track.trim() : '';
          const rawSteps = Array.isArray(trackPlanItem.steps) ? trackPlanItem.steps : [];
          if (!track) {
            return null;
          }

          const steps = rawSteps
            .map((stepItem) => {
              if (!isRecord(stepItem)) {
                return null;
              }

              const stepId = typeof stepItem.id === 'string' ? stepItem.id.trim() : '';
              const title = typeof stepItem.title === 'string' ? stepItem.title.trim() : '';
              const detail = typeof stepItem.detail === 'string' ? stepItem.detail.trim() : '';
              if (!stepId || !title) {
                return null;
              }

              return {
                id: stepId,
                title,
                detail,
              };
            })
            .filter((step): step is NonNullable<typeof step> => step !== null);

          if (steps.length === 0) {
            return null;
          }

          return {
            track,
            steps,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (trackPlans.length === 0) {
        return null;
      }

      uniquePhaseIds.add(id);
      return {
        id,
        label,
        sublabel,
        desc,
        goal,
        color: color || DEFAULT_TRACK_COLOR,
        tracks: trackPlans,
      };
    })
    .filter((phase): phase is Phase => phase !== null);

  if (normalizedPhases.length === 0) {
    return null;
  }

  normalizedPhases.forEach((phase) => {
    phase.tracks.forEach((trackPlan) => {
      if (!normalizedTracks[trackPlan.track]) {
        normalizedTracks[trackPlan.track] = {
          label: trackPlan.track,
          color: DEFAULT_TRACK_COLOR,
        };
      }
    });
  });

  return {
    phases: normalizedPhases,
    tracks: normalizedTracks,
  };
};

const loadInitialRoadmapConfig = (): RoadmapConfig => {
  try {
    const raw = localStorage.getItem(ROADMAP_CONFIG_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ROADMAP_CONFIG;
    }

    const parsed = JSON.parse(raw) as unknown;
    return normalizeRoadmapConfig(parsed) ?? DEFAULT_ROADMAP_CONFIG;
  } catch {
    return DEFAULT_ROADMAP_CONFIG;
  }
};

const createPhaseDraftMap = (
  phaseIds: PhaseId[],
  previous: Record<PhaseId, TaskDraft> = {},
): Record<PhaseId, TaskDraft> => {
  const next: Record<PhaseId, TaskDraft> = {};
  phaseIds.forEach((phaseId) => {
    next[phaseId] = previous[phaseId] ?? makeDefaultDraft();
  });
  return next;
};

const withAlpha = (hexColor: string, alphaHex: string): string => {
  if (/^#[\da-fA-F]{6}$/.test(hexColor)) {
    return `${hexColor}${alphaHex}`;
  }

  return '#1a2430';
};

const clampScheduleStart = (startMinute: number, durationMinute: number): number => {
  const maxStart = CALENDAR_END_MINUTE - durationMinute;
  return Math.max(CALENDAR_START_MINUTE, Math.min(startMinute, Math.max(CALENDAR_START_MINUTE, maxStart)));
};

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

function App() {
  const [roadmapConfig, setRoadmapConfig] = useState<RoadmapConfig>(loadInitialRoadmapConfig);
  const phases = roadmapConfig.phases;
  const tracks = roadmapConfig.tracks;
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [notesPhaseId, setNotesPhaseId] = useState<PhaseId>(() => roadmapConfig.phases[0]?.id ?? 'p1');
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(true);

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

  const [phaseDrafts, setPhaseDrafts] = useState<Record<PhaseId, TaskDraft>>(() =>
    createPhaseDraftMap(roadmapConfig.phases.map((phase) => phase.id)),
  );
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventItem[]>(() => {
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (raw) {
        return sortScheduleItems(JSON.parse(raw) as ScheduleEventItem[]);
      }
    } catch {
      // Fallback to default schedule when local data is invalid.
    }

    const now = new Date().toISOString();
    return sortScheduleItems(
      DEFAULT_SCHEDULE_EVENTS.map((item) => ({
        ...item,
        id: createId(),
        updatedAt: now,
      })),
    );
  });
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft>(makeDefaultScheduleDraft);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string>('');
  const [draggingScheduleId, setDraggingScheduleId] = useState<string | null>(null);
  const [roadmapConfigError, setRoadmapConfigError] = useState<string>('');
  const [scheduleTimeline, setScheduleTimeline] = useState<ScheduleTimelineItem[]>(() => {
    try {
      const raw = localStorage.getItem(SCHEDULE_TIMELINE_STORAGE_KEY);
      return raw ? sortScheduleTimelineItems(JSON.parse(raw) as ScheduleTimelineItem[]) : [];
    } catch {
      return [];
    }
  });
  const phaseIds = useMemo(() => phases.map((phase) => phase.id), [phases]);

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

  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleEvents));
  }, [scheduleEvents]);

  useEffect(() => {
    localStorage.setItem(SCHEDULE_TIMELINE_STORAGE_KEY, JSON.stringify(scheduleTimeline));
  }, [scheduleTimeline]);

  useEffect(() => {
    localStorage.setItem(ROADMAP_CONFIG_STORAGE_KEY, JSON.stringify(roadmapConfig));
  }, [roadmapConfig]);

  useEffect(() => {
    setPhaseDrafts((prev) => {
      const next = createPhaseDraftMap(phaseIds, prev);
      const prevKeys = Object.keys(prev);
      const sameShape = prevKeys.length === phaseIds.length && phaseIds.every((phaseId) => phaseId in prev);
      const sameValues = sameShape && phaseIds.every((phaseId) => prev[phaseId] === next[phaseId]);
      return sameValues ? prev : next;
    });

    setNotesPhaseId((prev) => (phaseIds.includes(prev) ? prev : phaseIds[0] ?? prev));
    setActiveSection((prev) => {
      if (prev === 'overview' || prev === 'schedule' || prev === 'tasks' || prev === 'notes') {
        return prev;
      }

      return phaseIds.includes(prev) ? prev : 'overview';
    });
  }, [phaseIds]);

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

  const allSteps = useMemo(() => phases.flatMap((phase) => phase.tracks.flatMap((track) => track.steps)), [phases]);
  const allRoadmapDone = allSteps.filter((step) => doneSet.has(step.id)).length;
  const roadmapProgress = allSteps.length > 0 ? Math.round((allRoadmapDone / allSteps.length) * 100) : 0;

  const sortedTasks = useMemo(() => sortTaskLikeItems(tasks), [tasks]);
  const sortedPhaseTasks = useMemo(() => sortTaskLikeItems(phaseTasks), [phaseTasks]);

  const phaseTasksByPhase = useMemo(() => {
    const base: Record<PhaseId, PhaseTaskItem[]> = {};
    phaseIds.forEach((phaseId) => {
      base[phaseId] = [];
    });

    sortedPhaseTasks.forEach((task) => {
      if (!base[task.phaseId]) {
        base[task.phaseId] = [];
      }
      base[task.phaseId].push(task);
    });

    return base;
  }, [phaseIds, sortedPhaseTasks]);

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
    const currentDraft = phaseDrafts[phaseId] ?? makeDefaultDraft();
    if (!currentDraft.title.trim()) {
      return;
    }

    setPhaseTasks((prev) => [makePhaseTask(phaseId, currentDraft), ...prev]);
    setPhaseDrafts((prev) => ({
      ...prev,
      [phaseId]: {
        ...(prev[phaseId] ?? makeDefaultDraft()),
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
        ...(prev[phaseId] ?? makeDefaultDraft()),
        ...patch,
      },
    }));
  };

  const scheduleEventsByDay = useMemo(() => {
    const base: Record<ScheduleDayId, ScheduleEventItem[]> = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    scheduleEvents.forEach((item) => {
      base[item.day].push(item);
    });

    Object.keys(base).forEach((dayKey) => {
      const dayId = dayKey as ScheduleDayId;
      base[dayId].sort((a, b) => a.startMinute - b.startMinute);
    });

    return base;
  }, [scheduleEvents]);

  const resetScheduleDraft = (): void => {
    setScheduleDraft(makeDefaultScheduleDraft());
    setEditingScheduleId(null);
    setScheduleError('');
  };

  const readScheduleRange = (draftItem: ScheduleDraft): { startMinute: number; endMinute: number } | null => {
    const startMinute = parseClockTime(draftItem.start);
    const endMinute = parseClockTime(draftItem.end);

    if (startMinute === null || endMinute === null) {
      setScheduleError('Giờ không hợp lệ. Dùng định dạng HH:MM, ví dụ 19:30.');
      return null;
    }

    if (endMinute <= startMinute) {
      setScheduleError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
      return null;
    }

    if (startMinute < CALENDAR_START_MINUTE || endMinute > CALENDAR_END_MINUTE) {
      setScheduleError(
        `Lịch đang hiển thị khung ${formatClockTime(CALENDAR_START_MINUTE)}-${formatClockTime(CALENDAR_END_MINUTE)}.`,
      );
      return null;
    }

    return { startMinute, endMinute };
  };

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!scheduleDraft.title.trim()) {
      setScheduleError('Bạn cần nhập tên lịch học.');
      return;
    }

    const range = readScheduleRange(scheduleDraft);
    if (!range) {
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      title: scheduleDraft.title.trim(),
      day: scheduleDraft.day,
      startMinute: range.startMinute,
      endMinute: range.endMinute,
      color: scheduleDraft.color,
      note: scheduleDraft.note.trim(),
      updatedAt: now,
    };

    if (editingScheduleId) {
      setScheduleEvents((prev) =>
        sortScheduleItems(
          prev.map((item) =>
            item.id === editingScheduleId
              ? {
                ...item,
                ...payload,
              }
              : item,
          ),
        ),
      );
    } else {
      setScheduleEvents((prev) =>
        sortScheduleItems([
          ...prev,
          {
            id: createId(),
            ...payload,
          },
        ]),
      );
    }

    resetScheduleDraft();
  };

  const deleteScheduleEvent = (scheduleId: string): void => {
    setScheduleEvents((prev) => prev.filter((item) => item.id !== scheduleId));
    if (editingScheduleId === scheduleId) {
      resetScheduleDraft();
    }
  };

  const editScheduleEvent = (scheduleItem: ScheduleEventItem): void => {
    setEditingScheduleId(scheduleItem.id);
    setScheduleDraft({
      title: scheduleItem.title,
      day: scheduleItem.day,
      start: formatClockTime(scheduleItem.startMinute),
      end: formatClockTime(scheduleItem.endMinute),
      color: scheduleItem.color,
      note: scheduleItem.note,
    });
    setScheduleError('');
  };

  const nudgeScheduleEvent = (scheduleId: string, deltaMinutes: number): void => {
    setScheduleEvents((prev) =>
      sortScheduleItems(
        prev.map((item) => {
          if (item.id !== scheduleId) {
            return item;
          }

          const duration = item.endMinute - item.startMinute;
          const nextStart = clampScheduleStart(item.startMinute + deltaMinutes, duration);
          return {
            ...item,
            startMinute: nextStart,
            endMinute: nextStart + duration,
            updatedAt: new Date().toISOString(),
          };
        }),
      ),
    );
  };

  const completeScheduleEvent = (scheduleId: string): void => {
    const selectedItem = scheduleEvents.find((item) => item.id === scheduleId);
    if (!selectedItem) {
      return;
    }

    const completedAt = new Date().toISOString();
    setScheduleTimeline((prev) =>
      sortScheduleTimelineItems([
        {
          id: createId(),
          title: selectedItem.title,
          day: selectedItem.day,
          startMinute: selectedItem.startMinute,
          endMinute: selectedItem.endMinute,
          note: selectedItem.note,
          color: selectedItem.color,
          completedAt,
        },
        ...prev,
      ]),
    );
    setScheduleEvents((prev) => prev.filter((item) => item.id !== scheduleId));

    if (editingScheduleId === scheduleId) {
      resetScheduleDraft();
    }
  };

  const handleScheduleDragStart = (
    dragEvent: DragEvent<HTMLElement>,
    scheduleId: string,
  ): void => {
    dragEvent.dataTransfer.setData('text/schedule-event-id', scheduleId);
    dragEvent.dataTransfer.setData('text/plain', scheduleId);
    dragEvent.dataTransfer.effectAllowed = 'move';
    setDraggingScheduleId(scheduleId);
  };

  const handleScheduleDragOver = (dragEvent: DragEvent<HTMLDivElement>): void => {
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = 'move';
  };

  const handleScheduleDrop = (dragEvent: DragEvent<HTMLDivElement>, dayId: ScheduleDayId): void => {
    dragEvent.preventDefault();
    const scheduleId =
      dragEvent.dataTransfer.getData('text/schedule-event-id') || dragEvent.dataTransfer.getData('text/plain');
    if (!scheduleId) {
      setDraggingScheduleId(null);
      return;
    }

    const selectedItem = scheduleEvents.find((item) => item.id === scheduleId);
    if (!selectedItem) {
      setDraggingScheduleId(null);
      return;
    }

    const columnRect = dragEvent.currentTarget.getBoundingClientRect();
    const relativeY = Math.min(Math.max(dragEvent.clientY - columnRect.top, 0), columnRect.height);
    const targetSlotIndex = Math.min(
      CALENDAR_SLOT_COUNT - 1,
      Math.max(0, Math.floor((relativeY / columnRect.height) * CALENDAR_SLOT_COUNT)),
    );
    const rawStartMinute = CALENDAR_START_MINUTE + targetSlotIndex * CALENDAR_SLOT_MINUTES;
    const duration = selectedItem.endMinute - selectedItem.startMinute;
    const nextStart = clampScheduleStart(rawStartMinute, duration);

    setScheduleEvents((prev) =>
      sortScheduleItems(
        prev.map((item) =>
          item.id === scheduleId
            ? {
              ...item,
              day: dayId,
              startMinute: nextStart,
              endMinute: nextStart + duration,
              updatedAt: new Date().toISOString(),
            }
            : item,
        ),
      ),
    );
    setDraggingScheduleId(null);
  };

  const getScheduleEventStyle = (item: ScheduleEventItem): CSSProperties => {
    const totalMinutes = CALENDAR_END_MINUTE - CALENDAR_START_MINUTE;
    const topPercent = ((item.startMinute - CALENDAR_START_MINUTE) / totalMinutes) * 100;
    const heightPercent = ((item.endMinute - item.startMinute) / totalMinutes) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 4)}%`,
      borderColor: item.color,
      background: `linear-gradient(155deg, ${withAlpha(item.color, '4a')} 0%, ${withAlpha(item.color, '26')} 100%)`,
      boxShadow: `0 10px 24px ${withAlpha(item.color, '2e')}`,
    };
  };

  const applyRoadmapConfig = (rawConfig: string): void => {
    try {
      const parsed = JSON.parse(rawConfig) as unknown;
      const normalized = normalizeRoadmapConfig(parsed);
      if (!normalized) {
        setRoadmapConfigError(
          'Config không hợp lệ. Cần có tracks + phases, mỗi phase có track và step (id/title/detail).',
        );
        return;
      }

      setRoadmapConfig(normalized);
      setRoadmapConfigError('');
    } catch {
      setRoadmapConfigError('JSON không hợp lệ. Hãy kiểm tra dấu phẩy, dấu ngoặc hoặc dấu nháy.');
    }
  };

  const resetRoadmapConfig = (): void => {
    setRoadmapConfig(DEFAULT_ROADMAP_CONFIG);
    setRoadmapConfigError('');
  };

  const phaseProgress = (phase: Phase): { done: number; total: number; percent: number } => {
    const phaseSteps = phase.tracks.flatMap((track) => track.steps);
    const staticDone = phaseSteps.filter((step) => doneSet.has(step.id)).length;

    const customTasks = phaseTasksByPhase[phase.id] ?? [];
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
    const phase = phases.find((item) => item.id === notesPhaseId);
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
          detail: `${(tracks[track.track]?.label ?? track.track)} · ${phase.label}`,
        }))
        .filter((item) => item.note.trim().length > 0);
    });

    const phaseTaskNoteItems: PhaseNoteItem[] = (phaseTasksByPhase[notesPhaseId] ?? [])
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
  }, [notesPhaseId, phaseTasksByPhase, phases, stepNotes, tracks]);

  const topNavSections: NavItem[] = [
    { id: 'overview', label: 'Overview' },
    ...phases.map((phase) => ({
      id: phase.id,
      label: phase.label,
    })),
  ];

  const dashboardSections: NavItem[] = [
    { id: 'schedule', label: 'Lịch học' },
    { id: 'tasks', label: 'Task List' },
    { id: 'notes', label: 'Notes' },
  ];
  const activePhase = phases.find((phase) => phase.id === activeSection) ?? null;

  return (
    <AppLayout
      header={
        <AppHeader
          sections={topNavSections}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          roadmapProgress={roadmapProgress}
          isDashboardOpen={isDashboardOpen}
          onToggleDashboard={() => setIsDashboardOpen((prev) => !prev)}
        />
      }
      sidebar={
        <LeftDashboard
          sections={dashboardSections}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          isOpen={isDashboardOpen}
        />
      }
      footer={<AppFooter />}
    >
      {activeSection === 'overview' && (
        <OverviewPage
          phases={phases}
          phaseTaskCount={phaseTasks.length}
          openTasksTotal={openTasksTotal}
          totalStudyMinutes={totalStudyMinutes}
          totalNotesCount={totalNotesCount}
          onOpenPhase={(phaseId) => setActiveSection(phaseId)}
          phaseProgress={phaseProgress}
          totalStepsCount={allSteps.length}
        />
      )}

      {activePhase && (
        <PhasePage
          phase={activePhase}
          tracks={tracks}
          doneSet={doneSet}
          stepNotes={stepNotes}
          phaseTasksByPhase={phaseTasksByPhase}
          phaseDrafts={phaseDrafts}
          phaseProgress={phaseProgress}
          onToggleStep={toggleStep}
          onStepNoteChange={updateStepNote}
          onAddPhaseTask={handleAddPhaseTask}
          onUpdatePhaseDraft={updatePhaseDraft}
          onUpdatePhaseTask={upsertPhaseTask}
          onDeletePhaseTask={deletePhaseTask}
          normalizeMinutes={normalizeMinutes}
          formatStamp={formatStamp}
        />
      )}

      {activeSection === 'schedule' && (
        <SchedulePage
          editingScheduleId={editingScheduleId}
          scheduleDraft={scheduleDraft}
          scheduleError={scheduleError}
          draggingScheduleId={draggingScheduleId}
          weekDays={WEEK_DAYS}
          scheduleColors={SCHEDULE_COLORS}
          calendarSlotMinutes={CALENDAR_SLOT_MINUTES}
          calendarStartMinute={CALENDAR_START_MINUTE}
          calendarEndMinute={CALENDAR_END_MINUTE}
          calendarSlotCount={CALENDAR_SLOT_COUNT}
          calendarHourMarkers={CALENDAR_HOUR_MARKERS}
          scheduleEventsByDay={scheduleEventsByDay}
          onSubmit={handleScheduleSubmit}
          onDraftChange={(patch) => setScheduleDraft((prev) => ({ ...prev, ...patch }))}
          onResetDraft={resetScheduleDraft}
          onDragOver={handleScheduleDragOver}
          onDrop={handleScheduleDrop}
          onDragStart={handleScheduleDragStart}
          onDragEnd={() => setDraggingScheduleId(null)}
          onNudgeEvent={nudgeScheduleEvent}
          onEditEvent={editScheduleEvent}
          onDeleteEvent={deleteScheduleEvent}
          onCompleteEvent={completeScheduleEvent}
          getScheduleEventStyle={getScheduleEventStyle}
          formatClockTime={formatClockTime}
        />
      )}

      {activeSection === 'tasks' && (
        <TasksPage
          draft={draft}
          tasks={sortedTasks}
          onSubmit={handleAddTask}
          onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          onUpsertTask={upsertTask}
          onDeleteTask={deleteTask}
          normalizeMinutes={normalizeMinutes}
          formatStamp={formatStamp}
          scheduleTimeline={scheduleTimeline}
          formatClockTime={formatClockTime}
        />
      )}

      {activeSection === 'notes' && (
        <NotesPage
          phases={phases}
          notesPhaseId={notesPhaseId}
          phaseNotes={phaseNotes}
          generalNote={generalNote}
          onPhaseChange={(phaseId) => setNotesPhaseId(phaseId)}
          onGeneralNoteChange={(note) => setGeneralNote(note)}
          roadmapConfig={roadmapConfig}
          roadmapConfigError={roadmapConfigError}
          onApplyRoadmapConfig={applyRoadmapConfig}
          onResetRoadmapConfig={resetRoadmapConfig}
          formatStamp={formatStamp}
        />
      )}
    </AppLayout>
  );
}

export default App;
