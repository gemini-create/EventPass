import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import PasswordInput from '../components/PasswordInput'

const empty = { name: '', email: '', password: '', role: 'staff' }

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () =>
    api.get('/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  async function create(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      await api.post('/users', form)
      setForm(empty)
      load()
    } catch (err) {
      const d = err.response?.data
      if (d?.errors) setErrors(d.errors)
      else setMessage(d?.message || 'Could not create the account.')
    } finally {
      setSaving(false)
    }
  }

  async function change(u, changes) {
    setMessage('')
    try {
      await api.put(`/users/${u.id}`, changes)
      load()
    } catch (err) {
      const d = err.response?.data
        setMessage(d?.message || 'Could not update the account.')    }
  }


  return (
    <div className="stack">
      <header className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Admin only</div>
          <h1 className="page-title">Team</h1>
        </div>
      </header>

      <form onSubmit={create} className="card card-pad form">
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Add team member</h2>
        <div className="grid-2">
          <label className="field">
            Full name
            <input className={`input ${errors.name ? 'invalid' : ''}`} value={form.name}
              onChange={set('name')} placeholder="Door Staff" required />
            {errors.name && <span className="error-text">{errors.name[0]}</span>}
          </label>
          <label className="field">
            Email
            <input className={`input ${errors.email ? 'invalid' : ''}`} type="email" value={form.email}
              onChange={set('email')} placeholder="staff@example.com" required />
            {errors.email && <span className="error-text">{errors.email[0]}</span>}
          </label>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="new-pw">Password</label>
            <PasswordInput id="new-pw" value={form.password} onChange={set('password')}
              placeholder="At least 8 characters" minLength={8} autoComplete="new-password" />
            {errors.password && <span className="error-text">{errors.password[0]}</span>}
          </div>
          <label className="field">
            Role
            <select className="select" style={{ width: '100%', height: 48 }} value={form.role} onChange={set('role')}>
              <option value="staff">Staff (check-in only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </label>
        </div>
        {message && <div className="alert alert-error" role="alert">{message}</div>}
        <div className="actions">
          <button disabled={saving} className="btn btn-primary">
            {saving ? <><span className="spinner" /> Creating...</> : 'Create account'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : (
        <section className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                  <td data-label="Name" className="cell-title"><strong>{u.name}</strong></td>
                  <td data-label="Email" className="muted">{u.email}</td>
                  <td data-label="Role"><span className="badge badge-role">{u.role}</span></td>
                  <td data-label="Status">
                    {u.is_active
                      ? <span className="badge badge-ok">Active</span>
                      : <span className="badge badge-off">Disabled</span>}
                  </td>
                  <td data-label="Actions">
                    {u.id === me.id ? (
                      <span className="muted">This is you</span>
                    ) : (
                      <div className="cell-actions">
                        <button className="link-btn" onClick={() => change(u, { is_active: !u.is_active })}>
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button className="link-btn" onClick={() => change(u, { role: u.role === 'admin' ? 'staff' : 'admin' })}>
                          Make {u.role === 'admin' ? 'staff' : 'admin'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}