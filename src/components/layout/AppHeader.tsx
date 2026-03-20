import { NavItem, NavSection } from '../../@types/navigation';

interface AppHeaderProps {
  sections: NavItem[];
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  roadmapProgress: number;
  isDashboardOpen: boolean;
  onToggleDashboard: () => void;
}

function AppHeader({
  sections,
  activeSection,
  onNavigate,
  roadmapProgress,
  isDashboardOpen,
  onToggleDashboard,
}: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <button
          type="button"
          className="dashboard-toggle-btn"
          onClick={onToggleDashboard}
          aria-label={isDashboardOpen ? 'Ẩn thanh dashboard trái' : 'Hiện thanh dashboard trái'}
          aria-expanded={isDashboardOpen}
        >
          {isDashboardOpen ? '◀' : '▶'}
        </button>
        <div className="brand">DAT DEV MAP</div>
      </div>

      <nav className="topnav">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onNavigate(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="progress-chip">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${roadmapProgress}%` }} />
        </div>
        <span>{roadmapProgress}%</span>
      </div>
    </header>
  );
}

export default AppHeader;
