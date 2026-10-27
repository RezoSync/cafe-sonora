import { useEffect, useState } from 'react'
import { Card, Loader, Message } from 'semantic-ui-react'

const weatherDescriptions = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo leve',
  99: 'Tormenta con granizo intenso',
}

function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 10000)

    async function loadWeather() {
      const params = new URLSearchParams({
        latitude: '32.4565',
        longitude: '-114.7719',
        current: 'temperature_2m,wind_speed_10m,weather_code',
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        timezone: 'America/Hermosillo',
      })

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: controller.signal },
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error('El servicio meteorológico respondió con un error.')
        }

        const current = data.current
        if (
          !current ||
          !Number.isFinite(current.temperature_2m) ||
          !Number.isFinite(current.wind_speed_10m) ||
          !Number.isInteger(current.weather_code)
        ) {
          throw new Error('El servicio meteorológico devolvió datos incompletos.')
        }

        setWeather({
          temperature: current.temperature_2m,
          windSpeed: current.wind_speed_10m,
          weatherCode: current.weather_code,
        })
      } catch (requestError) {
        if (requestError.name === 'AbortError' && !timedOut) {
          return
        }

        setError(
          timedOut
            ? 'La consulta del clima tardó demasiado. Inténtalo más tarde.'
            : 'No fue posible cargar el clima actual. Inténtalo más tarde.',
        )
      }
    }

    loadWeather()
    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Clima actual de San Luis Río Colorado</Card.Header>
        <Card.Meta>Datos de Open-Meteo</Card.Meta>
        {error ? (
          <Message negative>{error}</Message>
        ) : weather ? (
          <Card.Description>
            <p>
              <strong>Temperatura:</strong> {weather.temperature} °C
            </p>
            <p>
              <strong>Viento:</strong> {weather.windSpeed} km/h
            </p>
            <p>
              <strong>Condición:</strong>{' '}
              {weatherDescriptions[weather.weatherCode] ||
                `Código de clima no reconocido (${weather.weatherCode})`}
            </p>
          </Card.Description>
        ) : (
          <Loader active inline="centered">
            Cargando el clima...
          </Loader>
        )}
      </Card.Content>
    </Card>
  )
}

export default WeatherWidget
