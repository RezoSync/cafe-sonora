import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.js'

function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  }

  return context
}

export default useAuth
