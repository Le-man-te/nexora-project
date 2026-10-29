import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField, AuthMessage, AuthSubmit } from '../../../pages/auth/AuthControls.jsx'
import { login } from '../auth.api.js'

function LoginForm() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [remember, setRemember] = useState(true)
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)
		try {
			await login({ email: email.trim(), password })
			navigate('/dashboard', { replace: true })
		} catch (requestError) {
			setError(requestError.message || 'Unable to sign in. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit}>
				<AuthField
					autoComplete="email"
					label="Work email"
					name="email"
					onChange={(event) => { setEmail(event.target.value); setError('') }}
					placeholder="you@company.com"
					type="email"
					value={email}
				/>
				<AuthField
					autoComplete="current-password"
					label="Password"
					name="password"
					onChange={(event) => { setPassword(event.target.value); setError('') }}
					placeholder="Enter your password"
					type="password"
					value={password}
				/>
				<div className="auth-form-options">
					<label className="auth-remember">
						<input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
						Keep me signed in
					</label>
					<Link className="auth-text-link" to="/forgot-password">Forgot password?</Link>
				</div>
				<AuthSubmit disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</AuthSubmit>
			</form>
			<AuthMessage variant="error">{error}</AuthMessage>
		</>
	)
}

export default LoginForm
