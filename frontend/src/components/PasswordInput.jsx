import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function PasswordInput({
  value,
  onChange,
  id,
  placeholder = 'Enter your password',
  minLength,
  autoComplete,
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="pw-wrap">
      <input
        id={id}
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
      >
        {show ? <FiEyeOff size={20} aria-hidden="true" /> : <FiEye size={20} aria-hidden="true" />}
      </button>
    </div>
  )
}