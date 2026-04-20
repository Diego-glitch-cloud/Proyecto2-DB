-- ============================================================
-- data.sql — Datos de prueba para tienda_db
-- MariaDB 11.4 | Tienda de música (discos y vinilos)
-- Contraseña de todos los usuarios seed: secret
-- Hash bcrypt (cost 12) de la cadena "secret"
-- ============================================================

USE tienda_db;

SET NAMES utf8mb4;

-- ============================================================
-- Rol (tabla de catalogo, 3 valores fijos)
-- ============================================================

INSERT INTO Rol (id, detalle) VALUES
(1, 'admin'),
(2, 'vendedor'),
(3, 'cliente');

-- ============================================================
-- Categoria (27 generos musicales)
-- ============================================================

INSERT INTO Categoria (id, detalle) VALUES
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
-- Proveedor (27 distribuidoras discograficas)
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
-- Persona (53 filas)
-- IDs  1- 3 : admin
-- IDs  4-28 : vendedor
-- IDs 29-53 : cliente
-- Todas las contrasenas son el hash bcrypt de "secret"
-- ============================================================

INSERT INTO Persona (id, nombre, correo, contrasena, id_rol) VALUES
-- Admins
( 1, 'Diego Calderón',      'diego.admin@tiendamusical.gt',       '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
( 2, 'Marcela Gatica',      'marce.admin@tiendamusical.gt',       '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
( 3, 'Max Apolo',           'max.admin@tiendamusical.gt',      '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
-- Vendedores
( 4, 'Ana López',           'ana.lopez@tiendamusical.gt',         '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
( 5, 'Roberto Pérez',       'roberto.perez@tiendamusical.gt',     '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
( 6, 'Sofía Ramírez',       'sofia.ramirez@tiendamusical.gt',     '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
( 7, 'Luis García',         'luis.garcia@tiendamusical.gt',       '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
( 8, 'Fernanda Torres',     'fernanda.torres@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
( 9, 'Miguel Castillo',     'miguel.castillo@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(10, 'Valeria Morales',     'valeria.morales@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(11, 'José Hernández',      'jose.hernandez@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(12, 'Andrea Vásquez',      'andrea.vasquez@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(13, 'Pablo Reyes',         'pablo.reyes@tiendamusical.gt',       '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(14, 'Claudia Ruiz',        'claudia.ruiz@tiendamusical.gt',      '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(15, 'Eduardo Flores',      'eduardo.flores@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(16, 'Daniela Cruz',        'daniela.cruz@tiendamusical.gt',      '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(17, 'Andrés Maldonado',    'andres.maldonado@tiendamusical.gt',  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(18, 'Isabella Gómez',      'isabella.gomez@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(19, 'Marco Jiménez',       'marco.jimenez@tiendamusical.gt',     '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(20, 'Lucía Herrera',       'lucia.herrera@tiendamusical.gt',     '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(21, 'Sebastián Ramos',     'sebastian.ramos@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(22, 'Camila Ortiz',        'camila.ortiz@tiendamusical.gt',      '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(23, 'Alejandro Soto',      'alejandro.soto@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(24, 'Natalia Vargas',      'natalia.vargas@tiendamusical.gt',    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(25, 'Fernando Aguilar',    'fernando.aguilar@tiendamusical.gt',  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(26, 'Patricia Molina',     'patricia.molina@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(27, 'Ricardo Salazar',     'ricardo.salazar@tiendamusical.gt',   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
(28, 'Gabriela Espinoza',   'gabriela.espinoza@tiendamusical.gt', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
-- Clientes
(29, 'Javier Alvarado',     'javier.alvarado@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(30, 'Mariana Pineda',      'mariana.pineda@gmail.com',           '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(31, 'Kevin Estrada',       'kevin.estrada@hotmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(32, 'Alicia Fuentes',      'alicia.fuentes@gmail.com',           '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(33, 'Oscar Rivera',        'oscar.rivera@yahoo.com',             '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(34, 'Stephanie Morán',     'stephanie.moran@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(35, 'David Pacheco',       'david.pacheco@gmail.com',            '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(36, 'Karla Cifuentes',     'karla.cifuentes@hotmail.com',        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(37, 'Héctor Velásquez',    'hector.velasquez@gmail.com',         '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(38, 'Daniela Lima',        'daniela.lima@gmail.com',             '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(39, 'Samuel Quiñones',     'samuel.quinones@outlook.com',        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(40, 'Laura Monroy',        'laura.monroy@gmail.com',             '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(41, 'Rodrigo Chávez',      'rodrigo.chavez@gmail.com',           '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(42, 'Vanessa Palma',       'vanessa.palma@hotmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(43, 'Jorge Barrios',       'jorge.barrios@gmail.com',            '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(44, 'Melissa Cabrera',     'melissa.cabrera@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(45, 'Gabriel Mejía',       'gabriel.mejia@yahoo.com',            '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(46, 'Andrea Solano',       'andrea.solano@gmail.com',            '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(47, 'Christian Leiva',     'christian.leiva@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(48, 'Diana Marroquín',     'diana.marroquin@hotmail.com',        '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(49, 'Roberto Campos',      'roberto.campos@gmail.com',           '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(50, 'Paola Solórzano',     'paola.solorzano@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(51, 'Erick Ovalle',        'erick.ovalle@outlook.com',           '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(52, 'Mónica Sandoval',     'monica.sandoval@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
(53, 'Tomás Contreras',     'tomas.contreras@gmail.com',          '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3);

-- ============================================================
-- Empleado (28 filas — Personas 1-28)
-- DPIs ficticios de 13 digitos (formato Guatemala)
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
-- NITs ficticios; algunos usan CF (Consumidor Final)
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
-- Producto (30 albumes legendarios — discos y vinilos)
-- Precios en Quetzales guatemaltecos (Q)
-- Categoria y Proveedor referenciados por ID
-- Nota: el formato (Vinilo/CD) se registrara en una entidad
-- separada en una version futura del esquema.
-- ============================================================

INSERT INTO Producto (id, nombre, precio, stock, id_categoria, id_proveedor) VALUES
( 1, 'Master of Puppets - Metallica (Vinilo)',                  285.00,  8,  1, 13),
( 2, '...And Justice for All - Metallica (CD)',                 125.00, 15,  1, 13),
( 3, 'The Dark Side of the Moon - Pink Floyd (Vinilo)',         390.00,  5,  2,  4),
( 4, 'Wish You Were Here - Pink Floyd (Vinilo)',                360.00,  6,  2,  4),
( 5, 'Animals - Pink Floyd (CD)',                               118.00, 12,  2,  4),
( 6, 'Is This It - The Strokes (Vinilo)',                       295.00,  9,  3, 16),
( 7, 'Room on Fire - The Strokes (CD)',                         108.00, 20,  3, 16),
( 8, 'Dirt - Alice in Chains (Vinilo)',                         298.00,  7,  4, 16),
( 9, 'Siamese Dream - The Smashing Pumpkins (Vinilo)',          315.00,  6,  5,  4),
(10, 'Souvlaki - Slowdive (Vinilo)',                            335.00,  4,  7, 21),
(11, 'Loveless - My Bloody Valentine (Vinilo)',                 425.00,  3,  7, 20),
(12, 'Isn''t Anything - My Bloody Valentine (CD)',             132.00, 11,  7, 20),
(13, 'Moving Pictures - Rush (CD)',                             115.00, 18,  2, 17),
(14, '2112 - Rush (Vinilo)',                                    275.00,  7,  2, 17),
(15, 'The Queen Is Dead - The Smiths (Vinilo)',                 345.00,  5, 10,  8),
(16, 'White Pony - Deftones (CD)',                              128.00, 14,  6,  3),
(17, 'OK Computer - Radiohead (Vinilo)',                        398.00,  4,  5, 24),
(18, 'Kid A - Radiohead (CD)',                                  138.00, 16, 19, 24),
(19, 'The Bends - Radiohead (CD)',                              115.00, 19,  5, 24),
(20, 'Paranoid - Black Sabbath (Vinilo)',                       312.00,  8,  8,  3),
(21, 'Lateralus - Tool (CD)',                                   148.00, 13,  9,  1),
(22, 'Aenima - Tool (CD)',                                      142.00, 11,  9,  1),
(23, 'Superunknown - Soundgarden (Vinilo)',                     318.00,  6,  4,  1),
(24, 'Nevermind - Nirvana (Vinilo)',                            298.00,  9,  4,  9),
(25, 'In Utero - Nirvana (CD)',                                 118.00, 17,  4,  9),
(26, 'Disintegration - The Cure (Vinilo)',                      362.00,  5, 15,  1),
(27, 'Heaven or Las Vegas - Cocteau Twins (Vinilo)',            375.00,  4, 14, 22),
(28, 'Sunbather - Deafheaven (CD)',                             112.00, 15, 16,  8),
(29, 'American Football LP1 - American Football (Vinilo)',      328.00,  6, 12, 27),
(30, 'Ants from Up There - Black Country New Road (CD)',        132.00, 13, 13, 23);

-- ============================================================
-- Compra (30 filas — fechas entre marzo 2025 y noviembre 2025)
-- id_empleado referencia Empleado.id (1-28)
-- id_cliente  referencia Cliente.id  (1-25)
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
-- Compras 1-10 llevan 2 productos; compras 11-30 llevan 1.
-- precio_unitario es snapshot del precio en el momento de la venta.
-- PK compuesta (id_compra, id_producto) — no se repite un producto
-- en la misma compra.
-- ============================================================

INSERT INTO DetalleVenta (id_compra, id_producto, cantidad, precio_unitario) VALUES
-- Compra 1: Master of Puppets Vinilo + Dark Side of the Moon Vinilo
( 1,  1, 1, 285.00),
( 1,  3, 1, 390.00),
-- Compra 2: OK Computer Vinilo + Loveless Vinilo
( 2, 17, 1, 398.00),
( 2, 11, 1, 425.00),
-- Compra 3: Nevermind Vinilo + Lateralus CD
( 3, 24, 1, 298.00),
( 3, 21, 1, 148.00),
-- Compra 4: Souvlaki Vinilo + The Queen Is Dead Vinilo
( 4, 10, 1, 335.00),
( 4, 15, 1, 345.00),
-- Compra 5: Disintegration Vinilo + Paranoid Vinilo
( 5, 26, 1, 362.00),
( 5, 20, 1, 312.00),
-- Compra 6: Siamese Dream Vinilo + Is This It Vinilo
( 6,  9, 1, 315.00),
( 6,  6, 1, 295.00),
-- Compra 7: Heaven or Las Vegas Vinilo + 2112 Vinilo
( 7, 27, 1, 375.00),
( 7, 14, 1, 275.00),
-- Compra 8: American Football LP1 Vinilo + And Justice for All CD
( 8, 29, 1, 328.00),
( 8,  2, 1, 125.00),
-- Compra 9: White Pony CD + Ants from Up There CD
( 9, 16, 1, 128.00),
( 9, 30, 1, 132.00),
-- Compra 10: Aenima CD + Kid A CD
(10, 22, 1, 142.00),
(10, 18, 1, 138.00),
-- Compras 11-30: un producto cada una
(11,  3, 1, 390.00),
(12,  1, 2, 285.00),  -- 2 copias de Master of Puppets (regalo)
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
(25, 12, 2, 132.00),  -- 2 copias de Isn't Anything CD
(26, 29, 1, 328.00),
(27,  7, 1, 108.00),
(28, 13, 1, 115.00),
(29, 25, 1, 118.00),
(30, 30, 1, 132.00);