import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { AuthLinks } from './AuthControls.jsx'
import RegisterForm from '../../features/auth/components/RegisterForm.jsx'

function RegisterPage() {
  return (
    <AuthLayout
      className="nexora-auth-layout"
      description="Make room for good work. Start with your free workspace."
      title="Create your account"
    >
      <div className="auth-kicker"><span className="auth-kicker-mark">✦</span> LET’S MAKE SOMETHING</div>
      <RegisterForm />
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      <AuthLinks />
    </AuthLayout>
  )
}

export default RegisterPage