import { Container, Header } from 'semantic-ui-react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function AdminLayout({ children }) {
  const { auth } = useAuth()

  if (auth === undefined) {
    return null
  }

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return (
    <Container>
      <Header as="h1">Café Sonora | Administración</Header>
      {children}
    </Container>
  )
}

export default AdminLayout
