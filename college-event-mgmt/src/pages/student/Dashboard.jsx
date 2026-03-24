import { useEffect, useState } from 'react'
import { Calendar, BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { dashboardService, eventService } from '../../services/eventService'
import { useAuth } from '../../context/AuthContext'
import { StatCard, EmptyState, PageHeader } from '../../components/UI'
import { formatDate } from '../../utils/constants'
import { Link } from 'react-router-dom'
import EventCard from '../../components/EventCard'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const { user, studentProfile } = useAuth()
  const navigate = useNavigate()
  const [dashData, setDashData] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sid = studentProfile?.studentId
    Promise.all([
      sid ? dashboardService.getStudentDashboard(sid) : Promise.resolve({ data: {} }),
      eventService.upcoming(),
    ]).then(([dashRes, upcomingRes]) => {
      setDashData(dashRes.data || {})
      setUpcomingEvents((upcomingRes.data || []).slice(0, 6))
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [studentProfile])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Welcome back! 👋`}
        subtitle="Here's what's happening with your events"
      />

      {user?.status !== 'Approved' && (
        <div className="card border border-amber-500/20 bg-amber-500/10">
          <p className="text-sm text-amber-200">
            Your account is currently <span className="font-semibold">{user?.status || 'Pending'}</span>. You can explore the portal, but event registration will stay locked until an admin approves your account.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Registered Events" value={loading ? null : dashData?.registeredEvents ?? 0} icon={BookOpen} color="brand" />
        <StatCard label="Upcoming Events" value={loading ? null : dashData?.upcomingEvents ?? upcomingEvents.length} icon={Clock} color="cyan" />
        <StatCard label="Attended" value={loading ? null : dashData?.attendedEvents ?? 0} icon={CheckCircle} color="amber" />
      </div>

      {/* My recent registrations */}
      {dashData?.recentRegistrations?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">My Recent Registrations</h2>
            <Link to="/student/my-events" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {dashData.recentRegistrations.slice(0, 4).map((reg, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{reg.eventTitle || reg.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(reg.eventDate)}</p>
                </div>
                <span className={`badge text-xs ${
                  reg.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  reg.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>{reg.status || 'Confirmed'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white">Upcoming Events</h2>
          <Link to="/student/events" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Browse all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="card">
            <EmptyState icon={Calendar} title="No upcoming events" message="Check back later for new events" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingEvents.map(ev => (
              <EventCard
                key={ev.eventId}
                event={ev}
                isAdmin={false}
                onView={() => navigate(`/student/events?eventId=${ev.eventId}`)}
                onRegister={() => navigate(`/student/events?eventId=${ev.eventId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
