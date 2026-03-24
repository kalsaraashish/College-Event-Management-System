import { Calendar, MapPin, Users, Tag, Clock } from 'lucide-react'
import { formatDate } from '../utils/constants'
import { Badge } from './UI'

export default function EventCard({ event, onView, onRegister, onEdit, onDelete, showActions = true, isAdmin = false }) {
  const isUpcoming = new Date(event.eventDate) > new Date()
  const registrationCount = event.registrationCount ?? 0
  const hasCapacityLimit = event.maxParticipants > 0
  const isFull = hasCapacityLimit && registrationCount >= event.maxParticipants

  const typeColors = {
    Academic: 'brand',
    Cultural: 'info',
    Sports: 'warning',
    Technical: 'success',
    Workshop: 'success',
    Seminar: 'gray',
    Other: 'gray',
  }

  return (
    <div className="card hover:border-brand-600/40 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer flex flex-col h-full">
      {/* Header bar */}
      <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-brand-600 to-accent-cyan mb-4 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors"
          onClick={onView}
        >
          {event.title}
        </h3>
        <Badge variant={typeColors[event.eventType] || 'gray'}>
          {event.eventType}
        </Badge>
      </div>

      {event.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{event.description}</p>
      )}

      <div className="space-y-1.5 mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={12} className="text-brand-400 flex-shrink-0" />
          <span>{formatDate(event.eventDate)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={12} className="text-accent-cyan flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Users size={12} className="text-accent-amber flex-shrink-0" />
          <span>
            {registrationCount}/{hasCapacityLimit ? event.maxParticipants : '∞'}
            {isFull && <span className="ml-1 text-rose-400">(Full)</span>}
          </span>
        </div>
        {event.categoryName && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Tag size={12} className="text-gray-500 flex-shrink-0" />
            <span>{event.categoryName}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-surface-3">
          <button
            onClick={onView}
            className="btn-secondary text-xs py-1.5 flex-1"
          >
            View Details
          </button>
          {isAdmin ? (
            <>
              <button onClick={onEdit} className="btn-secondary text-xs py-1.5 flex-1">Edit</button>
              <button onClick={onDelete} className="btn-danger text-xs py-1.5 flex-1">Delete</button>
            </>
          ) : (
            isUpcoming && !isFull && (
              <button
                onClick={onRegister}
                className="btn-primary text-xs py-1.5 flex-1"
              >
                Register
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
