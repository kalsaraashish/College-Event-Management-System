import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Calendar, Tag, Users, ClipboardCheck,
  BarChart3, Bell, BookOpen, LogOut, GraduationCap, X, ChevronRight
} from 'lucide-react'

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/approve-users', icon: Users, label: 'Approve Accounts' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/organizers', icon: Users, label: 'Organizers' },
  { to: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
]

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/events', icon: Calendar, label: 'Browse Events' },
  { to: '/student/my-events', icon: BookOpen, label: 'My Registrations' },
  { to: '/student/profile', icon: Users, label: 'My Profile' },
]

const organizerNav = [
  { to: '/organizer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizer/events', icon: Calendar, label: 'Manage Events' },
  { to: '/organizer/registrations', icon: Users, label: 'Registrations' },
  { to: '/organizer/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/organizer/notifications', icon: Bell, label: 'Notifications' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'Admin' ? adminNav : user?.role === 'Organizer' ? organizerNav : studentNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-surface-1 border-r border-brand-900/40
        transition-transform duration-300 ease-in-out
        w-[260px]
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-white leading-none">CollegeEvents</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                {user?.role === 'Admin' ? 'Admin Portal' : user?.role === 'Organizer' ? 'Organizer Portal' : 'Student Portal'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-surface-3">
          <div className="flex items-center gap-3 bg-surface-2 rounded-xl p-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-cyan flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-brand-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item group ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-surface-3">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
