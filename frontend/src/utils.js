// event_date is stored without a timezone, so read it as plain local time
export const parseDate = (s) => new Date(s.slice(0, 19))

export const fmtDate = (s) =>
  parseDate(s).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

// for <input type="datetime-local">
export const toInput = (s) => s.slice(0, 16)

// checked_in_at is a real UTC timestamp, so convert it to local time
export const fmtTime = (s) =>
  new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })