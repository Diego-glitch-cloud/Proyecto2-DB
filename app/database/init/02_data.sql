-- ============================================================
-- data.sql — Datos de prueba para tienda_db
-- MariaDB 11.4 | Tienda de música (discos y vinilos)
-- Contraseña de todos los usuarios seed: secret
-- Hash bcrypt (cost 12) de la cadena "secret"
-- ============================================================

USE tienda_db;

SET NAMES utf8mb4;

-- ============================================================
-- Rol (3 valores fijos)
-- ============================================================

INSERT INTO Rol (id, detalle) VALUES
(1, 'admin'),
(2, 'vendedor'),
(3, 'cliente');

-- ============================================================
-- Categoria (7 entradas — etiqueta comercial del producto físico)
-- Clasifica COMO se vende, no qué música contiene.
-- Los géneros musicales viven en la tabla Genero.
-- ============================================================

INSERT INTO Categoria (id, detalle) VALUES
(1, 'Nuevo — Sellado'),
(2, 'Nuevo — Sin Celofán'),
(3, 'Usado — Excelente Estado'),
(4, 'Usado — Buen Estado'),
(5, 'Importado'),
(6, 'Edición Especial'),
(7, 'Outlet / Liquidación');

-- ============================================================
-- Proveedor (27 distribuidoras discográficas)
-- ============================================================

INSERT INTO Proveedor (id, nombre) VALUES
( 1, 'Discos Universal Guatemala'),
( 2, 'Sony Music Distribución'),
( 3, 'Warner Music Latin America'),
( 4, 'EMI Music Distribution'),
( 5, 'Independent Records GT'),
( 6, 'Vinyl Import USA'),
( 7, 'Record Heaven Import'),
( 8, 'Rough Trade Distribution'),
( 9, 'Sub Pop Records'),
(10, 'Merge Records Distribution'),
(11, 'Epitaph Distribution'),
(12, 'Victory Records'),
(13, 'Nuclear Blast Records'),
(14, 'Roadrunner Records'),
(15, 'Atlantic Records Distribution'),
(16, 'Columbia Records Supply'),
(17, 'Capitol Music Group'),
(18, 'Interscope Distribution'),
(19, 'Reprise Records'),
(20, 'Island Records Distribution'),
(21, 'Beggars Group'),
(22, '4AD Distribution'),
(23, 'Domino Recording'),
(24, 'XL Recordings'),
(25, 'Matador Records'),
(26, 'Touch and Go Records'),
(27, 'Captured Tracks');

-- ============================================================
-- Artista (20 artistas)
-- ============================================================

INSERT INTO Artista (id, nombre) VALUES
( 1, 'Metallica'),
( 2, 'Pink Floyd'),
( 3, 'The Strokes'),
( 4, 'Alice in Chains'),
( 5, 'The Smashing Pumpkins'),
( 6, 'Slowdive'),
( 7, 'My Bloody Valentine'),
( 8, 'Rush'),
( 9, 'The Smiths'),
(10, 'Deftones'),
(11, 'Radiohead'),
(12, 'Black Sabbath'),
(13, 'Tool'),
(14, 'Soundgarden'),
(15, 'Nirvana'),
(16, 'The Cure'),
(17, 'Cocteau Twins'),
(18, 'Deafheaven'),
(19, 'American Football'),
(20, 'Black Country New Road');

-- ============================================================
-- Album_Tipo (4 formatos físicos)
-- ============================================================

INSERT INTO Album_Tipo (id, detalle) VALUES
(1, 'Vinilo'),
(2, 'CD'),
(3, 'Cassette'),
(4, 'Edición Limitada');

-- ============================================================
-- Genero (27 géneros musicales — clasificación del álbum)
-- ============================================================

INSERT INTO Genero (id, detalle) VALUES
( 1, 'Thrash Metal'),
( 2, 'Progressive Rock'),
( 3, 'Indie Rock'),
( 4, 'Grunge'),
( 5, 'Alternative Rock'),
( 6, 'Alternative Metal'),
( 7, 'Shoegaze'),
( 8, 'Heavy Metal'),
( 9, 'Progressive Metal'),
(10, 'Indie Pop'),
(11, 'Post-Hardcore'),
(12, 'Math Rock'),
(13, 'Art Rock'),
(14, 'Dream Pop'),
(15, 'Post-Punk'),
(16, 'Blackgaze'),
(17, 'Hard Rock'),
(18, 'Punk Rock'),
(19, 'Electronic Rock'),
(20, 'Folk Rock'),
(21, 'Blues Rock'),
(22, 'Classic Rock'),
(23, 'Nu Metal'),
(24, 'Doom Metal'),
(25, 'Stoner Rock'),
(26, 'Post-Rock'),
(27, 'Psychedelic Rock');

-- ============================================================
-- Persona (53 filas)
-- IDs  1- 3 : admin
-- IDs  4-28 : vendedor
-- IDs 29-53 : cliente
-- Contraseña seed: "secret" — hash bcrypt cost 12
-- ============================================================

INSERT INTO Persona (id, nombre, correo, contrasena, id_rol) VALUES
( 1, 'Diego Calderón',      'diego.admin@tiendamusical.gt',       '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 1),
( 2, 'Marcela Gatica',      'marce.admin@tiendamusical.gt',       '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 1),
( 3, 'Max Apolo',           'max.admin@tiendamusical.gt',         '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 1),
( 4, 'Ana López',           'ana.lopez@tiendamusical.gt',         '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
( 5, 'Roberto Pérez',       'roberto.perez@tiendamusical.gt',     '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
( 6, 'Sofía Ramírez',       'sofia.ramirez@tiendamusical.gt',     '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
( 7, 'Luis García',         'luis.garcia@tiendamusical.gt',       '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
( 8, 'Fernanda Torres',     'fernanda.torres@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
( 9, 'Miguel Castillo',     'miguel.castillo@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(10, 'Valeria Morales',     'valeria.morales@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(11, 'José Hernández',      'jose.hernandez@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(12, 'Andrea Vásquez',      'andrea.vasquez@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(13, 'Marcela Gatica',      'marcela.gatica@tiendamusical.gt',       '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(14, 'Claudia Ruiz',        'claudia.ruiz@tiendamusical.gt',      '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(15, 'Eduardo Flores',      'eduardo.flores@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(16, 'Daniela Cruz',        'daniela.cruz@tiendamusical.gt',      '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(17, 'Andrés Maldonado',    'andres.maldonado@tiendamusical.gt',  '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(18, 'Isabella Gómez',      'isabella.gomez@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(19, 'Marco Jiménez',       'marco.jimenez@tiendamusical.gt',     '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(20, 'Lucía Herrera',       'lucia.herrera@tiendamusical.gt',     '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(21, 'Sebastián Ramos',     'sebastian.ramos@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(22, 'Camila Ortiz',        'camila.ortiz@tiendamusical.gt',      '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(23, 'Alejandro Soto',      'alejandro.soto@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(24, 'Natalia Vargas',      'natalia.vargas@tiendamusical.gt',    '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(25, 'Fernando Aguilar',    'fernando.aguilar@tiendamusical.gt',  '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(26, 'Patricia Molina',     'patricia.molina@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(27, 'Ricardo Salazar',     'ricardo.salazar@tiendamusical.gt',   '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(28, 'Gabriela Espinoza',   'gabriela.espinoza@tiendamusical.gt', '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 2),
(29, 'Javier Alvarado',     'javier.alvarado@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(30, 'Mariana Pineda',      'mariana.pineda@gmail.com',           '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(31, 'Kevin Estrada',       'kevin.estrada@hotmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(32, 'Alicia Fuentes',      'alicia.fuentes@gmail.com',           '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(33, 'Oscar Rivera',        'oscar.rivera@yahoo.com',             '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(34, 'Stephanie Morán',     'stephanie.moran@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(35, 'David Pacheco',       'david.pacheco@gmail.com',            '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(36, 'Karla Cifuentes',     'karla.cifuentes@hotmail.com',        '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(37, 'Héctor Velásquez',    'hector.velasquez@gmail.com',         '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(38, 'Daniela Lima',        'daniela.lima@gmail.com',             '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(39, 'Samuel Quiñones',     'samuel.quinones@outlook.com',        '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(40, 'Laura Monroy',        'laura.monroy@gmail.com',             '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(41, 'Rodrigo Chávez',      'rodrigo.chavez@gmail.com',           '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(42, 'Vanessa Palma',       'vanessa.palma@hotmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(43, 'Jorge Barrios',       'jorge.barrios@gmail.com',            '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(44, 'Melissa Cabrera',     'melissa.cabrera@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(45, 'Gabriel Mejía',       'gabriel.mejia@yahoo.com',            '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(46, 'Andrea Solano',       'andrea.solano@gmail.com',            '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(47, 'Christian Leiva',     'christian.leiva@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(48, 'Diana Marroquín',     'diana.marroquin@hotmail.com',        '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(49, 'Roberto Campos',      'roberto.campos@gmail.com',           '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(50, 'Paola Solórzano',     'paola.solorzano@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(51, 'Erick Ovalle',        'erick.ovalle@outlook.com',           '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(52, 'Mónica Sandoval',     'monica.sandoval@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3),
(53, 'Tomás Contreras',     'tomas.contreras@gmail.com',          '$2a$12$pCvNMBxu/ExeVMDwn2VJ8e2KbiBSCroqwKFuAIOpcxfcGraGZW44i', 3);

-- ============================================================
-- Empleado (28 filas — Personas 1-28)
-- DPIs ficticios de 13 dígitos (formato Guatemala)
-- ============================================================

INSERT INTO Empleado (id, id_persona, DPI) VALUES
( 1,  1, '2985741230101'),
( 2,  2, '1847362950202'),
( 3,  3, '3621089470303'),
( 4,  4, '4512378960404'),
( 5,  5, '5023641870505'),
( 6,  6, '6187490230606'),
( 7,  7, '7394820150707'),
( 8,  8, '8261053740808'),
( 9,  9, '9038174620909'),
(10, 10, '1923045871010'),
(11, 11, '2084739561111'),
(12, 12, '3140628951212'),
(13, 13, '4295817031313'),
(14, 14, '5371946281414'),
(15, 15, '6483027591515'),
(16, 16, '7594138601616'),
(17, 17, '8605249711717'),
(18, 18, '9716350821818'),
(19, 19, '1827461931919'),
(20, 20, '2938572042020'),
(21, 21, '3049683152121'),
(22, 22, '4150794262222'),
(23, 23, '5261805372323'),
(24, 24, '6372916482424'),
(25, 25, '7483027592525'),
(26, 26, '8594138602626'),
(27, 27, '9605249712727'),
(28, 28, '1716350822828');

-- ============================================================
-- Cliente (25 filas — Personas 29-53)
-- NITs ficticios; CF = Consumidor Final
-- ============================================================

INSERT INTO Cliente (id, id_persona, NIT, direccion) VALUES
( 1, 29, '1234567-8',  'Zona 10, Guatemala City'),
( 2, 30, 'CF',         NULL),
( 3, 31, '2345678-9',  '5a Avenida, Zona 1, Guatemala City'),
( 4, 32, '3456789-0',  'Colonia Las Charcas, Zona 11'),
( 5, 33, 'CF',         NULL),
( 6, 34, '4567890-1',  'San Pedro Sacatepéquez, San Marcos'),
( 7, 35, '5678901-2',  'Antigua Guatemala, Sacatepéquez'),
( 8, 36, 'CF',         NULL),
( 9, 37, '6789012-3',  'Quetzaltenango, Zona 3'),
(10, 38, '7890123-4',  'Villa Nueva, Guatemala'),
(11, 39, 'CF',         '6a Calle, Zona 4, Guatemala City'),
(12, 40, '8901234-5',  'Mixco, Guatemala'),
(13, 41, '9012345-6',  'Escuintla, Escuintla'),
(14, 42, 'CF',         NULL),
(15, 43, '1023456-7',  'Cobán, Alta Verapaz'),
(16, 44, '2034567-8',  'Huehuetenango, Huehuetenango'),
(17, 45, 'CF',         NULL),
(18, 46, '3045678-9',  'Puerto Barrios, Izabal'),
(19, 47, '4056789-0',  'Zona 15, Guatemala City'),
(20, 48, 'CF',         NULL),
(21, 49, '5067890-1',  'Santa Catarina Pinula, Guatemala'),
(22, 50, '6078901-2',  'Chimaltenango, Chimaltenango'),
(23, 51, 'CF',         NULL),
(24, 52, '7089012-3',  'Petén, Flores'),
(25, 53, '8090123-4',  'Zona 13, Guatemala City');

-- ============================================================
-- Album (30 álbumes)
-- url_portada: obtenida de la iTunes Search API (artworkUrl100).
-- El campo es VARCHAR(1024); NULL en seed donde la URL no está
-- disponible — el backend la puebla vía iTunes al crear/editar.
-- anio es tipo YEAR de MariaDB (1 byte, rango 1901-2155).
-- ============================================================

INSERT INTO Album (id, titulo, anio, url_portada, track_count, id_artista) VALUES
( 1, 'Master of Puppets',         1986, NULL,  8,  1),
( 2, '...And Justice for All',    1988,  NULL,  9,  1),
( 3, 'The Dark Side of the Moon', 1973, NULL, 10,  2),
( 4, 'Wish You Were Here',        1975, NULL,  5,  2),
( 5, 'Animals',                   1977,  NULL,  5,  2),
( 6, 'Is This It',                2001,  NULL, 11,  3),
( 7, 'Room on Fire',              2003,  NULL, 11,  3),
( 8, 'Dirt',                      1992,  NULL, 13,  4),
( 9, 'Siamese Dream',             1993, NULL, 13,  5),
(10, 'Souvlaki',                  1994,  NULL,  9,  6),
(11, 'Loveless',                  1991, NULL, 11,  7),
(12, 'Isn''t Anything',           1988,  NULL, 11,  7),
(13, 'Moving Pictures',           1981,  NULL,  7,  8),
(14, '2112',                      1976,  NULL,  7,  8),
(15, 'The Queen Is Dead',         1986, NULL, 10,  9),
(16, 'White Pony',                2000,  NULL, 12, 10),
(17, 'OK Computer',               1997, NULL, 12, 11),
(18, 'Kid A',                     2000, NULL, 10, 11),
(19, 'The Bends',                 1995,  NULL, 12, 11),
(20, 'Paranoid',                  1970, NULL,  8, 12),
(21, 'Lateralus',                 2001, NULL, 13, 13),
(22, 'Ænima',                     1996,  NULL, 15, 13),
(23, 'Superunknown',              1994,  NULL, 24, 14),
(24, 'Nevermind',                 1991, NULL, 13, 15),
(25, 'In Utero',                  1993,  NULL, 12, 15),
(26, 'Disintegration',            1989,  NULL, 12, 16),
(27, 'Heaven or Las Vegas',       1990,  NULL, 12, 17),
(28, 'Sunbather',                 2013,  NULL,  8, 18),
(29, 'American Football LP1',     1999,  NULL,  8, 19),
(30, 'Ants from Up There',        2022,  NULL, 11, 20);

-- ============================================================
-- Album_Genero (N:M — 1 o 2 géneros por álbum)
-- ============================================================

INSERT INTO Album_Genero (id_album, id_genero) VALUES
( 1,  1), ( 1,  8),   -- Master of Puppets       : Thrash Metal, Heavy Metal
( 2,  1), ( 2,  8),   -- ...And Justice for All  : Thrash Metal, Heavy Metal
( 3,  2), ( 3, 13),   -- Dark Side of the Moon   : Progressive Rock, Art Rock
( 4,  2), ( 4, 13),   -- Wish You Were Here      : Progressive Rock, Art Rock
( 5,  2), ( 5, 27),   -- Animals                 : Progressive Rock, Psychedelic Rock
( 6,  3), ( 6, 18),   -- Is This It               : Indie Rock, Punk Rock
( 7,  3),             -- Room on Fire             : Indie Rock
( 8,  4), ( 8,  6),   -- Dirt                    : Grunge, Alternative Metal
( 9,  5), ( 9,  7),   -- Siamese Dream            : Alternative Rock, Shoegaze
(10,  7), (10, 14),   -- Souvlaki                : Shoegaze, Dream Pop
(11,  7), (11,  5),   -- Loveless                : Shoegaze, Alternative Rock
(12,  7), (12,  5),   -- Isn't Anything          : Shoegaze, Alternative Rock
(13,  2), (13, 17),   -- Moving Pictures         : Progressive Rock, Hard Rock
(14,  2), (14, 17),   -- 2112                    : Progressive Rock, Hard Rock
(15, 10), (15, 15),   -- The Queen Is Dead       : Indie Pop, Post-Punk
(16,  6), (16, 23),   -- White Pony              : Alternative Metal, Nu Metal
(17,  5), (17, 13),   -- OK Computer             : Alternative Rock, Art Rock
(18, 19), (18, 13),   -- Kid A                   : Electronic Rock, Art Rock
(19,  5), (19,  3),   -- The Bends               : Alternative Rock, Indie Rock
(20,  8), (20, 24),   -- Paranoid                : Heavy Metal, Doom Metal
(21,  9), (21,  6),   -- Lateralus               : Progressive Metal, Alternative Metal
(22,  6), (22,  9),   -- Ænima                   : Alternative Metal, Progressive Metal
(23,  4), (23,  5),   -- Superunknown            : Grunge, Alternative Rock
(24,  4), (24,  5),   -- Nevermind               : Grunge, Alternative Rock
(25,  4), (25,  5),   -- In Utero                : Grunge, Alternative Rock
(26, 15), (26, 14),   -- Disintegration          : Post-Punk, Dream Pop
(27, 14), (27,  7),   -- Heaven or Las Vegas     : Dream Pop, Shoegaze
(28, 16), (28, 26),   -- Sunbather               : Blackgaze, Post-Rock
(29, 12), (29, 26),   -- American Football LP1   : Math Rock, Post-Rock
(30, 26), (30, 13);   -- Ants from Up There      : Post-Rock, Art Rock

-- ============================================================
-- Producto (30 filas) — precio en Quetzales (Q)
-- id_categoria referencia Categoria (condición/estado comercial):
--   1 Nuevo-Sellado  2 Nuevo-Sin Celofán  3 Usado-Excelente
--   4 Usado-Buen Estado  5 Importado  6 Edición Especial  7 Outlet
-- El nombre se construye en la app: Artista - Titulo (Tipo)
-- ============================================================

INSERT INTO Producto (id, precio, stock, id_album, id_album_tipo, id_categoria, id_proveedor) VALUES
( 1, 285.00,  8,  1, 1, 5, 13),  -- Master of Puppets       Vinilo  Importado
( 2, 125.00, 15,  2, 2, 2, 13),  -- ...And Justice for All  CD      Nuevo-Sin Celofán
( 3, 390.00,  5,  3, 1, 6,  4),  -- Dark Side of the Moon   Vinilo  Edición Especial
( 4, 360.00,  6,  4, 1, 5,  4),  -- Wish You Were Here      Vinilo  Importado
( 5, 118.00, 12,  5, 2, 7,  4),  -- Animals                 CD      Outlet/Liquidación
( 6, 295.00,  9,  6, 1, 5, 16),  -- Is This It              Vinilo  Importado
( 7, 108.00, 20,  7, 2, 4, 16),  -- Room on Fire            CD      Usado-Buen Estado
( 8, 298.00,  7,  8, 1, 3, 16),  -- Dirt                    Vinilo  Usado-Excelente
( 9, 315.00,  6,  9, 1, 5,  4),  -- Siamese Dream           Vinilo  Importado
(10, 335.00,  4, 10, 1, 6, 21),  -- Souvlaki                Vinilo  Edición Especial
(11, 425.00,  3, 11, 1, 6, 20),  -- Loveless                Vinilo  Edición Especial
(12, 132.00, 11, 12, 2, 1, 20),  -- Isn't Anything          CD      Nuevo-Sellado
(13, 115.00, 18, 13, 2, 1, 17),  -- Moving Pictures         CD      Nuevo-Sellado
(14, 275.00,  7, 14, 1, 5, 17),  -- 2112                    Vinilo  Importado
(15, 345.00,  5, 15, 1, 3,  8),  -- The Queen Is Dead       Vinilo  Usado-Excelente
(16, 128.00, 14, 16, 2, 2,  3),  -- White Pony              CD      Nuevo-Sin Celofán
(17, 398.00,  4, 17, 1, 6, 24),  -- OK Computer             Vinilo  Edición Especial
(18, 138.00, 16, 18, 2, 1, 24),  -- Kid A                   CD      Nuevo-Sellado
(19, 115.00, 19, 19, 2, 2, 24),  -- The Bends               CD      Nuevo-Sin Celofán
(20, 312.00,  8, 20, 1, 5,  3),  -- Paranoid                Vinilo  Importado
(21, 148.00, 13, 21, 2, 1,  1),  -- Lateralus               CD      Nuevo-Sellado
(22, 142.00, 11, 22, 2, 2,  1),  -- Ænima                   CD      Nuevo-Sin Celofán
(23, 318.00,  6, 23, 1, 5,  1),  -- Superunknown            Vinilo  Importado
(24, 298.00,  9, 24, 1, 5,  9),  -- Nevermind               Vinilo  Importado
(25, 118.00, 17, 25, 2, 2,  9),  -- In Utero                CD      Nuevo-Sin Celofán
(26, 362.00,  5, 26, 1, 6,  1),  -- Disintegration          Vinilo  Edición Especial
(27, 375.00,  4, 27, 1, 4, 22),  -- Heaven or Las Vegas     Vinilo  Usado-Buen Estado
(28, 112.00, 15, 28, 2, 7,  8),  -- Sunbather               CD      Outlet/Liquidación
(29, 328.00,  6, 29, 1, 6, 27),  -- American Football LP1   Vinilo  Edición Especial
(30, 132.00, 13, 30, 2, 2, 23);  -- Ants from Up There      CD      Nuevo-Sin Celofán

-- ============================================================
-- Compra (30 filas — marzo a noviembre 2025)
-- ============================================================

INSERT INTO Compra (id, id_cliente, id_empleado, fecha) VALUES
( 1,  1,  5, '2025-03-15 10:22:00'),
( 2,  2,  4, '2025-03-20 14:45:00'),
( 3,  3,  6, '2025-04-02 11:30:00'),
( 4,  4,  7, '2025-04-10 16:10:00'),
( 5,  5,  5, '2025-04-18 09:55:00'),
( 6,  6,  8, '2025-04-25 13:20:00'),
( 7,  7,  4, '2025-05-03 17:05:00'),
( 8,  8,  9, '2025-05-11 10:40:00'),
( 9,  9,  6, '2025-05-19 12:15:00'),
(10, 10,  5, '2025-05-28 15:50:00'),
(11, 11, 10, '2025-06-05 11:00:00'),
(12, 12, 11, '2025-06-14 14:30:00'),
(13, 13,  4, '2025-06-22 09:20:00'),
(14, 14, 12, '2025-07-01 16:45:00'),
(15, 15,  7, '2025-07-09 10:10:00'),
(16, 16, 13, '2025-07-18 13:55:00'),
(17, 17,  5, '2025-07-26 11:35:00'),
(18, 18, 14, '2025-08-04 15:20:00'),
(19, 19,  6, '2025-08-12 09:40:00'),
(20, 20, 15, '2025-08-21 14:00:00'),
(21, 21,  4, '2025-09-01 10:30:00'),
(22, 22, 16, '2025-09-10 12:50:00'),
(23, 23,  8, '2025-09-18 16:15:00'),
(24, 24, 17, '2025-09-27 11:05:00'),
(25, 25,  5, '2025-10-05 14:40:00'),
(26,  1, 18, '2025-10-14 10:55:00'),
(27,  3, 19, '2025-10-22 13:10:00'),
(28,  5,  4, '2025-11-01 09:25:00'),
(29,  7, 20, '2025-11-09 15:35:00'),
(30,  9,  6, '2025-11-17 11:50:00');

-- ============================================================
-- DetalleVenta (40 filas)
-- Compras 1-10: 2 productos cada una. Compras 11-30: 1 producto.
-- precio_unitario es snapshot del precio en el momento de la venta.
-- ============================================================

INSERT INTO DetalleVenta (id_compra, id_producto, cantidad, precio_unitario) VALUES
( 1,  1, 1, 285.00),
( 1,  3, 1, 390.00),
( 2, 17, 1, 398.00),
( 2, 11, 1, 425.00),
( 3, 24, 1, 298.00),
( 3, 21, 1, 148.00),
( 4, 10, 1, 335.00),
( 4, 15, 1, 345.00),
( 5, 26, 1, 362.00),
( 5, 20, 1, 312.00),
( 6,  9, 1, 315.00),
( 6,  6, 1, 295.00),
( 7, 27, 1, 375.00),
( 7, 14, 1, 275.00),
( 8, 29, 1, 328.00),
( 8,  2, 1, 125.00),
( 9, 16, 1, 128.00),
( 9, 30, 1, 132.00),
(10, 22, 1, 142.00),
(10, 18, 1, 138.00),
(11,  3, 1, 390.00),
(12,  1, 2, 285.00),
(13, 17, 1, 398.00),
(14, 11, 1, 425.00),
(15, 24, 1, 298.00),
(16,  9, 1, 315.00),
(17, 15, 1, 345.00),
(18, 10, 1, 335.00),
(19, 27, 1, 375.00),
(20, 26, 1, 362.00),
(21,  4, 1, 360.00),
(22, 19, 1, 115.00),
(23, 23, 1, 318.00),
(24,  8, 1, 298.00),
(25, 12, 2, 132.00),
(26, 29, 1, 328.00),
(27,  7, 1, 108.00),
(28, 13, 1, 115.00),
(29, 25, 1, 118.00),
(30, 30, 1, 132.00);