import { createContext } from 'react'
import useAuthState from '../auth/hooks/useAuth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children, value }) {
  const authState = useAuthState()
  return (
    <AuthContext.Provider value={value ?? authState}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext