import { CSSProperties, DragEvent, FormEvent } from 'react';

export type ScheduleDayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ScheduleEventItem {
  id: string;
  title: string;
  day: ScheduleDayId;
  startMinute: number;
  endMinute: number;
  color: string;
  note: string;
  updatedAt: string;
}

export interface ScheduleDraft {
  title: string;
  day: ScheduleDayId;
  start: string;
  end: string;
  color: string;
  note: string;
}

export interface WeekDayItem {
  id: ScheduleDayId;
  label: string;
  shortLabel: string;
}

export interface SchedulePageProps {
  editingScheduleId: string | null;
  scheduleDraft: ScheduleDraft;
  scheduleError: string;
  draggingScheduleId: string | null;
  weekDays: WeekDayItem[];
  scheduleColors: { value: string; label: string }[];
  calendarSlotMinutes: number;
  calendarStartMinute: number;
  calendarEndMinute: number;
  calendarSlotCount: number;
  calendarHourMarkers: number[];
  scheduleEventsByDay: Record<ScheduleDayId, ScheduleEventItem[]>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (patch: Partial<ScheduleDraft>) => void;
  onResetDraft: () => void;
  onDragOver: (dragEvent: DragEvent<HTMLDivElement>) => void;
  onDrop: (dragEvent: DragEvent<HTMLDivElement>, dayId: ScheduleDayId) => void;
  onDragStart: (dragEvent: DragEvent<HTMLElement>, scheduleId: string) => void;
  onDragEnd: () => void;
  onNudgeEvent: (scheduleId: string, deltaMinutes: number) => void;
  onEditEvent: (item: ScheduleEventItem) => void;
  onDeleteEvent: (scheduleId: string) => void;
  getScheduleEventStyle: (item: ScheduleEventItem) => CSSProperties;
  formatClockTime: (minutes: number) => string;
}
