import { useCallback, useState } from 'react'
import * as authApi from '../auth.api.js'
import { getAuthUser } from '../auth.utils.js'

function useAuth() {
	const [user, setUser] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	const perform = useCallback(async (operation, onSuccess) => {
		setIsLoading(true)
		setError(null)

		try {
			const result = await operation()
			onSuccess?.(result)
			return result
		} catch (requestError) {
			setError(requestError)
			throw requestError
		} finally {
			setIsLoading(false)
		}
	}, [])

	const login = useCallback((credentials, options) => perform(
		() => authApi.login(credentials, options),
		(result) => {
			const authenticatedUser = getAuthUser(result)
			if (authenticatedUser) setUser(authenticatedUser)
		},
	), [perform])

	const register = useCallback((account, options) => perform(
		() => authApi.register(account, options),
		(result) => {
			const authenticatedUser = getAuthUser(result)
			if (authenticatedUser) setUser(authenticatedUser)
		},
	), [perform])

	const logout = useCallback((options) => perform(
		() => authApi.logout(options),
		() => setUser(null),
	), [perform])

	const refreshUser = useCallback(() => perform(
		() => authApi.getCurrentUser(),
		(result) => setUser(getAuthUser(result)),
	), [perform])

	const requestPasswordReset = useCallback(
		(data, options) => perform(() => authApi.requestPasswordReset(data, options)),
		[perform],
	)

	const resetPassword = useCallback(
		(data, options) => perform(() => authApi.resetPassword(data, options)),
		[perform],
	)

	const verifyEmail = useCallback(
		(data, options) => perform(() => authApi.verifyEmail(data, options)),
		[perform],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		user,
		isAuthenticated: Boolean(user),
		isLoading,
		error,
		clearError,
		login,
		register,
		logout,
		refreshUser,
		requestPasswordReset,
		resetPassword,
		verifyEmail,
	}
}

export default useAuth