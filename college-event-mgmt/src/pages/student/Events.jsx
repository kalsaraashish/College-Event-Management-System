import { useEffect, useState } from 'react'
import { Search, Filter, Loader2, Calendar } from 'lucide-react'
import { eventService, categoryService, registrationService } from '../../services/eventService'
import { useAuth } from '../../context/AuthContext'
import EventCard from '../../components/EventCard'
import { Modal, PageHeader, EmptyState, Badge } from '../../components/UI'
import { formatDate, formatDateTime, EVENT_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

export default function StudentEvents() {
  const { user, studentProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showDetail, setShowDetail] = useState(null)
  const [registering, setRegistering] = useState(false)

  const getApiErrorMessage = (err, fallback) => {
    if (!err?.response) {
      return 'Cannot connect to server. Please check if backend API is running.'
    }

    const data = err?.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data?.message) return data.message
    if (data?.title) return data.title
    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0]
      const firstError = firstKey ? data.errors[firstKey]?.[0] : null
      if (firstError) return firstError
    }
    return fallback
  }

  const openEventDetail = async (event) => {
    try {
      const slotsRes = await eventService.getAvailableSlots(event.eventId)
      setShowDetail({
        ...event,
        registrationCount: slotsRes.data?.registered ?? event.registrationCount ?? 0,
        maxParticipants: slotsRes.data?.maxParticipants ?? event.maxParticipants,
      })
    } catch {
      // Fall back to existing event data if slots endpoint fails.
      setShowDetail(event)
    }
  }

  useEffect(() => {
    Promise.all([eventService.getAll(), categoryService.getAll()])
      .then(([evRes, catRes]) => {
        const eventList = evRes.data || []
        setEvents(eventList)
        setCategories(catRes.data || [])

        // When arriving from dashboard with ?eventId=..., auto-open details modal.
        const selectedId = Number(searchParams.get('eventId'))
        if (selectedId) {
          const selectedEvent = eventList.find(e => e.eventId === selectedId)
          if (selectedEvent) {
            openEventDetail(selectedEvent)
          }
          setSearchParams({}, { replace: true })
        }
      }).catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false))
  }, [searchParams, setSearchParams])

  const handleRegister = async (event) => {
    if (user?.status !== 'Approved') {
      toast.error('Your account is waiting for admin approval.')
      return
    }

    if (!studentProfile?.studentId) { toast.error('Student profile not found'); return }
    const registrationCount = event.registrationCount ?? 0
    const isFull = event.maxParticipants > 0 && registrationCount >= event.maxParticipants
    if (isFull) {
      toast.error('This event is full')
      return
    }

    setRegistering(true)
    try {
      await registrationService.create({
        studentId: studentProfile.studentId,
        eventId: event.eventId,
      })
      toast.success(`Registered for "${event.title}"!`)
      setShowDetail(null)
      // Refresh
      const res = await eventService.getAll()
      setEvents(res.data || [])
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed')
      toast.error(msg)
    } finally {
      setRegistering(false)
    }
  }

  const filtered = events.filter(ev => {
    const ms = !search || ev.title?.toLowerCase().includes(search.toLowerCase())
    const mt = !filterType || ev.eventType === filterType
    const mc = !filterCat || String(ev.categoryId) === String(filterCat)
    return ms && mt && mc
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Browse Events" subtitle={`${filtered.length} events available`} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-dark pl-10" placeholder="Search events..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark max-w-[160px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input-dark max-w-[180px]" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
        </select>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Calendar} title="No events found" message="Try adjusting your search or filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <EventCard
              key={ev.eventId}
              event={ev}
              isAdmin={false}
              onView={() => openEventDetail(ev)}
              onRegister={() => openEventDetail(ev)}
            />
          ))}
        </div>
      )}

      {/* Event detail / registration modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Event Details" size="lg">
        {showDetail && (
          (() => {
            const registrationCount = showDetail.registrationCount ?? 0
            const isUpcoming = new Date(showDetail.eventDate) > new Date()
            const hasCapacityLimit = showDetail.maxParticipants > 0
            const isFull = hasCapacityLimit && registrationCount >= showDetail.maxParticipants

            return (
          <div className="space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-display font-bold text-xl text-white">{showDetail.title}</h2>
                <Badge>{showDetail.eventType}</Badge>
              </div>
              {showDetail.description && (
                <p className="text-sm text-gray-400 leading-relaxed">{showDetail.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['📅 Date', formatDateTime(showDetail.eventDate)],
                ['📍 Location', showDetail.location || 'TBA'],
                ['👥 Max Participants', showDetail.maxParticipants || '∞'],
                ['✅ Registered', `${registrationCount} students`],
              ].map(([label, val]) => (
                <div key={label} className="bg-surface-2 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-white text-sm mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Availability bar */}
            {hasCapacityLimit && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Capacity</span>
                  <span>{registrationCount}/{showDetail.maxParticipants}</span>
                </div>
                <div className="w-full bg-surface-3 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (registrationCount / showDetail.maxParticipants) > 0.9
                        ? 'bg-rose-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(100, (registrationCount / showDetail.maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {isUpcoming && !isFull ? (
              <button
                onClick={() => handleRegister(showDetail)}
                disabled={registering}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {registering ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : '🎯 Register for This Event'}
              </button>
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center text-sm text-rose-400">
                {!isUpcoming ? 'This event has already passed' : 'This event is full'}
              </div>
            )}
          </div>
            )
          })()
        )}
      </Modal>
    </div>
  )
}
