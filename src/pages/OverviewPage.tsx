import { CSSProperties } from 'react';
import { PHASES, RULES } from '../data';
import { Phase, PhaseId } from '../types';

interface OverviewPageProps {
  phaseTaskCount: number;
  openTasksTotal: number;
  totalStudyMinutes: number;
  totalNotesCount: number;
  onOpenPhase: (phaseId: PhaseId) => void;
  phaseProgress: (phase: Phase) => { done: number; total: number; percent: number };
  totalStepsCount: number;
}

function OverviewPage({
  phaseTaskCount,
  openTasksTotal,
  totalStudyMinutes,
  totalNotesCount,
  onOpenPhase,
  phaseProgress,
  totalStepsCount,
}: OverviewPageProps) {
  return (
    <section className="section fade-in">
      <div className="hero">
        <p className="kicker">Lộ trình học + theo dõi task thực chiến</p>
        <h1>
          React + Vite + TSX
          <br />
          <span>Roadmap 3 tháng có theo dõi tiến độ thật.</span>
        </h1>
        <p className="hero-copy">
          Đánh dấu roadmap, thêm task trong từng phase, ghi chú theo từng bước và gom toàn bộ ghi chú ở tab Notes để
          ôn lại nhanh.
        </p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <strong>{PHASES.length}</strong>
          <p>Phases</p>
        </article>
        <article className="stat-card">
          <strong>{totalStepsCount}</strong>
          <p>Bước roadmap</p>
        </article>
        <article className="stat-card">
          <strong>{phaseTaskCount}</strong>
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
              onClick={() => onOpenPhase(phase.id)}
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
  );
}

export default OverviewPage;
