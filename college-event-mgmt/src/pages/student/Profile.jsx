import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2, Save } from 'lucide-react'
import { PageHeader, FormField } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const { user, studentProfile, completeStudentProfile, updateStudentProfile } = useAuth()
  const isEditing = !!studentProfile
  
  const [form, setForm] = useState({ 
    name: user?.name || studentProfile?.user?.name || '',
    email: user?.email || studentProfile?.user?.email || '',
    enrollmentNo: studentProfile?.enrollmentNo || '', 
    course: studentProfile?.course || '', 
    year: studentProfile?.year || '', 
    phone: studentProfile?.phone || '' 
  })
  const [saving, setSaving] = useState(false)

  // Re-populate if profile loads later
  useEffect(() => {
    if (studentProfile) {
      setForm({
        name: user?.name || studentProfile.user?.name || '',
        email: user?.email || studentProfile.user?.email || '',
        enrollmentNo: studentProfile.enrollmentNo || '',
        course: studentProfile.course || '',
        year: studentProfile.year || '',
        phone: studentProfile.phone || ''
      })
    }
  }, [studentProfile, user?.email, user?.name])

  const set = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isEditing && !form.enrollmentNo) {
      toast.error('Enrollment number is required')
      return
    }

    if (isEditing && (!form.name.trim() || !form.email.trim())) {
      toast.error('Name and email are required')
      return
    }

    setSaving(true)
    try {
      if (isEditing) {
        await updateStudentProfile({
          name: form.name.trim(),
          email: form.email.trim(),
          course: form.course,
          year: Number(form.year),
          phone: form.phone,
        })
        toast.success('Profile updated successfully')
      } else {
        await completeStudentProfile({
          enrollmentNo: form.enrollmentNo,
          course: form.course,
          year: Number(form.year),
          phone: form.phone,
        })
        toast.success('Profile completed successfully')
        navigate('/student/dashboard', { replace: true })
      }
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
        title={isEditing ? "Edit Your Profile" : "Complete Student Profile"}
        subtitle={isEditing 
          ? "Update your academic details"
          : user?.status === 'Approved'
            ? 'Your account is approved. Add your academic details to start registering for events.'
            : 'Your account must be approved before the profile can be completed.'}
      />

      <div className="card">
        <div className="flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/10 p-4 mb-5">
          <GraduationCap size={20} className="text-brand-300" />
          <p className="text-sm text-gray-300">
            Keep your name and email up to date, and complete enrollment, course, year, and phone to enable event registration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Enrollment No" required={!isEditing}>
            <input 
              className={`input-dark ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`} 
              value={form.enrollmentNo} 
              onChange={set('enrollmentNo')} 
              placeholder="e.g. CE2026001" 
              disabled={isEditing}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" required={isEditing}>
              <input
                className="input-dark"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. John Doe"
              />
            </FormField>

            <FormField label="Email" required={isEditing}>
              <input
                type="email"
                className="input-dark"
                value={form.email}
                onChange={set('email')}
                placeholder="e.g. student@college.edu"
              />
            </FormField>
          </div>

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
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEditing ? 'Update Profile' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}