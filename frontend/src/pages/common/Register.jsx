import { Formik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Header, Message } from 'semantic-ui-react'
import { toast } from 'react-toastify'
import { registerApi } from '../../api/user'

const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required('El nombre de usuario es obligatorio.'),
  email: Yup.string()
    .trim()
    .email('Ingresa un correo electrónico válido.')
    .required('El correo electrónico es obligatorio.'),
  telefono: Yup.string()
    .matches(/^[0-9+ ]*$/, 'Usa solo dígitos, el signo + y espacios.')
    .optional(),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .matches(/\p{Lu}/u, 'Incluye al menos una letra mayúscula.')
    .matches(/\p{N}/u, 'Incluye al menos un número.')
    .matches(/[^\p{L}\p{N}]/u, 'Incluye al menos un símbolo.')
    .required('La contraseña es obligatoria.'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden.')
    .required('Confirma tu contraseña.'),
})

const fieldLabels = {
  username: 'Nombre de usuario',
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  password: 'Contraseña',
  password_confirm: 'Confirmación de contraseña',
  non_field_errors: 'Registro',
}

function getRegistrationErrorMessage(error) {
  if (error.status === 429) {
    return 'Has alcanzado el límite de registros. Espera una hora antes de intentarlo nuevamente.'
  }

  const responseData = error.responseData
  if (responseData?.detail) {
    return responseData.detail
  }

  const messages = Object.entries(responseData || {}).flatMap(
    ([field, fieldErrors]) => {
      const fieldMessages = Array.isArray(fieldErrors)
        ? fieldErrors
        : [fieldErrors]
      return fieldMessages.map(
        (message) => `${fieldLabels[field] || field}: ${message}`,
      )
    },
  )

  return (
    messages.join('\n') ||
    error.message ||
    'No fue posible crear la cuenta. Inténtalo nuevamente.'
  )
}

function Register() {
  const navigate = useNavigate()

  const handleRegister = async (values) => {
    const userData = {
      ...values,
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      telefono: values.telefono.trim(),
    }

    try {
      await registerApi(userData)
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.')
      navigate('/login')
    } catch (error) {
      toast.error(getRegistrationErrorMessage(error), { autoClose: 8000 })
    }
  }

  return (
    <Formik
      initialValues={{
        username: '',
        email: '',
        telefono: '',
        password: '',
        password_confirm: '',
      }}
      validationSchema={validationSchema}
      onSubmit={handleRegister}
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
        <main className="register-page">
          <Header as="h2">Crear cuenta</Header>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.username && errors.username ? errors.username : false
              }
            />
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
              label="Teléfono (opcional)"
              name="telefono"
              type="tel"
              autoComplete="tel"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.telefono && errors.telefono ? errors.telefono : false
              }
            />
            <Form.Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password && errors.password ? errors.password : false
              }
            />
            <Form.Input
              label="Confirmar contraseña"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              value={values.password_confirm}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password_confirm && errors.password_confirm
                  ? errors.password_confirm
                  : false
              }
            />
            <Button
              type="submit"
              primary
              fluid
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Registrarme
            </Button>
          </Form>
          <Message>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </Message>
        </main>
      )}
    </Formik>
  )
}

export default Register
