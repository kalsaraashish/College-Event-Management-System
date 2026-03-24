import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2 } from 'lucide-react'
import { PageHeader, FormField } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { user, completeStudentProfile } = useAuth()
  const [form, setForm] = useState({ enrollmentNo: '', course: '', year: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const set = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.enrollmentNo || !form.course || !form.year || !form.phone) {
      toast.error('All profile fields are required')
      return
    }

    setSaving(true)
    try {
      await completeStudentProfile({
        enrollmentNo: form.enrollmentNo,
        course: form.course,
        year: Number(form.year),
        phone: form.phone,
      })
      toast.success('Profile completed successfully')
      navigate('/student/dashboard', { replace: true })
    } catch (err) {
      const data = err?.response?.data
      toast.error((typeof data === 'string' ? data : data?.message) || 'Failed to complete profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader
        title="Complete Student Profile"
        subtitle={user?.status === 'Approved'
          ? 'Your account is approved. Add your academic details to start registering for events.'
          : 'Your account must be approved before the profile can be completed.'}
      />

      <div className="card">
        <div className="flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/10 p-4 mb-5">
          <GraduationCap size={20} className="text-brand-300" />
          <p className="text-sm text-gray-300">
            Enrollment number, course, year, and phone are required before event registration is enabled.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Enrollment No" required>
            <input className="input-dark" value={form.enrollmentNo} onChange={set('enrollmentNo')} placeholder="e.g. CE2026001" />
          </FormField>

          <FormField label="Course" required>
            <input className="input-dark" value={form.course} onChange={set('course')} placeholder="e.g. B.Tech CSE" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Year" required>
              <select className="input-dark" value={form.year} onChange={set('year')}>
                <option value="">Select year</option>
                {[1, 2, 3, 4].map(year => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </FormField>

            <FormField label="Phone" required>
              <input className="input-dark" value={form.phone} onChange={set('phone')} placeholder="e.g. 9876543210" />
            </FormField>
          </div>

          <button type="submit" disabled={saving || user?.status !== 'Approved'} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Profile
          </button>
        </form>
      </div>
    </div>
  )
}