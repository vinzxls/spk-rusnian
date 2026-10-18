/**
 * Sidebar — navigasi role-based (Admin & Mahasiswa).
 *
 * Admin  : Dashboard, Data Mahasiswa, Kriteria & Subkriteria,
 *          Hasil Identifikasi, Ranking, Laporan
 * Mahasiswa : Dashboard, Kuesioner
 *
 * Styling mengikuti design system di src/styles/design-system.css
 * (.ds-sidebar, .ds-nav-item, ds-badge, ds-nav-icon).
 * Aktif/tdk aktif ditentukan NavLink dari react-router-dom.
 */
import { NavLink } from 'react-router-dom';
import type { UserRole } from '../../types';

/* ---------------------------------------------------------------------------
 * Ikon SVG inline (stroke-based, 24×24) — tanpa dependensi eksternal.
 * ------------------------------------------------------------------------- */
export type IconName =
  | 'home'
  | 'users'
  | 'sliders'
  | 'clipboard-check'
  | 'trophy'
  | 'file-text'
  | 'clipboard'
  | 'grid';

const ICON_PATHS: Record<IconName, JSX.Element> = {
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </>
  ),
  'clipboard-check': (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  'file-text': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
};

export function SidebarIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Definisi menu per role
 * ------------------------------------------------------------------------- */
export interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  /** Badge angka opsional (mis. jumlah pending) */
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Menu Admin — sesuai kriteria role-based navigation. */
export const ADMIN_NAV: NavSection[] = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'grid' },
      { label: 'Data Mahasiswa', to: '/admin/mahasiswa', icon: 'users' },
      { label: 'Kriteria & Subkriteria', to: '/admin/kriteria', icon: 'sliders' },
    ],
  },
  {
    title: 'Analisis',
    items: [
      { label: 'Hasil Identifikasi', to: '/admin/hasil-identifikasi', icon: 'clipboard-check' },
      { label: 'Ranking', to: '/admin/ranking', icon: 'trophy' },
      { label: 'Laporan', to: '/admin/laporan', icon: 'file-text' },
    ],
  },
];

/** Menu Mahasiswa. */
export const MAHASISWA_NAV: NavSection[] = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', to: '/mahasiswa/dashboard', icon: 'grid' },
      { label: 'Kuesioner', to: '/mahasiswa/kuesioner', icon: 'clipboard' },
    ],
  },
];

/** Ambil sections navigasi sesuai role. */
export function getNavSections(role: UserRole): NavSection[] {
  return role === 'admin' ? ADMIN_NAV : MAHASISWA_NAV;
}

/* ---------------------------------------------------------------------------
 * Sidebar component
 * ------------------------------------------------------------------------- */
export interface SidebarProps {
  role: UserRole;
  /** Status drawer terbuka (mobile) */
  isOpen?: boolean;
  /** Dipanggil saat item navigasi diklik — berguna untuk menutup drawer mobile */
  onNavigate?: () => void;
}

export function Sidebar({ role, isOpen = false, onNavigate }: SidebarProps) {
  const sections = getNavSections(role);
  const brandSubtitle = role === 'admin' ? 'Panel Administrator' : 'Portal Mahasiswa';

  return (
    <>
      {/* Backdrop drawer mobile — dikontrol DashboardLayout via class */}
      <div
        className={`ds-sidebar-backdrop${isOpen ? ' is-visible' : ''}`}
        onClick={onNavigate}
        aria-hidden="true"
      />

      <aside className={`ds-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Navigasi utama">
        {/* Brand */}
        <div className="ds-sidebar-brand">
          <div className="ds-sidebar-logo" aria-hidden="true">
            UI
          </div>
          <div>
            <p className="ds-sidebar-brand-title">Sistem Identifikasi</p>
            <p className="ds-sidebar-brand-subtitle">Kecanduan Media Sosial Unpatti</p>
          </div>
        </div>

        {/* Navigasi */}
        <nav className="ds-sidebar-nav">
          {sections.map((section) => (
            <div key={section.title ?? 'default'}>
              {section.title && <div className="ds-sidebar-section">{section.title}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `ds-nav-item${isActive ? ' is-active' : ''}`}
                  onClick={onNavigate}
                >
                  <span className="ds-nav-icon">
                    <SidebarIcon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  {item.badge && <span className="ds-nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="ds-sidebar-footer">
          {brandSubtitle}
          <br />
          Universitas Pattimura
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
