import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthField, AuthMessage, AuthSubmit } from '../../../pages/auth/AuthControls.jsx'

function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [remember, setRemember] = useState(true)
	const [submitted, setSubmitted] = useState(false)

	function handleSubmit(event) {
		event.preventDefault()
		setSubmitted(true)
	}

	return (
		<>
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
				<AuthField
					autoComplete="current-password"
					label="Password"
					name="password"
					onChange={(event) => { setPassword(event.target.value); setSubmitted(false) }}
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
				<AuthSubmit>Sign in</AuthSubmit>
			</form>
			<AuthMessage>
				{submitted && 'Sign-in is a preview right now. Your details were not sent to an authentication service.'}
			</AuthMessage>
		</>
	)
}

export default LoginForm
