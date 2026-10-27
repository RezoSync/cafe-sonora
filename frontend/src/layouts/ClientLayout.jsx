import { Container, Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

function ClientLayout({ children }) {
  return (
    <Container>
      <Menu>
        <Menu.Item as={Link} to="/" header>
          Café Sonora
        </Menu.Item>
        <Menu.Item as={Link} to="/login">
          Iniciar sesión
        </Menu.Item>
        <Menu.Item as={Link} to="/register">
          Crear cuenta
        </Menu.Item>
      </Menu>
      {children}
    </Container>
  )
}

export default ClientLayout
