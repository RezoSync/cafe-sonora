import useAuth from './useAuth'

function useUser() {
  const { auth } = useAuth()
  return auth
}

export default useUser
