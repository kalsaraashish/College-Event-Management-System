# CollegeEvents — Frontend Management System

A modern React frontend for the College Event Management System, built with Vite + Tailwind CSS.

---

## Tech Stack

- **React 18** + Vite
- **Tailwind CSS** (custom dark theme)
- **Axios** (JWT-attached API calls)
- **React Router DOM v6** (role-based routing)
- **React Hot Toast** (notifications)
- **Lucide React** (icons)
- **Context API** (auth state)
- **Google Fonts**: Syne (display) + Outfit (body) + JetBrains Mono

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API Base URL

Edit `src/utils/constants.js`:

```js
export const API_BASE_URL = 'https://localhost:7001/api'
// ↑ Change port to match your ASP.NET Core backend
```

### 3. Run dev server

```bash
npm run dev
```

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Sidebar + Navbar shell
│   ├── Sidebar.jsx         # Navigation sidebar
│   ├── Navbar.jsx          # Top bar
│   ├── EventCard.jsx       # Reusable event card
│   ├── ProtectedRoute.jsx  # Role-based route guard
│   └── UI.jsx              # StatCard, Modal, Badge, etc.
│
├── context/
│   └── AuthContext.jsx     # Auth state + login/logout
│
├── hooks/
│   └── useAuth.js          # Re-export of useAuth
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── admin/
│   │   ├── Dashboard.jsx   # Stats + today events
│   │   ├── Events.jsx      # Full CRUD
│   │   ├── Categories.jsx  # Full CRUD
│   │   ├── Students.jsx    # Full CRUD
│   │   ├── Users.jsx       # Full CRUD
│   │   ├── Attendance.jsx  # Mark / bulk mark
│   │   ├── Notifications.jsx
│   │   └── Reports.jsx     # Overview / top events / event detail
│   └── student/
│       ├── Dashboard.jsx   # Personal stats + upcoming
│       ├── Events.jsx      # Browse + register
│       └── MyEvents.jsx    # My registrations + cancel
│
├── services/
│   ├── api.js              # Axios instance + interceptors
│   ├── authService.js      # Auth endpoints
│   └── eventService.js     # All other API services
│
├── utils/
│   └── constants.js        # API URL, helpers, enums
│
├── App.jsx                 # Routes
└── main.jsx                # Entry point
```

---

## API Integration

All API calls go through `src/services/api.js` which automatically:
- Sets `Content-Type: application/json`
- Attaches `Authorization: Bearer <token>` from localStorage
- Redirects to `/login` on 401 responses

Services available:
| Service | Endpoints |
|---|---|
| `authService` | login, register, changePassword, resetPassword |
| `eventService` | full CRUD + search, filter, upcoming |
| `categoryService` | full CRUD |
| `registrationService` | create, getAll, remove, getByEvent, getByStudent |
| `attendanceService` | mark, update, markBulk, getByEvent, getSummary |
| `studentService` | full CRUD + getByUserId |
| `userService` | full CRUD |
| `notificationService` | getAll, create, getByEvent, remove |
| `dashboardService` | getStats, getTodayEvents, getStudentDashboard |
| `reportService` | events, participants, attendance, topEvents, summary |

---

## Roles & Routes

| Role | After Login → | Routes |
|---|---|---|
| Admin | `/admin/dashboard` | `/admin/*` |
| Student | `/student/dashboard` | `/student/*` |

---

## Build

```bash
npm run build
```

Output in `dist/` folder, ready to serve.
