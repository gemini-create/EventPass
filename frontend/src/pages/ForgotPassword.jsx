import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-wrap" style={{ minHeight: '100vh' }}>
      <form onSubmit={submit} className="card auth-form form">
        <div>
          <h1>Forgot password?</h1>
          <p className="sub">Enter your email and we will send you a reset link.</p>
        </div>

        {sent ? (
          <div className="alert" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }} role="status">
            If that email is registered, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <>
            <label className="field">
              Email
              <input className="input" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button disabled={loading} className="btn btn-primary btn-lg btn-block">
              {loading ? <><span className="spinner" /> Sending...</> : 'Send reset link'}
            </button>
          </>
        )}

        <Link to="/login" className="link-btn" style={{ alignSelf: 'center' }}>Back to log in</Link>
      </form>
    </div>
  )
}