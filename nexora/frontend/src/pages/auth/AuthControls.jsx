import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthFlow.css'

function EyeIcon({ visible }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      {visible ? (
        <>
          <path d="M2.2 10s2.8-5 7.8-5 7.8 5 7.8 5-2.8 5-7.8 5-7.8-5-7.8-5Z" />
          <circle cx="10" cy="10" r="2.2" />
        </>
      ) : (
        <>
          <path d="m3 3 14 14M8.6 5.2A8.3 8.3 0 0 1 10 5c5 0 7.8 5 7.8 5a12 12 0 0 1-2.2 2.8M5.4 5.8C3.3 7.1 2.2 10 2.2 10s2.8 5 7.8 5c.8 0 1.5-.1 2.2-.4" />
          <path d="M8.6 8.6a2 2 0 0 0 2.8 2.8" />
        </>
      )}
    </svg>
  )
}

function AuthField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  minLength,
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <span className="auth-input-frame">
        <input
          autoComplete={autoComplete}
          id={id}
          minLength={minLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={inputType}
          value={value}
        />
        {isPassword && (
          <button
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="auth-password-toggle"
            onClick={() => setVisible((current) => !current)}
            type="button"
          >
            <EyeIcon visible={visible} />
          </button>
        )}
      </span>
    </div>
  )
}

function AuthMessage({ children, variant = 'info' }) {
  if (!children) return null

  return (
    <p className={`auth-message auth-message-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{variant === 'error' ? '!' : '✦'}</span>
      {children}
    </p>
  )
}

function AuthSubmit({ children, disabled = false }) {
  return (
    <button className="auth-submit" disabled={disabled} type="submit">
      {children}
      <span aria-hidden="true">→</span>
    </button>
  )
}

function AuthLinks() {
  return (
    <div className="auth-legal">
      By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
    </div>
  )
}

export { AuthField, AuthLinks, AuthMessage, AuthSubmit }
