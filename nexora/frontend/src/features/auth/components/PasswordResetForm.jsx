import { useState } from 'react'
import { AuthField, AuthMessage, AuthSubmit } from '../../../pages/auth/AuthControls.jsx'

function PasswordResetForm() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [submitted, setSubmitted] = useState(false)

	function handleSubmit(event) {
		event.preventDefault()
		if (password !== confirmPassword) {
			setError('Those passwords don’t match yet.')
			setSubmitted(false)
			return
		}
		setError('')
		setSubmitted(true)
	}

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit}>
				<AuthField
					autoComplete="new-password"
					label="New password"
					minLength={8}
					name="password"
					onChange={(event) => { setPassword(event.target.value); setError(''); setSubmitted(false) }}
					placeholder="At least 8 characters"
					type="password"
					value={password}
				/>
				<AuthField
					autoComplete="new-password"
					label="Confirm new password"
					minLength={8}
					name="confirmPassword"
					onChange={(event) => { setConfirmPassword(event.target.value); setError(''); setSubmitted(false) }}
					placeholder="Enter it once more"
					type="password"
					value={confirmPassword}
				/>
				<AuthSubmit>Save new password</AuthSubmit>
			</form>
			<AuthMessage variant={error ? 'error' : 'info'}>
				{error || (submitted && 'Password updates are a preview right now. No password was changed.')}
			</AuthMessage>
		</>
	)
}

export default PasswordResetForm
