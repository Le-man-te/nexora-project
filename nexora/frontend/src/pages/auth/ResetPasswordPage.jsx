import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import PasswordResetForm from '../../features/auth/components/PasswordResetForm.jsx'

function ResetPasswordPage() {
  return (
    <AuthLayout
      className="nexora-auth-layout"
      description="Choose a new password to get back to your workspace."
      title="Set a new password"
    >
      <div className="auth-kicker"><span className="auth-kicker-mark">✦</span> BACK IN YOUR FLOW</div>
      <PasswordResetForm />
      <Link className="auth-back-link" to="/login"><span aria-hidden="true">←</span> Back to sign in</Link>
    </AuthLayout>
  )
}

export default ResetPasswordPage