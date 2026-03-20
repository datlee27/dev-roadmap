import { useEffect, useState } from 'react';
import { Step } from '../../types';

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

export default PhaseStepItem;
