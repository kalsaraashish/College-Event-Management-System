import { useEffect, useState, useCallback } from 'react'
import { Edit2, Trash2, Users, Search, Loader2 } from 'lucide-react'
import { userService } from '../../services/eventService'
import { Modal, ConfirmModal, PageHeader, FormField, EmptyState, TableSkeleton, Badge } from '../../components/UI'
import { getInitials, formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Organizers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Organizer',
    status: 'Pending',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const usersRes = await userService.getAll()
      setUsers(usersRes.data || [])
    } catch { toast.error('Failed to load organizers') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      email: item.email || '',
      role: item.role || 'Organizer',
      status: item.status || 'Pending',
    })
    setEditItem(item)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!editItem) return

      await userService.update(editItem.userId, {
        userId: editItem.userId,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      })

      toast.success('Organizer details updated!')
      setShowModal(false); load()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await userService.remove(deleteItem.userId)
      toast.success('Organizer account removed')
      setDeleteItem(null)
      load()
    }
    catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const filteredRaw = users.filter(u => u.role === 'Organizer')

  const filtered = filteredRaw.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Organizers" subtitle={`${filteredRaw.length} registered organizer accounts`} />

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input-dark !pl-8" placeholder="Search by name, email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton rows={4} cols={4} /> :
          filtered.length === 0 ? (
            <EmptyState icon={Users} title="No organizers found" />
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Organizer</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.userId}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-cyan flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {getInitials(s.name || 'O')}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{s.name || '—'}</p>
                          <p className="text-xs text-gray-500">{s.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={s.status === 'Approved' ? 'success' : s.status === 'Rejected' ? 'danger' : 'warning'}>
                        {s.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-accent-amber hover:bg-amber-500/10 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteItem(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Edit Organizer">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required>
              <input className="input-dark" placeholder="John Doe" value={form.name} onChange={set('name')} />
            </FormField>
            <FormField label="Email" required>
              <input type="email" className="input-dark" placeholder="organizer@college.edu" value={form.email} onChange={set('email')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Role">
              <select className="input-dark" value={form.role} onChange={set('role')}>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
                <option value="Student">Student</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select className="input-dark" value={form.status} onChange={set('status')}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </FormField>
          </div>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-surface-3">
          <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Update
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleting} title="Remove Organizer"
        message={`Delete organizer "${deleteItem?.name}" account?`} />
    </div>
  )
}
