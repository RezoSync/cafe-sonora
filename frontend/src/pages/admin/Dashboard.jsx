import { Button, Header } from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom'
import SoapCountryWidget from '../../components/SoapCountryWidget'
import WeatherWidget from '../../components/WeatherWidget'
import useAuth from '../../hooks/useAuth'
import useUser from '../../hooks/useUser'

function Dashboard() {
  const user = useUser()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user.first_name || user.username || user.email

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main>
      <Header as="h2">Panel de administración</Header>
      <p>Bienvenido {displayName}</p>
      <Button onClick={handleLogout}>Cerrar Sesión</Button>
      <WeatherWidget />
      <SoapCountryWidget />
    </main>
  )
}

export default Dashboard
