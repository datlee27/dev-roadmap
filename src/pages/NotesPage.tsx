import { useEffect, useState } from 'react';
import { Phase, PhaseId, RoadmapConfig } from '../types';

interface PhaseNoteItem {
  id: string;
  source: 'step' | 'phase-task';
  title: string;
  note: string;
  detail: string;
  updatedAt?: string;
}

interface NotesPageProps {
  phases: Phase[];
  notesPhaseId: PhaseId;
  phaseNotes: PhaseNoteItem[];
  generalNote: string;
  roadmapConfig: RoadmapConfig;
  roadmapConfigError: string;
  onPhaseChange: (phaseId: PhaseId) => void;
  onGeneralNoteChange: (note: string) => void;
  onApplyRoadmapConfig: (rawConfig: string) => void;
  onResetRoadmapConfig: () => void;
  formatStamp: (value: string) => string;
}

function NotesPage({
  phases,
  notesPhaseId,
  phaseNotes,
  generalNote,
  roadmapConfig,
  roadmapConfigError,
  onPhaseChange,
  onGeneralNoteChange,
  onApplyRoadmapConfig,
  onResetRoadmapConfig,
  formatStamp,
}: NotesPageProps) {
  const [configDraft, setConfigDraft] = useState<string>(() => JSON.stringify(roadmapConfig, null, 2));

  useEffect(() => {
    setConfigDraft(JSON.stringify(roadmapConfig, null, 2));
  }, [roadmapConfig]);

  return (
    <section className="section fade-in">
      <p className="kicker">Notes Hub</p>
      <h2>Tổng hợp ghi chú theo phase</h2>

      <div className="notes-layout">
        <article className="notes-panel">
          <label className="notes-select">
            Chọn phase để xem tất cả ghi chú
            <select value={notesPhaseId} onChange={(event) => onPhaseChange(event.target.value as PhaseId)}>
              {phases.map((phase) => (
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

          <div className="roadmap-config-box">
            <h3>Cấu hình roadmap (không hardcode)</h3>
            <p className="notes-helper">
              Bạn có thể sửa JSON để đổi phase/track/step cho user khác mà không cần sửa source code.
            </p>
            <textarea
              className="roadmap-config-input"
              rows={14}
              value={configDraft}
              onChange={(event) => setConfigDraft(event.target.value)}
              placeholder="Roadmap config JSON..."
            />
            <div className="schedule-form-actions">
              <button type="button" className="primary-btn" onClick={() => onApplyRoadmapConfig(configDraft)}>
                Lưu cấu hình
              </button>
              <button type="button" className="ghost-btn" onClick={onResetRoadmapConfig}>
                Khôi phục mặc định
              </button>
            </div>
            {roadmapConfigError && <p className="schedule-error">{roadmapConfigError}</p>}
          </div>
        </article>
      </div>
    </section>
  );
}

export default NotesPage;
