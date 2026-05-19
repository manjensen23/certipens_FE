import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Database,
  FileCheck,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  Users,
  User,
  Bell,
  History,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Data Master', path: '/admin/data-master', icon: <Database size={20} /> },
  { label: 'Verifikasi Pendaftaran', path: '/admin/registrations', icon: <FileCheck size={20} /> },
  { label: 'Kelola Jadwal', path: '/admin/schedules', icon: <Calendar size={20} /> },
  { label: 'Laporan', path: '/admin/reports', icon: <BarChart3 size={20} /> },
  { label: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
];

const asesiNav: NavItem[] = [
  { label: 'Dashboard', path: '/asesi/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Sertifikasi Saya', path: '/asesi/sertifikasi', icon: <ClipboardList size={20} /> },
  { label: 'Jadwal', path: '/asesi/schedule', icon: <Calendar size={20} /> },
  { label: 'Riwayat', path: '/asesi/riwayat', icon: <History size={20} /> },
  { label: 'Profil', path: '/asesi/profile', icon: <User size={20} /> },
  { label: 'Notifikasi', path: '/asesi/notifikasi', icon: <Bell size={20} /> },
];

const asesorNav: NavItem[] = [
  { label: 'Dashboard', path: '/asesor/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Jadwal', path: '/asesor/schedule', icon: <Calendar size={20} /> },
  { label: 'Penilaian', path: '/asesor/penilaian', icon: <Users size={20} /> },
  { label: 'Riwayat', path: '/asesor/riwayat', icon: <History size={20} /> },
  { label: 'Profil', path: '/asesor/profile', icon: <User size={20} /> },
  { label: 'Notifikasi', path: '/asesor/notifikasi', icon: <Bell size={20} /> },
];

function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'admin':
      return adminNav;
    case 'asesi':
      return asesiNav;
    case 'asesor':
      return asesorNav;
    default:
      return [];
  }
}

function getRoleLabel(role?: string): string {
  switch (role) {
    case 'admin':
      return 'Admin Dashboard';
    case 'asesi':
      return 'Asesi';
    case 'asesor':
      return 'Asesor';
    default:
      return '';
  }
}

export default function Sidebar({ isOpen, isMobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-outline-variant">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <ShieldCheck size={20} className="text-primary" />
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-on-surface text-base leading-tight">CertiPENS</h1>
            <p className="text-xs text-on-surface-variant">{getRoleLabel(user?.role)}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-alpha-10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User card + collapse toggle */}
      <div className="border-t border-outline-variant">
        {/* User card */}
        {isOpen && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-alpha-10 text-primary text-sm font-bold shrink-0">
              {user?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">
                {user?.nama_lengkap || 'User'}
              </p>
              <p className="text-xs text-on-surface-variant capitalize">
                {user?.role || 'Role'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block p-3 pt-0">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-[68px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface-container-lowest shadow-xl transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-4 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
