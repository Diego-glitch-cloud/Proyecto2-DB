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
| Backend | ⏳ Por implementar |
| Frontend | ⏳ Por implementar |
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

## Estructura del proyecto

```
Proyecto2-DB/
├── app/
│   ├── database/
│   │   └── init/
│   │       ├── 01_schema.sql   # DDL: tablas, índices, vista
│   │       └── 02_data.sql     # Seed: ≥25 filas por tabla
│   ├── backend/                # Por implementar
│   └── frontend/               # Por implementar
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

El modelo está normalizado en **3FN** con 9 tablas:

```
Rol          (id, detalle)
Persona      (id, nombre, correo, contrasena, id_rol →Rol)
Empleado     (id, id_persona →Persona, DPI)
Cliente      (id, id_persona →Persona, NIT, direccion)
Categoria    (id, detalle)
Proveedor    (id, nombre)
Producto     (id, nombre, precio, stock, id_categoria →Categoria, id_proveedor →Proveedor)
Compra       (id, id_cliente →Cliente, id_empleado →Empleado, fecha)
DetalleVenta (id_compra →Compra, id_producto →Producto, cantidad, precio_unitario)
```

Decisiones de diseño relevantes:
- **`stock`** vive en `Producto` (relación 1:1 con Stock colapsada en normalización).
- **`precio_unitario`** en `DetalleVenta` es un snapshot histórico copiado al momento de la venta, no derivado de `Producto.precio`.
- **`Persona`** centraliza correo, contraseña y rol para soportar el login tanto de clientes como de empleados.
- El **subtotal** (`cantidad × precio_unitario`) es un valor derivado calculado en la capa de aplicación.
