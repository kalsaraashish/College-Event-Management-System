import { useEffect, useState, useCallback } from 'react'
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react'
import { notificationService, eventService } from '../../services/eventService'
import { Modal, ConfirmModal, PageHeader, FormField, EmptyState, TableSkeleton } from '../../components/UI'
import { formatDateTime } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', eventId: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [notifRes, evRes] = await Promise.all([notificationService.getAll(), eventService.getAll()])
      setNotifications(notifRes.data || [])
      setEvents(evRes.data || [])
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.title || !form.message) { toast.error('Title and message required'); return }
    setSaving(true)
    try {
      await notificationService.create(form)
      toast.success('Notification sent!')
      setShowModal(false)
      setForm({ title: '', message: '', eventId: '' })
      load()
    } catch { toast.error('Failed to send notification') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await notificationService.remove(deleteItem.notificationId); toast.success('Deleted'); setDeleteItem(null); load() }
    catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" subtitle={`${notifications.length} notifications`}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Send Notification
          </button>
        }
      />

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : notifications.length === 0 ? (
          <div className="card">
            <EmptyState icon={Bell} title="No notifications" message="Send a notification to students"
              action={<button onClick={() => setShowModal(true)} className="btn-primary">Send Now</button>} />
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.notificationId} className="card flex items-start gap-4 hover:border-brand-600/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    {n.eventTitle && (
                      <p className="text-xs text-brand-400 mt-1">📅 {n.eventTitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-600">{formatDateTime(n.createdAt)}</span>
                    <button onClick={() => setDeleteItem(n)} className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Send Notification">
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className="input-dark" placeholder="Notification title" value={form.title} onChange={set('title')} />
          </FormField>
          <FormField label="Message" required>
            <textarea className="input-dark resize-none" rows={4} placeholder="Write your message..."
              value={form.message} onChange={set('message')} />
          </FormField>
          <FormField label="Link to Event (optional)">
            <select className="input-dark" value={form.eventId} onChange={set('eventId')}>
              <option value="">Select event (optional)</option>
              {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.title}</option>)}
            </select>
          </FormField>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-surface-3">
          <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Bell size={14} /> Send
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Notification" message={`Delete "${deleteItem?.title}"?`} />
    </div>
  )
}
