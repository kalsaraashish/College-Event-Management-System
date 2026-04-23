import { Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../services/eventService'
import toast from 'react-hot-toast'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const loadNotificationCount = async () => {
      if (user?.role !== 'Admin' && user?.role !== 'Organizer') {
        setNotificationCount(0)
        return
      }

      try {
        const res = await notificationService.getAll()
        const notifications = res.data || []
        const lastSeenAt = localStorage.getItem(`notifications_last_seen_${user?.role}`)

        if (!lastSeenAt) {
          setNotificationCount(notifications.length)
          return
        }

        const lastSeenTime = new Date(lastSeenAt).getTime()
        const unread = notifications.filter(n => {
          const createdAt = new Date(n.createdAt).getTime()
          return !Number.isNaN(createdAt) && createdAt > lastSeenTime
        }).length

        setNotificationCount(unread)
      } catch {
        toast.error('Failed to load notification count')
      }
    }

    loadNotificationCount()
  }, [user?.role])

  const handleOpenNotifications = () => {
    localStorage.setItem(`notifications_last_seen_${user?.role}`, new Date().toISOString())
    setNotificationCount(0)
    navigate(user?.role === 'Admin' ? '/admin/notifications' : '/organizer/notifications')
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-surface-0/80 backdrop-blur-sm border-b border-surface-3 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-surface-3 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2 w-64 border border-transparent focus-within:border-brand-600/40 transition-colors">
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search events, students..."
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {(user?.role === 'Admin' || user?.role === 'Organizer') && (
          <button
            onClick={handleOpenNotifications}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-surface-3 transition-colors relative"
            aria-label="Open notifications"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-rose text-[10px] leading-4 text-white font-semibold text-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
            <p className="text-[10px] text-brand-400 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
