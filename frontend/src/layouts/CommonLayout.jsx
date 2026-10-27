import { Container, Header } from 'semantic-ui-react'

function CommonLayout({ children }) {
  return (
    <Container>
      <Header as="h1">Café Sonora</Header>
      {children}
    </Container>
  )
}

export default CommonLayout
