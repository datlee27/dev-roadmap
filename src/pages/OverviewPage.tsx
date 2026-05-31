import { CSSProperties } from 'react';
import { RULES } from '../data';
import { Phase, PhaseId } from '../types';

interface OverviewPageProps {
  phases: Phase[];
  roadmapProgress: number;
  phaseTaskCount: number;
  openTasksTotal: number;
  totalStudyMinutes: number;
  totalNotesCount: number;
  onOpenPhase: (phaseId: PhaseId) => void;
  phaseProgress: (phase: Phase) => { done: number; total: number; percent: number };
  totalStepsCount: number;
}

function OverviewPage({
  phases,
  roadmapProgress,
  phaseTaskCount,
  openTasksTotal,
  totalStudyMinutes,
  totalNotesCount,
  onOpenPhase,
  phaseProgress,
  totalStepsCount,
}: OverviewPageProps) {
  const nextPhase = phases.find((phase) => phaseProgress(phase).percent < 100) ?? phases[0] ?? null;
  const progressLabel =
    roadmapProgress >= 80
      ? 'Sắp hoàn thành roadmap'
      : roadmapProgress >= 40
        ? 'Đang đi đúng hướng'
        : 'Cần thêm nhịp học đều';

  return (
    <section className="section fade-in">
      <div className="hero">
        <p className="kicker">Tổng quan roadmap + đánh giá tiến độ</p>
        <h1>
          Roadmap
          <br />
          <span>Tổng kết chung cho toàn bộ lộ trình.</span>
        </h1>
        <p className="hero-copy">
          Theo dõi phase, task, giờ học và ghi chú ở một nơi. Muốn mở rộng lộ trình thì bấm nút + cạnh Overview để
          thêm phase mới.
        </p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <strong>{phases.length}</strong>
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

      <div className="overview-insight">
        <article>
          <span>Đánh giá tiến độ</span>
          <strong>{progressLabel}</strong>
          <p>{roadmapProgress}% tổng roadmap đã hoàn thành.</p>
        </article>

        <article>
          <span>Phase nên tập trung</span>
          <strong>{nextPhase?.label ?? 'Chưa có phase'}</strong>
          <p>{nextPhase ? `${phaseProgress(nextPhase).percent}% hoàn thành trong phase này.` : 'Thêm phase để bắt đầu.'}</p>
        </article>
      </div>

      <div className="phase-grid">
        {phases.map((phase) => {
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

      {/* <div className="rule-grid">
        {RULES.map((rule) => (
          <article key={rule.title} className="rule-card">
            <span>{rule.emoji}</span>
            <div>
              <h4>{rule.title}</h4>
              <p>{rule.desc}</p>
            </div>
          </article>
        ))}
      </div> */}
    </section>
  );
}

export default OverviewPage;
