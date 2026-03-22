import { FormEvent, useMemo, useState } from 'react';
import { ScheduleDayId, ScheduleTimelineItem } from '../@types/schedule';
import { PRIORITY_META } from '../data';
import { TaskItem, TaskPriority } from '../types';

interface TaskDraftShape {
  title: string;
  note: string;
  studyMinutes: string;
  priority: TaskPriority;
}

interface TasksPageProps {
  draft: TaskDraftShape;
  tasks: TaskItem[];
  scheduleTimeline: ScheduleTimelineItem[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (patch: Partial<TaskDraftShape>) => void;
  onUpsertTask: (taskId: string, patch: Partial<Omit<TaskItem, 'id' | 'createdAt'>>) => void;
  onDeleteTask: (taskId: string) => void;
  normalizeMinutes: (rawMinutes: string | number) => number;
  formatStamp: (value: string) => string;
  formatClockTime: (minutes: number) => string;
}

const DAY_LABELS: Record<ScheduleDayId, string> = {
  mon: 'Thứ 2',
  tue: 'Thứ 3',
  wed: 'Thứ 4',
  thu: 'Thứ 5',
  fri: 'Thứ 6',
  sat: 'Thứ 7',
  sun: 'Chủ nhật',
};

type TimelineFilter = 'week' | 'month';

const getStartOfCurrentWeek = (current: Date): Date => {
  const base = new Date(current);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay();
  const offset = day === 0 ? 6 : day - 1;
  base.setDate(base.getDate() - offset);
  return base;
};

const getStartOfCurrentMonth = (current: Date): Date => {
  const base = new Date(current);
  base.setHours(0, 0, 0, 0);
  base.setDate(1);
  return base;
};

function TasksPage({
  draft,
  tasks,
  scheduleTimeline,
  onSubmit,
  onDraftChange,
  onUpsertTask,
  onDeleteTask,
  normalizeMinutes,
  formatStamp,
  formatClockTime,
}: TasksPageProps) {
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('week');
  const filteredTimeline = useMemo(() => {
    const now = new Date();
    const startRange = timelineFilter === 'week' ? getStartOfCurrentWeek(now) : getStartOfCurrentMonth(now);
    return scheduleTimeline.filter((item) => new Date(item.completedAt).getTime() >= startRange.getTime());
  }, [scheduleTimeline, timelineFilter]);

  return (
    <section className="section fade-in">
      <p className="kicker">Task Manager</p>
      <h2>Thêm và quản lý task học tập</h2>

      <form className="task-form" onSubmit={onSubmit}>
        <label>
          Tên task
          <input
            type="text"
            placeholder="Ví dụ: Hoàn thành API login"
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
            required
          />
        </label>

        <label>
          Note
          <textarea
            placeholder="Ghi chú nhanh, link tài liệu, blockers..."
            value={draft.note}
            onChange={(event) => onDraftChange({ note: event.target.value })}
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
              onChange={(event) => onDraftChange({ studyMinutes: event.target.value })}
            />
          </label>

          <label>
            Ưu tiên
            <select value={draft.priority} onChange={(event) => onDraftChange({ priority: event.target.value as TaskPriority })}>
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
        {tasks.length === 0 && <p className="empty">Chưa có task nào. Thêm task đầu tiên để bắt đầu.</p>}

        {tasks.map((task) => (
          <article key={task.id} className={`task-card ${task.done ? 'done' : ''}`}>
            <header>
              <label className="task-check">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={(event) => onUpsertTask(task.id, { done: event.target.checked })}
                />
                <input
                  className="task-title-input"
                  value={task.title}
                  onChange={(event) => onUpsertTask(task.id, { title: event.target.value })}
                />
              </label>

              <button type="button" className="ghost-btn" onClick={() => onDeleteTask(task.id)}>
                Xóa
              </button>
            </header>

            <div className="task-controls">
              <label>
                Ưu tiên
                <select
                  value={task.priority}
                  onChange={(event) => onUpsertTask(task.id, { priority: event.target.value as TaskPriority })}
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
                    onUpsertTask(task.id, {
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
                onChange={(event) => onUpsertTask(task.id, { note: event.target.value })}
                placeholder="Ghi chú cho task này..."
              />
            </label>

            <footer>
              <span style={{ color: PRIORITY_META[task.priority].color }}>{PRIORITY_META[task.priority].label}</span>
              <span>Cập nhật: {formatStamp(task.updatedAt)}</span>
            </footer>
          </article>
        ))}
      </div>

      <div className="timeline-panel">
        <div className="timeline-head">
          <div>
            <h3>Timeline hoàn thành từ lịch</h3>
            <p>Lưu lại chính xác ngày giờ bạn đã hoàn thành event ở Lịch học.</p>
          </div>

          <div className="timeline-filter-group" role="tablist" aria-label="Lọc timeline">
            <button
              type="button"
              className={`timeline-filter-btn ${timelineFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimelineFilter('week')}
              aria-pressed={timelineFilter === 'week'}
            >
              Tuần này
            </button>
            <button
              type="button"
              className={`timeline-filter-btn ${timelineFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimelineFilter('month')}
              aria-pressed={timelineFilter === 'month'}
            >
              Tháng này
            </button>
          </div>
        </div>

        <div className="timeline-list">
          {filteredTimeline.length === 0 && (
            <p className="empty">Chưa có dữ liệu hoàn thành trong bộ lọc hiện tại.</p>
          )}

          {filteredTimeline.map((item) => (
            <article key={item.id} className="timeline-card" style={{ borderLeftColor: item.color }}>
              <header>
                <strong>{item.title}</strong>
                <span>{formatStamp(item.completedAt)}</span>
              </header>

              <p>
                {DAY_LABELS[item.day]} · {formatClockTime(item.startMinute)} - {formatClockTime(item.endMinute)}
              </p>

              {item.note.trim() && <small>Ghi chú: {item.note}</small>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TasksPage;
