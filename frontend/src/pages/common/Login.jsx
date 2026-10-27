import { Formik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Header, Message } from 'semantic-ui-react'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Ingresa un correo electrónico válido.')
    .required('El correo electrónico es obligatorio.'),
  password: Yup.string().required('La contraseña es obligatoria.'),
})

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (values) => {
    try {
      const data = await login(values)

      if (import.meta.env.DEV) {
        console.log('Token de acceso:', data.access)
      }
      toast.success('Inicio de sesión exitoso.')
      navigate('/dashboard')
    } catch (error) {
      if (error.status === 429) {
        toast.error(
          'Demasiados intentos de inicio de sesión. Espera un minuto antes de intentarlo nuevamente.',
        )
        return
      }

      toast.error(
        error.responseData?.detail ||
          'No fue posible iniciar sesión. Revisa tus datos e inténtalo de nuevo.',
      )
    }
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={handleLogin}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => (
        <main className="login-page">
          <Header as="h2">Iniciar sesión</Header>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? errors.email : false}
            />
            <Form.Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password && errors.password ? errors.password : false
              }
            />
            <Button
              type="submit"
              primary
              fluid
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Entrar
            </Button>
          </Form>
          <Message>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </Message>
        </main>
      )}
    </Formik>
  )
}

export default Login
