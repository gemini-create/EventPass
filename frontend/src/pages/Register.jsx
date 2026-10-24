import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import PublicHeader from '../components/PublicHeader'

export default function Register() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/public/events/${slug}`)
      .then(({ data }) => setEvent(data))
      .catch(() => setNotFound(true))
  }, [slug])

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      const { data } = await api.post(`/public/events/${slug}/register`, form)
      navigate(`/ticket/${data.token}`)
    } catch (err) {
      const d = err.response?.data
      if (d?.errors) setErrors(d.errors)
      else setMessage(d?.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <div className="center-box">
        <div className="card card-pad anim">
          <h1>Event not found</h1>
          <p>Check the link you were given and try again.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return <div className="center-box"><span className="skeleton" style={{ width: 240, height: 24 }} /></div>
  }

  if (event.is_full) {
    return (
      <div className="public">
        <PublicHeader label={event.title} title="Registration closed" event={event} />
        <div className="public-body">
          <div className="card closed">
            <div className="icon-circle warn">!</div>
            <h2>This event is full</h2>
            <p className="note" style={{ marginTop: 8 }}>
              All {event.capacity} seats have been taken. Contact the organizer if you need a spot.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const input = (name, label, props = {}) => (
    <label className="field">
      {label}
      <input className={`input ${errors[name] ? 'invalid' : ''}`} value={form[name]} onChange={set(name)} {...props} />
      {errors[name] && <span className="error-text">{errors[name][0]}</span>}
    </label>
  )

  return (
    <div className="public">
      <PublicHeader label="You're invited" title={event.title} event={event} />
      <div className="public-body">
        <form onSubmit={submit} className="card form">
          <h2>Reserve your seat</h2>
          {event.description && <p className="note" style={{ textAlign: 'left' }}>{event.description}</p>}
          {input('name', 'Full name', { placeholder: 'Ayesha Khan', required: true })}
          {input('email', 'Email', { type: 'email', placeholder: 'name@example.com', required: true })}
          {input('phone', 'Phone (optional)', { placeholder: '0300 1234567' })}
          {message && <div className="alert alert-error" role="alert">{message}</div>}
          <button disabled={saving} className="btn btn-primary btn-lg btn-block">
            {saving ? <><span className="spinner" /> Registering...</> : 'Register'}
          </button>
          <p className="note">Your QR ticket appears right after you register.</p>
        </form>
      </div>
    </div>
  )
}