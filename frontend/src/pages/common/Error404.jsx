import { Link } from 'react-router-dom'
import { Header } from 'semantic-ui-react'

function Error404() {
  return (
    <main>
      <Header as="h2">Página no encontrada</Header>
      <p>La página que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  )
}

export default Error404
