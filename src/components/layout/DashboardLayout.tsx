import { useState, type ReactNode } from 'react'
import type { UserRole } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from './Sidebar'
import Navbar from './Navbar'

export interface DashboardLayoutProps {
  role: UserRole
  pageTitle: string
  pageDesc?: string
  children: ReactNode
  userName?: string
  onLogout?: () => void
}

export function DashboardLayout({
  role,
  pageTitle,
  pageDesc,
  children,
  userName: userNameProp,
  onLogout: onLogoutProp,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const userName = userNameProp ?? user?.nama_lengkap ?? user?.username ?? 'Pengguna'
  const onLogout = onLogoutProp ?? logout
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((v) => !v)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="ds-dashboard">
      <Sidebar role={role} isOpen={sidebarOpen} onNavigate={closeSidebar} />
      <div className="ds-dashboard-main">
        <Navbar
          title={pageTitle}
          subtitle={pageDesc}
          user={{ name: userName, role }}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
        />
        <main className="ds-dashboard-content">
          <div className="ds-page-header">
            <div>
              <h1 className="ds-page-title">{pageTitle}</h1>
              {pageDesc && <p className="ds-page-desc">{pageDesc}</p>}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
