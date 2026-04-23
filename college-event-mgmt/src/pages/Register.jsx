import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'Student'
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const result = await register({
      name: form.name, email: form.email,
      password: form.password, role: form.role
    })
    setLoading(false)
    if (result.success) {
      toast.success('Registration submitted. Please log in and wait for admin approval.')
      navigate('/login')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 bg-mesh-brand flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan mb-4 glow-brand">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join CollegeEvents portal</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
              Student sign-ups require admin approval before event registration is enabled.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="John Doe" className="input-dark !pl-8"
                  value={form.name} onChange={set('name')} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" placeholder="you@college.edu" className="input-dark !pl-8"
                  value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" className="input-dark !pl-8 pr-10"
                  value={form.password} onChange={set('password')} required minLength={8} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="Repeat password" className="input-dark !pl-8"
                  value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <label className={`cursor-pointer flex items-center justify-center p-2 rounded-lg border text-sm font-medium transition-colors ${form.role === 'Student' ? 'border-brand-500 bg-brand-500/20 text-white' : 'border-gray-700 bg-surface-1 text-gray-400 hover:bg-surface-2'}`}>
                  <input type="radio" name="role" value="Student" checked={form.role === 'Student'} onChange={set('role')} className="hidden" />
                  Student
                </label>
                <label className={`cursor-pointer flex items-center justify-center p-2 rounded-lg border text-sm font-medium transition-colors ${form.role === 'Organizer' ? 'border-brand-500 bg-brand-500/20 text-white' : 'border-gray-700 bg-surface-1 text-gray-400 hover:bg-surface-2'}`}>
                  <input type="radio" name="role" value="Organizer" checked={form.role === 'Organizer'} onChange={set('role')} className="hidden" />
                  Organizer
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
