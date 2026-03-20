import { FormEvent } from 'react';
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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (patch: Partial<TaskDraftShape>) => void;
  onUpsertTask: (taskId: string, patch: Partial<Omit<TaskItem, 'id' | 'createdAt'>>) => void;
  onDeleteTask: (taskId: string) => void;
  normalizeMinutes: (rawMinutes: string | number) => number;
  formatStamp: (value: string) => string;
}

function TasksPage({
  draft,
  tasks,
  onSubmit,
  onDraftChange,
  onUpsertTask,
  onDeleteTask,
  normalizeMinutes,
  formatStamp,
}: TasksPageProps) {
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
    </section>
  );
}

export default TasksPage;
