import CommonLayout from '../layouts/CommonLayout'
import Error404 from '../pages/common/Error404'
import Login from '../pages/common/Login'
import Register from '../pages/common/Register'

const routesCommon = [
  {
    path: '/login',
    element: (
      <CommonLayout>
        <Login />
      </CommonLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <CommonLayout>
        <Register />
      </CommonLayout>
    ),
  },
  {
    path: '*',
    element: (
      <CommonLayout>
        <Error404 />
      </CommonLayout>
    ),
  },
]

export default routesCommon
