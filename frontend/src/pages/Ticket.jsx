import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import api from '../api'
import { fmtDate } from '../utils'

export default function Ticket() {
  const { token } = useParams()
  const [ticket, setTicket] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    api.get(`/public/tickets/${token}`)
      .then(({ data }) => setTicket(data))
      .catch(() => setNotFound(true))
  }, [token])

  function download() {
    const canvas = box.current.querySelector('canvas')
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `ticket-${token}.png`
    a.click()
  }

  if (notFound) {
    return (
      <div className="center-box">
        <div className="card card-pad anim">
          <h1>Ticket not found</h1>
          <p>Check the link and try again.</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return <div className="center-box"><span className="skeleton" style={{ width: 240, height: 24 }} /></div>
  }

  return (
    <div className="ticket-page">
      <div className="icon-circle ok">
        <svg className="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <div className="ticket-head">
        <h1>You're registered</h1>
        <p>Show this QR code at the door.</p>
      </div>

      <div className="card ticket">
        <div className="ticket-top">
          <div className="kicker">Admit one</div>
          <div className="name">{ticket.event.title}</div>
          <div className="meta">{fmtDate(ticket.event.event_date)} · {ticket.event.venue}</div>
        </div>
        <div className="ticket-tear" />
        <div className="ticket-body">
          <div ref={box} className="qr-box">
            <QRCodeCanvas value={ticket.token} size={200} level="M" marginSize={1} />
          </div>
          <div className="token">{ticket.token}</div>
          {ticket.checked_in_at && <div className="used">Already checked in</div>}
          <div className="holder">
            <div className="who">{ticket.name}</div>
            <div className="mail">{ticket.email}</div>
          </div>
        </div>
      </div>

      <button onClick={download} className="btn btn-primary btn-lg btn-block">Download ticket</button>
      <p className="note">Save this page or the image. You need the QR code to enter.</p>
    </div>
  )
}