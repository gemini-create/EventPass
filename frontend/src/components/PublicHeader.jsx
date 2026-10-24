import { fmtDate } from '../utils'

export default function PublicHeader({ label, title, event }) {
  const showSeats = event && event.seats_left !== null && event.seats_left !== undefined && !event.is_full

  return (
    <div className="hero">
      <span className="orb a" /><span className="orb b" />
      <div className="hero-inner">
        <div className="label">{label}</div>
        <h1>{title}</h1>
        {event && (
          <div className="chips">
            <span className="chip">{fmtDate(event.event_date)}</span>
            <span className="chip">{event.venue}</span>
          </div>
        )}
        {showSeats && <span className="seats">{event.seats_left} seats left</span>}
      </div>
    </div>
  )
}