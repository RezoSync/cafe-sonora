# Café Sonora

Aplicación escolar para una cafetería ficticia de San Luis Río Colorado. El proyecto conserva el sitio y las plantillas HTML de Django existentes y agrega un frontend React con Vite que consume la API REST protegida con JWT. Incluye registro, inicio de sesión, consulta del clima con Open-Meteo y un servicio SOAP de países.

## Estructura

- `accounts/`: usuario personalizado, registro, autenticación JWT, perfil y endpoint SOAP.
- `menu/`: API y administración de categorías y productos existentes.
- `cafe_sonora/`: configuración y rutas del proyecto Django.
- `templates/`, `static/`: sitio HTML existente de Django, conservado.
- `frontend/`: aplicación React + Vite en JavaScript.
  - `src/api/`: solicitudes a la API Django y manejo del token.
  - `src/context/`, `src/hooks/`: estado y hooks de autenticación.
  - `src/routes/`, `src/layouts/`: navegación y layouts.
  - `src/pages/`: páginas de administración, cliente y acceso común.
  - `src/components/`: widgets de clima y consulta SOAP.

## Tecnologías

- Backend: Django, Django REST Framework, SimpleJWT, CORS Headers y Zeep.
- Frontend: React, Vite, Semantic UI React, Sass, React Router, Formik, Yup y React Toastify.
- API externa de clima: Open-Meteo, sin API key.
- Servicio SOAP externo: CountryInfoService de Oorsprong.

## Instalación del backend

Desde la raíz del repositorio, en Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Configura `SECRET_KEY` en `.env` con una clave local privada. Para desarrollo local usa `DEBUG=True`; en producción debe ser `False`. El `.env` local no se versiona.

```powershell
python manage.py migrate
python manage.py runserver 8000
```

El backend queda disponible en `http://localhost:8000`. Las plantillas Django existentes siguen disponibles, por ejemplo, en `/`, `/registro/` y `/login/`.

## Instalación del frontend

Desde la raíz:

```powershell
cd frontend
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

El frontend queda disponible en `http://localhost:5173`. Su `.env` define:

```dotenv
VITE_BASE_API_URL=http://localhost:8000
VITE_LOCAL_STORAGE_ITEM_NAME=TOKEN
```

## Puertos de desarrollo

| Servicio | Puerto | URL |
|---|---:|---|
| Django | 8000 | `http://localhost:8000` |
| Vite/React | 5173 | `http://localhost:5173` |

El `.env.example` de Django permite desarrollo local y conserva los orígenes anteriores de CORS junto con `http://localhost:5173` y `http://127.0.0.1:5173`.

## Endpoints utilizados

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Público | Registro con `username`, `email`, `telefono`, `password` y `password_confirm`. |
| `POST` | `/api/auth/login/` | Público | Recibe `email` y `password`; devuelve `access` y `refresh`. |
| `POST` | `/api/auth/refresh/` | Público | Renueva el access token mediante el refresh token. |
| `GET` | `/api/auth/me/` | JWT | Devuelve el usuario actual, sin contraseña. Es el web service propio; sin Bearer token responde `401`. |
| `GET` | `/api/soap/country/?code=MX` | JWT | Consulta código, nombre y capital mediante SOAP. |

El inicio de sesión tiene límite de 5 intentos por minuto y el registro de 3 por hora. La interfaz muestra un aviso claro al recibir `429`. La API de menú y las rutas CRUD de usuarios del backend conservan sus permisos existentes.

## API externa: Open-Meteo

El dashboard solicita el clima actual de San Luis Río Colorado, Sonora, usando latitud `32.4565` y longitud `-114.7719`. Muestra temperatura, viento y la descripción en español del código meteorológico. No requiere API key. La tarjeta indica carga y errores de conexión o timeout.

## Servicio SOAP: CountryInfoService

El endpoint propio `GET /api/soap/country/?code=MX` requiere `Authorization: Bearer <access>`. Django usa Zeep y el WSDL público:

`http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`

Consulta las operaciones `CountryName(sCountryISOCode)` y `CapitalCity(sCountryISOCode)`, con timeout configurado. Devuelve JSON con `code`, `name` y `capital`; un código ISO inválido responde `400`, y errores o timeout del servicio remoto responden `502`. El widget SOAP del dashboard envía el access token y permite ingresar el código de país.

## Cómo probar

1. Inicia Django desde la raíz con `python manage.py runserver 8000`.
2. En otra terminal, inicia Vite con `npm --prefix frontend run dev`.
3. Abre `http://localhost:5173/register`, crea una cuenta y después inicia sesión en `/login`. La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.
4. En el dashboard verifica el saludo, el widget del clima, la consulta SOAP con `MX` y el botón **Cerrar Sesión**. Al recargar una sesión válida, el usuario se vuelve a consultar en `/api/auth/me/`.
5. Comprueba que `/api/auth/me/` requiere autenticación:

   ```powershell
   curl.exe -i "http://localhost:8000/api/auth/me/"
   ```

   Sin token debe responder `401`.

6. Para probar SOAP, sustituye `<ACCESS_TOKEN>` por el access token de la sesión:

   ```powershell
   curl.exe -H "Authorization: Bearer <ACCESS_TOKEN>" "http://localhost:8000/api/soap/country/?code=MX"
   ```

   La respuesta esperada es similar a:

   ```json
   {"code":"MX","name":"Mexico","capital":"Mexico City"}
   ```

## Validaciones

```powershell
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test accounts
npm --prefix frontend run build
npm --prefix frontend run lint
```
