# Music 4 U — Tienda Musical

> **Rama actual: `PY2-WEB`**
> Esta rama corresponde al **Proyecto 2 de cc3062 Sistemas y Tecnologías Web**, cuyo frontend fue migrado completamente de Vue 3 a **React 18**.
> La rama `main` contiene la versión del **Proyecto 2 de cc3088 Bases de Datos 1**, elaborada con **Vue 3 + Pinia**.

---

**Proyecto 2 · cc3062 Sistemas y Tecnologías Web**
Universidad del Valle de Guatemala · Ciclo 1, 2026
**Autor:** Diego Andre Calderón Salazar — Carné 241263

---

## Demo desplegada

El proyecto está corriendo en el servidor compartido del curso.

| Servicio | URL |
|----------|-----|
| **Frontend (aplicación)** | http://35.255.29.219:8081 |
| **Backend (API REST)** | http://35.255.29.219:3002 |
| **Health check** | http://35.255.29.219:3002/api/health-db |

### Puertos en el servidor

| Servicio | Puerto host | Puerto interno |
|----------|-------------|----------------|
| Frontend (nginx) | `8081` | `80` |
| Backend (Fastify) | `3002` | `3002` |
| Base de datos (MariaDB) | `3306` | `3306` |

### Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `diego.admin@tiendamusical.gt` | `secret` |
| Vendedor | `ana.lopez@tiendamusical.gt` | `secret` |
| Cliente | `javier.alvarado@gmail.com` | `secret` |

---

## Descripción general

Music 4 U es un sistema de gestión de inventario y ventas para una tienda de discos físicos (vinilos, CDs, cassettes y ediciones limitadas). La aplicación implementa una arquitectura cliente-servidor con API REST, base de datos relacional MariaDB y frontend en React 18.

El sistema soporta dos canales de venta:

- **Canal online:** El cliente navega el catálogo, agrega productos al carrito y completa la compra desde su cuenta registrada.
- **Canal presencial:** Un vendedor o administrador registra una venta desde el panel interno, asociándola a un cliente con cuenta o a un Consumidor Final (CF) sin cuenta.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + React Router DOM v6 |
| Estado global | React Context API + `useReducer` |
| Gráficas | Chart.js + react-chartjs-2 |
| Íconos | lucide-react |
| Backend | Fastify + Node.js (sin ORM — SQL explícito) |
| Base de datos | MariaDB 11.4 |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Testing | Vitest + React Testing Library |
| Linter | ESLint (eslint-plugin-react + eslint-plugin-react-hooks) |
| Build | Vite 5 |
| Contenedores | Docker Compose + Nginx |

---

## Migración Vue → React

Esta rama es el resultado de una refactorización completa del frontend original. Los cambios más relevantes son:

| Componente | Antes (Vue 3) | Ahora (React 18) |
|---|---|---|
| Librería core | Vue 3 Composition API | React 18 hooks |
| Estado global | Pinia (`stores/`) | Context API + `useReducer` |
| Enrutamiento | Vue Router | React Router DOM v6 |
| Gráficas | vue-chartjs | react-chartjs-2 |
| Testing | No implementado | Vitest + Testing Library (15 assertions) |

Los cuatro contextos que reemplazaron los stores de Pinia:

- **`AuthContext`** — sesión JWT, login/logout, persistencia en `localStorage`
- **`ThemeContext`** — alternancia dark/light mode
- **`WishlistContext`** — lista de deseos aislada por usuario autenticado
- **`CartContext`** — carrito de compras con `useReducer` para manejo predecible de acciones (añadir, remover, modificar cantidades, calcular totales)

---

## Galería de la aplicación

### Experiencia del cliente

| Catálogo (dark mode) | Detalle de álbum |
|:---:|:---:|
| ![Catálogo](docs/img/catalogo-cliente.png) | ![Detalle álbum](docs/img/detalle-album-cliente.png) |

| Carrito y checkout | Historial de pedidos |
|:---:|:---:|
| ![Confirmación de compra](docs/img/confirmacion-compra-cliente.png) | ![Pedidos](docs/img/pedidos-cliente.png) |

| Filtros por género | Modo claro |
|:---:|:---:|
| ![Filtros género](docs/img/filtro-genero-cliente.png) | ![Light mode](docs/img/catalogo-light-cliente.png) |

### Panel de administración y ventas

| Dashboard y KPIs | Gestión de inventario |
|:---:|:---:|
| ![Resumen admin](docs/img/resumen-admin.png) | ![Gestión inventario](docs/img/gestion-inventario-admin.png) |

| Reporte de ventas | Detalle de venta |
|:---:|:---:|
| ![Ventas admin](docs/img/ventas-admin.png) | ![Detalle venta](docs/img/ventas-detalle-admin.png) |

| Venta presencial (POS) | Exportación a CSV |
|:---:|:---:|
| ![Venta presencial](docs/img/venta-presencial-admin.png) | ![Exportación CSV](docs/img/exportacion-csv-admin.png) |

### Autenticación y administración de staff

| Login y registro | Registro de empleado (solo admin) |
|:---:|:---:|
| ![Login y registro](docs/img/login-registro.png) | ![Registro staff](docs/img/registro-staff-admin.png) |

| Agregar producto (iTunes) | Vista catálogo desde panel admin |
|:---:|:---:|
| ![Agregar producto](docs/img/agregar-producto-admin.png) | ![Vista cliente admin](docs/img/vista-cliente-admin.png) |

---

## Levantamiento del proyecto

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) o Docker Engine con el plugin Compose
- Git

### Instrucciones

**1. Clonar el repositorio y cambiar a la rama correcta**

```bash
git clone <url-del-repositorio>
cd Proyecto2-DB
git checkout PY2-WEB
```

**2. Crear el archivo de variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con los siguientes valores. Las credenciales de base de datos son fijas para calificación y **no deben modificarse**:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=tienda_db
DB_USER=proy2
DB_PASSWORD=secret
DB_ROOT_PASSWORD=rootsecret
JWT_SECRET=tienda_musical_jwt_secret_2026
BACKEND_PORT=3000
FRONTEND_PORT=8080
```

**3. Levantar todos los servicios**

```bash
docker compose up
```

El primer arranque puede tardar entre 30 y 60 segundos mientras MariaDB inicializa el esquema y carga los datos de prueba. No se requiere ningún paso adicional.

| Servicio | URL |
|---------|-----|
| Frontend (React + Nginx) | http://localhost:8080 |
| Backend API (Fastify) | http://localhost:3000 |
| Health check DB | http://localhost:3000/api/health-db |

```bash
# Levantar en segundo plano
docker compose up -d

# Detener sin borrar datos
docker compose down

# Reset completo (esquema + datos)
docker compose down -v && docker compose up
```

---

## Pruebas unitarias

El proyecto usa **Vitest** + **React Testing Library**. Hay 6 archivos de prueba con 15 assertions en total.

**Archivos de prueba** (`app/frontend/src/components/__tests__/`):

| Archivo | Qué evalúa |
|---------|-----------|
| `AlbumCard.test.jsx` | Renderizado de tarjeta de producto, texto y callbacks |
| `AlbumCover.test.jsx` | Carga de portada y fallback ante error |
| `ThemeToggle.test.jsx` | Alternancia dark/light mode |
| `PosterStrip.test.jsx` | Componente decorativo de portadas |
| `BLogo.test.jsx` | Renderizado del logotipo |
| `FormatChip.test.jsx` | Etiquetas de formato (Vinilo, CD, Cassette) |

**Ejecutar pruebas (desde el host, requiere Node.js):**

```bash
cd app/frontend
npm install
npm test
```

**Ejecutar pruebas desde el contenedor:**

```bash
docker compose exec frontend sh -c "npm test"
```

---

## Linting

**Ejecutar lint (desde el host):**

```bash
cd app/frontend
npm run lint
```

**Ejecutar lint desde el contenedor:**

```bash
docker compose exec frontend sh -c "npm run lint"
```

El proyecto usa ESLint con `eslint-plugin-react`, `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`. No hay errores ni advertencias activas.

---

## Credenciales de prueba

La contraseña de todos los usuarios seed es `secret`.

### Administrador

| Campo | Valor |
|-------|-------|
| Correo | `diego.admin@tiendamusical.gt` |
| Contraseña | `secret` |

Permisos: acceso completo. Puede gestionar inventario, consultar reportes, registrar ventas presenciales y crear cuentas de empleados. Es el único rol que puede eliminar registros de productos.

Otros administradores: `marce.admin@tiendamusical.gt`, `max.admin@tiendamusical.gt`.

### Vendedor

| Campo | Valor |
|-------|-------|
| Correo | `marcela.gatica@tiendamusical.gt` |
| Contraseña | `secret` |

Permisos: registrar ventas presenciales, gestionar inventario (agregar y editar productos), consultar reporte de ventas y exportar CSV. No puede registrar empleados ni eliminar productos.

Otros vendedores: `roberto.perez@tiendamusical.gt`, `sofia.ramirez@tiendamusical.gt`.

### Cliente

| Campo | Valor |
|-------|-------|
| Correo | `javier.alvarado@gmail.com` |
| Contraseña | `secret` |

Permisos: navegar catálogo, gestionar carrito, realizar compras online, administrar wishlist y consultar historial de pedidos.

Otros clientes: `mariana.pineda@gmail.com`, `kevin.estrada@hotmail.com`.

> Para crear un cliente nuevo: usar la pestaña **CREAR CUENTA** en la pantalla de login.

---

## Mapa de rutas

| Ruta | Vista | Acceso |
|------|-------|--------|
| `/login` | Login y registro | Público (redirige si ya autenticado) |
| `/` | Catálogo + carrusel + panel de detalle | Autenticado |
| `/carrito` | Carrito + checkout + confirmación | Autenticado |
| `/perfil` | Perfil personal, wishlist, historial | Autenticado |
| `/admin` | Dashboard (KPIs, gráfica de ventas) | Admin, Vendedor |
| `/admin/inventario` | CRUD de productos | Admin, Vendedor |
| `/admin/ventas` | Reporte de ventas + exportación CSV | Admin, Vendedor |
| `/*` | Página 404 | Cualquier ruta inválida |

---

## Endpoints de la API REST

### Autenticación

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Público | Genera JWT |
| POST | `/api/auth/register` | Público | Crea cuenta de cliente (transacción explícita) |
| GET | `/api/auth/me` | Autenticado | Datos del token actual |

### Productos y álbumes

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/productos` | Público | Lista completa (JOIN de 6 tablas + subquery de géneros) |
| GET | `/api/productos/mas-vendidos` | Público | Top N por `SUM(cantidad)` |
| POST | `/api/productos` | Staff | Crear producto (valida FKs) |
| PATCH | `/api/productos/:id` | Staff | Actualizar precio y/o stock |
| DELETE | `/api/productos/:id` | Admin | Eliminar registro |
| GET | `/api/albums` | Público | Lista de álbumes |
| POST | `/api/albums` | Staff | Crear álbum y artista si no existen |
| GET | `/api/albums/buscar-portada` | Staff | Búsqueda en iTunes Search API |

### Ventas

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/ventas` | Autenticado | Venta online con `id_cliente` |
| POST | `/api/ventas/presencial` | Staff | Venta presencial (CF o cliente por correo) |
| GET | `/api/ventas` | Staff | Reporte completo (CTE + `vw_resumen_ventas`) |
| GET | `/api/ventas/mis-compras` | Autenticado | Historial del cliente autenticado |

### Clientes y empleados

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/clientes/mi-perfil` | Autenticado | Perfil del cliente |
| PATCH | `/api/clientes/mi-perfil` | Autenticado | Actualizar NIT y dirección |
| GET | `/api/admin/clientes` | Staff | Lista de clientes |
| GET | `/api/admin/buscar-cliente` | Staff | Buscar cliente por correo |
| GET | `/api/admin/empleados` | Staff | Lista de empleados |
| POST | `/api/admin/empleados` | Admin | Registrar empleado (transacción explícita) |

### Utilidades

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/stats/publico` | Público | KPIs para pantalla de login |
| GET | `/api/health-db` | Público | Verificación de conectividad con la DB |
| GET | `/api/categorias` | Público | Categorías comerciales |
| GET | `/api/generos` | Público | Géneros musicales |
| GET | `/api/proveedores` | Staff | Distribuidoras |
| GET | `/api/album-tipos` | Público | Formatos físicos |

---

## Estructura del repositorio

```
Proyecto2-DB/
├── app/
│   ├── database/
│   │   └── init/
│   │       ├── 01_schema.sql          # DDL: tablas, índices y vista SQL
│   │       └── 02_data.sql            # Datos de prueba (≥25 filas/tabla)
│   ├── backend/                       # Fastify + Node.js
│   │   └── src/
│   │       ├── routes/                # Un módulo por entidad
│   │       ├── hooks/                 # Middleware JWT y autorización por rol
│   │       └── db.js                  # Pool de conexiones mysql2
│   └── frontend/                      # React 18 + Vite
│       └── src/
│           ├── views/                 # Vistas por ruta (.jsx)
│           ├── components/            # Componentes reutilizables + __tests__/
│           ├── Context/               # AuthContext, CartContext, ThemeContext, WishlistContext
│           ├── api/                   # Cliente Axios con interceptor JWT
│           ├── AuthContext.jsx        # Contexto principal de sesión
│           └── App.jsx                # Router + ProtectedRoute
├── docs/
│   └── img/                           # Capturas de pantalla de la aplicación
├── docker-compose.example.yml         # Plantilla de referencia
├── .env.example                       # Variables requeridas (sin valores sensibles)
└── README.md                          # Este archivo
```

---

## Criterios de evaluación cubiertos (cc3062)

### I. Arquitectura y API REST — 35 pts

| Criterio | Implementación |
|----------|---------------|
| Endpoints REST documentados | Tablas completas en este README |
| CRUD completo para ≥2 entidades | **Producto**: crear, leer, actualizar (precio/stock), eliminar. **Perfil de cliente**: leer, actualizar (NIT/dirección) |
| Manejo de errores con códigos HTTP correctos | Respuestas JSON con código y mensaje; interceptor Axios gestiona 401/500 y diferencia sesión expirada de login fallido |
| Endpoint de agregación | `GET /api/productos/mas-vendidos` (`SUM`), KPIs en `GET /api/stats/publico` y totales en `GET /api/ventas` |

### II. Frontend — React — 53 pts

| Criterio | Implementación |
|----------|---------------|
| React Router con ≥4 rutas | 8 rutas definidas en `App.jsx`, incluyendo ruta 404 con `path="*"` |
| Estado global con React Context | `AuthContext` (sesión), `CartContext` (carrito), `WishlistContext` (favoritos), `ThemeContext` (tema) |
| `useState`, `useEffect` y `useCallback`/`useMemo` | Presentes en todas las vistas; `useMemo` en `AuthContext` para el valor del provider y en filtros de inventario/ventas |
| `useReducer` para flujo complejo | `CartContext` usa `useReducer` para todas las acciones del carrito |
| Formularios controlados con validación | Login, registro, checkout, CRUD de inventario, venta presencial y registro de empleado |
| Reporte visible en UI con datos reales | `/admin/ventas`: tabla desde `vw_resumen_ventas`, KPIs calculados en DB, gráfica de ingresos mensuales con Chart.js, panel de detalle expandible por venta |
| Manejo visible de errores | Mensajes inline en formularios y notificaciones en todas las operaciones CRUD |

### III. Calidad de código — 12 pts

| Criterio | Comando | Resultado |
|----------|---------|-----------|
| ESLint sin errores | `npm run lint` | 0 errores, 0 advertencias |
| ≥3 pruebas unitarias | `npm test` | 6 archivos, 15 assertions |

### IV. Despliegue y entrega — 15 pts

| Criterio | Estado |
|----------|--------|
| README con instrucciones funcionales | Este documento |
| Levanta con `docker compose up` sin pasos adicionales | Confirmado — Nginx sirve la build de Vite/React |

### V. Avanzado — 20 pts

| Criterio | Implementación |
|----------|---------------|
| Autenticación con login/logout y sesión via Context | JWT en `localStorage`; `AuthContext` expone `login`/`logout`; `ProtectedRoute` aplica guards por rol; auto-logout en 401 con token activo |
| Exportar reporte a CSV | Botón en `/admin/ventas`; genera `Blob` con BOM UTF-8 para compatibilidad con Excel; nombre de archivo `ventas_YYYY-MM-DD.csv` |
| Diseño responsivo | Layout adaptable verificado en catálogo, panel admin y formularios de checkout |
