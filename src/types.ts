export type TrackKey = 'react' | 'backend' | 'lc' | 'docker' | 'ielts' | 'project';
export type PhaseId = 'p1' | 'p2' | 'p3';

export interface TrackMeta {
  label: string;
  color: string;
}

export interface Step {
  id: string;
  title: string;
  detail: string;
}

export interface TrackPlan {
  track: TrackKey;
  steps: Step[];
}

export interface Phase {
  id: PhaseId;
  label: string;
  sublabel: string;
  desc: string;
  goal: string;
  color: string;
  tracks: TrackPlan[];
}

export interface ScheduleSlot {
  time: string;
  label: string;
  color: string;
  desc: string;
}

export interface ScheduleDay {
  day: string;
  color: string;
  slots: ScheduleSlot[];
}

export interface Rule {
  emoji: string;
  title: string;
  desc: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  note: string;
  studyMinutes: number;
  priority: TaskPriority;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseTaskItem extends TaskItem {
  phaseId: PhaseId;
}
