import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ requiredRole, allowedRoles }) {
  const { isAuthenticated, user, profileResolved } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'Admin' ? '/admin/dashboard' : user?.role === 'Organizer' ? '/organizer/dashboard' : '/student/dashboard'} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'Admin' ? '/admin/dashboard' : user?.role === 'Organizer' ? '/organizer/dashboard' : '/student/dashboard'} replace />
  }

  if (user?.role === 'Student') {
    if (!profileResolved) return null

    const needsProfile = user?.status === 'Approved' && !user?.hasStudentProfile
    const onCompleteProfilePage = location.pathname === '/student/complete-profile'

    if (needsProfile && !onCompleteProfilePage) {
      return <Navigate to="/student/complete-profile" replace />
    }

    if (!needsProfile && onCompleteProfilePage) {
      return <Navigate to="/student/dashboard" replace />
    }
  }

  return <Outlet />
}
