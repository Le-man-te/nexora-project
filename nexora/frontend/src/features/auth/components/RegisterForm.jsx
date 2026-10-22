import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthField, AuthMessage, AuthSubmit } from '../../../pages/auth/AuthControls.jsx'

function RegisterForm() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [acceptedTerms, setAcceptedTerms] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const passwordChecks = [
		password.length >= 8,
		/[A-Z]/.test(password),
		/[0-9]/.test(password),
		/[^A-Za-z0-9]/.test(password),
	]
	const strength = passwordChecks.filter(Boolean).length
	const strengthLabel = ['Add a password', 'Getting started', 'Fair', 'Good', 'Strong'][strength]

	function handleSubmit(event) {
		event.preventDefault()
		setSubmitted(true)
	}

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit}>
				<AuthField
					autoComplete="name"
					label="Your name"
					name="name"
					onChange={(event) => { setName(event.target.value); setSubmitted(false) }}
					placeholder="Alex Morgan"
					value={name}
				/>
				<AuthField
					autoComplete="email"
					label="Work email"
					name="email"
					onChange={(event) => { setEmail(event.target.value); setSubmitted(false) }}
					placeholder="you@company.com"
					type="email"
					value={email}
				/>
				<div className="auth-password-group">
					<AuthField
						autoComplete="new-password"
						label="Create a password"
						minLength={8}
						name="password"
						onChange={(event) => { setPassword(event.target.value); setSubmitted(false) }}
						placeholder="At least 8 characters"
						type="password"
						value={password}
					/>
					<div aria-label={`Password strength: ${strengthLabel}`} aria-valuemax={4} aria-valuemin={0} aria-valuenow={strength} className="auth-password-strength" data-level={strength} role="meter">
						<div className="auth-strength-bars" aria-hidden="true">
							{passwordChecks.map((_, index) => (
								<span className={index < strength ? 'auth-strength-segment is-active' : 'auth-strength-segment'} key={index} />
							))}
						</div>
						<span className="auth-strength-label">{strengthLabel}</span>
					</div>
				</div>
				<label className="auth-remember auth-terms-check">
					<input checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required type="checkbox" />
					<span>I agree to Nexora’s <Link className="auth-inline-link" to="/terms">Terms</Link> and <Link className="auth-inline-link" to="/privacy">Privacy Policy</Link>.</span>
				</label>
				<AuthSubmit>Create account</AuthSubmit>
			</form>
			<AuthMessage>
				{submitted && 'Account creation is a preview right now. Your details were not sent or saved.'}
			</AuthMessage>
		</>
	)
}

export default RegisterForm
