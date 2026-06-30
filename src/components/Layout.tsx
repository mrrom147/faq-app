import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }: { children: ReactNode }) {
  const { profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="font-display text-sm font-bold tracking-tight text-ink">
            KDS <span className="text-accent">FAQ</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-ink/60 hover:text-ink transition">
              Danh sách
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-ink/60 hover:text-ink transition">
                Quản trị
              </Link>
            )}
            <span className="text-ink/30">|</span>
            <span className="text-ink/40 text-xs">{profile?.email}</span>
            <button onClick={handleLogout} className="text-ink/60 hover:text-accent transition">
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
