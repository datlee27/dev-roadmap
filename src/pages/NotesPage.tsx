import { PHASES } from '../data';
import { PhaseId } from '../types';

interface PhaseNoteItem {
  id: string;
  source: 'step' | 'phase-task';
  title: string;
  note: string;
  detail: string;
  updatedAt?: string;
}

interface NotesPageProps {
  notesPhaseId: PhaseId;
  phaseNotes: PhaseNoteItem[];
  generalNote: string;
  onPhaseChange: (phaseId: PhaseId) => void;
  onGeneralNoteChange: (note: string) => void;
  formatStamp: (value: string) => string;
}

function NotesPage({
  notesPhaseId,
  phaseNotes,
  generalNote,
  onPhaseChange,
  onGeneralNoteChange,
  formatStamp,
}: NotesPageProps) {
  return (
    <section className="section fade-in">
      <p className="kicker">Notes Hub</p>
      <h2>Tổng hợp ghi chú theo phase</h2>

      <div className="notes-layout">
        <article className="notes-panel">
          <label className="notes-select">
            Chọn phase để xem tất cả ghi chú
            <select value={notesPhaseId} onChange={(event) => onPhaseChange(event.target.value as PhaseId)}>
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
                  <span className={`note-tag ${item.source}`}>{item.source === 'phase-task' ? 'Task phase' : 'Step note'}</span>
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
            onChange={(event) => onGeneralNoteChange(event.target.value)}
            placeholder="Ví dụ: Tuần này tập trung hoàn tất auth flow + 5 bài LeetCode..."
          />
          <p className="notes-helper">
            {generalNote.trim() ? 'Đã lưu tự động vào localStorage.' : 'Chưa có ghi chú chung.'}
          </p>
        </article>
      </div>
    </section>
  );
}

export default NotesPage;
