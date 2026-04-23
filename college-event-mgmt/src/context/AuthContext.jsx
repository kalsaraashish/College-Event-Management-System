import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { studentService } from '../services/eventService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)

  const persistUser = useCallback((nextUser) => {

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('user')
    }
    setUser(nextUser)
  }, [])

  // Fetch student profile if role is Student
  useEffect(() => {
    if (user?.role === 'Student' && user?.userId) {
      setProfileResolved(false)
      studentService.getByUserId(user.userId)
        .then(res => {
          setStudentProfile(res.data)
          if (!user.hasStudentProfile) {
            persistUser({ ...user, hasStudentProfile: true })
          }
        })
        .catch(() => {
          setStudentProfile(null)
          if (user.hasStudentProfile) {
            persistUser({ ...user, hasStudentProfile: false })
          }
        })
        .finally(() => setProfileResolved(true))
    } else {
      setStudentProfile(null)
      setProfileResolved(true)
    }
  }, [persistUser, user?.hasStudentProfile, user?.role, user?.userId])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const res = await authService.login(credentials)
      const { token: jwt, user: userData } = res.data
      localStorage.setItem('token', jwt)
      setToken(jwt)
      persistUser(userData)

      const redirectTo = userData.role === 'Admin'
        ? '/admin/dashboard'
        : userData.status === 'Approved' && !userData.hasStudentProfile
          ? '/student/profile'
          : '/student/dashboard'

      return { success: true, role: userData.role, redirectTo, user: userData }
    } catch (err) {
      const data = err.response?.data
      const msg = (typeof data === 'string' ? data : data?.message) || 'Login failed'
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [persistUser])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      await authService.register(data)
      return { success: true }
    } catch (err) {
      const data = err.response?.data
      const msg = (typeof data === 'string' ? data : data?.message) || 'Registration failed'
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setStudentProfile(null)
    setProfileResolved(true)
  }, [])

  const completeStudentProfile = useCallback(async (data) => {
    const res = await studentService.completeProfile(data)
    setStudentProfile(res.data)
    if (user) {
      persistUser({ ...user, hasStudentProfile: true })
    }
    return res
  }, [persistUser, user])

  const updateStudentProfile = useCallback(async (data) => {
    const res = await studentService.updateProfile(data)
    setStudentProfile(res.data)
    if (user) {
      persistUser({
        ...user,
        name: res.data?.name ?? user.name,
        email: res.data?.email ?? user.email,
      })
    }
    return res
  }, [persistUser, user])

  const isAdmin = user?.role === 'Admin'
  const isStudent = user?.role === 'Student'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      studentProfile,
      profileResolved,
      loading,
      login,
      register,
      logout,
      completeStudentProfile,
      updateStudentProfile,
      isAdmin,
      isStudent,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
