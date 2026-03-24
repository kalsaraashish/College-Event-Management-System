import { X, AlertTriangle, Loader2 } from 'lucide-react'

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'brand', change }) {
  const colorMap = {
    brand: 'from-brand-600/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20 text-accent-cyan',
    amber: 'from-accent-amber/20 to-accent-amber/5 border-accent-amber/20 text-accent-amber',
    rose: 'from-accent-rose/20 to-accent-rose/5 border-accent-rose/20 text-accent-rose',
  }

  return (
    <div className={`card bg-gradient-to-br ${colorMap[color]} animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold text-white mt-1.5">
            {value ?? <span className="skeleton inline-block w-16 h-8 rounded" />}
          </p>
          {change !== undefined && (
            <p className="text-xs mt-1 text-gray-500">{change}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center`}>
            <Icon size={20} className="opacity-80" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${sizeMap[size]} w-full`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-3">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle size={22} className="text-rose-400" />
        </div>
        <p className="text-sm text-gray-300">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-brand-500/10 text-brand-300 border border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  }
  return (
    <span className={`badge ${variants[variant]}`}>{children}</span>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-surface-4 flex items-center justify-center">
          <Icon size={24} className="text-gray-600" />
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-400">{title}</p>
        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  )
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-brand-500" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
