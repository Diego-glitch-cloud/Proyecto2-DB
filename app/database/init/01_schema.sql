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
-- Catalogo musical
-- ============================================================

CREATE TABLE IF NOT EXISTS Artista (
    id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_artista_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Album_Tipo diferencia el formato fisico del mismo album:
-- 'Vinilo', 'CD', 'Cassette', 'Edicion Limitada'.
CREATE TABLE IF NOT EXISTS Album_Tipo (
    id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    detalle VARCHAR(50)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_album_tipo_detalle (detalle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Genero clasifica musicalmente a los albums (N:M via Album_Genero).
-- Separado de Categoria: Categoria es la etiqueta comercial del producto
-- en el inventario; Genero es la clasificacion musical del album.
CREATE TABLE IF NOT EXISTS Genero (
    id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    detalle VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_genero_detalle (detalle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- url_portada almacena el enlace externo a la imagen de portada
-- (obtenido de la iTunes Search API). VARCHAR(1024) cubre holgadamente
-- las URLs del CDN de Apple (is1-ssl.mzstatic.com, ~150-200 chars).
-- anio usa tipo YEAR (MariaDB): 1 byte, rango 1901-2155, mostrado como YYYY.
CREATE TABLE IF NOT EXISTS Album (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    titulo      VARCHAR(200)  NOT NULL,
    anio        YEAR          NOT NULL,
    url_portada VARCHAR(1024)     NULL,
    track_count INT UNSIGNED  NOT NULL,
    id_artista  INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_album_artista
        FOREIGN KEY (id_artista) REFERENCES Artista (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cruce N:M entre Album y Genero.
CREATE TABLE IF NOT EXISTS Album_Genero (
    id_album  INT UNSIGNED NOT NULL,
    id_genero INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_album, id_genero),
    CONSTRAINT fk_album_genero_album
        FOREIGN KEY (id_album)  REFERENCES Album  (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_album_genero_genero
        FOREIGN KEY (id_genero) REFERENCES Genero (id)
        ON UPDATE CASCADE
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
-- Stock en Producto (relacion 1:1 conceptual — sin entidad separada).
-- El nombre del producto se construye desde Album + Album_Tipo,
-- eliminando la dependencia funcional directa en Producto.
-- uq_producto_album_tipo evita duplicar un album en el mismo formato.
-- ============================================================

CREATE TABLE IF NOT EXISTS Producto (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    precio        DECIMAL(10,2) NOT NULL,
    stock         INT UNSIGNED  NOT NULL DEFAULT 0,
    id_album      INT UNSIGNED  NOT NULL,
    id_album_tipo INT UNSIGNED  NOT NULL,
    id_categoria  INT UNSIGNED  NOT NULL,
    id_proveedor  INT UNSIGNED  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_producto_album_tipo (id_album, id_album_tipo),
    CONSTRAINT fk_producto_album
        FOREIGN KEY (id_album)      REFERENCES Album     (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_producto_album_tipo
        FOREIGN KEY (id_album_tipo) REFERENCES Album_Tipo (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)  REFERENCES Categoria  (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor)  REFERENCES Proveedor  (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Ventas
-- ============================================================

-- id_empleado es NULL en compras online (el cliente compra solo).
-- En ventas físicas de tienda contiene el id del empleado que registró la compra.
CREATE TABLE IF NOT EXISTS Compra (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cliente  INT UNSIGNED NOT NULL,
    id_empleado INT UNSIGNED     NULL,
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
-- precio_unitario es snapshot historico: se copia desde Producto.precio al
-- registrar la venta. Cambios futuros de precio no alteran el historial.
-- El subtotal se calcula en la capa de aplicacion como cantidad * precio_unitario.
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
CREATE INDEX idx_compra_fecha     ON Compra  (fecha);

-- Busqueda y autocompletado de albums por titulo en la UI de inventario.
-- Reemplaza al anterior idx_producto_nombre, ahora que el nombre
-- se deriva de Album.titulo + Artista.nombre + Album_Tipo.detalle.
CREATE INDEX idx_album_titulo     ON Album   (titulo);

-- Filtrado de albums por artista (listado de discografia en la UI).
-- Sin este indice cada consulta por artista escanea toda la tabla Album.
CREATE INDEX idx_album_id_artista ON Album   (id_artista);

-- Consultas de alerta de stock bajo en el dashboard (WHERE stock < umbral).
-- Permite descartar filas sin leer la tabla completa.
CREATE INDEX idx_producto_stock   ON Producto (stock);

-- Busqueda de clientes por NIT para emision de facturas y consultas rapidas.
-- NIT no lleva UNIQUE KEY porque "CF" (Consumidor Final) puede repetirse.
CREATE INDEX idx_cliente_NIT      ON Cliente  (NIT);

-- ============================================================
-- Vista: resumen completo de ventas
-- Usada por el backend para alimentar el reporte principal de ventas en la UI.
-- Evita reescribir el JOIN de 9 tablas en cada endpoint del backend.
-- nombre_artista, titulo_album y tipo_formato se exponen por separado
-- para que el frontend los combine segun su necesidad de presentacion.
-- ============================================================

CREATE OR REPLACE VIEW vw_resumen_ventas AS
SELECT
    c.id                                         AS id_compra,
    c.fecha,
    cli.id                                       AS id_cliente,
    pe_cli.nombre                                AS nombre_cliente,
    cli.NIT                                      AS nit_cliente,
    pe_emp.nombre                                AS nombre_empleado,
    p.id                                         AS id_producto,
    art.nombre                                   AS nombre_artista,
    alb.titulo                                   AS titulo_album,
    alb.anio                                     AS anio_album,
    alb.url_portada,
    at.detalle                                   AS tipo_formato,
    cat.detalle                                  AS categoria,
    dv.cantidad,
    dv.precio_unitario,
    (dv.cantidad * dv.precio_unitario)           AS subtotal
FROM        Compra       c
JOIN        Cliente      cli     ON c.id_cliente    = cli.id
JOIN        Persona      pe_cli  ON cli.id_persona  = pe_cli.id
LEFT JOIN   Empleado     emp     ON c.id_empleado   = emp.id
LEFT JOIN   Persona      pe_emp  ON emp.id_persona  = pe_emp.id
JOIN        DetalleVenta dv      ON c.id            = dv.id_compra
JOIN        Producto     p       ON dv.id_producto  = p.id
JOIN        Album        alb     ON p.id_album      = alb.id
JOIN        Artista      art     ON alb.id_artista  = art.id
JOIN        Album_Tipo   at      ON p.id_album_tipo = at.id
JOIN        Categoria    cat     ON p.id_categoria  = cat.id;