import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { AuthMessage } from './AuthControls.jsx'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'your inbox'
  const [resent, setResent] = useState(false)

  return (
    <AuthLayout
      className="nexora-auth-layout"
      description="One last little step before everything comes together."
      title="Check your inbox"
    >
      <div className="auth-success-panel">
        <span aria-hidden="true" className="auth-success-icon">✉</span>
        <h2>Look for a note from Nexora</h2>
        <p>
          We’d send a verification link to <strong>{email}</strong> once email delivery is connected.
          It’s a prototype for now, so no email has been sent.
        </p>
        <AuthMessage>{resent && 'Email verification is a preview right now. No email was sent.'}</AuthMessage>
        <button className="auth-submit" onClick={() => setResent(true)} type="button">
          Resend verification email <span aria-hidden="true">→</span>
        </button>
        <Link className="auth-back-link" to="/login"><span aria-hidden="true">←</span> Back to sign in</Link>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmailPage