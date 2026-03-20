import { NavItem, NavSection } from '../../@types/navigation';

interface LeftDashboardProps {
  sections: NavItem[];
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isOpen: boolean;
}

function LeftDashboard({ sections, activeSection, onNavigate, isOpen }: LeftDashboardProps) {
  return (
    <aside className={`left-dashboard ${isOpen ? 'open' : 'closed'}`}>
      <p className="dashboard-title">Dashboard</p>
      <nav className="dashboard-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`dashboard-link ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onNavigate(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default LeftDashboard;
