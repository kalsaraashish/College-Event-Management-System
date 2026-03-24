import { useEffect, useState, useCallback } from 'react'
import { ClipboardCheck, Search, CheckCircle, XCircle, Clock, Loader2, Users } from 'lucide-react'
import { attendanceService, eventService, registrationService } from '../../services/eventService'
import { PageHeader, Badge, EmptyState, TableSkeleton, FormField } from '../../components/UI'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  Present: { variant: 'success', icon: CheckCircle },
  Absent: { variant: 'danger', icon: XCircle },
  Late: { variant: 'warning', icon: Clock },
}

export default function Attendance() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [attendanceList, setAttendanceList] = useState([])
  const [summary, setSummary] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('Present')
  const [markingBulk, setMarkingBulk] = useState(false)

  useEffect(() => {
    eventService.getAll().then(r => setEvents(r.data || [])).catch(() => {})
  }, [])

  const loadAttendance = useCallback(async (eventId) => {
    if (!eventId) return
    setLoading(true)
    try {
      const [attRes, regRes, sumRes] = await Promise.all([
        attendanceService.getByEvent(eventId),
        registrationService.getByEvent(eventId),
        attendanceService.getSummary(eventId),
      ])
      setAttendanceList(attRes.data || [])
      setRegistrations(regRes.data || [])
      setSummary(sumRes.data)
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }, [])

  const handleEventChange = (id) => { setSelectedEvent(id); loadAttendance(id) }

  const handleMark = async (registrationId, status) => {
    setSaving(true)
    try {
      const existing = attendanceList.find(a => a.eventRegistrationId === registrationId)
      if (existing) {
        await attendanceService.update(existing.attendanceId, {
          eventRegistrationId: registrationId,
          attendanceStatus: status,
        })
      } else {
        await attendanceService.mark({ eventRegistrationId: registrationId, attendanceStatus: status })
      }
      toast.success(`Marked as ${status}`)
      loadAttendance(selectedEvent)
    } catch { toast.error('Failed to mark attendance') }
    finally { setSaving(false) }
  }

  const handleBulkMark = async () => {
    if (!selectedEvent) return
    setMarkingBulk(true)
    try {
      await attendanceService.markBulk({
        eventId: Number(selectedEvent),
        status: bulkStatus,
        registrationIds: registrations.map(r => r.registrationId || r.eventRegistrationId),
      })
      toast.success(`Bulk marked as ${bulkStatus}`)
      loadAttendance(selectedEvent)
    } catch { toast.error('Bulk mark failed') }
    finally { setMarkingBulk(false) }
  }

  const getAttendance = (regId) => attendanceList.find(a => a.eventRegistrationId === regId)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance" subtitle="Mark and manage event attendance" />

      {/* Event selector */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <FormField label="Select Event">
              <select className="input-dark" value={selectedEvent} onChange={e => handleEventChange(e.target.value)}>
                <option value="">Choose an event...</option>
                {events.map(ev => (
                  <option key={ev.eventId} value={ev.eventId}>{ev.title}</option>
                ))}
              </select>
            </FormField>
          </div>
          {selectedEvent && (
            <div className="flex items-center gap-2">
              <select className="input-dark w-36" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
              <button onClick={handleBulkMark} disabled={markingBulk}
                className="btn-primary flex items-center gap-2 whitespace-nowrap">
                {markingBulk && <Loader2 size={14} className="animate-spin" />}
                <Users size={14} /> Bulk Mark
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Registered', value: summary.totalRegistered ?? registrations.length, color: 'text-white' },
            { label: 'Present', value: summary.presentCount ?? 0, color: 'text-emerald-400' },
            { label: 'Absent', value: summary.absentCount ?? 0, color: 'text-rose-400' },
            { label: 'Attendance %', value: summary.attendancePercentage != null ? `${summary.attendancePercentage}%` : '—', color: 'text-brand-400' },
          ].map(item => (
            <div key={item.label} className="card text-center">
              <p className={`text-2xl font-display font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance table */}
      {selectedEvent ? (
        loading ? (
          <div className="card"><TableSkeleton rows={5} cols={4} /></div>
        ) : registrations.length === 0 ? (
          <div className="card">
            <EmptyState icon={ClipboardCheck} title="No registrations" message="No students have registered for this event" />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Registration Date</th>
                  <th>Current Status</th>
                  <th>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => {
                  const att = getAttendance(reg.registrationId || reg.eventRegistrationId)
                  const status = att?.attendanceStatus
                  return (
                    <tr key={reg.registrationId || reg.eventRegistrationId}>
                      <td>
                        <div>
                          <p className="font-medium text-white text-sm">{reg.studentName || reg.userName || '—'}</p>
                          <p className="text-xs text-gray-500">{reg.enrollmentNo || ''}</p>
                        </div>
                      </td>
                      <td className="text-xs">{reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : '—'}</td>
                      <td>
                        {status ? (
                          <Badge variant={STATUS_MAP[status]?.variant || 'gray'}>{status}</Badge>
                        ) : (
                          <Badge variant="gray">Not Marked</Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {['Present', 'Absent', 'Late'].map(s => (
                            <button key={s} onClick={() => handleMark(reg.registrationId || reg.eventRegistrationId, s)}
                              disabled={saving}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                status === s
                                  ? s === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : s === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-surface-3 text-gray-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="card">
          <EmptyState icon={ClipboardCheck} title="Select an event" message="Choose an event above to manage attendance" />
        </div>
      )}
    </div>
  )
}
