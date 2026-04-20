-- ============================================================
-- schema.sql — DDL para tienda_db
-- MariaDB 11.4 | Normalizado en 3FN
-- Ejecutado automaticamente por Docker al primer arranque.
-- DB_NAME debe coincidir con el valor definido en .env
-- ============================================================

USE tienda_db;

-- ============================================================
-- Tablas de catalogo (sin dependencias externas)
-- ============================================================

CREATE TABLE IF NOT EXISTS Rol (
    id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    detalle VARCHAR(20)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rol_detalle (detalle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Categoria (
    id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    detalle VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categoria_detalle (detalle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Proveedor (
    id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_proveedor_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Persona centraliza credenciales de login para Cliente y Empleado
-- ============================================================

CREATE TABLE IF NOT EXISTS Persona (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(150) NOT NULL,
    correo     VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    id_rol     INT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_persona_correo (correo),
    CONSTRAINT fk_persona_rol
        FOREIGN KEY (id_rol) REFERENCES Rol (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relacion 1:1 con Persona. UNIQUE KEY en id_persona fuerza la cardinalidad.
CREATE TABLE IF NOT EXISTS Empleado (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_persona INT UNSIGNED NOT NULL,
    DPI        VARCHAR(13)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_empleado_persona (id_persona),
    UNIQUE KEY uq_empleado_dpi     (DPI),
    CONSTRAINT fk_empleado_persona
        FOREIGN KEY (id_persona) REFERENCES Persona (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relacion 1:1 con Persona. direccion es opcional (NULL permitido segun diseno).
CREATE TABLE IF NOT EXISTS Cliente (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_persona INT UNSIGNED NOT NULL,
    NIT        VARCHAR(15)  NOT NULL,
    direccion  VARCHAR(255)     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cliente_persona (id_persona),
    CONSTRAINT fk_cliente_persona
        FOREIGN KEY (id_persona) REFERENCES Persona (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Inventario
-- Stock en Producto (relacion 1:1)
-- ============================================================

CREATE TABLE IF NOT EXISTS Producto (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(150)  NOT NULL,
    precio       DECIMAL(10,2) NOT NULL,
    stock        INT UNSIGNED  NOT NULL DEFAULT 0,
    id_categoria INT UNSIGNED  NOT NULL,
    id_proveedor INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES Categoria (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES Proveedor (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Ventas
-- ============================================================

CREATE TABLE IF NOT EXISTS Compra (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cliente  INT UNSIGNED NOT NULL,
    id_empleado INT UNSIGNED NOT NULL,
    fecha       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_compra_cliente
        FOREIGN KEY (id_cliente)  REFERENCES Cliente  (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_compra_empleado
        FOREIGN KEY (id_empleado) REFERENCES Empleado (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PK compuesta (id_compra, id_producto).
-- precio_unitario es snapshot historico: se copia desde Producto.precio al registrar
-- la venta. Cambios futuros de precio no alteran el historial. Esto resuelve la
-- dependencia parcial que rompia 2FN en el diseno inicial (subtotal dependia solo
-- de id_producto). El subtotal se calcula en la capa de aplicacion como
-- cantidad * precio_unitario y no se almacena.
CREATE TABLE IF NOT EXISTS DetalleVenta (
    id_compra       INT UNSIGNED  NOT NULL,
    id_producto     INT UNSIGNED  NOT NULL,
    cantidad        INT UNSIGNED  NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_compra, id_producto),
    CONSTRAINT fk_detalle_compra
        FOREIGN KEY (id_compra)   REFERENCES Compra   (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES Producto (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Indices explicitos
-- Las FK sobre columnas de cardinalidad N son indexadas automaticamente
-- por InnoDB. Los indices a continuacion cubren patrones de busqueda
-- adicionales no cubiertos por ninguna PK, FK ni UNIQUE KEY.
-- ============================================================

-- Filtrado de ventas por rango de fechas en reportes (diario, mensual, anual).
-- Sin este indice cada reporte realiza full scan de Compra.
CREATE INDEX idx_compra_fecha    ON Compra   (fecha);

-- Busqueda de productos por nombre (autocompletado y filtros en la UI de inventario).
-- Sin este indice cada busqueda de texto realiza full scan de Producto.
CREATE INDEX idx_producto_nombre ON Producto (nombre);

-- Consultas de alerta de stock bajo en el dashboard (WHERE stock < umbral).
-- Permite descartar filas sin leer la tabla completa.
CREATE INDEX idx_producto_stock  ON Producto (stock);

-- Busqueda de clientes por NIT para emision de facturas y consultas rapidas.
-- NIT no lleva UNIQUE KEY porque "CF" (Consumidor Final) puede repetirse entre clientes.
CREATE INDEX idx_cliente_NIT     ON Cliente  (NIT);

-- ============================================================
-- Vista: resumen completo de ventas
-- Usada por el backend para alimentar el reporte principal de ventas en la UI.
-- Evita reescribir el JOIN de 7 tablas en cada endpoint del backend.
-- ============================================================

CREATE OR REPLACE VIEW vw_resumen_ventas AS
SELECT
    c.id                                AS id_compra,
    c.fecha,
    pe_cli.nombre                       AS nombre_cliente,
    cli.NIT                             AS nit_cliente,
    pe_emp.nombre                       AS nombre_empleado,
    p.id                                AS id_producto,
    p.nombre                            AS nombre_producto,
    cat.detalle                         AS categoria,
    dv.cantidad,
    dv.precio_unitario,
    (dv.cantidad * dv.precio_unitario)  AS subtotal
FROM        Compra       c
JOIN        Cliente      cli     ON c.id_cliente    = cli.id
JOIN        Persona      pe_cli  ON cli.id_persona  = pe_cli.id
JOIN        Empleado     emp     ON c.id_empleado   = emp.id
JOIN        Persona      pe_emp  ON emp.id_persona  = pe_emp.id
JOIN        DetalleVenta dv      ON c.id            = dv.id_compra
JOIN        Producto     p       ON dv.id_producto  = p.id
JOIN        Categoria    cat     ON p.id_categoria  = cat.id;