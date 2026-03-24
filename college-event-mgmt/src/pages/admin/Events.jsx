import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Filter, List, Grid, Loader2, Edit2, Trash2, Eye } from 'lucide-react'
import { eventService, categoryService } from '../../services/eventService'
import EventCard from '../../components/EventCard'
import { Modal, ConfirmModal, PageHeader, FormField, Badge, TableSkeleton, EmptyState } from '../../components/UI'
import { formatDate, EVENT_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

const emptyForm = {
  title: '', description: '', eventDate: '', location: '',
  maxParticipants: '', eventType: 'Academic', categoryId: ''
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'grid'
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [evRes, catRes] = await Promise.all([
        eventService.getAll(),
        categoryService.getAll(),
      ])
      setEvents(evRes.data || [])
      setCategories(catRes.data || [])
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowModal(true) }
  const openEdit = (ev) => {
    setEditItem(ev)
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      eventDate: ev.eventDate ? ev.eventDate.slice(0, 16) : '',
      location: ev.location || '',
      maxParticipants: ev.maxParticipants || '',
      eventType: ev.eventType || 'Academic',
      categoryId: ev.categoryId || '',
    })
    setShowModal(true)
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.title || !form.eventDate) { toast.error('Title and date are required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        maxParticipants: form.maxParticipants === '' ? 0 : Number(form.maxParticipants),
        categoryId: form.categoryId === '' ? null : Number(form.categoryId),
      }

      if (editItem) {
        payload.eventId = editItem.eventId
        await eventService.update(editItem.eventId, payload)
        toast.success('Event updated!')
      } else {
        await eventService.create(payload)
        toast.success('Event created!')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      await eventService.remove(deleteItem.eventId)
      toast.success('Event deleted')
      setDeleteItem(null)
      loadData()
    } catch {
      toast.error('Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = events.filter(ev => {
    const matchSearch = !search || ev.title?.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || ev.eventType === filterType
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Events"
        subtitle={`${events.length} total events`}
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Event
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-dark pl-10" placeholder="Search events..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark max-w-[180px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-1 bg-surface-3 rounded-xl p-1">
          {[['list', List], ['grid', Grid]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-2 rounded-lg transition-all ${view === v ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card"><TableSkeleton rows={5} cols={4} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Filter} title="No events found" message="Try adjusting your filters or create a new event"
            action={<button onClick={openCreate} className="btn-primary">Create Event</button>} />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <EventCard key={ev.eventId} event={ev} isAdmin
              onView={() => setShowDetail(ev)}
              onEdit={() => openEdit(ev)}
              onDelete={() => setDeleteItem(ev)}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Type</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.eventId}>
                  <td className="font-medium text-white">{ev.title}</td>
                  <td>{formatDate(ev.eventDate)}</td>
                  <td>{ev.location || '—'}</td>
                  <td><Badge variant="default">{ev.eventType}</Badge></td>
                  <td>{ev.registrationCount ?? 0}/{ev.maxParticipants ?? '∞'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowDetail(ev)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg text-gray-400 hover:text-accent-amber hover:bg-amber-500/10 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteItem(ev)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Event' : 'Create Event'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Title" required>
              <input className="input-dark" placeholder="Event title" value={form.title} onChange={set('title')} />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <textarea className="input-dark resize-none" rows={3} placeholder="Event description"
                value={form.description} onChange={set('description')} />
            </FormField>
          </div>
          <FormField label="Event Date" required>
            <input type="datetime-local" className="input-dark" value={form.eventDate} onChange={set('eventDate')} />
          </FormField>
          <FormField label="Location">
            <input className="input-dark" placeholder="e.g. Main Auditorium" value={form.location} onChange={set('location')} />
          </FormField>
          <FormField label="Max Participants">
            <input type="number" className="input-dark" placeholder="100" value={form.maxParticipants} onChange={set('maxParticipants')} />
          </FormField>
          <FormField label="Event Type">
            <select className="input-dark" value={form.eventType} onChange={set('eventType')}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Category">
              <select className="input-dark" value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </FormField>
          </div>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-surface-3">
          <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editItem ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Event Details" size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">{showDetail.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{showDetail.description || 'No description'}</p>
              </div>
              <Badge>{showDetail.eventType}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Date', formatDate(showDetail.eventDate)],
                ['Location', showDetail.location || '—'],
                ['Max Participants', showDetail.maxParticipants],
                ['Registrations', showDetail.registrationCount ?? 0],
              ].map(([label, val]) => (
                <div key={label} className="bg-surface-2 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-white mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowDetail(null); openEdit(showDetail) }} className="btn-secondary flex-1">Edit</button>
              <button onClick={() => { setShowDetail(null); setDeleteItem(showDetail) }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
