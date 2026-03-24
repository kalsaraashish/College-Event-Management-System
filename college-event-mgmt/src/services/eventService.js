import api from './api'

export const eventService = {
  getAll: (params) => api.get('/Events', { params }),
  getById: (id) => api.get(`/Events/${id}`),
  create: (data) => api.post('/Events', data),
  update: (id, data) => api.put(`/Events/${id}`, data),
  remove: (id) => api.delete(`/Events/${id}`),
  search: (params) => api.get('/Events/search', { params }),
  filter: (params) => api.get('/Events/filter', { params }),
  upcoming: () => api.get('/Events/upcoming'),
  getByStudent: (studentId) => api.get(`/Events/${studentId}/events`),
  getAvailableSlots: (eventId) => api.get(`/Events/${eventId}/available-slots`),
}

export const categoryService = {
  getAll: () => api.get('/Categories'),
  getById: (id) => api.get(`/Categories/${id}`),
  create: (data) => api.post('/Categories', data),
  update: (id, data) => api.put(`/Categories/${id}`, data),
  remove: (id) => api.delete(`/Categories/${id}`),
}

export const registrationService = {
  create: (data) => api.post('/EventRegistration', data),
  getAll: () => api.get('/EventRegistration'),
  remove: (id) => api.delete(`/EventRegistration/${id}`),
  getByEvent: (eventId) => api.get(`/EventRegistration/event/${eventId}`),
  getByStudent: (studentId) => api.get(`/EventRegistration/student/${studentId}`),
}

export const attendanceService = {
  mark: (data) => api.post('/Attendance', data),
  update: (id, data) => api.put(`/Attendance/${id}`, data),
  markBulk: (data) => api.post('/Attendance/mark-bulk', data),
  getByEvent: (eventId) => api.get(`/Attendance/event/${eventId}`),
  getSummary: (eventId) => api.get(`/Attendance/event/${eventId}/summary`),
}

export const studentService = {
  getAll: () => api.get('/Students'),
  getById: (id) => api.get(`/Students/${id}`),
  getByUserId: (userId) => api.get(`/Students/user/${userId}`),
  completeProfile: (data) => api.post('/student/profile', data),
  create: (data) => api.post('/Students', data),
  update: (id, data) => api.put(`/Students/${id}`, data),
  remove: (id) => api.delete(`/Students/${id}`),
}

export const userService = {
  getAll: () => api.get('/Users'),
  getById: (id) => api.get(`/Users/${id}`),
  create: (data) => api.post('/Users', data),
  update: (id, data) => api.put(`/Users/${id}`, data),
  remove: (id) => api.delete(`/Users/${id}`),
}

export const adminService = {
  getPendingStudents: () => api.get('/Admin/pending-students'),
  approveStudent: (userId) => api.put(`/Admin/approve-student/${userId}`),
}

export const notificationService = {
  getAll: () => api.get('/Notifications'),
  create: (data) => api.post('/Notifications', data),
  getByEvent: (eventId) => api.get(`/Notifications/event/${eventId}`),
  remove: (id) => api.delete(`/Notifications/${id}`),
}

export const dashboardService = {
  getStats: () => api.get('/Dashboard/stats'),
  getTodayEvents: () => api.get('/Dashboard/today-events'),
  getStudentDashboard: (studentId) => api.get(`/Dashboard/student/${studentId}`),
}

export const reportService = {
  getEvents: () => api.get('/Reports/events'),
  getParticipants: (eventId) => api.get(`/Reports/event/${eventId}/participants`),
  getAttendance: (eventId) => api.get(`/Reports/event/${eventId}/attendance`),
  getStudentEvents: (studentId) => api.get(`/Reports/student/${studentId}/events`),
  getTopEvents: () => api.get('/Reports/top-events'),
  getEventSummary: (eventId) => api.get(`/Reports/event/${eventId}/summary`),
}
