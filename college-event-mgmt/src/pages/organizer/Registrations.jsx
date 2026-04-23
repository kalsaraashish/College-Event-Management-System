import { useEffect, useState, useCallback } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { eventService, registrationService } from '../../services/eventService'
import { PageHeader, Badge, EmptyState, TableSkeleton, FormField } from '../../components/UI'
import toast from 'react-hot-toast'

export default function Registrations() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    eventService.getAll().then(r => setEvents(r.data || [])).catch(() => {})
  }, [])

  const loadRegistrations = useCallback(async (eventId) => {
    if (!eventId) return
    setLoading(true)
    try {
      const regRes = await registrationService.getByEvent(eventId)
      setRegistrations(regRes.data || [])
    } catch { toast.error('Failed to load registrations') }
    finally { setLoading(false) }
  }, [])

  const handleEventChange = (id) => { 
    setSelectedEvent(id); 
    loadRegistrations(id); 
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Event Registrations" subtitle="View all student registrations for your events" />

      {/* Event selector */}
      <div className="card">
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
      </div>

      {/* Registrations table */}
      {selectedEvent ? (
        loading ? (
          <div className="card"><TableSkeleton rows={5} cols={4} /></div>
        ) : registrations.length === 0 ? (
          <div className="card">
            <EmptyState icon={Users} title="No registrations" message="No students have registered for this event" />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Enrollment No</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.eventRegistrationId}>
                    <td className="font-medium text-white">{reg.studentName || '—'}</td>
                    <td className="text-gray-400">{reg.enrollmentNo || '—'}</td>
                    <td>{reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <Badge variant={reg.status === 'Cancelled' ? 'danger' : 'success'}>
                        {reg.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="card">
          <EmptyState icon={Users} title="Select an event" message="Choose an event above to view registrations" />
        </div>
      )}
    </div>
  )
}
