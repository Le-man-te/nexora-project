import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { AuthField, AuthMessage, AuthSubmit } from './AuthControls.jsx'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AuthLayout
      className="nexora-auth-layout"
      description="No worries. Enter the email you use for Nexora and we’ll help you find your way back."
      title="Reset your password"
    >
      <div className="auth-kicker"><span className="auth-kicker-mark">↗</span> A FRESH START</div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField
          autoComplete="email"
          label="Work email"
          name="email"
          onChange={(event) => { setEmail(event.target.value); setSubmitted(false) }}
          placeholder="you@company.com"
          type="email"
          value={email}
        />
        <AuthSubmit>Continue</AuthSubmit>
      </form>
      <AuthMessage>
        {submitted && 'Password recovery is a preview right now. No email was sent.'}
      </AuthMessage>
      <div className="auth-security-note">
        <span aria-hidden="true">✦</span>
        <p>For your security, password recovery will only be available once Nexora is connected to an account service.</p>
      </div>
      <Link className="auth-back-link" to="/login"><span aria-hidden="true">←</span> Back to sign in</Link>
    </AuthLayout>
  )
}

export default ForgotPasswordPage