import { NavItem, NavSection } from '../../@types/navigation';

type AppTheme = 'light' | 'dark';

interface AppHeaderProps {
  sections: NavItem[];
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onAddPhase?: () => void;
  roadmapProgress: number;
  isDashboardOpen: boolean;
  onToggleDashboard: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

function AppHeader({
  sections,
  activeSection,
  onNavigate,
  onAddPhase,
  roadmapProgress,
  isDashboardOpen,
  onToggleDashboard,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  const nextThemeLabel = theme === 'dark' ? 'sáng' : 'tối';

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
        {sections.map((section, index) => (
          <span key={section.id} className="topnav-item">
            <button
              type="button"
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onNavigate(section.id)}
            >
              {section.label}
            </button>

            {index === 0 && onAddPhase && (
              <button
                type="button"
                className="nav-add-phase-btn"
                onClick={onAddPhase}
                aria-label="Thêm phase mới"
                title="Thêm phase mới"
              >
                +
              </button>
            )}
          </span>
        ))}
      </nav>

      <div className="topbar-actions">
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Chuyển sang chế độ ${nextThemeLabel}`}
          aria-pressed={theme === 'dark'}
          title={`Chuyển sang chế độ ${nextThemeLabel}`}
        >
          <span className={`theme-toggle-icon ${theme === 'light' ? 'active' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 4V2.5M12 21.5V20M4 12H2.5M21.5 12H20M6.34 6.34L5.28 5.28M18.72 18.72L17.66 17.66M17.66 6.34L18.72 5.28M5.28 18.72L6.34 17.66" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </span>
          <span className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M20 15.5A7.5 7.5 0 0 1 8.5 4A8.2 8.2 0 1 0 20 15.5Z" />
            </svg>
          </span>
        </button>

        <div className="progress-chip">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${roadmapProgress}%` }} />
          </div>
          <span>{roadmapProgress}%</span>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
