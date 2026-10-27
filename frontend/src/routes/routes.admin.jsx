import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'

const routesAdmin = [
  {
    path: '/dashboard',
    element: (
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    ),
  },
]

export default routesAdmin
