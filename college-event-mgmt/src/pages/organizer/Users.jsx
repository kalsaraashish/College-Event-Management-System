import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, Users, Search, Loader2, Shield, GraduationCap } from 'lucide-react'
import { userService } from '../../services/eventService'
import { Modal, ConfirmModal, PageHeader, FormField, EmptyState, TableSkeleton, Badge } from '../../components/UI'
import { getInitials, formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student', status: 'Pending' })

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await userService.getAll(); setUsers(res.data || []) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm({ name: '', email: '', password: '', role: 'Student', status: 'Pending' }); setEditItem(null); setShowModal(true) }
  const openEdit = (u) => { setForm({ name: u.name || '', email: u.email || '', password: '', role: u.role || 'Student', status: u.status || 'Pending' }); setEditItem(u); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    setSaving(true)
    try {
      if (editItem) {
        const payload = {
          userId: editItem.userId,
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        }
        await userService.update(editItem.userId, payload)
        toast.success('User updated!')
      }
      else {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          passwordHash: form.password,
        }
        await userService.create(payload)
        toast.success('User created!')
      }
      setShowModal(false); load()
    } catch (err) {
      const apiMessage = err?.response?.data?.message
        || (typeof err?.response?.data === 'string' ? err.response.data : null)
      toast.error(apiMessage || 'Failed to save user')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await userService.remove(deleteItem.userId); toast.success('User deleted'); setDeleteItem(null); load() }
    catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const filtered = users.filter(u => !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Users" subtitle={`${users.length} registered users`}
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input-dark pl-10" placeholder="Search users..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-brand-400' },
          { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: Shield, color: 'text-accent-rose' },
          { label: 'Students', value: users.filter(u => u.role === 'Student').length, icon: GraduationCap, color: 'text-accent-cyan' },
        ].map(item => (
          <div key={item.label} className="card flex items-center gap-3">
            <item.icon size={20} className={item.color} />
            <div>
              <p className="font-display font-bold text-xl text-white">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton rows={6} cols={4} /> :
         filtered.length === 0 ? <EmptyState icon={Users} title="No users found" /> : (
          <table className="table-dark">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.userId}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(u.name)}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-xs">{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'Admin' ? 'danger' : 'info'}>{u.role}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.status === 'Approved' ? 'success' : u.status === 'Rejected' ? 'danger' : 'warning'}>{u.status || 'Pending'}</Badge>
                  </td>
                  <td className="text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-accent-amber hover:bg-amber-500/10 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteItem(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <input className="input-dark" placeholder="John Doe" value={form.name} onChange={set('name')} />
          </FormField>
          <FormField label="Email" required>
            <input type="email" className="input-dark" placeholder="john@college.edu" value={form.email} onChange={set('email')} />
          </FormField>
          {!editItem && (
            <FormField label="Password" required>
              <input type="password" className="input-dark" placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
            </FormField>
          )}
          <FormField label="Role">
            <select className="input-dark" value={form.role} onChange={set('role')}>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
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
        <div className="flex gap-3 mt-5 pt-4 border-t border-surface-3">
          <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editItem ? 'Update' : 'Create User'}
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete User" message={`Delete user "${deleteItem?.name}"?`} />
    </div>
  )
}
