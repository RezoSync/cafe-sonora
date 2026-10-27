import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Message } from 'semantic-ui-react'
import { getToken } from '../api/token'
import useAuth from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_BASE_API_URL

function SoapCountryWidget() {
  const [code, setCode] = useState('MX')
  const [country, setCountry] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const countryCode = code.trim().toUpperCase()

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      setCountry(null)
      setError('Ingresa un código ISO de país de dos letras, por ejemplo MX.')
      return
    }

    const accessToken = getToken()
    if (!accessToken) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 12000)
    setLoading(true)
    setError('')
    setCountry(null)

    try {
      const params = new URLSearchParams({ code: countryCode })
      const response = await fetch(
        `${API_URL}/api/soap/country/?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        },
      )
      const responseData = await response.json()

      if (response.status === 401) {
        logout()
        navigate('/login', { replace: true })
        return
      }

      if (!response.ok) {
        setError(
          responseData.detail || 'No fue posible consultar el país solicitado.',
        )
        return
      }

      setCountry(responseData)
    } catch (requestError) {
      setError(
        requestError.name === 'AbortError'
          ? 'La consulta SOAP tardó demasiado. Inténtalo más tarde.'
          : 'No fue posible conectar con el servicio SOAP.',
      )
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Consulta de países por SOAP</Card.Header>
        <Card.Meta>Servicio propio protegido con JWT</Card.Meta>
        <Form onSubmit={handleSubmit}>
          <Form.Input
            label="Código ISO de país"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={2}
            autoComplete="off"
          />
          <Button type="submit" primary loading={loading} disabled={loading}>
            Consultar país
          </Button>
        </Form>
        {error && <Message negative>{error}</Message>}
        {country && (
          <Card.Description>
            <p>
              <strong>País:</strong> {country.name}
            </p>
            <p>
              <strong>Capital:</strong> {country.capital}
            </p>
            <p>
              <strong>Código:</strong> {country.code}
            </p>
          </Card.Description>
        )}
      </Card.Content>
    </Card>
  )
}

export default SoapCountryWidget
