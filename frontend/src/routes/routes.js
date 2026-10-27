import routesAdmin from './routes.admin'
import routesClient from './routes.client'
import routesCommon from './routes.common'

const routes = [...routesAdmin, ...routesClient, ...routesCommon]

export default routes
