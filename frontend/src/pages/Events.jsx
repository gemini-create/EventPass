import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { fmtDate } from '../utils'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  const load = () =>
    api.get('/events').then(({ data }) => setEvents(data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  async function remove(ev) {
    if (!window.confirm(`Delete "${ev.title}" and all its attendees?`)) return
    await api.delete(`/events/${ev.id}`)
    load()
  }

  function copyLink(ev) {
    navigator.clipboard.writeText(`${window.location.origin}/register/${ev.slug}`)
    setCopied(ev.id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="stack">
      <header className="page-head" style={{ marginBottom: 0 }}>
        <h1 className="page-title">Events</h1>
        <Link to="/admin/events/new" className="btn btn-primary">+ Create event</Link>
      </header>

      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <section className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Event</th><th>Date</th><th>Venue</th><th>Registered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={ev.id} style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}>
                  <td data-label="Event" className="cell-title"><strong>{ev.title}</strong></td>
                  <td data-label="Date" className="muted">{fmtDate(ev.event_date)}</td>
                  <td data-label="Venue" className="muted">{ev.venue}</td>
                  <td data-label="Registered">{ev.attendees_count}{ev.capacity ? ` / ${ev.capacity}` : ''}</td>
                  <td data-label="Actions">
                    <div className="cell-actions">
                      <button onClick={() => copyLink(ev)} className="link-btn">
                        {copied === ev.id ? 'Copied!' : 'Copy link'}
                      </button>
                      <Link to={`/admin/events/${ev.id}/edit`} className="link-btn">Edit</Link>
                      <button onClick={() => remove(ev)} className="link-btn danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="empty">No events yet.</div>}
        </section>
      )}
    </div>
  )
}