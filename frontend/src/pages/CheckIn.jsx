import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api'
import { fmtTime } from '../utils'

const titles = {
  success: 'Checked in',
  duplicate: 'Already used',
  invalid: 'Invalid ticket',
}

export default function CheckIn() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [stats, setStats] = useState(null)
  const [result, setResult] = useState(null)
  const [manual, setManual] = useState('')
  const [camError, setCamError] = useState('')
  const busy = useRef(false)
  const last = useRef({ code: '', at: 0 })

  useEffect(() => {
    api.get('/events').then(({ data }) => {
      setEvents(data)
      if (data.length) setEventId(String(data[0].id))
    })
  }, [])

  const loadStats = useCallback(() => {
    if (!eventId) return
    api.get(`/events/${eventId}/stats`).then(({ data }) => setStats(data))
  }, [eventId])

  useEffect(() => { loadStats() }, [loadStats])

  const verify = useCallback(async (raw) => {
    const code = String(raw).trim().toUpperCase()
    if (!code || busy.current) return

    const now = Date.now()
    if (code === last.current.code && now - last.current.at < 3000) return
    last.current = { code, at: now }

    busy.current = true
    try {
      const { data } = await api.post('/checkin', { token: code })
      setResult({ ...data, code, id: now })
    } catch (err) {
      const d = err.response?.data
      if (d?.status) setResult({ ...d, code, id: now })
      else setResult({ status: 'invalid', message: d?.message || 'Could not verify. Check your connection.', code, id: now })
    } finally {
      busy.current = false
      loadStats()
    }
  }, [loadStats])

  const verifyRef = useRef(verify)
  useEffect(() => { verifyRef.current = verify }, [verify])

  useEffect(() => {
    let cancelled = false
    let scanner = null
    let running = false

    const config = {
      fps: 15,
      aspectRatio: 1.0,
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    }
    const onScan = (text) => verifyRef.current(text)

    async function start() {
      scanner = new Html5Qrcode('qr-reader')
      try {
        const cams = await Html5Qrcode.getCameras()
        if (!cams.length) throw new Error('No camera found')
        const back = cams.find((c) => /back|rear|environment/i.test(c.label))
        const choice = back ? back.id : cams[0].id

        await scanner.start(choice, config, onScan, () => {})
        running = true
        if (cancelled) {
          await scanner.stop().catch(() => {})
          running = false
        }
      } catch (err) {
        console.error('Camera error:', err)
        if (!cancelled) {
          setCamError(`Camera error: ${err?.name || err?.message || err}. Allow camera access, or type the code below.`)
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (scanner && running) {
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      }
    }
  }, [])

  function submitManual(e) {
    e.preventDefault()
    last.current = { code: '', at: 0 }
    verify(manual)
    setManual('')
  }

  async function scanFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new Html5Qrcode('qr-file-temp')
    try {
      const text = await reader.scanFile(file, false)
      last.current = { code: '', at: 0 }
      verify(text)
    } catch {
      setResult({ status: 'invalid', message: 'No QR code found in that image.', code: '', id: Date.now() })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="checkin">
      <header className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Check-in</div>
          {events.length > 0 && (
            <select className="select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          )}
        </div>
        {stats && <span className="counter">{stats.checked_in} / {stats.registered} in</span>}
      </header>

      <div className="scanner">
        <div id="qr-reader" />
        <span className="corner tl" /><span className="corner tr" />
        <span className="corner bl" /><span className="corner br" />
        {camError && <p className="cam-error">{camError}</p>}
      </div>
      {!camError && <p className="hint">Point the camera at the QR code</p>}

      {result && (
        <div key={result.id} className={`result ${result.status}`} role="status">
          <div className="r-title">{titles[result.status]}</div>
          <div className="r-text">
            {result.status === 'success' && `${result.name}, ${fmtTime(result.checked_in_at)}`}
            {result.status === 'duplicate' && `${result.name} was already checked in at ${fmtTime(result.checked_in_at)}. Entry blocked.`}
            {result.status === 'invalid' && (result.message || `No ticket matches ${result.code}.`)}
          </div>
        </div>
      )}

      <form onSubmit={submitManual} className="card manual">
        <label htmlFor="manual">Camera not working? Enter the code</label>
        <div className="row">
          <input id="manual" className="input" value={manual} onChange={(e) => setManual(e.target.value)}
            placeholder="TKT-K3M9X2QA" />
          <button className="btn btn-primary">Verify</button>
        </div>
      </form>

      <div id="qr-file-temp"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} />
      <label className="file-link">
        Or scan from a photo or screenshot
        <input type="file" accept="image/*" onChange={scanFile} />
      </label>
    </div>
  )
}