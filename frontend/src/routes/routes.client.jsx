import ClientLayout from '../layouts/ClientLayout'
import Home from '../pages/client/Home'

const routesClient = [
  {
    path: '/',
    element: (
      <ClientLayout>
        <Home />
      </ClientLayout>
    ),
  },
  {
    path: '/home',
    element: (
      <ClientLayout>
        <Home />
      </ClientLayout>
    ),
  },
]

export default routesClient
