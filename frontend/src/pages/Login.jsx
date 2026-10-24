import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-hero">
        <span className="orb a" /><span className="orb b" /><span className="orb c" />
        <div className="brand"><div className="brand-mark">E</div><span>EventPass</span></div>
        <div>
          <h2>Check in every guest in seconds.</h2>
          <ul>
            <li>Share one link and let guests register themselves</li>
            <li>Every guest gets a unique QR ticket</li>
            <li>Scan at the door and block duplicate entry</li>
          </ul>
        </div>
        <small>QR-based event registration and check-in</small>
      </div>

      <div className="auth-form-wrap">
        <form onSubmit={handleSubmit} className="card auth-form form">
          <div className="brand mobile-brand"><div className="brand-mark">E</div><span>EventPass</span></div>
          <div>
            <h1>Welcome back</h1>
            <p className="sub">Log in to manage events and check in attendees.</p>
          </div>

          <label className="field">
            Email
            <input className="input" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="admin@eventpass.test" />
          </label>

          <label className="field">
            Password
            <input className="input" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <button disabled={loading} className="btn btn-primary btn-lg btn-block">
            {loading ? <><span className="spinner" /> Logging in...</> : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}