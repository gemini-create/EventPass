import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const icons = {
  dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  scan: <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
}

function Icon({ name }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">E</div>
      <span>EventPass</span>
    </div>
  )
}

const items = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/events', label: 'Events', icon: 'calendar' },
  { to: '/admin/checkin', label: 'Check-in', icon: 'scan' },
]

export default function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className="nav-link">
              <Icon name={i.icon} />{i.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="nav-link logout">
          <Icon name="logout" />Log out
        </button>
      </aside>

      <div className="content">
        <header className="topbar"><Brand /></header>
        <main className="main"><Outlet /></main>
      </div>

      <nav className="tabbar">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className="tab">
            <Icon name={i.icon} />{i.label}
          </NavLink>
        ))}
        <button onClick={logout} className="tab">
          <Icon name="logout" />Log out
        </button>
      </nav>
    </div>
  )
}