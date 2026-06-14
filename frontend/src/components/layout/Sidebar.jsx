import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar, { getImageUrl } from '../ui/Avatar';
import {
  LayoutDashboard, Briefcase, FileText, User,
  Settings, PlusCircle, Building2, Users,
  BarChart3, ShieldCheck, ChevronLeft, ChevronRight,
  Bell, LogOut, Search, TrendingUp, UserCheck,
  ClipboardList
} from 'lucide-react';
import clsx from 'clsx';

const studentMenu = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/student/dashboard'      },
  { label: 'Browse Jobs',     icon: Search,          path: '/student/jobs'           },
  { label: 'My Applications', icon: FileText,        path: '/student/applications'   },
  { label: 'Notifications',   icon: Bell,            path: '/student/notifications'  },
  { label: 'Profile',         icon: User,            path: '/student/profile'        },
  { label: 'Settings',        icon: Settings,        path: '/student/settings'       },
];

const companyMenu = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/company/dashboard'  },
  { label: 'Post a Job',  icon: PlusCircle,      path: '/company/post-job'   },
  { label: 'My Jobs',     icon: Briefcase,       path: '/company/jobs'       },
  { label: 'Applicants',  icon: Users,           path: '/company/applicants' },
  { label: 'Profile',     icon: Building2,       path: '/company/profile'    },
  { label: 'Settings',    icon: Settings,        path: '/company/settings'   },
];

const adminMenu = [
  { label: 'Dashboard',      icon: LayoutDashboard, path: '/admin/dashboard'  },
  { label: 'Companies',      icon: Building2,       path: '/admin/companies'  },
  { label: 'Job Listings',   icon: Briefcase,       path: '/admin/jobs'       },
  { label: 'Students',       icon: UserCheck,       path: '/admin/students'   },
  { label: 'Analytics',      icon: TrendingUp,      path: '/admin/analytics'  },
  { label: 'Reports',        icon: BarChart3,       path: '/admin/reports'    },
  { label: 'User Management',icon: ShieldCheck,     path: '/admin/users'      },
];

export default function Sidebar() {
  const { user, logout, profileImage } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const menu = user?.role === 'student' ? studentMenu
             : user?.role === 'company' ? companyMenu
             : adminMenu;

  const roleLabel = user?.role === 'student' ? 'Student Portal'
                  : user?.role === 'company' ? 'Company Portal'
                  : 'Admin Panel';

  const roleColor = user?.role === 'student' ? '#007BFF'
                  : user?.role === 'company' ? '#00CCCC'
                  : '#7850FF';

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen flex flex-col z-40 sidebar-transition',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{
        background:  'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        boxShadow:   '4px 0 20px rgba(0,0,0,0.2)',
      }}
    >

      {/* ── Logo area ──────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-4"
        style={{ borderBottom: '1px solid var(--color-border)', minHeight: '64px' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #007BFF, #00FFFF)' }}
            >
              <Briefcase size={16} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black leading-tight truncate gradient-text">
                CareerNexus
              </p>
              <p
                className="text-xs leading-tight truncate font-medium"
                style={{ color: roleColor }}
              >
                {roleLabel}
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #007BFF, #00FFFF)' }}
          >
            <Briefcase size={16} className="text-white" />
          </div>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg transition-colors flex-shrink-0 hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden px-2">
        {menu.map((item) => {
          const Icon     = item.icon;
          const pathSegment = item.path.split('/')[1] + '/' + item.path.split('/')[2];
          const isActive    = location.pathname.includes(item.path.split('/')[2] || item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group',
                collapsed ? 'justify-center' : 'justify-start'
              )}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0,123,255,0.2), rgba(0,204,204,0.1))'
                  : 'transparent',
                borderLeft: isActive
                  ? '2px solid #007BFF'
                  : '2px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(0,123,255,0.08)';
                  e.currentTarget.style.color      = '#B0D4FF';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color      = 'var(--color-text-muted)';
                }
              }}
            >
              <Icon
                size={18}
                className="flex-shrink-0"
                style={{ color: isActive ? '#007BFF' : 'inherit' }}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#00FFFF' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── User info + logout ──────────────────────── */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Avatar name={user?.name} src={profileImage} size="sm" />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {user?.name}
              </p>
              <p
                className="text-xs truncate capitalize"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {user?.role}
              </p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg transition-colors hover:text-red-400"
              style={{ color: 'var(--color-text-muted)' }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar name={user?.name} src={profileImage} size="sm" />
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg transition-colors hover:text-red-400"
              style={{ color: 'var(--color-text-muted)' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Expand button when collapsed ─────────────── */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors"
          style={{
            background:  'var(--color-bg-card)',
            border:      '1px solid var(--color-border)',
            color:       '#007BFF',
          }}
        >
          <ChevronRight size={12} />
        </button>
      )}
    </aside>
  );
}