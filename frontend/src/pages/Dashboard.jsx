import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { fmtTime } from '../utils'

function CountUp({ value, suffix = '' }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min((t - start) / 800, 1)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{n}{suffix}</>
}

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [stats, setStats] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => {
        setEvents(data)
        if (data.length) setEventId(String(data[0].id))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    api.get(`/events/${eventId}/stats`).then(({ data }) => setStats(data))
  }, [eventId])

  useEffect(() => {
    if (!eventId) return
    const t = setTimeout(() => {
      api.get(`/events/${eventId}/attendees`, { params: { search } })
        .then(({ data }) => setAttendees(data))
    }, 300)
    return () => clearTimeout(t)
  }, [eventId, search])

  async function exportCsv() {
    const ev = events.find((x) => String(x.id) === eventId)
    const res = await api.get(`/events/${eventId}/export`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ev?.slug || 'event'}-attendees.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="stack">
        <div className="skeleton" style={{ height: 56, width: '50%' }} />
        <div className="stats">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" />)}
        </div>
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="card empty-card">
        <h1>No events yet</h1>
        <p>Create your first event to start taking registrations.</p>
        <Link to="/admin/events/new" className="btn btn-primary">Create event</Link>
      </div>
    )
  }

  return (
    <div className="stack">
      <header className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Event overview</div>
          <select className="select page-title" style={{ fontSize: 22, height: 48 }}
            value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>
        <Link to="/admin/events/new" className="btn btn-primary">+ Create event</Link>
      </header>

      {stats && (
        <section className="stats">
          <div className="card stat"><div className="stat-label">Registered</div><div className="stat-value"><CountUp value={stats.registered} /></div></div>
          <div className="card stat"><div className="stat-label">Checked in</div><div className="stat-value ok"><CountUp value={stats.checked_in} /></div></div>
          <div className="card stat"><div className="stat-label">Remaining</div><div className="stat-value"><CountUp value={stats.remaining} /></div></div>
          <div className="card stat">
            <div className="stat-label">Attendance</div>
            <div className="stat-value"><CountUp value={stats.attendance_percent} suffix="%" /></div>
            <div className="progress"><div className="progress-bar" style={{ width: `${stats.attendance_percent}%` }} /></div>
          </div>
        </section>
      )}

      <section className="card table-wrap">
        <div className="panel-head">
          <h2>Attendees</h2>
          <div className="toolbar">
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email" aria-label="Search attendees" />
            <button onClick={exportCsv} className="btn btn-secondary" style={{ height: 42 }}>Export CSV</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody>
            {attendees.map((a, i) => (
              <tr key={a.id} style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <td data-label="Name" className="cell-title">{a.name}</td>
                <td data-label="Email" className="muted">{a.email}</td>
                <td data-label="Status">
                  {a.checked_in_at
                    ? <span className="badge badge-ok">Checked in</span>
                    : <span className="badge badge-warn">Pending</span>}
                </td>
                <td data-label="Time" className="muted">{a.checked_in_at ? fmtTime(a.checked_in_at) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendees.length === 0 && <div className="empty">No attendees found.</div>}
      </section>
    </div>
  )
}