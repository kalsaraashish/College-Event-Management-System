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
import AdminPendingStudents from './pages/admin/PendingStudents'
import AdminEvents from './pages/admin/Events'
import AdminCategories from './pages/admin/Categories'
import AdminStudents from './pages/admin/Students'
import AdminAttendance from './pages/admin/Attendance'
import AdminReports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentCompleteProfile from './pages/student/CompleteProfile'
import StudentEvents from './pages/student/Events'
import StudentMyEvents from './pages/student/MyEvents'

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
              <Route path="/admin/pending-students" element={<AdminPendingStudents />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/students" element={<AdminStudents />} />
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
              <Route path="/student/complete-profile" element={<StudentCompleteProfile />} />
              <Route path="/student/events" element={<StudentEvents />} />
              <Route path="/student/my-events" element={<StudentMyEvents />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
