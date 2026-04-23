import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminApproveUsers from './pages/admin/ApproveUsers'
import AdminEvents from './pages/admin/Events'
import AdminCategories from './pages/admin/Categories'
import AdminStudents from './pages/admin/Students'
import AdminOrganizers from './pages/admin/Organizers'
import AdminAttendance from './pages/admin/Attendance'
import AdminReports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentEvents from './pages/student/Events'
import StudentMyEvents from './pages/student/MyEvents'

// Organizer pages
import OrganizerDashboard from './pages/organizer/Dashboard'
import OrganizerEvents from './pages/organizer/Events'
import OrganizerRegistrations from './pages/organizer/Registrations'
import OrganizerAttendance from './pages/organizer/Attendance'
import OrganizerNotifications from './pages/organizer/Notifications'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/approve-users" element={<AdminApproveUsers />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/organizers" element={<AdminOrganizers />} />
              <Route path="/admin/users" element={<Navigate to="/admin/students" replace />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute requiredRole="Student" />}>
            <Route element={<Layout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/events" element={<StudentEvents />} />
              <Route path="/student/my-events" element={<StudentMyEvents />} />
            </Route>
          </Route>

          {/* Organizer routes */}
          <Route element={<ProtectedRoute requiredRole="Organizer" />}>
            <Route element={<Layout />}>
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/organizer/events" element={<OrganizerEvents />} />
              <Route path="/organizer/registrations" element={<OrganizerRegistrations />} />
              <Route path="/organizer/attendance" element={<OrganizerAttendance />} />
              <Route path="/organizer/notifications" element={<OrganizerNotifications />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
