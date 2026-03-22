import { ScheduleDayId, SchedulePageProps } from '../@types/schedule';

function SchedulePage({
  editingScheduleId,
  scheduleDraft,
  scheduleError,
  draggingScheduleId,
  weekDays,
  scheduleColors,
  calendarSlotMinutes,
  calendarStartMinute,
  calendarEndMinute,
  calendarSlotCount,
  calendarHourMarkers,
  scheduleEventsByDay,
  onSubmit,
  onDraftChange,
  onResetDraft,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onNudgeEvent,
  onEditEvent,
  onDuplicateEvent,
  onDeleteEvent,
  onCompleteEvent,
  getScheduleEventStyle,
  formatClockTime,
}: SchedulePageProps) {
  return (
    <section className="section fade-in">
      <p className="kicker">Weekly Planner - tạo, kéo-thả, tự sắp lịch</p>
      <h2>Lịch học theo tuần</h2>
      <p className="hero-copy">
        Tạo event mới, kéo-thả event vào ngày/giờ mong muốn, hoặc dùng nút -30p/+30p để tinh chỉnh nhanh. Dữ liệu
        được lưu tự động trong trình duyệt.
      </p>

      <div className="schedule-builder">
        <form className="schedule-form" onSubmit={onSubmit}>
          <h3>{editingScheduleId ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}</h3>
          <label>
            Tên sự kiện
            <input
              type="text"
              value={scheduleDraft.title}
              onChange={(event) => onDraftChange({ title: event.target.value })}
              placeholder="Ví dụ: Backend API practice"
              required
            />
          </label>

          <div className="schedule-form-row">
            <label>
              Ngày
              <select
                value={scheduleDraft.day}
                onChange={(event) => onDraftChange({ day: event.target.value as ScheduleDayId })}
              >
                {weekDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="color-picker-field">
              Màu
              <div className="schedule-color-palette">
                {scheduleColors.map((colorItem) => (
                  <button
                    key={colorItem.value}
                    type="button"
                    className={`schedule-color-swatch ${scheduleDraft.color === colorItem.value ? 'active' : ''}`}
                    style={{ backgroundColor: colorItem.value }}
                    onClick={() => onDraftChange({ color: colorItem.value })}
                    aria-label={`Chọn màu ${colorItem.label}`}
                    title={`${colorItem.label} (${colorItem.value})`}
                  />
                ))}
              </div>
            </label>
          </div>

          <div className="schedule-form-row">
            <label>
              Bắt đầu
              <input
                type="time"
                value={scheduleDraft.start}
                onChange={(event) => onDraftChange({ start: event.target.value })}
                step={calendarSlotMinutes * 60}
                min={formatClockTime(calendarStartMinute)}
                max={formatClockTime(calendarEndMinute - calendarSlotMinutes)}
              />
            </label>

            <label>
              Kết thúc
              <input
                type="time"
                value={scheduleDraft.end}
                onChange={(event) => onDraftChange({ end: event.target.value })}
                step={calendarSlotMinutes * 60}
                min={formatClockTime(calendarStartMinute + calendarSlotMinutes)}
                max={formatClockTime(calendarEndMinute)}
              />
            </label>
          </div>

          <label>
            Ghi chú
            <textarea
              rows={3}
              value={scheduleDraft.note}
              onChange={(event) => onDraftChange({ note: event.target.value })}
              placeholder="Mục tiêu của buổi học, link tài liệu, checklist..."
            />
          </label>

          {scheduleError && <p className="schedule-error">{scheduleError}</p>}

          <div className="schedule-form-actions">
            <button className="primary-btn" type="submit">
              {editingScheduleId ? 'Lưu chỉnh sửa' : '+ Thêm sự kiện'}
            </button>
            {editingScheduleId && (
              <button type="button" className="ghost-btn" onClick={onResetDraft}>
                Hủy sửa
              </button>
            )}
          </div>
        </form>

        <div className="weekly-calendar-wrap">
          <div className="weekly-calendar-head">
            <div className="calendar-time-head">Time</div>
            {weekDays.map((day) => (
              <div key={day.id} className="calendar-day-head">
                <strong>{day.shortLabel}</strong>
                <span>{day.label}</span>
              </div>
            ))}
          </div>

          <div className="weekly-calendar-grid">
            <div className="calendar-time-col">
              {calendarHourMarkers.map((hour) => (
                <div key={hour} className="calendar-time-mark">
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {weekDays.map((day) => (
              <div
                key={day.id}
                className={`calendar-day-col ${draggingScheduleId ? 'droppable' : ''}`}
                onDragOver={onDragOver}
                onDrop={(event) => onDrop(event, day.id)}
              >
                {Array.from({ length: calendarSlotCount }).map((_, index) => (
                  <div key={`${day.id}-slot-${index}`} className={`calendar-slot-line ${index % 2 === 0 ? 'hour' : ''}`} />
                ))}

                {scheduleEventsByDay[day.id].map((item) => (
                  <article
                    key={item.id}
                    className={`calendar-event ${draggingScheduleId === item.id ? 'dragging' : ''}`}
                    style={getScheduleEventStyle(item)}
                    draggable
                    onDragStart={(event) => onDragStart(event, item.id)}
                    onDragEnd={onDragEnd}
                  >
                    <button
                      type="button"
                      className="calendar-event-clone-btn"
                      onClick={() => onDuplicateEvent(item.id)}
                      aria-label="Nhân bản sự kiện"
                      title="Nhân bản sự kiện"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 6v12M6 12h12" />
                      </svg>
                    </button>
                    <header>
                      <strong>{item.title}</strong>
                      <span>
                        {formatClockTime(item.startMinute)} - {formatClockTime(item.endMinute)}
                      </span>
                    </header>
                    <footer>
                      <button
                        type="button"
                        className="calendar-event-icon-btn"
                        onClick={() => onNudgeEvent(item.id, -30)}
                        aria-label="Lùi sớm 30 phút"
                        title="Lùi 30 phút"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M14.5 7L9.5 12l5 5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="calendar-event-icon-btn"
                        onClick={() => onNudgeEvent(item.id, 30)}
                        aria-label="Dời trễ 30 phút"
                        title="Trễ 30 phút"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M9.5 7l5 5-5 5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="calendar-event-icon-btn"
                        onClick={() => onEditEvent(item)}
                        aria-label="Sửa sự kiện"
                        title="Sửa"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 20h4l10-10-4-4L4 16v4zM12 6l4 4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="calendar-event-icon-btn success"
                        onClick={() => onCompleteEvent(item.id)}
                        aria-label="Đánh dấu hoàn thành"
                        title="Hoàn thành"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 12.5l4 4L18 8.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="calendar-event-icon-btn danger"
                        onClick={() => onDeleteEvent(item.id)}
                        aria-label="Xóa sự kiện"
                        title="Xóa"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 7h14M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M7 7l1 13h8l1-13" />
                        </svg>
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SchedulePage;
