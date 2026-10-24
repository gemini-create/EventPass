import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { toInput } from '../utils'

const empty = { title: '', description: '', venue: '', event_date: '', capacity: '' }

export default function EventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/events/${id}`).then(({ data }) =>
      setForm({
        title: data.title,
        description: data.description || '',
        venue: data.venue,
        event_date: toInput(data.event_date),
        capacity: data.capacity || '',
      })
    )
  }, [id])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    const payload = { ...form, capacity: form.capacity === '' ? null : Number(form.capacity) }
    try {
      if (id) await api.put(`/events/${id}`, payload)
      else await api.post('/events', payload)
      navigate('/admin/events')
    } catch (err) {
      setErrors(err.response?.data?.errors || { title: [err.response?.data?.message || 'Could not save.'] })
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, props = {}) => (
    <label className="field">
      {label}
      <input className={`input ${errors[name] ? 'invalid' : ''}`} value={form[name]} onChange={set(name)} {...props} />
      {errors[name] && <span className="error-text">{errors[name][0]}</span>}
    </label>
  )

  return (
    <div style={{ maxWidth: 680 }}>
      <header className="page-head">
        <h1 className="page-title">{id ? 'Edit event' : 'Create event'}</h1>
      </header>
      <form onSubmit={submit} className="card card-pad form">
        {field('title', 'Event title', { placeholder: 'Tech Seminar 2026' })}

        <label className="field">
          Description
          <textarea className="textarea" rows="3" value={form.description} onChange={set('description')}
            placeholder="What attendees should know" />
        </label>

        <div className="grid-2">
          {field('event_date', 'Date and time', { type: 'datetime-local' })}
          {field('venue', 'Venue', { placeholder: 'Main hall, Block B' })}
        </div>

        {field('capacity', 'Seat limit (optional)', { type: 'number', min: 1, placeholder: '150' })}

        <div className="actions">
          <button type="button" onClick={() => navigate('/admin/events')} className="btn btn-secondary">Cancel</button>
          <button disabled={saving} className="btn btn-primary">
            {saving ? <><span className="spinner" /> Saving...</> : 'Save event'}
          </button>
        </div>
      </form>
    </div>
  )
}