import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'react-toastify'
import { getToken, removeToken, setToken } from '../api/token'
import { getMeApi, loginApi } from '../api/user'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => (getToken() ? undefined : null))
  const authRequestId = useRef(0)

  useEffect(() => {
    const requestId = ++authRequestId.current
    const accessToken = getToken()

    if (!accessToken) {
      return () => {
        if (authRequestId.current === requestId) {
          authRequestId.current += 1
        }
      }
    }

    getMeApi(accessToken)
      .then((currentUser) => {
        if (authRequestId.current === requestId) {
          setAuth(currentUser)
        }
      })
      .catch(() => {
        if (authRequestId.current !== requestId) {
          return
        }

        removeToken()
        setAuth(null)
        toast.error(
          'Tu sesión ya no es válida. Inicia sesión nuevamente para continuar.',
        )
      })

    return () => {
      if (authRequestId.current === requestId) {
        authRequestId.current += 1
      }
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const tokenResponse = await loginApi(credentials)

    if (!tokenResponse.access) {
      throw new Error('El servidor no devolvió un token de acceso válido.')
    }

    const requestId = ++authRequestId.current
    setToken(tokenResponse.access)

    try {
      const currentUser = await getMeApi(tokenResponse.access)

      if (authRequestId.current !== requestId) {
        throw new Error('La solicitud de inicio de sesión fue cancelada.')
      }

      setAuth(currentUser)
      return tokenResponse
    } catch (error) {
      if (authRequestId.current === requestId) {
        removeToken()
        setAuth(null)
      }
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    authRequestId.current += 1
    removeToken()
    setAuth(null)
  }, [])

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
