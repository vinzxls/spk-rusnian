/**
 * Navbar — top navigation bar with user menu and role-aware branding.
 * Pure design-system CSS (no Tailwind). Dropdown default tertutup.
 */
import { useState } from 'react';
import type { UserRole } from '../../types';

export type NavIconName = 'menu' | 'logout' | 'user' | 'chevron-down';

const NAV_ICON_PATHS: Record<NavIconName, string> = {
  menu: 'M3 4h18M3 12h18M3 20h18',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 7l5 5-5 5M21 12H9',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'chevron-down': 'M6 9l6 6 6-6',
};

function NavIcon({ name, size = 18 }: { name: NavIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={NAV_ICON_PATHS[name]} />
    </svg>
  );
}

export interface NavbarProps {
  title?: string;
  subtitle?: string;
  user?: { name: string; role: UserRole };
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({
  title = 'Sistem Identifikasi',
  subtitle = 'Kecanduan Media Sosial Universitas Pattimura',
  user,
  onLogout,
  onToggleSidebar,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="ds-navbar" aria-label="Bar navigasi atas">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka menu sidebar"
          className="ds-navbar-toggle"
        >
          <NavIcon name="menu" />
        </button>
        <div>
          <p className="ds-navbar-title">{title}</p>
          {subtitle && <p className="ds-navbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="ds-navbar-user"
            >
              <span className="ds-avatar" aria-hidden="true">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span style={{ textAlign: 'right' }}>
                <span className="ds-navbar-user-name">{user.name}</span>
                <span className="ds-navbar-user-role">{user.role}</span>
              </span>
              <NavIcon name="chevron-down" />
            </button>

            {userMenuOpen && (
              <div className="ds-dropdown" role="menu" aria-label="Menu pengguna">
                <button
                  type="button"
                  role="menuitem"
                  className="ds-dropdown-item ds-dropdown-item--danger"
                  onClick={() => {
                    closeAll();
                    onLogout?.();
                  }}
                >
                  <NavIcon name="logout" size={16} />
                  Keluar
                </button>
              </div>
            )}
          </>
        ) : (
          <span className="ds-caption">Belum login</span>
        )}
      </div>
    </nav>
  );
}

export { Navbar };