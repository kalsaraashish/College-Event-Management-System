import { useEffect, useState } from 'react'
import { Calendar, Users, ClipboardList, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { dashboardService } from '../../services/eventService'
import { StatCard, TableSkeleton, PageHeader } from '../../components/UI'
import { formatDate, formatDateTime } from '../../utils/constants'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [todayEvents, setTodayEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getTodayEvents(),
    ]).then(([statsRes, todayRes]) => {
      setStats(statsRes.data)
      setTodayEvents(todayRes.data || [])
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of your college event management system"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={loading ? null : stats?.totalEvents ?? 0}
          icon={Calendar}
          color="brand"
        />
        <StatCard
          label="Total Students"
          value={loading ? null : stats?.totalStudents ?? 0}
          icon={Users}
          color="cyan"
        />
        <StatCard
          label="Registrations"
          value={loading ? null : stats?.totalRegistrations ?? 0}
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          label="Today's Events"
          value={loading ? null : todayEvents.length}
          icon={Clock}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Today's events */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Today's Events</h2>
            <Link to="/admin/events" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-10">
              <Calendar size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No events scheduled today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Location</th>
                    <th>Participants</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {todayEvents.map(ev => (
                    <tr key={ev.eventId}>
                      <td className="font-medium text-white">{ev.title}</td>
                      <td>{ev.location || '—'}</td>
                      <td>{ev.registrationCount ?? 0}/{ev.maxParticipants}</td>
                      <td>
                        <span className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20">
                          {ev.eventType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="card">
          <h2 className="font-display font-bold text-white mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Active Events', value: stats?.activeEvents ?? '—', color: 'text-brand-400' },
              { label: 'Upcoming Events', value: stats?.upcomingEvents ?? '—', color: 'text-accent-cyan' },
              { label: 'Completed Events', value: stats?.completedEvents ?? '—', color: 'text-accent-amber' },
              { label: 'Cancelled Events', value: stats?.cancelledEvents ?? '—', color: 'text-accent-rose' },
              { label: 'Total Categories', value: stats?.totalCategories ?? '—', color: 'text-gray-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-3 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`font-display font-bold text-lg ${item.color}`}>
                  {loading ? <span className="skeleton inline-block w-8 h-5 rounded" /> : item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-surface-3 grid grid-cols-2 gap-2">
            <Link to="/admin/events" className="btn-primary text-xs text-center py-2">
              Manage Events
            </Link>
            <Link to="/admin/reports" className="btn-secondary text-xs text-center py-2">
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-brand-400" />
          <h2 className="font-display font-bold text-white">System Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Attendance Rate', value: stats?.attendanceRate != null ? `${stats.attendanceRate}%` : '—' },
            { label: 'Avg Participants', value: stats?.avgParticipants ?? '—' },
            { label: 'Total Departments', value: stats?.totalDepartments ?? '—' },
            { label: 'New This Month', value: stats?.newEventsThisMonth ?? '—' },
          ].map(item => (
            <div key={item.label} className="bg-surface-2 rounded-xl p-4">
              <p className="text-2xl font-display font-bold gradient-text">
                {loading ? '...' : item.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
