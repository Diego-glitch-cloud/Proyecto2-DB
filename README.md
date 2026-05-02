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
| Docker Compose (MariaDB 11.4) | ✅ Completo |
| Backend (Fastify + Node.js) | ⏳ Por implementar |
| Frontend (Vue 3 + Vite + PrimeVue) | ⏳ Por implementar |
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
│   │       ├── 01_schema.sql   # DDL: tablas, índices, vista
│   │       └── 02_data.sql     # Seed: ≥25 filas por tabla
│   ├── backend/                # Fastify + Node.js (por implementar)
│   └── frontend/               # Vue 3 + Vite + PrimeVue (por implementar)
├── docs/
│   ├── DER-PY2.png
│   ├── modelo-relacional.png
│   └── PY2-DB.pdf
├── docker-compose.yml
├── docker-compose.example.yml
├── .env
├── .env.example
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

Copia el archivo de ejemplo y completa las variables:

```bash
cp .env.example .env
```

> ⚠️ **Nota académica:** por tratarse de un proyecto académico, las variables del `.env` se incluyen directamente en este README para facilitar la evaluación y evitar inconvenientes al levantar el contenedor. Somos conscientes de que exponer credenciales en un README representa una vulnerabilidad de seguridad — esta práctica **no debe replicarse en proyectos reales**.

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=tienda_db
DB_USER=proy2
DB_PASSWORD=secret
DB_ROOT_PASSWORD=root_secret
```

**3. Levantar los contenedores**

```bash
docker compose up
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

### Comandos útiles

```bash
# Levantar en segundo plano
docker compose up -d

# Ver logs de la base de datos
docker compose logs db

# Detener (conserva los datos)
docker compose down

# Resetear completamente (borra el volumen y re-ejecuta los scripts)
docker compose down -v && docker compose up
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
