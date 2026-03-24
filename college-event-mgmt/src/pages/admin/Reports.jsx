import { useEffect, useState } from 'react'
import { BarChart3, Download, TrendingUp, Users, Calendar, Award } from 'lucide-react'
import { reportService, eventService } from '../../services/eventService'
import { PageHeader, EmptyState, TableSkeleton, Badge, FormField } from '../../components/UI'
import { formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Reports() {
  const [events, setEvents] = useState([])
  const [topEvents, setTopEvents] = useState([])
  const [eventReports, setEventReports] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [eventSummary, setEventSummary] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      eventService.getAll(),
      reportService.getTopEvents(),
      reportService.getEvents(),
    ]).then(([evRes, topRes, repRes]) => {
      setEvents(evRes.data || [])
      setTopEvents(topRes.data || [])
      setEventReports(repRes.data || [])
    }).catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  const loadEventDetail = async (eventId) => {
    setSelectedEvent(eventId)
    setDetailLoading(true)
    try {
      const [sumRes, partRes] = await Promise.all([
        reportService.getEventSummary(eventId),
        reportService.getParticipants(eventId),
      ])
      setEventSummary(sumRes.data)
      setParticipants(partRes.data || [])
    } catch { toast.error('Failed to load event details') }
    finally { setDetailLoading(false) }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'top', label: 'Top Events', icon: Award },
    { id: 'detail', label: 'Event Detail', icon: Calendar },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Reports" subtitle="Insights and analytics for your events" />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="card overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white">All Events Report</h2>
              <span className="text-xs text-gray-500">{eventReports.length} records</span>
            </div>
            {loading ? <TableSkeleton rows={5} cols={5} /> :
             eventReports.length === 0 ? <EmptyState icon={BarChart3} title="No report data" /> : (
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Participants</th>
                    <th>Attendance</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {eventReports.map((ev, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => { setActiveTab('detail'); loadEventDetail(ev.eventId) }}>
                      <td className="font-medium text-white hover:text-brand-300 transition-colors">{ev.title || ev.eventTitle}</td>
                      <td>{formatDate(ev.eventDate)}</td>
                      <td>{ev.registrationCount ?? ev.participantCount ?? '—'}</td>
                      <td>
                        {ev.attendancePercentage !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-3 rounded-full h-1.5 max-w-[80px]">
                              <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${ev.attendancePercentage}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{ev.attendancePercentage}%</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td><Badge>{ev.eventType}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'top' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">Top Events by Registrations</h2>
            {loading ? <TableSkeleton rows={5} cols={3} /> :
             topEvents.length === 0 ? <EmptyState icon={Award} title="No data available" /> : (
              <div className="space-y-3">
                {topEvents.map((ev, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-surface-2 rounded-xl">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-400' :
                      i === 2 ? 'bg-orange-700/20 text-orange-600' : 'bg-surface-3 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{ev.title || ev.eventTitle}</p>
                      <p className="text-xs text-gray-500">{formatDate(ev.eventDate)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-brand-400">{ev.registrationCount ?? ev.participantCount}</p>
                      <p className="text-xs text-gray-600">registrations</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="space-y-4">
          <div className="card">
            <FormField label="Select Event for Detailed Report">
              <select className="input-dark" value={selectedEvent} onChange={e => loadEventDetail(e.target.value)}>
                <option value="">Choose an event...</option>
                {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.title}</option>)}
              </select>
            </FormField>
          </div>

          {detailLoading ? (
            <div className="card"><TableSkeleton rows={5} cols={4} /></div>
          ) : eventSummary ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Registered', value: eventSummary.totalRegistered ?? participants.length },
                  { label: 'Attended', value: eventSummary.attended ?? eventSummary.presentCount ?? '—' },
                  { label: 'Absent', value: eventSummary.absent ?? eventSummary.absentCount ?? '—' },
                  { label: 'Attendance %', value: eventSummary.attendancePercentage != null ? `${eventSummary.attendancePercentage}%` : '—' },
                ].map(item => (
                  <div key={item.label} className="card text-center">
                    <p className="text-2xl font-display font-bold gradient-text">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="card overflow-x-auto">
                <h3 className="font-display font-bold text-white mb-4">Participants</h3>
                {participants.length === 0 ? <EmptyState icon={Users} title="No participants" /> : (
                  <table className="table-dark">
                    <thead>
                      <tr><th>Student</th><th>Enrollment No</th><th>Registration Date</th><th>Attendance</th></tr>
                    </thead>
                    <tbody>
                      {participants.map((p, i) => (
                        (() => {
                          const status = p.attendanceStatus || (p.attended === true ? 'Present' : p.attended === false ? 'Absent' : null)
                          return (
                            <tr key={i}>
                              <td className="font-medium text-white">{p.studentName || p.name || '—'}</td>
                              <td><span className="font-mono text-xs text-brand-300">{p.enrollmentNo || '—'}</span></td>
                              <td>{formatDate(p.registrationDate)}</td>
                              <td>
                                <Badge variant={status === 'Present' ? 'success' : status ? 'danger' : 'gray'}>
                                  {status || 'Not Marked'}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })()
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : selectedEvent ? null : (
            <div className="card">
              <EmptyState icon={BarChart3} title="Select an event" message="Choose an event to view its detailed report" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
