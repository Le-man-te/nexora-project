import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField, AuthMessage, AuthSubmit } from '../../../pages/auth/AuthControls.jsx'
import { register } from '../auth.api.js'

function RegisterForm() {
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [acceptedTerms, setAcceptedTerms] = useState(false)
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const passwordChecks = [
		password.length >= 8,
		/[A-Z]/.test(password),
		/[0-9]/.test(password),
		/[^A-Za-z0-9]/.test(password),
	]
	const strength = passwordChecks.filter(Boolean).length
	const strengthLabel = ['Add a password', 'Getting started', 'Fair', 'Good', 'Strong'][strength]

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)
		try {
			await register({
				name: name.trim(),
				email: email.trim(),
				password,
				acceptedTerms,
			})
			navigate('/dashboard', { replace: true })
		} catch (requestError) {
			setError(requestError.message || 'Unable to create your account. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit}>
				<AuthField
					autoComplete="name"
					label="Your name"
					name="name"
					onChange={(event) => { setName(event.target.value); setError('') }}
					placeholder="Leta Tesfaye"
					value={name}
				/>
				<AuthField
					autoComplete="email"
					label="Work email"
					name="email"
					onChange={(event) => { setEmail(event.target.value); setError('') }}
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
						onChange={(event) => { setPassword(event.target.value); setError('') }}
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
				<AuthSubmit disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</AuthSubmit>
			</form>
			<AuthMessage variant="error">{error}</AuthMessage>
		</>
	)
}

export default RegisterForm
