import { useEffect, useState, useCallback } from 'react'
import { BookOpen, Calendar, MapPin, XCircle, Loader2 } from 'lucide-react'
import { registrationService } from '../../services/eventService'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, EmptyState, ConfirmModal, Badge } from '../../components/UI'
import { formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function MyEvents() {
  const { studentProfile } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelItem, setCancelItem] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    if (!studentProfile?.studentId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await registrationService.getByStudent(studentProfile.studentId)
      setRegistrations(res.data || [])
    } catch { toast.error('Failed to load registrations') }
    finally { setLoading(false) }
  }, [studentProfile])

  useEffect(() => { load() }, [load])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await registrationService.remove(cancelItem.eventRegistrationId || cancelItem.registrationId)
      toast.success('Registration cancelled')
      setCancelItem(null)
      load()
    } catch { toast.error('Failed to cancel') }
    finally { setCancelling(false) }
  }

  const upcoming = registrations.filter(r => new Date(r.eventDate) > new Date() && r.status !== 'Cancelled')
  const past = registrations.filter(r => new Date(r.eventDate) <= new Date() || r.status === 'Cancelled')

  const RegCard = ({ reg }) => {
    const isPast = new Date(reg.eventDate) <= new Date()
    const isCancelled = reg.status === 'Cancelled'
    return (
      <div className={`card hover:border-brand-600/30 transition-all ${isCancelled ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{reg.eventTitle || reg.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{reg.eventType}</p>
          </div>
          <Badge variant={
            isCancelled ? 'danger' :
            isPast ? 'gray' :
            reg.attended ? 'success' : 'default'
          }>
            {isCancelled ? 'Cancelled' : isPast ? (reg.attended ? 'Attended' : 'Past') : 'Upcoming'}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} className="text-brand-400" />
            <span>{formatDate(reg.eventDate)}</span>
          </div>
          {reg.location && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={12} className="text-accent-cyan" />
              <span>{reg.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-3">
          <span className="text-xs text-gray-600">
            Registered: {formatDate(reg.registrationDate)}
          </span>
          {!isPast && !isCancelled && (
            <button
              onClick={() => setCancelItem(reg)}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <XCircle size={13} /> Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Registrations"
        subtitle={`${registrations.length} total registrations`}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : registrations.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="No registrations yet"
            message="Browse events and register for ones you're interested in"
            action={<a href="/student/events" className="btn-primary">Browse Events</a>}
          />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-3">
                Upcoming <span className="text-brand-400 text-base">({upcoming.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map(reg => <RegCard key={reg.eventRegistrationId || reg.registrationId} reg={reg} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-3">
                Past & Cancelled <span className="text-gray-600 text-base">({past.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {past.map(reg => <RegCard key={reg.eventRegistrationId || reg.registrationId} reg={reg} />)}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!cancelItem}
        onClose={() => setCancelItem(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Registration"
        message={`Cancel your registration for "${cancelItem?.eventTitle}"? You may not be able to re-register if the event fills up.`}
      />
    </div>
  )
}
