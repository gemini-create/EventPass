import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventForm from './pages/EventForm'
import CheckIn from './pages/CheckIn'
import Users from './pages/Users'
import Register from './pages/Register'
import Ticket from './pages/Ticket'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function Protected({ children, roles }) {
  const { token, user } = useAuth()
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin/checkin" replace />
  return children
}

function Home() {
  const { user } = useAuth()
  return user.role === 'staff' ? <Navigate to="/admin/checkin" replace /> : <Dashboard />
}

const adminOnly = (el) => <Protected roles={['admin']}>{el}</Protected>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/:slug" element={<Register />} />
          <Route path="/ticket/:token" element={<Ticket />} />

          <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<Home />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="events" element={adminOnly(<Events />)} />
            <Route path="events/new" element={adminOnly(<EventForm />)} />
            <Route path="events/:id/edit" element={adminOnly(<EventForm />)} />
            <Route path="users" element={adminOnly(<Users />)} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}