import { NavLink, Outlet } from 'react-router-dom'
import { FiGrid, FiCalendar, FiMaximize, FiUsers, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../AuthContext'

const icons = {
  dashboard: FiGrid,
  calendar: FiCalendar,
  scan: FiMaximize,
  users: FiUsers,
  logout: FiLogOut,
}

function Icon({ name }) {
  const Component = icons[name]
  return <Component size={20} aria-hidden="true" />
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
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true, roles: ['admin'] },
  { to: '/admin/events', label: 'Events', icon: 'calendar', roles: ['admin'] },
  { to: '/admin/checkin', label: 'Check-in', icon: 'scan', roles: ['admin', 'staff'] },
  { to: '/admin/users', label: 'Team', icon: 'users', roles: ['admin'] },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const visible = items.filter((i) => i.roles.includes(user.role))

  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          {visible.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className="nav-link">
              <Icon name={i.icon} />{i.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div className="me"><strong>{user.name}</strong><span>{user.role}</span></div>
          <button onClick={logout} className="nav-link">
            <Icon name="logout" />Log out
          </button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar"><Brand /></header>
        <main className="main"><Outlet /></main>
      </div>

      <nav className="tabbar">
        {visible.map((i) => (
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