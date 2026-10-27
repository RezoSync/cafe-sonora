const TOKEN_STORAGE_KEY = import.meta.env.VITE_LOCAL_STORAGE_ITEM_NAME

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
