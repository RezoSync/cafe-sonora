const API_URL = import.meta.env.VITE_BASE_API_URL

async function requestJson(url, options, fallbackMessage) {
  const response = await fetch(url, options)
  const responseData = await response.json()

  if (!response.ok) {
    const error = new Error(
      responseData.detail || fallbackMessage,
    )
    error.status = response.status
    error.responseData = responseData
    throw error
  }

  return responseData
}

export function loginApi(credentials) {
  return requestJson(
    `${API_URL}/api/auth/login/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    },
    'No fue posible iniciar sesión.',
  )
}

export function registerApi(userData) {
  return requestJson(
    `${API_URL}/api/auth/register/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    },
    'No fue posible crear la cuenta.',
  )
}

export function getMeApi(accessToken) {
  return requestJson(
    `${API_URL}/api/auth/me/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'No fue posible validar la sesión.',
  )
}
