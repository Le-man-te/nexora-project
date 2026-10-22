import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { AuthLinks } from './AuthControls.jsx'
import LoginForm from '../../features/auth/components/LoginForm.jsx'

function LoginPage() {
  return (
    <AuthLayout
      className="nexora-auth-layout"
      description="Pick up where your team left off."
      title="Welcome back"
    >
      <div className="auth-kicker"><span className="auth-kicker-mark">✦</span> YOUR WORK, IN SYNC</div>
      <LoginForm />
      <div className="auth-divider">A calmer way to work</div>
      <p className="auth-switch">New to Nexora? <Link to="/register">Create an account</Link></p>
      <AuthLinks />
    </AuthLayout>
  )
}

export default LoginPage