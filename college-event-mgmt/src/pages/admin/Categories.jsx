import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react'
import { categoryService } from '../../services/eventService'
import { Modal, ConfirmModal, PageHeader, FormField, EmptyState } from '../../components/UI'
import toast from 'react-hot-toast'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState({ categoryName: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryService.getAll()
      setCategories(res.data || [])
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm({ categoryName: '', description: '' }); setEditItem(null); setShowModal(true) }
  const openEdit = (c) => { setForm({ categoryName: c.categoryName, description: c.description || '' }); setEditItem(c); setShowModal(true) }

  const handleSave = async () => {
    if (!form.categoryName) { toast.error('Category name is required'); return }
    setSaving(true)
    try {
      if (editItem) {
        const payload = { ...form, categoryId: editItem.categoryId }
        await categoryService.update(editItem.categoryId, payload)
        toast.success('Category updated!')
      } else {
        await categoryService.create(form)
        toast.success('Category created!')
      }
      setShowModal(false); load()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoryService.remove(deleteItem.categoryId)
      toast.success('Category deleted')
      setDeleteItem(null); load()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const colors = ['from-brand-500 to-brand-700', 'from-cyan-500 to-teal-700', 'from-amber-500 to-orange-700',
    'from-rose-500 to-pink-700', 'from-violet-500 to-purple-700', 'from-emerald-500 to-green-700']

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Categories" subtitle={`${categories.length} categories`}
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Category
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={Tag} title="No categories yet" message="Create categories to organize your events"
            action={<button onClick={openCreate} className="btn-primary">Add Category</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.categoryId} className="card group hover:border-brand-600/40 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center mb-3`}>
                  <Tag size={18} className="text-white" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-accent-amber hover:bg-amber-500/10 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteItem(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-white">{cat.categoryName}</h3>
              {cat.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>}
              {cat.eventCount !== undefined && (
                <p className="text-xs text-brand-400 mt-2 font-mono">{cat.eventCount} events</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <FormField label="Category Name" required>
            <input className="input-dark" placeholder="e.g. Sports & Games" value={form.categoryName}
              onChange={e => setForm(f => ({ ...f, categoryName: e.target.value }))} />
          </FormField>
          <FormField label="Description">
            <textarea className="input-dark resize-none" rows={3} placeholder="Brief description..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-surface-3">
          <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editItem ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Category"
        message={`Delete "${deleteItem?.categoryName}"? Events in this category may be affected.`} />
    </div>
  )
}
