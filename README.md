# Café Sonora

Proyecto escolar de demostración: una cafetería ficticia de desierto en San Luis Río Colorado. Incluye sitio responsive, registro y autenticación JWT, catálogo desde API REST y clima actual de Open-Meteo. No representa una marca comercial.

## Pantallas y funciones

- **Inicio** (`/`): hero, esencia de la cafetería, sucursal/horario de ejemplo, accesos de registro y login y widget del clima.
- **Registro** (`/registro/`): validación en navegador y API, correo/nombre únicos, validación de contraseña Django y hash seguro.
- **Login** (`/login/`): recibe JWT access/refresh y los conserva para la sesión de demostración.
- **Menú protegido** (`/menu/`): productos desde la API, categorías, búsqueda, renovación de access con refresh y logout.
- **Admin** (`/admin/`): gestión de productos y categorías.

## Tecnologías

Django 5.2, Django REST Framework, SimpleJWT, django-cors-headers, python-dotenv, WhiteNoise, Gunicorn, dj-database-url, SQLite local, HTML/CSS/JavaScript y Open-Meteo.

## Instalación local (Windows PowerShell)

Desde la raíz del proyecto:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edita `.env` para desarrollo: configura `SECRET_KEY` con una clave aleatoria propia y cambia `DEBUG=True`. Luego:

```powershell
python manage.py migrate
python manage.py seed_menu
python manage.py createsuperuser
python manage.py runserver
```

Abre `http://127.0.0.1:8000/`. La cuenta de superusuario se define interactivamente; no se incluye ninguna credencial de prueba.

## Variables de entorno

`.env.example` contiene el inventario de variables sin secretos:

| Variable | Uso |
|---|---|
| `SECRET_KEY` | Clave secreta Django. Obligatoria en despliegue; usar valor fuerte y exclusivo. |
| `DEBUG` | `True` solo en desarrollo local; `False` en producción. |
| `ALLOWED_HOSTS` | Hosts permitidos separados por comas. |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS exactos, separados por comas; no usar comodines. |
| `CSRF_TRUSTED_ORIGINS` | Orígenes HTTPS/HTTP confiables para CSRF, separados por comas. |
| `DATABASE_URL` | URL de base de datos de producción. Vacía usa SQLite local. |
| `ACCESS_TOKEN_LIFETIME_MINUTES` | Duración del access token (predeterminado: 15 minutos). |
| `REFRESH_TOKEN_LIFETIME_DAYS` | Duración del refresh token (predeterminado: 1 día). |
| `API_THROTTLE_LOGIN` | Límite para login (predeterminado: `5/minute`). |
| `API_THROTTLE_REGISTER` | Límite para registro (predeterminado: `3/hour`). |

Open-Meteo no necesita API key.

## API REST

Los endpoints del catálogo requieren `Authorization: Bearer <access>`; sin JWT responden `401`.

| Método | Endpoint | Acceso |
|---|---|---|
| `POST` | `/api/auth/register/` | Público; recibe `username`, `email`, `password`, `password_confirm`. |
| `POST` | `/api/auth/login/` | Público; recibe usuario/contraseña y devuelve access + refresh. |
| `POST` | `/api/auth/refresh/` | Público; recibe `refresh` y devuelve access (y refresh rotado). |
| `GET` | `/api/categories/` | JWT; lista categorías. |
| `GET` | `/api/products/` | JWT; lista productos disponibles. |
| `GET` | `/api/products/<id>/` | JWT; detalle de producto. |
| `GET` | `/api/products/?category=cafes-calientes&search=latte` | JWT; filtros opcionales por slug y texto. |

El registro usa `create_user` para almacenar contraseñas hasheadas. El serializer marca ambas contraseñas como `write_only`; no aparecen en respuestas.

## Despliegue en Render (opcional)

1. Sube este repositorio a GitHub y crea un servicio **Web Service** en Render conectado al repositorio.
2. Selecciona **Runtime: Python**. Usa `./build.sh` como **Build Command**.
3. Usa `gunicorn cafe_sonora.wsgi:application` como **Start Command**.
4. En Render configura estas variables:
   - `SECRET_KEY`: clave criptográficamente aleatoria y privada.
   - `DEBUG`: `False`.
   - `ALLOWED_HOSTS`: dominio asignado de Render, por ejemplo `cafe-sonora.onrender.com` (sin esquema).
   - `CORS_ALLOWED_ORIGINS`: origen HTTPS del dominio Render, por ejemplo `https://cafe-sonora.onrender.com`.
   - `CSRF_TRUSTED_ORIGINS`: `https://` más el dominio Render.
   - `DATABASE_URL`: URL interna de una base PostgreSQL de Render; omítela únicamente para una demo SQLite no persistente.
   - `ACCESS_TOKEN_LIFETIME_MINUTES`: `15`; `REFRESH_TOKEN_LIFETIME_DAYS`: `1`.
   - `API_THROTTLE_LOGIN`: `5/minute`; `API_THROTTLE_REGISTER`: `3/hour`.
5. Start Command: `python manage.py migrate --noinput && python manage.py seed_menu && gunicorn cafe_sonora.wsgi:application`. Crea el usuario administrador con una Shell de Render: `python manage.py createsuperuser`.
6. Verifica `/`, registro, login, `/menu/` y `https://<dominio>/api/products/` sin token (debe ser `401`).

El build instala dependencias y recopila estáticos; el arranque aplica migraciones y carga el menú de forma idempotente. En producción Render debe proveer una base de datos persistente por `DATABASE_URL`; los discos locales efímeros no son apropiados para SQLite con datos duraderos.

**Ejecución:** el proyecto se ejecuta en local (ver «Instalación local»). Abrir http://127.0.0.1:8000/ después de `python manage.py runserver`.

## Rúbrica vs. implementación

| Requisito | Implementación |
|---|---|
| Apps independientes y estructura limpia | `accounts/`, `menu/`, `cafe_sonora/`, `templates/`, `static/` |
| Identidad, paleta, fuentes, responsive, navbar fija, tarjetas y footer | `static/css/site.css`, `templates/base.html` |
| Inicio, sucursal, horario y enlaces de cuenta | `templates/home.html` |
| Open-Meteo, carga, errores y recomendación por temperatura | `static/js/home.js` |
| Registro con validación cliente/servidor y unicidad | `static/js/auth.js`, `accounts/serializers.py`, `accounts/tests.py` |
| Login JWT, refresh, menú protegido y logout | `accounts/views.py`, `static/js/auth.js`, `static/js/menu.js`, `templates/menu.html` |
| Categorías/productos, serializers, filtros, endpoints y permisos | `menu/models.py`, `menu/serializers.py`, `menu/views.py`, `menu/urls.py`, `menu/tests.py` |
| Semilla de 16 productos y administración | `menu/management/commands/seed_menu.py`, `menu/admin.py` |
| Variables de entorno, CORS, CSRF, throttling y cabeceras de producción | `.env.example`, `cafe_sonora/settings.py`, `accounts/views.py` |
| Render, Gunicorn, WhiteNoise y base por URL | `requirements.txt`, `build.sh`, `cafe_sonora/settings.py` |
| Pruebas automatizadas de registro, JWT y API protegida | `accounts/tests.py`, `menu/tests.py` |

## Comprobaciones

```powershell
python manage.py check
python manage.py test accounts menu
```

El proyecto incluye pruebas automatizadas de registro, contraseñas hasheadas, autenticación JWT, catálogo protegido, categorías, filtros y la respuesta `401` del menú sin token.
