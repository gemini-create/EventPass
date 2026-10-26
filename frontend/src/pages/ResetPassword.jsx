import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import PasswordInput from '../components/PasswordInput'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const email = params.get('email')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await api.post('/reset-password', { token, email, password, password_confirmation: confirm })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const d = err.response?.data
      setError(d?.errors?.password?.[0] || d?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="center-box">
        <div className="card card-pad anim">
          <h1>Invalid link</h1>
          <p>This reset link is incomplete. Request a new one.</p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: 16 }}>Request new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form-wrap" style={{ minHeight: '100vh' }}>
      <form onSubmit={submit} className="card auth-form form">
        <div>
          <h1>Set a new password</h1>
          <p className="sub">For {email}</p>
        </div>

        {done ? (
          <div className="alert" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }} role="status">
            Password updated. Taking you to the login page...
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="np">New password</label>
              <PasswordInput id="np" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" minLength={8} autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="cp">Confirm password</label>
              <PasswordInput id="cp" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the new password" minLength={8} autoComplete="new-password" />
            </div>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button disabled={loading} className="btn btn-primary btn-lg btn-block">
              {loading ? <><span className="spinner" /> Saving...</> : 'Update password'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}