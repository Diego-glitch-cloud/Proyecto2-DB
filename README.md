# Proyecto 2 — Gestión de Inventario en Tienda Musical

**Diego Andre Calderón Salazar — 241263**
Universidad del Valle de Guatemala · cc3088 Bases de Datos 1 · Ciclo 1, 2026

---

## Descripción

Aplicación web para gestionar el inventario y las ventas de una **tienda de discos y vinilos**. El sistema permite registrar productos (álbumes), categorías por género musical, proveedores, clientes, empleados y compras con su detalle de venta.

La base de datos está diseñada en **MariaDB 11.4**, normalizada hasta **3FN**, y toda la infraestructura se levanta con un único comando Docker Compose.

---

## Estado del proyecto

| Componente | Estado |
|---|---|
| Diseño ER y modelo relacional | ✅ Completo |
| Normalización documentada (3FN) | ✅ Completo |
| DDL (`01_schema.sql`) — tablas, FKs, índices, vista | ✅ Completo |
| Datos de prueba (`02_data.sql`) — ≥25 filas por tabla | ✅ Completo |
| Docker Compose (DB + Backend + Frontend) | ✅ Completo |
| Backend (Fastify + Node.js) — scaffold | ✅ Completo |
| Frontend (Vue 3 + Vite + PrimeVue) — scaffold | ✅ Completo |
| Autenticación JWT | ⏳ Por implementar |
| CRUD de entidades en la UI | ⏳ Por implementar |
| Consultas SQL avanzadas (JOINs, CTEs, subqueries) | ⏳ Por implementar |
| Transacciones explícitas con ROLLBACK | ⏳ Por implementar |
| Reportes en la UI (con exportación CSV/PDF) | ⏳ Por implementar |

> **Entrega de avances:** 20 de abril de 2026
> **Entrega final:** 4 de mayo de 2026

---

## Documentación de diseño

Los documentos de diseño de la base de datos se encuentran en la carpeta [`docs/`](./docs/).

### Diagrama Entidad-Relación

![DER](docs/DER-PY2.png)

### Modelo Relacional

![Modelo Relacional](docs/modelo-relacional.png)

> El documento completo con normalización, dependencias funcionales y justificaciones se encuentra en [`docs/PY2-DB.pdf`](./docs/PY2-DB.pdf).

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Base de datos | MariaDB 11.4 | Eficiencia en baja escala, gestión de credenciales vía variables de entorno, soporte nativo de SQL explícito |
| Backend | Fastify + Node.js | Alto rendimiento en procesamiento de peticiones, arquitectura modular por plugins, validación nativa con JSON Schema |
| Frontend | Vue 3 + Vite | Entorno de desarrollo ultra rápido, aplicación final ligera |
| Estado global | Pinia | Simplicidad y compatibilidad con la Composition API de Vue 3 |
| Componentes UI | PrimeVue | Librería de componentes preconstruidos (tablas, formularios) que acelera los módulos administrativos y reportes |

---

## Estructura del proyecto

```
Proyecto2-DB/
├── app/
│   ├── database/
│   │   └── init/
│   │       ├── 01_schema.sql        # DDL: tablas, índices, vista
│   │       └── 02_data.sql          # Seed: ≥25 filas por tabla
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.js             # Servidor Fastify (punto de entrada)
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── App.vue              # Componente raíz
│       │   └── main.js              # Bootstrap Vue + Pinia + PrimeVue
│       ├── Dockerfile
│       ├── index.html
│       ├── nginx.conf               # SPA routing + proxy /api → backend
│       ├── vite.config.js
│       └── package.json
├── docs/
│   ├── DER-PY2.png
│   ├── modelo-relacional.png
│   └── PY2-DB.pdf
├── docker-compose.yml               # No commiteado (usa .env)
├── docker-compose.example.yml       # Commiteado — idéntico al real
├── .env                             # No commiteado — credenciales reales
├── .env.example                     # Commiteado — lista las variables
└── README.md
```

---

## Levantar el proyecto

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) instalado y corriendo
- [Docker Compose](https://docs.docker.com/compose/) v2+

### Pasos

**1. Clonar el repositorio**

```bash
git clone https://github.com/Diego-glitch-cloud/Proyecto2-DB.git
cd Proyecto2-DB
```

**2. Configurar las variables de entorno**

> ⚠️ **Nota de seguridad (contexto académico):** en un proyecto real, el archivo `.env` **nunca** debe subirse al repositorio ni exponerse públicamente, ya que contiene credenciales sensibles. Se hace una excepción aquí — conscientemente y de forma explícita — porque se trata de un proyecto académico de evaluación, y exponer las variables facilita que el cuerpo docente pueda levantar el proyecto sin configuración adicional. **Esta práctica no debe replicarse fuera de contextos académicos y soy consciente de ello.**

El repositorio ya incluye el archivo `.env.example` con toda la estructura de los valores necesarios. Si por algún motivo no existe, créalo en la raíz del proyecto con el siguiente contenido:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=tienda_db
DB_USER=proy2
DB_PASSWORD=secret
DB_ROOT_PASSWORD=root_secret
JWT_SECRET=tienda_musical_jwt_secret_2026
BACKEND_PORT=3000
FRONTEND_PORT=80
```

| Variable | Descripción |
|---|---|
| `DB_HOST` | Nombre del servicio de base de datos en la red Docker (`db`) |
| `DB_PORT` | Puerto expuesto al host para conectar a MariaDB |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de la base de datos (fijo por rúbrica: `proy2`) |
| `DB_PASSWORD` | Contraseña de la base de datos (fijo por rúbrica: `secret`) |
| `DB_ROOT_PASSWORD` | Contraseña del usuario root de MariaDB |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT de autenticación |
| `BACKEND_PORT` | Puerto en que escucha el backend Fastify (host e interno) |
| `FRONTEND_PORT` | Puerto del host que sirve el frontend a través de Nginx |

**3. Levantar los contenedores**

```bash
docker compose up --build -d
```

Docker inicializará MariaDB y ejecutará automáticamente los scripts de la carpeta `app/database/init/` en orden:
1. `01_schema.sql` — crea las tablas, índices y la vista
2. `02_data.sql` — inserta los datos de prueba

**4. Verificar con Adminer**

El `docker-compose.yml` ya incluye un contenedor **Adminer** para facilitar la revisión de la base de datos durante la evaluación. Accede a `http://localhost:8080` con:
- **Sistema:** MySQL
- **Servidor:** `db`
- **Usuario:** `proy2`
- **Contraseña:** `secret`
- **Base de datos:** `tienda_db`

### Servicios y puertos

| Servicio | URL | Descripción |
|---|---|---|
| Frontend | `http://localhost:80` | Aplicación Vue 3 servida por Nginx |
| Backend | `http://localhost:3000` | API REST Fastify |
| Adminer | `http://localhost:8080` | Administrador visual de la base de datos |
| MariaDB | `localhost:3306` | Base de datos (acceso directo) |

### Comandos útiles

```bash
# Levantar (con rebuild de imágenes) en segundo plano
docker compose up --build -d

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener (conserva los datos)
docker compose down

# Resetear completamente (borra el volumen y re-ejecuta los scripts de init)
docker compose down -v && docker compose up --build -d
```

> ⚠️ Los scripts de inicialización **solo se ejecutan la primera vez** que el volumen está vacío. Si modificas `01_schema.sql` o `02_data.sql`, debes correr `docker compose down -v` antes de volver a levantar.

---

## Esquema de la base de datos

El modelo está normalizado en **3FN** con 14 tablas. Posterior a los avances iniciales el esquema fue extendido para modelar correctamente una tienda musical, agregando entidades de catálogo (`Artista`, `Album`, `Genero`, `Album_Tipo`, `Album_Genero`) y refactorizando `Producto` para referenciarlas.

```
-- Roles y acceso
Rol           (id, detalle)                                              -- 'admin' | 'vendedor' | 'cliente'
Persona       (id, nombre, correo, contrasena, id_rol →Rol)

-- Usuarios del sistema
Cliente       (id, id_persona →Persona, NIT, direccion)
Empleado      (id, id_persona →Persona, DPI)

-- Catálogo musical
Artista       (id, nombre)
Genero        (id, detalle)
Album_Tipo    (id, detalle)                                              -- 'CD' | 'Vinilo'
Album         (id, titulo, anio, url_portada, track_count, id_artista →Artista)
Album_Genero  (id_album →Album, id_genero →Genero)                      -- PK compuesta, N:M

-- Inventario
Categoria     (id, detalle)
Proveedor     (id, nombre)
Producto      (id, precio, stock, id_album →Album, id_album_tipo →Album_Tipo,
               id_categoria →Categoria, id_proveedor →Proveedor)

-- Ventas
Compra        (id, fecha, id_cliente →Cliente, id_empleado →Empleado)
DetalleVenta  (id_compra →Compra, id_producto →Producto,               -- PK compuesta
               cantidad, precio_unitario)
```

Decisiones de diseño relevantes:
- **`Artista` / `Album`** normalizan los metadatos musicales — evitan repetir el nombre del artista en cada producto y permiten consultas por catálogo.
- **`Album_Genero`** resuelve la cardinalidad N:M (un álbum puede tener varios géneros).
- **`Album_Tipo`** separa el formato físico (CD / Vinilo) como entidad, en lugar de codificarlo en el nombre del producto.
- **`Producto`** ya no tiene campo `nombre`; la identidad del producto se deriva de `Album` + `Album_Tipo`.
- **`stock`** vive en `Producto` (relación 1:1 con Stock colapsada en normalización).
- **`precio_unitario`** en `DetalleVenta` es un snapshot histórico copiado al momento de la venta, no derivado de `Producto.precio`.
- **`Persona`** centraliza correo, contraseña y rol para soportar el login tanto de clientes como de empleados.
- El **subtotal** (`cantidad × precio_unitario`) es un valor derivado calculado en la capa de aplicación.
