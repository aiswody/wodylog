import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: '대시보드' },
  { to: '/calendar', label: '캘린더' },
  { to: '/applications', label: '지원 목록' },
  { to: '/resumes', label: '자소서 버전' },
  { to: '/templates', label: '템플릿' },
]

export function AppLayout() {
  const { signOut } = useAuth()

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-title">wodylog</span>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={() => void signOut()}>
          로그아웃
        </button>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
