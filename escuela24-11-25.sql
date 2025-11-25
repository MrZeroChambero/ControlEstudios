-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-11-2025 a las 22:19:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `escuela`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_fk_if_not_exists` (IN `tbl_name` VARCHAR(64), IN `fk_name` VARCHAR(64), IN `fk_sql` TEXT)   BEGIN
  DECLARE cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO cnt
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = tbl_name
      AND constraint_name = fk_name
      AND constraint_type = 'FOREIGN KEY';
  IF cnt = 0 THEN
    SET @s = fk_sql;
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `add_fk_safe` (IN `p_table_name` VARCHAR(64), IN `p_fk_name` VARCHAR(64), IN `p_col_name` VARCHAR(64), IN `p_ref_table` VARCHAR(64), IN `p_ref_col` VARCHAR(64), IN `p_fk_sql` TEXT)   BEGIN
  DECLARE cnt_fk INT DEFAULT 0;
  DECLARE cnt_table_col INT DEFAULT 0;
  DECLARE cnt_ref_table_col INT DEFAULT 0;

  SELECT COUNT(*) INTO cnt_fk
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = p_table_name
      AND constraint_name = p_fk_name
      AND constraint_type = 'FOREIGN KEY';

  IF cnt_fk = 0 THEN
    SELECT COUNT(*) INTO cnt_table_col
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = p_table_name
        AND column_name = p_col_name;

    SELECT COUNT(*) INTO cnt_ref_table_col
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = p_ref_table
        AND column_name = p_ref_col;

    IF cnt_table_col = 1 AND cnt_ref_table_col = 1 THEN
      SET @s = p_fk_sql;
      PREPARE stmt FROM @s;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `count_orphans` (IN `p_table` VARCHAR(64), IN `p_child_col` VARCHAR(64), IN `p_ref_table` VARCHAR(64), IN `p_ref_col` VARCHAR(64))   BEGIN
  SET @s = CONCAT(
    'SELECT COUNT(*) INTO @cnt FROM `', p_table, '` t ',
    'LEFT JOIN `', p_ref_table, '` r ON t.`', p_child_col, '` = r.`', p_ref_col, '` ',
    'WHERE r.`', p_ref_col, '` IS NULL;'
  );
  PREPARE stmt FROM @s;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  SELECT @cnt AS orphan_count;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `drop_fk_if_exists` (IN `p_table` VARCHAR(64), IN `p_fk` VARCHAR(64))   BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = p_table
      AND constraint_name = p_fk
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    SET @s = CONCAT('ALTER TABLE `', p_table, '` DROP FOREIGN KEY `', p_fk, '`;');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alergias`
--

CREATE TABLE `alergias` (
  `id_alergia` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alergias`
--

INSERT INTO `alergias` (`id_alergia`, `nombre`) VALUES
(1, 'Alergia al polen'),
(2, 'Alergia a los ácaros'),
(3, 'Alergia al gluten'),
(4, 'Alergia a la lactosa'),
(5, 'Alergia a los frutos secos'),
(6, 'Alergia al marisco'),
(7, 'Alergia al veneno de insectos'),
(8, 'Alergia al látex'),
(9, 'Alergia a algunos medicamentos'),
(10, 'Alergia al moho');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `anios_escolares`
--

CREATE TABLE `anios_escolares` (
  `id_anio_escolar` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `limite_inscripcion` date NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_aprendizaje`
--

CREATE TABLE `areas_aprendizaje` (
  `id_area_aprendizaje` int(11) NOT NULL,
  `fk_componente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fk_funcion` int(11) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas_aprendizaje`
--

INSERT INTO `areas_aprendizaje` (`id_area_aprendizaje`, `fk_componente`, `nombre`, `fk_funcion`, `estado`) VALUES
(100, 100, 'Lengua y Literatura', 1, 'activo'),
(101, 100, 'Idiomas Extranjeros (Inglés)', 12, 'activo'),
(102, 100, 'Expresión Oral y Escrita', 1, 'activo'),
(103, 100, 'Comprensión Lectora', 1, 'activo'),
(104, 101, 'Números y Operaciones', 1, 'activo'),
(105, 101, 'Geometría y Medida', 1, 'activo'),
(106, 101, 'Estadística y Probabilidad', 1, 'activo'),
(107, 101, 'Resolución de Problemas Matemáticos', 1, 'activo'),
(108, 102, 'Seres Vivos y Salud', 1, 'activo'),
(109, 102, 'Materia y Energía', 1, 'activo'),
(110, 102, 'Tierra y Universo', 1, 'activo'),
(111, 102, 'Ciencia, Tecnología y Sociedad', 1, 'activo'),
(112, 103, 'Historia de Venezuela', 1, 'activo'),
(113, 103, 'Geografía General y de Venezuela', 1, 'activo'),
(114, 103, 'Formación Ciudadana', 1, 'activo'),
(115, 103, 'Identidad Nacional y Valores', 1, 'activo'),
(116, 104, 'Desarrollo Motor', 5, 'activo'),
(117, 104, 'Deportes Colectivos', 13, 'activo'),
(118, 104, 'Expresión Corporal', 11, 'activo'),
(119, 104, 'Juegos Tradicionales', 5, 'activo'),
(120, 105, 'Pensamiento Lógico', 1, 'activo'),
(121, 105, 'Pensamiento Crítico', 1, 'activo'),
(122, 105, 'Creatividad e Innovación', 1, 'activo'),
(123, 105, 'Estrategias de Aprendizaje', 1, 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `fk_inscripcion` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `asistencias` int(11) NOT NULL,
  `inasistencias` int(11) NOT NULL,
  `justificadas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `fecha_accion` datetime NOT NULL DEFAULT current_timestamp(),
  `accion` varchar(100) NOT NULL,
  `detalle` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula`
--

CREATE TABLE `aula` (
  `id_aula` int(11) NOT NULL,
  `fk_anio_escolar` int(11) NOT NULL,
  `fk_grado_seccion` int(11) NOT NULL,
  `fk_guia` int(11) NOT NULL,
  `cupos_disponibles` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bloqueos_seguridad`
--

CREATE TABLE `bloqueos_seguridad` (
  `id_bloqueo` int(11) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `intentos` int(1) NOT NULL,
  `fecha_desbloqueo` datetime NOT NULL,
  `bloqueos_seguidos` int(1) NOT NULL,
  `fecha_ultimo_bloqueo` datetime NOT NULL,
  `tipo_bloqueo` enum('inicio_de_sesion','preguntas_de_seguridad','DDOS') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos`
--

CREATE TABLE `cargos` (
  `id_cargo` int(11) NOT NULL,
  `nombre_cargo` varchar(100) NOT NULL,
  `tipo` enum('Docente','Administrativo','Obrero') NOT NULL DEFAULT 'Docente',
  `codigo` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id_cargo`, `nombre_cargo`, `tipo`, `codigo`) VALUES
(1, 'Docente Guía', 'Docente', ''),
(2, 'Subdirector', 'Docente', ''),
(3, 'Coordinador', 'Docente', ''),
(4, 'Secretario', 'Docente', ''),
(5, 'Obrero', 'Obrero', ''),
(6, 'Administrativo', 'Administrativo', ''),
(7, 'CBIT', 'Docente', ''),
(8, 'CNAE', 'Docente', ''),
(9, 'UPE', 'Docente', ''),
(10, 'Director', 'Docente', 'DIR-001'),
(11, 'Psicólogo', 'Docente', 'PSI-001'),
(12, 'Enfermero', 'Docente', 'ENF-001'),
(13, 'Bibliotecario', 'Docente', 'BIB-001'),
(14, 'Coordinador Pedagógico', 'Docente', 'CP-001'),
(15, 'Docente Especial', 'Docente', 'DE-001');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `competencias`
--

CREATE TABLE `competencias` (
  `id_competencia` int(11) NOT NULL,
  `fk_planificacion` int(11) NOT NULL,
  `descripcion_competencia` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `componentes_aprendizaje`
--

CREATE TABLE `componentes_aprendizaje` (
  `id_componente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `componentes_aprendizaje`
--

INSERT INTO `componentes_aprendizaje` (`id_componente`, `nombre`, `estado`) VALUES
(1, 'ejemplo 2', 'activo'),
(4, 'sadsadsa', 'activo'),
(15, 'dasdsads', 'activo'),
(16, 'hola', 'activo'),
(17, 'asdsa', 'activo'),
(18, 'asdsa', 'activo'),
(21, 'educiacion fisica', 'activo'),
(100, 'Lenguaje, Comunicación y Cultura', 'activo'),
(101, 'Matemática', 'activo'),
(102, 'Ciencias Naturales y Sociedad', 'activo'),
(103, 'Ciencias Sociales, Ciudadanía e Identidad', 'activo'),
(104, 'Educación Física, Deporte y Recreación', 'activo'),
(105, 'Desarrollo del Pensamiento para el Aprendizaje', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `condiciones_salud`
--

CREATE TABLE `condiciones_salud` (
  `id_condicion` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_patologia` int(11) NOT NULL,
  `afectado` enum('estudiante','familiar','estudiante_y_familiar') NOT NULL DEFAULT 'estudiante',
  `presente_en` enum('estudiante','familiar') NOT NULL,
  `tipo_familiar` enum('madre','padre','hermano','abuelo','tio','otro') DEFAULT NULL,
  `fecha_deteccion` date DEFAULT NULL,
  `cronica` enum('si','no') DEFAULT NULL,
  `impedimento_fisico` enum('si','no') DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas_medicas`
--

CREATE TABLE `consultas_medicas` (
  `id_consulta` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `tipo_consulta` enum('psicologo','psicopedagogo','neurologo','terapista_lenguaje','orientador','otro') NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `tiene_informe_medico` enum('si','no') DEFAULT NULL,
  `fecha_consulta` date DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenidos`
--

CREATE TABLE `contenidos` (
  `id_contenido` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fk_area_aprendizaje` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6','general') NOT NULL DEFAULT 'general',
  `descripcion` text DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `contenidos`
--

INSERT INTO `contenidos` (`id_contenido`, `nombre`, `fk_area_aprendizaje`, `grado`, `descripcion`, `estado`) VALUES
(100, 'El abecedario', 100, '1', 'Reconocimiento y escritura de las letras del abecedario', 'activo'),
(101, 'Lectura de palabras simples', 100, '1', 'Lectura y comprensión de palabras de uso frecuente', 'activo'),
(102, 'Escritura de oraciones cortas', 100, '1', 'Construcción de oraciones simples', 'activo'),
(103, 'Números del 1 al 50', 104, '1', 'Reconocimiento, lectura y escritura de números', 'activo'),
(104, 'Sumas y restas simples', 104, '1', 'Operaciones básicas de adición y sustracción', 'activo'),
(105, 'Figuras geométricas básicas', 105, '1', 'Identificación de círculo, cuadrado, triángulo', 'activo'),
(106, 'Partes del cuerpo humano', 108, '1', 'Identificación de partes principales del cuerpo', 'activo'),
(107, 'Seres vivos y no vivos', 108, '1', 'Diferenciación entre seres vivos e inertes', 'activo'),
(108, 'Cuidado del ambiente', 108, '1', 'Prácticas para conservar el medio ambiente', 'activo'),
(109, 'Mi familia y mi escuela', 112, '1', 'Reconocimiento del entorno familiar y escolar', 'activo'),
(110, 'Símbolos patrios', 112, '1', 'Identificación de la bandera, escudo e himno nacional', 'activo'),
(111, 'Normas de convivencia', 114, '1', 'Aplicación de normas en el aula y la escuela', 'activo'),
(200, 'Lectura y escritura inicial', 100, '1', 'Desarrollo de habilidades básicas de lectoescritura', 'activo'),
(201, 'Comunicación oral', 100, '1', 'Expresión y comprensión oral en situaciones cotidianas', 'activo'),
(202, 'Vocabulario básico', 100, '1', 'Ampliación del vocabulario activo', 'activo'),
(203, 'Lectura comprensiva', 100, '2', 'Comprensión de textos cortos y sencillos', 'activo'),
(204, 'Producción de textos narrativos', 100, '2', 'Creación de cuentos y narraciones breves', 'activo'),
(205, 'Gramática básica', 100, '2', 'Reconocimiento de elementos gramaticales simples', 'activo'),
(206, 'Textos informativos', 100, '3', 'Lectura y producción de textos expositivos', 'activo'),
(207, 'Ortografía básica', 100, '3', 'Aplicación de reglas ortográficas elementales', 'activo'),
(208, 'Literatura infantil venezolana', 100, '3', 'Conocimiento de autores y obras nacionales', 'activo'),
(300, 'Sistema numérico del 1 al 100', 104, '1', 'Conocimiento del sistema de numeración decimal', 'activo'),
(301, 'Operaciones básicas de adición', 104, '1', 'Sumas con números hasta 20', 'activo'),
(302, 'Operaciones básicas de sustracción', 104, '1', 'Restas con números hasta 20', 'activo'),
(303, 'Números hasta el 500', 104, '2', 'Lectura, escritura y comparación de números', 'activo'),
(304, 'Sumas y restas con llevadas', 104, '2', 'Operaciones con números de dos dígitos', 'activo'),
(305, 'Introducción a la multiplicación', 104, '2', 'Concepto de multiplicación como suma repetida', 'activo'),
(306, 'Números hasta el 1000', 104, '3', 'Valor posicional de unidades, decenas y centenas', 'activo'),
(307, 'Multiplicación de números de una cifra', 104, '3', 'Tablas de multiplicar del 1 al 10', 'activo'),
(308, 'División exacta', 104, '3', 'Concepto de división como reparto equitativo', 'activo'),
(400, 'El cuerpo humano', 108, '1', 'Conocimiento de las partes del cuerpo y sus funciones', 'activo'),
(401, 'Los sentidos', 108, '1', 'Identificación y función de los cinco sentidos', 'activo'),
(402, 'Hábitos de higiene', 108, '1', 'Prácticas de higiene personal', 'activo'),
(403, 'Animales y plantas', 108, '2', 'Características y clasificación de seres vivos', 'activo'),
(404, 'Ciclo de vida', 108, '2', 'Nacimiento, crecimiento y reproducción', 'activo'),
(405, 'Alimentación saludable', 108, '2', 'Grupos de alimentos y nutrición', 'activo'),
(406, 'Sistemas del cuerpo humano', 108, '3', 'Funcionamiento de sistemas básicos', 'activo'),
(407, 'Ecosistemas venezolanos', 108, '3', 'Diversidad de ecosistemas nacionales', 'activo'),
(408, 'Prevención de enfermedades', 108, '3', 'Medidas de prevención y cuidado de la salud', 'activo'),
(500, 'Mi identidad personal y familiar', 112, '1', 'Reconocimiento de la identidad individual y familiar', 'activo'),
(501, 'La comunidad escolar', 112, '1', 'Organización y funcionamiento de la escuela', 'activo'),
(502, 'Símbolos patrios', 112, '1', 'Conocimiento y respeto a los símbolos nacionales', 'activo'),
(503, 'La localidad', 112, '2', 'Características de la comunidad local', 'activo'),
(504, 'Fechas patrias venezolanas', 112, '2', 'Conmemoraciones históricas importantes', 'activo'),
(505, 'Héroes de la independencia', 112, '2', 'Vida y obra de próceres nacionales', 'activo'),
(506, 'Estados de Venezuela', 112, '3', 'División político-territorial del país', 'activo'),
(507, 'Pueblos originarios venezolanos', 112, '3', 'Culturas indígenas nacionales', 'activo'),
(508, 'Proceso de independencia', 112, '3', 'Antecedentes y desarrollo de la independencia', 'activo'),
(600, 'Coordinación motora básica', 116, '1', 'Desarrollo de habilidades motoras fundamentales', 'activo'),
(601, 'Juegos tradicionales venezolanos', 116, '1', 'Práctica de juegos autóctonos', 'activo'),
(602, 'Expresión corporal', 116, '1', 'Movimiento y expresión a través del cuerpo', 'activo'),
(603, 'Habilidades gimnásticas básicas', 116, '2', 'Ejercicios elementales de gimnasia', 'activo'),
(604, 'Deportes colectivos iniciales', 116, '2', 'Introducción a deportes en equipo', 'activo'),
(605, 'Actividades rítmicas', 116, '2', 'Movimiento al compás de la música', 'activo'),
(700, 'Normas de convivencia escolar', 114, '1', 'Aplicación de normas en el entorno escolar', 'activo'),
(701, 'Valores de respeto y solidaridad', 114, '1', 'Práctica de valores en la vida diaria', 'activo'),
(702, 'Derechos del niño', 114, '1', 'Conocimiento de los derechos fundamentales', 'activo'),
(703, 'Responsabilidades en el hogar', 114, '2', 'Cumplimiento de deberes familiares', 'activo'),
(704, 'Cuidado del ambiente', 114, '2', 'Prácticas de conservación ambiental', 'activo'),
(705, 'Participación comunitaria', 114, '2', 'Involucramiento en actividades comunitarias', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_academicos`
--

CREATE TABLE `documentos_academicos` (
  `id_documento` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `tipo_documento` enum('Tarjeta Vacunación','Carta Residencia','Partida Nacimiento','Constancia Act. Extracurricular','Boleta','Constancia Prosecución','Certificado Aprendizaje') NOT NULL,
  `grado` enum('Educ. Inicial','Primero','Segundo','Tercero','Cuarto','Quinto','Sexto') DEFAULT NULL,
  `entregado` enum('si','no') NOT NULL DEFAULT 'no',
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id_estudiante` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `cedula_escolar` varchar(20) NOT NULL,
  `fecha_ingreso_escuela` date NOT NULL,
  `vive_con_padres` enum('si','no') DEFAULT 'si',
  `orden_nacimiento` int(11) NOT NULL,
  `tiempo_gestacion` int(11) NOT NULL,
  `embarazo_deseado` enum('si','no') NOT NULL DEFAULT 'si',
  `tipo_parto` enum('cesaria','normal') NOT NULL,
  `control_esfinteres` enum('si','no') NOT NULL,
  `control_embarazo` enum('si','no') NOT NULL DEFAULT 'si',
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id_estudiante`, `id_persona`, `cedula_escolar`, `fecha_ingreso_escuela`, `vive_con_padres`, `orden_nacimiento`, `tiempo_gestacion`, `embarazo_deseado`, `tipo_parto`, `control_esfinteres`, `control_embarazo`, `estado`) VALUES
(1, 1, 'E-0001', '2010-09-01', 'si', 1, 38, 'si', 'normal', 'si', 'si', 'activo'),
(2, 2, 'E-0002', '2011-09-01', 'no', 2, 40, 'si', 'cesaria', 'si', 'si', 'activo'),
(3, 3, 'E-0003', '2012-09-01', 'si', 1, 37, 'si', 'normal', 'si', 'si', 'activo'),
(4, 4, 'E-0004', '2013-09-01', 'si', 3, 39, 'no', 'normal', 'no', 'si', 'activo'),
(5, 5, 'E-0005', '2014-09-01', 'no', 1, 40, 'si', 'normal', 'si', 'si', 'activo'),
(6, 6, 'E-0006', '2010-09-01', 'si', 2, 36, 'si', 'cesaria', 'si', 'si', 'activo'),
(7, 7, 'E-0007', '2011-09-01', 'si', 1, 39, 'si', 'normal', 'si', 'si', 'activo'),
(8, 8, 'E-0008', '2012-09-01', 'no', 4, 40, 'no', 'normal', 'no', 'si', 'activo'),
(9, 9, 'E-0009', '2013-09-01', 'si', 1, 38, 'si', 'normal', 'si', 'si', 'activo'),
(10, 10, 'E-0010', '2014-09-01', 'si', 3, 37, 'si', 'cesaria', 'si', 'si', 'activo'),
(11, 11, 'E-0011', '2010-09-01', 'no', 1, 40, 'no', 'normal', 'si', 'si', 'activo'),
(12, 12, 'E-0012', '2011-09-01', 'si', 2, 38, 'si', 'normal', 'si', 'si', 'activo'),
(13, 13, 'E-0013', '2012-09-01', 'si', 1, 39, 'si', 'cesaria', 'si', 'si', 'activo'),
(14, 14, 'E-0014', '2013-09-01', 'no', 3, 37, 'no', 'normal', 'no', 'si', 'activo'),
(15, 15, 'E-0015', '2014-09-01', 'si', 2, 40, 'si', 'normal', 'si', 'si', 'activo'),
(16, 16, 'E-0016', '2010-09-01', 'si', 1, 38, 'si', 'normal', 'si', 'si', 'activo'),
(17, 17, 'E-0017', '2011-09-01', 'no', 3, 39, 'si', 'cesaria', 'si', 'si', 'activo'),
(18, 18, 'E-0018', '2012-09-01', 'si', 1, 40, 'no', 'normal', 'si', 'si', 'activo'),
(19, 19, 'E-0019', '2013-09-01', 'si', 2, 36, 'si', 'normal', 'no', 'si', 'activo'),
(20, 20, 'E-0020', '2014-09-01', 'no', 1, 37, 'si', 'cesaria', 'si', 'si', 'activo'),
(21, 21, 'E-0021', '2010-09-01', 'si', 4, 39, 'no', 'normal', 'si', 'si', 'activo'),
(22, 22, 'E-0022', '2011-09-01', 'si', 1, 38, 'si', 'normal', 'si', 'si', 'activo'),
(23, 23, 'E-0023', '2012-09-01', 'no', 2, 40, 'si', 'cesaria', 'si', 'si', 'activo'),
(24, 24, 'E-0024', '2013-09-01', 'si', 1, 37, 'no', 'normal', 'si', 'si', 'activo'),
(25, 25, 'E-0025', '2014-09-01', 'si', 3, 39, 'si', 'normal', 'no', 'si', 'activo'),
(26, 26, 'E-0026', '2010-09-01', 'no', 1, 38, 'si', 'cesaria', 'si', 'si', 'activo'),
(27, 27, 'E-0027', '2011-09-01', 'si', 2, 40, 'no', 'normal', 'si', 'si', 'activo'),
(28, 28, 'E-0028', '2012-09-01', 'si', 1, 36, 'si', 'normal', 'si', 'si', 'activo'),
(29, 29, 'E-0029', '2013-09-01', 'no', 3, 37, 'si', 'cesaria', 'no', 'si', 'activo'),
(30, 30, 'E-0030', '2014-09-01', 'si', 1, 39, 'no', 'normal', 'si', 'si', 'activo'),
(31, 31, 'E-0031', '2010-09-01', 'si', 2, 38, 'si', 'normal', 'si', 'si', 'activo'),
(32, 32, 'E-0032', '2011-09-01', 'no', 4, 40, 'si', 'cesaria', 'si', 'si', 'activo'),
(33, 33, 'E-0033', '2012-09-01', 'si', 1, 37, 'no', 'normal', 'si', 'si', 'activo'),
(34, 34, 'E-0034', '2013-09-01', 'si', 3, 39, 'si', 'normal', 'no', 'si', 'activo'),
(35, 35, 'E-0035', '2014-09-01', 'no', 1, 38, 'si', 'cesaria', 'si', 'si', 'activo'),
(36, 36, 'E-0036', '2010-09-01', 'si', 2, 40, 'no', 'normal', 'si', 'si', 'activo'),
(37, 37, 'E-0037', '2011-09-01', 'si', 1, 36, 'si', 'normal', 'si', 'si', 'activo'),
(38, 38, 'E-0038', '2012-09-01', 'no', 3, 37, 'si', 'cesaria', 'no', 'si', 'activo'),
(39, 39, 'E-0039', '2013-09-01', 'si', 1, 39, 'no', 'normal', 'si', 'si', 'activo'),
(40, 40, 'E-0040', '2014-09-01', 'si', 4, 38, 'si', 'normal', 'si', 'si', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluaciones`
--

CREATE TABLE `evaluaciones` (
  `id_evaluacion` int(11) NOT NULL,
  `nombre_evaluacion` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evaluaciones`
--

INSERT INTO `evaluaciones` (`id_evaluacion`, `nombre_evaluacion`, `descripcion`, `estado`) VALUES
(1, 'microclaseshhh', 'hhhhhh', 'activo'),
(2, 'dsasdsa', 'dsadsadsadsa', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `funcion_personal`
--

CREATE TABLE `funcion_personal` (
  `id_funcion_personal` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `tipo` enum('Docente','Obrero','Administrativo','Especialista') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `funcion_personal`
--

INSERT INTO `funcion_personal` (`id_funcion_personal`, `nombre`, `tipo`) VALUES
(1, 'Docente Guía', 'Docente'),
(2, 'Docente de Aula', 'Docente'),
(3, 'Docente Integral', 'Docente'),
(4, 'Docente Especialista', 'Docente'),
(5, 'Educación Física', 'Especialista'),
(6, 'CBIT - Tecnología', 'Especialista'),
(7, 'Cultura', 'Especialista'),
(8, 'Artes Plásticas', 'Especialista'),
(9, 'Música', 'Especialista'),
(10, 'Teatro', 'Especialista'),
(11, 'Danza', 'Especialista'),
(12, 'Inglés', 'Especialista'),
(13, 'Deportes', 'Especialista'),
(14, 'Computación', 'Especialista'),
(15, 'Obrero de Mantenimiento', 'Obrero'),
(16, 'Obrero de Limpieza', 'Obrero'),
(17, 'Jardinero', 'Obrero'),
(18, 'Vigilante', 'Obrero'),
(19, 'Conserje', 'Obrero'),
(20, 'Aseador', 'Obrero'),
(21, 'Secretaria', 'Administrativo'),
(22, 'Director', 'Administrativo'),
(23, 'Subdirector', 'Administrativo'),
(24, 'Coordinador Académico', 'Administrativo'),
(25, 'Coordinador de Disciplina', 'Administrativo'),
(26, 'Bibliotecario', 'Administrativo'),
(27, 'Contador', 'Administrativo'),
(28, 'Recepcionista', 'Administrativo'),
(29, 'Psicólogo', 'Especialista'),
(30, 'Psicopedagogo', 'Especialista'),
(31, 'Terapista de Lenguaje', 'Especialista'),
(32, 'Orientador', 'Especialista'),
(33, 'Trabajador Social', 'Especialista'),
(34, 'Enfermero', 'Especialista'),
(35, 'Cocinero', 'Obrero'),
(36, 'Ayudante de Cocina', 'Obrero'),
(37, 'Nutricionista', 'Especialista'),
(38, 'Técnico en Informática', 'Especialista'),
(39, 'Técnico en Electricidad', 'Obrero'),
(40, 'Técnico en Plomería', 'Obrero');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grado_seccion`
--

CREATE TABLE `grado_seccion` (
  `id_grado_seccion` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6') NOT NULL,
  `seccion` enum('A','B','C') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos_estudiantiles`
--

CREATE TABLE `grupos_estudiantiles` (
  `id_grupos_estudiantiles` int(11) NOT NULL,
  `fk_horario` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `habilidades`
--

CREATE TABLE `habilidades` (
  `id_habilidad` int(11) NOT NULL,
  `fk_representante` int(11) NOT NULL,
  `nombre_habilidad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `fk_area` int(11) NOT NULL,
  `fk_personal` int(11) NOT NULL,
  `grupo` enum('completo','subgrupo') NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `hora_inicio` float NOT NULL,
  `hora_fin` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imparticion_clases`
--

CREATE TABLE `imparticion_clases` (
  `id_imparticion_clases` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_docente` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `fk_area_aprendizaje` int(11) NOT NULL,
  `tipo_docente` enum('Integral','Especialista') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores`
--

CREATE TABLE `indicadores` (
  `id_indicador` int(11) NOT NULL,
  `fk_competencia` int(11) NOT NULL,
  `nombre` varchar(256) NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores_descriptores`
--

CREATE TABLE `indicadores_descriptores` (
  `id_descriptor` int(11) NOT NULL,
  `fk_indicador` int(11) NOT NULL,
  `fk_literal` int(11) NOT NULL,
  `tipo_descripcion` enum('Logro','Avance','Dificultad') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicador_evaluacion_contenido`
--

CREATE TABLE `indicador_evaluacion_contenido` (
  `id_ind_eva_con` int(11) NOT NULL,
  `fk_indicador` int(11) NOT NULL,
  `fk_contenido` int(11) NOT NULL,
  `fk_evaluacion` int(11) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_inscripcion` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_representante` int(11) DEFAULT NULL,
  `fk_personal` int(11) NOT NULL,
  `fk_imparticion_clases` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6') NOT NULL,
  `fecha_inscripcion` date NOT NULL,
  `vive_con` varchar(200) DEFAULT NULL,
  `altura` float NOT NULL,
  `talla_zapatos` int(11) NOT NULL,
  `talla_camisa` int(11) NOT NULL,
  `talla_pantalon` int(11) NOT NULL,
  `peso` float NOT NULL,
  `estado_inscripcion` enum('activo','retirado','en_proceso') NOT NULL,
  `foto_estudiante` enum('si','no') DEFAULT 'no',
  `foto_representante` enum('si','no') DEFAULT 'no',
  `cedula_estudiante` enum('si','no') DEFAULT 'no',
  `cedula_representante` enum('si','no') DEFAULT 'no',
  `fecha_retiro` date DEFAULT NULL,
  `motivo_retiro` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista_alergias`
--

CREATE TABLE `lista_alergias` (
  `id_lista_alergia` int(11) NOT NULL,
  `fk_alergia` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `literal`
--

CREATE TABLE `literal` (
  `id_literal` int(11) NOT NULL,
  `literal` enum('A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','D3','E1','E2','E3') NOT NULL,
  `descripcion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `momentos_academicos`
--

CREATE TABLE `momentos_academicos` (
  `id_momento` int(11) NOT NULL,
  `fk_anio_escolar` int(11) NOT NULL,
  `nombre_momento` enum('1','2','3') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

CREATE TABLE `parentesco` (
  `id_parentesco` int(11) NOT NULL,
  `fk_representante` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `tipo_parentesco` enum('madre','padre','abuelo','tio','hermano','otro') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patologias`
--

CREATE TABLE `patologias` (
  `id_patologia` int(11) NOT NULL,
  `nombre_patologia` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `patologias`
--

INSERT INTO `patologias` (`id_patologia`, `nombre_patologia`, `descripcion`) VALUES
(1, 'Asma', 'Enfermedad crónica de las vías respiratorias'),
(2, 'Diabetes', 'Alteración del metabolismo de la glucosa'),
(3, 'Hipertensión', 'Presión arterial elevada de forma continua'),
(4, 'Epilepsia', 'Trastorno neurológico crónico'),
(5, 'Dermatitis atópica', 'Enfermedad inflamatoria crónica de la piel'),
(6, 'Trastorno por déficit de atención', 'Dificultad para mantener la atención'),
(7, 'Autismo', 'Trastorno del desarrollo neurológico'),
(8, 'Cardiopatía congénita', 'Malformación del corazón al nacer'),
(9, 'Anemia', 'Déficit de glóbulos rojos o hemoglobina'),
(10, 'Alergia alimentaria', 'Reacción adversa a ciertos alimentos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id_personal` int(11) NOT NULL,
  `fk_persona` int(11) NOT NULL,
  `fk_funcion` int(11) NOT NULL,
  `fecha_contratacion` date NOT NULL,
  `nivel_academico` varchar(100) DEFAULT NULL,
  `horas_trabajo` float DEFAULT NULL,
  `rif` varchar(20) DEFAULT NULL,
  `etnia_religion` varchar(100) DEFAULT NULL,
  `cantidad_hijas` int(11) DEFAULT NULL,
  `cantidad_hijos_varones` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido','jubilado') NOT NULL DEFAULT 'activo',
  `fk_cargo` int(11) DEFAULT NULL,
  `cod_dependencia` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personal`
--

INSERT INTO `personal` (`id_personal`, `fk_persona`, `fk_funcion`, `fecha_contratacion`, `nivel_academico`, `horas_trabajo`, `rif`, `etnia_religion`, `cantidad_hijas`, `cantidad_hijos_varones`, `estado`, `fk_cargo`, `cod_dependencia`) VALUES
(1, 35, 8, '2025-11-11', 'dsadsadas', NULL, NULL, 'sdsadsa', 4, 2, 'activo', 2, ''),
(2, 45, 6, '2025-10-30', 'sdasdasd', 35, 'J-12345678-9', 'sdqsadsad', 4, 5, 'activo', 3, 'ddas'),
(5, 62, 25, '2025-08-21', 'sdasdasd', 0, 'J-43166123-7', '', 42, 12, 'activo', 6, '2255525252'),
(6, 14, 4, '2025-04-06', 'adsdsadsa', 40, 'J-23166183-6', '', 3, 0, 'activo', 3, '66666666');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `id_persona` int(11) NOT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `segundo_nombre` varchar(50) DEFAULT NULL,
  `primer_apellido` varchar(50) NOT NULL,
  `segundo_apellido` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('M','F') NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `nacionalidad` varchar(50) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono_principal` varchar(20) NOT NULL,
  `telefono_secundario` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tipo_persona` enum('estudiante','representante','personal') DEFAULT NULL,
  `tipo_sangre` enum('No sabe','O-','O+','A-','A+','B-','B+','AB-','AB+') NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id_persona`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `fecha_nacimiento`, `genero`, `cedula`, `nacionalidad`, `direccion`, `telefono_principal`, `telefono_secundario`, `email`, `tipo_persona`, `tipo_sangre`, `estado`) VALUES
(1, 'José', NULL, 'Pérez', NULL, '1998-12-05', 'M', '31987654', 'Venezolano', 'Av. Libertador, Edif. A', '04161234567', NULL, 'jose.perez@email.com', NULL, 'No sabe', 'activo'),
(2, 'asdsad', 'sadsa', 'dasd', 'dsasdsad', '2025-10-21', 'F', '2822725272', 'Venezolana', 'sdsadwsadsadsadsaa', '04115444444444444', '6546465465465', 'amiascanio26@gmail.com', NULL, 'No sabe', 'activo'),
(3, 'persona 3', 'sdas', 'dasd', 'dsasdsad', '2025-10-10', 'F', '2822722132', 'Venezolana', 'ew4r324r12ras', '04115444444444444', '085885875488585', 'sdasd@adas.com', NULL, 'No sabe', 'activo'),
(4, 'Carlos', 'José', 'Gómez', 'Díaz', '2003-05-25', 'M', '45678901-3', 'Peruana', 'Res. Los Pinos, Apt 1A', '04164567890', '02716543210', 'carlos.gomez@email.com', 'estudiante', 'AB-', 'activo'),
(5, 'Andrea', 'Carolina', 'Fernández', 'Ruiz', '2005-01-10', 'F', '56789012-4', 'Venezolana', 'Sector La Luna, Lote 6', '04245678901', '02815432109', 'andrea.fernandez@email.com', 'estudiante', 'O+', 'activo'),
(6, 'Diego', 'Andrés', 'Hernández', 'Sánchez', '2004-07-03', 'M', '67890123-5', 'Ecuatoriana', 'Calle del Río, Edif. B', '04126789012', '02914321098', 'diego.hernandez@email.com', 'estudiante', 'A-', 'activo'),
(7, 'Valentina', 'Isabel', 'Pérez', 'Torres', '2006-02-18', 'F', '78901234-6', 'Venezolana', 'Av. Los Samanes, PH', '04147890123', '02123210987', 'valentina.perez@email.com', 'estudiante', 'AB+', 'activo'),
(8, 'Gabriel', 'Antonio', 'Sánchez', 'Vargas', '2003-10-29', 'M', '89012345-7', 'Chilena', 'Carrera 10, Casa 12', '04268901234', '02412109876', 'gabriel.sanchez@email.com', 'estudiante', 'B-', 'activo'),
(9, 'Emilia', 'Victoria', 'Ramírez', 'Castro', '2005-04-05', 'F', '90123456-8', 'Venezolana', 'Conj. Res. Las Flores', '04169012345', '02511098765', 'emilia.ramirez@email.com', 'estudiante', 'O+', 'activo'),
(10, 'Javier', 'Eduardo', 'Castro', 'Méndez', '2004-09-12', 'M', '01234567-9', 'Venezolana', 'Barrio Obrero, Calle P', '04240123456', '02719876543', 'javier.castro@email.com', 'estudiante', 'A+', 'activo'),
(11, 'Paula', 'Camila', 'Morales', 'Rojas', '2006-06-30', 'F', '11223344-0', 'Argentina', 'Av. 2, Edif. Z, Piso 3', '04121122334', '02818765432', 'paula.morales@email.com', 'estudiante', 'A-', 'activo'),
(12, 'Ricardo', 'Jesús', 'Vargas', 'Leal', '2003-12-08', 'M', '22334455-1', 'Venezolana', 'Centro, Calle del Comercio', '04142233445', '02917654321', 'ricardo.vargas@email.com', 'estudiante', 'O-', 'activo'),
(13, 'Luciana', 'Paz', 'Herrera', 'Gil', '2005-02-28', 'F', '33445566-2', 'Venezolana', 'Urbanización Vista Alegre', '04263344556', '02126543210', 'luciana.herrera@email.com', 'estudiante', 'B+', 'activo'),
(14, 'Adrián', 'Sebastián', 'Silva', 'Guzmán', '2004-08-07', 'M', '44556677-3', 'Uruguaya', 'Transversal 7, Casa A', '04164455667', '02415432109', 'adrian.silva@email.com', 'estudiante', 'AB+', 'activo'),
(15, 'Gabriela', 'Fernanda', 'Quintero', 'Ríos', '2006-01-19', 'F', '55667788-4', 'Venezolana', 'Calle Ciega, Manzana 3', '04245566778', '02514321098', 'gabriela.quintero@email.com', 'estudiante', 'O+', 'activo'),
(16, 'Mateo', 'Miguel', 'Arias', 'Zambrano', '2003-09-02', 'M', '66778899-5', 'Venezolana', 'Sector 9, Av. Bolivar', '04126677889', '02713210987', 'mateo.arias@email.com', 'estudiante', 'A+', 'activo'),
(17, 'Elena', 'Victoria', 'Bravo', 'Mendoza', '2005-03-14', 'F', '77889900-6', 'Española', 'Edif. Central, Piso 7', '04147788990', '02812109876', 'elena.bravo@email.com', 'estudiante', 'A-', 'activo'),
(18, 'Felipe', 'Alejandro', 'Fuentes', 'Reyes', '2004-10-22', 'M', '88990011-7', 'Venezolana', 'Urbanización Los Mangos', '04268899001', '02911098765', 'felipe.fuentes@email.com', 'estudiante', 'B-', 'activo'),
(19, 'Camila', 'Antonia', 'Guerrero', 'Luna', '2006-04-16', 'F', '99001122-8', 'Mexicana', 'Calle 3, Casa M', '04169900112', '02129876540', 'camila.guerrero@email.com', 'estudiante', 'O-', 'activo'),
(20, 'Nicolás', 'Daniel', 'Ibarra', 'Mora', '2003-06-01', 'M', '00112233-9', 'Venezolana', 'Av. Norte, Res. 5', '04240011223', '02418765400', 'nicolas.ibarra@email.com', 'estudiante', 'AB-', 'activo'),
(21, 'Laura', 'Sofía', 'Jiménez', 'Nava', '2005-09-29', 'F', '10203040-0', 'Colombiana', 'Los Girasoles, Apt 2C', '04121020304', '02517654301', 'laura.jimenez@email.com', 'estudiante', 'O+', 'activo'),
(22, 'Sebastián', 'Enrique', 'Kardona', 'Ortiz', '2004-01-11', 'M', '20304050-1', 'Venezolana', 'Callejón Perdido, Casa 8', '04142030405', '02716543202', 'sebastian.kardona@email.com', 'estudiante', 'A+', 'activo'),
(23, 'Mariana', 'José', 'Linares', 'Parra', '2006-07-27', 'F', '30405060-2', 'Peruana', 'Vía Pública, Local 1', '04263040506', '02815432103', 'mariana.linares@email.com', 'estudiante', 'B+', 'activo'),
(24, 'Alejandro', 'David', 'Méndez', 'Quijada', '2003-04-09', 'M', '40506070-3', 'Venezolana', 'El Bosque, Manzana K', '04164050607', '02914321094', 'alejandro.mendez@email.com', 'estudiante', 'O-', 'activo'),
(25, 'Daniela', 'Elizabeth', 'Nieves', 'Rangel', '2005-11-05', 'F', '50607080-4', 'Ecuatoriana', 'Av. 4, Edif. Blanco', '04245060708', '02123210985', 'daniela.nieves@email.com', 'estudiante', 'AB+', 'activo'),
(26, 'Joaquín', 'Ramón', 'Ochoa', 'Salas', '2004-02-17', 'M', '60708090-5', 'Venezolana', 'Carrera 3, C.C. Mall', '04126070809', '02412109876', 'joaquin.ochoa@email.com', 'estudiante', 'A-', 'activo'),
(27, 'Valeria', 'Guadalupe', 'Padilla', 'Tovar', '2006-09-03', 'F', '70809000-6', 'Chilena', 'Zona Industrial, Galpón 9', '04147080900', '02511098767', 'valeria.padilla@email.com', 'estudiante', 'O+', 'activo'),
(28, 'Miguel', 'Ángel', 'Quintero', 'Urbina', '2003-07-13', 'M', '80900010-7', 'Venezolana', 'Prolongación 10, Casa 1', '04268090001', '02719876548', 'miguel.quintero@email.com', 'estudiante', 'B-', 'activo'),
(29, 'Natalia', 'Pilar', 'Reyes', 'Valdez', '2005-12-24', 'F', '90001020-8', 'Argentina', 'El Paraíso, Quinta Sol', '04169000102', '02818765439', 'natalia.reyes@email.com', 'estudiante', 'AB-', 'activo'),
(30, 'Pedro', 'Pablo', 'Soto', 'Weber', '2004-05-18', 'M', '00010203-9', 'Venezolana', 'Avenida Intercomunal, Km 5', '04240001020', '02917654320', 'pedro.soto@email.com', 'estudiante', 'A+', 'activo'),
(31, 'Verónica', 'Teresa', 'Torres', 'Yépez', '2006-03-06', 'F', '10010203-0', 'Uruguaya', 'Calle 1, Res. Los Álamos', '04121001020', '02126543211', 'veronica.torres@email.com', 'estudiante', 'O+', 'activo'),
(32, 'Manuel', 'Arturo', 'Urbina', 'Zárate', '2003-11-21', 'M', '20020304-1', 'Venezolana', 'Altos de Miranda, Torre 3', '04142002030', '02415432102', 'manuel.urbina@email.com', 'estudiante', 'B+', 'activo'),
(33, 'Elisa', 'Beatriz', 'Vargas', 'Alonso', '2005-01-08', 'F', '30030405-2', 'Venezolana', 'Sector La Esperanza, Casa G', '04263003040', '02514321093', 'elisa.vargas@email.com', 'estudiante', 'A-', 'activo'),
(34, 'Francisco', 'Javier', 'Weber', 'Brito', '2004-06-26', 'M', '40040506-3', 'Española', 'Zona Centro, Av. Libertador', '04164004050', '02713210984', 'francisco.weber@email.com', 'estudiante', 'AB+', 'activo'),
(35, 'Adriana', 'Lucía', 'Yépez', 'Chacón', '2006-10-17', 'F', '50050607-4', 'Venezolana', 'Carrera 5, Edif. Amarillo', '04245005060', '02812109875', 'adriana.yepez@email.com', 'estudiante', 'O-', 'activo'),
(36, 'Héctor', 'Raúl', 'Zárate', 'Delgado', '2003-08-04', 'M', '60060708-5', 'Mexicana', 'Calle 12, Nro. 34', '04126006070', '02911098766', 'hector.zarate@email.com', 'estudiante', 'A+', 'activo'),
(37, 'Isabella', 'Alejandra', 'Alfonso', 'Escobar', '2005-05-13', 'F', '70070809-6', 'Venezolana', 'Urb. Jardín, Calle J', '04147007080', '02129876547', 'isabella.alfonso@email.com', 'estudiante', 'B-', 'activo'),
(38, 'Jorge', 'Luis', 'Brito', 'Flores', '2004-01-29', 'M', '80080910-7', 'Colombiana', 'Los Laureles, Casa 15', '04268008091', '02418765438', 'jorge.brito@email.com', 'estudiante', 'O+', 'activo'),
(39, 'Karelis', 'Yoselyn', 'Chacón', 'García', '2006-12-09', 'F', '90091020-8', 'Venezolana', 'Av. Sur, Res. Delta', '04169009102', '02517654329', 'karelis.chacon@email.com', 'estudiante', 'AB-', 'activo'),
(40, 'Leandro', 'Fabián', 'Delgado', 'Hurtado', '2003-03-27', 'M', '00102030-9', 'Peruana', 'Calle del Sol, Edif. Alto', '04240010203', '02716543210', 'leandro.delgado@email.com', 'estudiante', 'A-', 'activo'),
(41, 'Roberto', 'David', 'Méndez', 'Rivas', '1975-02-01', 'M', '11122233-0', 'Venezolana', 'Urb. Familiar, Casa A-1', '04141112223', '02121111111', 'roberto.mendez.rep@email.com', 'representante', 'O+', 'activo'),
(42, 'Marta', 'Elena', 'Silva', 'Núñez', '1980-11-23', 'F', '22233344-1', 'Venezolana', 'Av. 2, Edif. Z, Piso 3', '04162223334', '02412222222', 'marta.silva.rep@email.com', 'representante', 'B+', 'activo'),
(43, 'José', 'Gregorio', 'Quintero', 'López', '1968-04-10', 'M', '33344455-2', 'Colombiana', 'Zona Centro, Av. Libertador', '04263334445', '02513333333', 'jose.quintero.rep@email.com', 'representante', 'A+', 'activo'),
(44, 'Carmen', 'Rosa', 'Vargas', 'Pérez', '1979-07-07', 'F', '44455566-3', 'Venezolana', 'Res. Los Pinos, Apt 1A', '04124445556', '02714444444', 'carmen.vargas.rep@email.com', 'representante', 'O-', 'activo'),
(45, 'Alfredotres', 'Daniel', 'Gómez', 'Blanco', '1972-09-15', 'M', '55566677', 'Peruana', 'Calle 3, Casa M', '04245556667', '02815555555', 'alfredo.gomez.rep@email.com', 'representante', 'AB+', 'activo'),
(46, 'Teresa', 'Luisa', 'Reyes', 'Torres', '1985-03-02', 'F', '66677788-5', 'Venezolana', 'Los Girasoles, Apt 2C', '04146667778', '02916666666', 'teresa.reyes.rep@email.com', 'representante', 'A-', 'activo'),
(47, 'Humberto', 'Andrés', 'Castro', 'Sosa', '1965-12-30', 'M', '77788899-6', 'Chileno', 'Urbanización Vista Alegre', '04267778889', '02127777777', 'humberto.castro.rep@email.com', 'representante', 'B-', 'activo'),
(48, 'Diana', 'Carolina', 'Flores', 'Zambrano', '1970-06-21', 'F', '88899900-7', 'Venezolana', 'El Paraíso, Quinta Sol', '04168889990', '02418888888', 'diana.flores.rep@email.com', 'representante', 'O+', 'activo'),
(49, 'Juan', 'Ramón', 'Guerrero', 'Mora', '1978-01-05', 'M', '99900011-8', 'Español', 'Av. Norte, Res. 5', '04249990001', '02519999999', 'juan.guerrero.rep@email.com', 'representante', 'AB-', 'activo'),
(50, 'Patricia', 'Isabel', 'Leal', 'Arias', '1982-10-12', 'F', '00011122-9', 'Venezolana', 'Altos de Miranda, Torre 3', '04120001112', '02710000000', 'patricia.leal.rep@email.com', 'representante', 'A+', 'activo'),
(51, 'Jesús', 'Manuel', 'Ortega', 'Ramos', '1990-05-10', 'M', '10111213-0', 'Venezolana', 'Edif. Central, Piso 7', '04141011121', '02125439876', 'jesus.ortega.adm@instituto.edu.ve', 'personal', 'O-', 'activo'),
(52, 'Maribel', 'Corina', 'Páez', 'Soto', '1988-08-28', 'F', '14151617-1', 'Venezolana', 'Sector 9, Av. Bolivar', '04161415161', '02414328765', 'maribel.paez.prof@instituto.edu.ve', 'personal', 'B+', 'activo'),
(53, 'Samuel', 'Elías', 'Rivas', 'Toro', '1977-01-16', 'M', '18192021-2', 'Colombiana', 'Vía Pública, Local 1', '04261819202', '02513217654', 'samuel.rivas.dir@instituto.edu.ve', 'personal', 'A-', 'activo'),
(54, 'Yenny', 'Victoria', 'Vera', 'Yánez', '1995-11-04', 'F', '22232425-3', 'Peruana', 'Calle 1, Res. Los Álamos', '04122223242', '02712106543', 'yenny.vera.sec@instituto.edu.ve', 'personal', 'AB+', 'activo'),
(55, 'Marco', 'Tulio', 'Díaz', 'Rojas', '1983-06-20', 'M', '26272829-4', 'Venezolana', 'Zona Industrial, Galpón 9', '04242627282', '02811095432', 'marco.diaz.adm@instituto.edu.ve', 'personal', 'O+', 'activo'),
(56, 'Isabel', 'Cristina', 'Navas', 'Salazar', '1992-04-01', 'F', '30313233-5', 'Ecuatoriana', 'El Bosque, Manzana K', '04143031323', '02919874321', 'isabel.navas.prof@instituto.edu.ve', 'personal', 'A+', 'activo'),
(57, 'Eugenio', 'Simón', 'Parra', 'Molina', '1963-09-07', 'M', '34353637-6', 'Venezolana', 'Prolongación 10, Casa 1', '04263435363', '02128763210', 'eugenio.parra.dir@instituto.edu.ve', 'personal', 'B-', 'activo'),
(58, 'Rosa', 'María', 'Quintero', 'Jiménez', '1998-02-14', 'F', '38394041-7', 'Chilena', 'Avenida Intercomunal, Km 5', '04163839404', '02417652109', 'rosa.quintero.sec@instituto.edu.ve', 'personal', 'O+', 'activo'),
(59, 'Tony', 'Antonio', 'Rangel', 'Herrera', '1981-10-25', 'M', '42434445-8', 'Venezolana', 'Los Laureles, Casa 15', '04244243444', '02516541098', 'tony.rangel.adm@instituto.edu.ve', 'personal', 'AB-', 'activo'),
(60, 'Zuleima', 'Yelitza', 'Suárez', 'Flores', '1994-07-23', 'F', '46474849-9', 'Venezolana', 'Urb. Jardín, Calle J', '04124647484', '02715430987', 'zuleima.suarez.prof@instituto.edu.ve', 'personal', 'A-', 'activo'),
(61, 'jose', 'segundo', 'camejo', 'camejo', '2025-11-12', 'M', '2555515', 'Venezolana', 'dsadsadsadsadsadsadsadsadsadsdsadadsada', '0141545124584', NULL, 'asdsadsadhha@gmail.com', 'personal', 'AB-', 'incompleto'),
(62, 'persona creada para probar', 'sadsa', 'creada para probar', '', '2003-06-14', 'M', 'V-822725272', 'Venezolana', 'Calle 3, Casa M', '04115444444', '', 'sdsadsadsdsa@gmail.com', 'personal', 'A-', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificaciones`
--

CREATE TABLE `planificaciones` (
  `id_planificacion` int(11) NOT NULL,
  `fk_personal` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_area` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `tipo` enum('individual','aula') NOT NULL DEFAULT 'aula',
  `estado` enum('inactivo','activo') NOT NULL DEFAULT 'activo',
  `reutilizable` enum('si','no') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificaciones_individuales`
--

CREATE TABLE `planificaciones_individuales` (
  `id_planificaciones_individuales` int(11) NOT NULL,
  `fk_planificacion` int(11) NOT NULL,
  `fk_inscripcion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id_preguntas` int(11) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `pregunta` varchar(50) NOT NULL,
  `respuesta` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prosecucion`
--

CREATE TABLE `prosecucion` (
  `id_prosecucion` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6') NOT NULL,
  `fk_literal` int(11) NOT NULL,
  `paso_grado` enum('si','no') NOT NULL,
  `observaciones` varchar(255) NOT NULL,
  `literalFinal` enum('si','no') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `representantes`
--

CREATE TABLE `representantes` (
  `id_representante` int(11) NOT NULL,
  `fk_persona` int(11) NOT NULL,
  `oficio` varchar(100) DEFAULT NULL,
  `nivel_educativo` enum('Primaria','Bachiller','TSU','Licenciatura','Maestria','Doctorado') DEFAULT NULL,
  `profesion` varchar(100) NOT NULL,
  `lugar_trabajo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respaldos`
--

CREATE TABLE `respaldos` (
  `id_respaldos` int(11) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `fk_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultado_evaluacion`
--

CREATE TABLE `resultado_evaluacion` (
  `resultado_evaluacion` int(11) NOT NULL,
  `fk_ind_eva_con` int(11) NOT NULL,
  `fk_inscripcion` int(11) NOT NULL,
  `fk_literal` int(11) NOT NULL,
  `observaciones` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_usuario`
--

CREATE TABLE `sesiones_usuario` (
  `id` int(20) NOT NULL,
  `fk_usuario` int(11) NOT NULL,
  `hash_sesion` varchar(255) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesiones_usuario`
--

INSERT INTO `sesiones_usuario` (`id`, `fk_usuario`, `hash_sesion`, `fecha_inicio`, `fecha_vencimiento`) VALUES
(28, 1, 'a8dd2dc398a63eb068b709cce98830ba7277b370a6f983620ecbe969494a7d1f', '2025-11-19', '2025-11-20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socioeconomico`
--

CREATE TABLE `socioeconomico` (
  `id_socio` int(11) NOT NULL,
  `fk_representante` int(11) NOT NULL,
  `fk_inscripcion` int(11) NOT NULL,
  `tipo_vivienda` varchar(50) DEFAULT NULL,
  `zona_vivienda` enum('urbana','rural') DEFAULT 'urbana',
  `tenencia_vivienda` varchar(50) DEFAULT NULL,
  `ingreso_familiar` float DEFAULT NULL,
  `miembros_familia` int(4) DEFAULT NULL,
  `tareas_comunitarias` enum('si','no') DEFAULT NULL,
  `detalle_participacion` varchar(200) DEFAULT NULL,
  `desea_participar_comite` enum('si','no') DEFAULT NULL,
  `detalle_comite` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL,
  `fk_contenido` int(11) NOT NULL,
  `nombre_tema` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `temas`
--

INSERT INTO `temas` (`id_tema`, `fk_contenido`, `nombre_tema`, `estado`) VALUES
(1, 200, 'Reconocimiento de letras del abecedario', 'activo'),
(2, 200, 'Silabeo y formación de palabras', 'activo'),
(3, 200, 'Escritura de nombres propios', 'activo'),
(4, 200, 'Lectura de palabras de uso frecuente', 'activo'),
(5, 201, 'Saludos y presentaciones', 'activo'),
(6, 201, 'Descripción de objetos y personas', 'activo'),
(7, 201, 'Narración de experiencias personales', 'activo'),
(8, 203, 'Identificación de ideas principales', 'activo'),
(9, 203, 'Secuencia de eventos en textos', 'activo'),
(10, 203, 'Inferencias simples', 'activo'),
(11, 300, 'Conteo del 1 al 100', 'activo'),
(12, 300, 'Lectura y escritura de números', 'activo'),
(13, 300, 'Comparación de números (mayor, menor, igual)', 'activo'),
(14, 300, 'Números pares e impares', 'activo'),
(15, 301, 'Sumas sin llevadas', 'activo'),
(16, 301, 'Propiedad conmutativa de la suma', 'activo'),
(17, 301, 'Resolución de problemas con sumas', 'activo'),
(18, 305, 'Concepto de multiplicación', 'activo'),
(19, 305, 'Tablas del 2, 5 y 10', 'activo'),
(20, 305, 'Multiplicación por 0 y 1', 'activo'),
(21, 400, 'Partes de la cabeza, tronco y extremidades', 'activo'),
(22, 400, 'Órganos principales y sus funciones', 'activo'),
(23, 400, 'Cuidado del cuerpo', 'activo'),
(24, 401, 'El sentido de la vista', 'activo'),
(25, 401, 'El sentido del oído', 'activo'),
(26, 401, 'El sentido del tacto', 'activo'),
(27, 401, 'El sentido del olfato', 'activo'),
(28, 401, 'El sentido del gusto', 'activo'),
(29, 403, 'Animales vertebrados e invertebrados', 'activo'),
(30, 403, 'Plantas comestibles y ornamentales', 'activo'),
(31, 403, 'Animales en peligro de extinción en Venezuela', 'activo'),
(32, 502, 'La Bandera Nacional', 'activo'),
(33, 502, 'El Escudo Nacional', 'activo'),
(34, 502, 'El Himno Nacional', 'activo'),
(35, 502, 'Respeto a los símbolos patrios', 'activo'),
(36, 505, 'Simón Bolívar: El Libertador', 'activo'),
(37, 505, 'Antonio José de Sucre', 'activo'),
(38, 505, 'Francisco de Miranda', 'activo'),
(39, 505, 'José Félix Ribas', 'activo'),
(40, 506, 'Capitales de los estados', 'activo'),
(41, 506, 'Productos típicos por región', 'activo'),
(42, 506, 'Ubicación geográfica de los estados', 'activo'),
(43, 601, 'La ere', 'activo'),
(44, 601, 'El gurrufío', 'activo'),
(45, 601, 'El papagayo', 'activo'),
(46, 601, 'Las metras', 'activo'),
(47, 603, 'Voltereta adelante', 'activo'),
(48, 603, 'Equilibrio sobre un pie', 'activo'),
(49, 603, 'Salto de cuerda', 'activo'),
(50, 603, 'Coordinación en carrera y salto', 'activo'),
(51, 700, 'Respeto al turno de palabra', 'activo'),
(52, 700, 'Cuidado de los materiales escolares', 'activo'),
(53, 700, 'Convivencia con compañeros', 'activo'),
(54, 702, 'Derecho a la educación', 'activo'),
(55, 702, 'Derecho a la salud', 'activo'),
(56, 702, 'Derecho al juego', 'activo'),
(57, 702, 'Derecho a la identidad', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `fk_personal` int(11) DEFAULT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo',
  `rol` enum('Administrador','Director','Docente','Secretaria') DEFAULT NULL,
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `fecha_bloqueo` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `fk_personal`, `nombre_usuario`, `contrasena_hash`, `estado`, `rol`, `ultimo_login`, `intentos_fallidos`, `fecha_bloqueo`) VALUES
(1, 1, 'usuario', '$2y$10$9qQDpCH5pvRJ.dWocshMtONhwF4RhhLATmb3ZKEophNlsR6g7/S4S', 'activo', 'Administrador', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacuna`
--

CREATE TABLE `vacuna` (
  `id_vacuna` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacuna`
--

INSERT INTO `vacuna` (`id_vacuna`, `nombre`) VALUES
(1, 'BCG (Tuberculosis)'),
(2, 'Hepatitis B'),
(3, 'Pentavalente'),
(4, 'Polio'),
(5, 'SRP (Sarampión, Rubéola, Paperas)'),
(6, 'DPT (Difteria, Tosferina, Tétanos)'),
(7, 'Fiebre Amarilla'),
(8, 'Influenza'),
(9, 'COVID-19'),
(10, 'Varicela'),
(11, 'Rotavirus'),
(12, 'Neumococo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas_estudiante`
--

CREATE TABLE `vacunas_estudiante` (
  `id_vacuna_estudiante` int(11) NOT NULL,
  `fk_vacuna` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fecha_aplicacion` date DEFAULT NULL,
  `refuerzos` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alergias`
--
ALTER TABLE `alergias`
  ADD PRIMARY KEY (`id_alergia`);

--
-- Indices de la tabla `anios_escolares`
--
ALTER TABLE `anios_escolares`
  ADD PRIMARY KEY (`id_anio_escolar`);

--
-- Indices de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  ADD PRIMARY KEY (`id_area_aprendizaje`),
  ADD KEY `fk_componente` (`fk_componente`),
  ADD KEY `fk_funcion` (`fk_funcion`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `fk_asistencia_inscripcion` (`fk_inscripcion`),
  ADD KEY `fk_momento` (`fk_momento`);

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `aula`
--
ALTER TABLE `aula`
  ADD PRIMARY KEY (`id_aula`),
  ADD KEY `fk_anio_escolar` (`fk_anio_escolar`),
  ADD KEY `fk_grado_seccion` (`fk_grado_seccion`),
  ADD KEY `fk_guia` (`fk_guia`);

--
-- Indices de la tabla `bloqueos_seguridad`
--
ALTER TABLE `bloqueos_seguridad`
  ADD PRIMARY KEY (`id_bloqueo`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `cargos`
--
ALTER TABLE `cargos`
  ADD PRIMARY KEY (`id_cargo`),
  ADD UNIQUE KEY `nombre_cargo` (`nombre_cargo`);

--
-- Indices de la tabla `competencias`
--
ALTER TABLE `competencias`
  ADD PRIMARY KEY (`id_competencia`),
  ADD KEY `id_planificacion` (`fk_planificacion`);

--
-- Indices de la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  ADD PRIMARY KEY (`id_componente`);

--
-- Indices de la tabla `condiciones_salud`
--
ALTER TABLE `condiciones_salud`
  ADD PRIMARY KEY (`id_condicion`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_patologia` (`fk_patologia`);

--
-- Indices de la tabla `consultas_medicas`
--
ALTER TABLE `consultas_medicas`
  ADD PRIMARY KEY (`id_consulta`),
  ADD KEY `fk_consultas_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `contenidos`
--
ALTER TABLE `contenidos`
  ADD PRIMARY KEY (`id_contenido`),
  ADD KEY `id_area_aprendizaje` (`fk_area_aprendizaje`);

--
-- Indices de la tabla `documentos_academicos`
--
ALTER TABLE `documentos_academicos`
  ADD PRIMARY KEY (`id_documento`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id_estudiante`),
  ADD UNIQUE KEY `id_persona` (`id_persona`),
  ADD UNIQUE KEY `codigo_estudiantil` (`cedula_escolar`);

--
-- Indices de la tabla `evaluaciones`
--
ALTER TABLE `evaluaciones`
  ADD PRIMARY KEY (`id_evaluacion`);

--
-- Indices de la tabla `funcion_personal`
--
ALTER TABLE `funcion_personal`
  ADD PRIMARY KEY (`id_funcion_personal`);

--
-- Indices de la tabla `grado_seccion`
--
ALTER TABLE `grado_seccion`
  ADD PRIMARY KEY (`id_grado_seccion`);

--
-- Indices de la tabla `grupos_estudiantiles`
--
ALTER TABLE `grupos_estudiantiles`
  ADD PRIMARY KEY (`id_grupos_estudiantiles`),
  ADD KEY `fk_horario` (`fk_horario`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `habilidades`
--
ALTER TABLE `habilidades`
  ADD PRIMARY KEY (`id_habilidad`),
  ADD KEY `fk_representante` (`fk_representante`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`),
  ADD KEY `fk_aula` (`fk_aula`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_area` (`fk_area`),
  ADD KEY `fk_personal` (`fk_personal`);

--
-- Indices de la tabla `imparticion_clases`
--
ALTER TABLE `imparticion_clases`
  ADD PRIMARY KEY (`id_imparticion_clases`),
  ADD KEY `id_asignacion_aula` (`fk_aula`),
  ADD KEY `id_docente` (`fk_docente`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_area_aprendizaje` (`fk_area_aprendizaje`);

--
-- Indices de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD PRIMARY KEY (`id_indicador`),
  ADD KEY `fk_competencia` (`fk_competencia`);

--
-- Indices de la tabla `indicadores_descriptores`
--
ALTER TABLE `indicadores_descriptores`
  ADD PRIMARY KEY (`id_descriptor`),
  ADD UNIQUE KEY `idx_indicador_rango` (`fk_indicador`,`fk_literal`),
  ADD KEY `id_literal` (`fk_literal`);

--
-- Indices de la tabla `indicador_evaluacion_contenido`
--
ALTER TABLE `indicador_evaluacion_contenido`
  ADD PRIMARY KEY (`id_ind_eva_con`),
  ADD UNIQUE KEY `fk_indicador` (`fk_indicador`),
  ADD KEY `fk_contenido` (`fk_contenido`),
  ADD KEY `fk_evaluacion` (`fk_evaluacion`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `fk_imparticion_clases` (`fk_imparticion_clases`),
  ADD KEY `fk_personal` (`fk_personal`),
  ADD KEY `fk_representante` (`fk_representante`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  ADD PRIMARY KEY (`id_lista_alergia`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_alergia` (`fk_alergia`);

--
-- Indices de la tabla `literal`
--
ALTER TABLE `literal`
  ADD PRIMARY KEY (`id_literal`);

--
-- Indices de la tabla `momentos_academicos`
--
ALTER TABLE `momentos_academicos`
  ADD PRIMARY KEY (`id_momento`),
  ADD UNIQUE KEY `id_anio_escolar` (`fk_anio_escolar`);

--
-- Indices de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD PRIMARY KEY (`id_parentesco`),
  ADD KEY `fk_representante` (`fk_representante`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `patologias`
--
ALTER TABLE `patologias`
  ADD PRIMARY KEY (`id_patologia`),
  ADD UNIQUE KEY `nombre_enfermedad` (`nombre_patologia`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id_personal`),
  ADD UNIQUE KEY `rif` (`rif`),
  ADD KEY `fk_cargo` (`fk_cargo`),
  ADD KEY `fk_persona` (`fk_persona`),
  ADD KEY `fk_funcion` (`fk_funcion`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id_persona`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  ADD PRIMARY KEY (`id_planificacion`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_personal` (`fk_personal`),
  ADD KEY `fk_area` (`fk_area`),
  ADD KEY `fk_aula` (`fk_aula`);

--
-- Indices de la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  ADD PRIMARY KEY (`id_planificaciones_individuales`),
  ADD KEY `fk_planificacion` (`fk_planificacion`),
  ADD KEY `fk_inscripcion` (`fk_inscripcion`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id_preguntas`),
  ADD KEY `preguntas_ibfk_1` (`fk_usuario`);

--
-- Indices de la tabla `prosecucion`
--
ALTER TABLE `prosecucion`
  ADD PRIMARY KEY (`id_prosecucion`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_literal` (`fk_literal`);

--
-- Indices de la tabla `representantes`
--
ALTER TABLE `representantes`
  ADD PRIMARY KEY (`id_representante`),
  ADD UNIQUE KEY `id_persona` (`fk_persona`);

--
-- Indices de la tabla `respaldos`
--
ALTER TABLE `respaldos`
  ADD PRIMARY KEY (`id_respaldos`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `resultado_evaluacion`
--
ALTER TABLE `resultado_evaluacion`
  ADD PRIMARY KEY (`resultado_evaluacion`),
  ADD KEY `fk_literal` (`fk_literal`),
  ADD KEY `fk_ind_eva_con` (`fk_ind_eva_con`),
  ADD KEY `fk_inscripcion` (`fk_inscripcion`);

--
-- Indices de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`fk_usuario`);

--
-- Indices de la tabla `socioeconomico`
--
ALTER TABLE `socioeconomico`
  ADD PRIMARY KEY (`id_socio`),
  ADD KEY `fk_inscripcion` (`fk_inscripcion`),
  ADD KEY `fk_representante` (`fk_representante`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD KEY `fk_contenido` (`fk_contenido`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `fk_personal` (`fk_personal`);

--
-- Indices de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  ADD PRIMARY KEY (`id_vacuna`);

--
-- Indices de la tabla `vacunas_estudiante`
--
ALTER TABLE `vacunas_estudiante`
  ADD PRIMARY KEY (`id_vacuna_estudiante`),
  ADD KEY `fk_vacuna` (`fk_vacuna`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alergias`
--
ALTER TABLE `alergias`
  MODIFY `id_alergia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `anios_escolares`
--
ALTER TABLE `anios_escolares`
  MODIFY `id_anio_escolar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  MODIFY `id_area_aprendizaje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aula`
--
ALTER TABLE `aula`
  MODIFY `id_aula` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bloqueos_seguridad`
--
ALTER TABLE `bloqueos_seguridad`
  MODIFY `id_bloqueo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id_cargo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `competencias`
--
ALTER TABLE `competencias`
  MODIFY `id_competencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  MODIFY `id_componente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT de la tabla `condiciones_salud`
--
ALTER TABLE `condiciones_salud`
  MODIFY `id_condicion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consultas_medicas`
--
ALTER TABLE `consultas_medicas`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contenidos`
--
ALTER TABLE `contenidos`
  MODIFY `id_contenido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=706;

--
-- AUTO_INCREMENT de la tabla `documentos_academicos`
--
ALTER TABLE `documentos_academicos`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `evaluaciones`
--
ALTER TABLE `evaluaciones`
  MODIFY `id_evaluacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `funcion_personal`
--
ALTER TABLE `funcion_personal`
  MODIFY `id_funcion_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `grado_seccion`
--
ALTER TABLE `grado_seccion`
  MODIFY `id_grado_seccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grupos_estudiantiles`
--
ALTER TABLE `grupos_estudiantiles`
  MODIFY `id_grupos_estudiantiles` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `habilidades`
--
ALTER TABLE `habilidades`
  MODIFY `id_habilidad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imparticion_clases`
--
ALTER TABLE `imparticion_clases`
  MODIFY `id_imparticion_clases` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  MODIFY `id_indicador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores_descriptores`
--
ALTER TABLE `indicadores_descriptores`
  MODIFY `id_descriptor` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicador_evaluacion_contenido`
--
ALTER TABLE `indicador_evaluacion_contenido`
  MODIFY `id_ind_eva_con` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  MODIFY `id_lista_alergia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `literal`
--
ALTER TABLE `literal`
  MODIFY `id_literal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `momentos_academicos`
--
ALTER TABLE `momentos_academicos`
  MODIFY `id_momento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  MODIFY `id_planificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  MODIFY `id_planificaciones_individuales` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id_preguntas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prosecucion`
--
ALTER TABLE `prosecucion`
  MODIFY `id_prosecucion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `representantes`
--
ALTER TABLE `representantes`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `respaldos`
--
ALTER TABLE `respaldos`
  MODIFY `id_respaldos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resultado_evaluacion`
--
ALTER TABLE `resultado_evaluacion`
  MODIFY `resultado_evaluacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `socioeconomico`
--
ALTER TABLE `socioeconomico`
  MODIFY `id_socio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `vacunas_estudiante`
--
ALTER TABLE `vacunas_estudiante`
  MODIFY `id_vacuna_estudiante` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  ADD CONSTRAINT `areas_aprendizaje_ibfk_1` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `areas_aprendizaje_ibfk_2` FOREIGN KEY (`fk_funcion`) REFERENCES `funcion_personal` (`id_funcion_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos_academicos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asistencia_inscripcion` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `aula`
--
ALTER TABLE `aula`
  ADD CONSTRAINT `fk_aula_anio_escolar` FOREIGN KEY (`fk_anio_escolar`) REFERENCES `anios_escolares` (`id_anio_escolar`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aula_grado_seccion` FOREIGN KEY (`fk_grado_seccion`) REFERENCES `grado_seccion` (`id_grado_seccion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `bloqueos_seguridad`
--
ALTER TABLE `bloqueos_seguridad`
  ADD CONSTRAINT `bloqueos_seguridad_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `competencias`
--
ALTER TABLE `competencias`
  ADD CONSTRAINT `competencias_ibfk_1` FOREIGN KEY (`fk_planificacion`) REFERENCES `planificaciones` (`id_planificacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `condiciones_salud`
--
ALTER TABLE `condiciones_salud`
  ADD CONSTRAINT `condiciones_salud_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `condiciones_salud_ibfk_2` FOREIGN KEY (`fk_patologia`) REFERENCES `patologias` (`id_patologia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `consultas_medicas`
--
ALTER TABLE `consultas_medicas`
  ADD CONSTRAINT `fk_consultas_estudiante` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `contenidos`
--
ALTER TABLE `contenidos`
  ADD CONSTRAINT `contenidos_ibfk_1` FOREIGN KEY (`fk_area_aprendizaje`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `documentos_academicos`
--
ALTER TABLE `documentos_academicos`
  ADD CONSTRAINT `documentos_academicos_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `fk_estudiantes_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `grupos_estudiantiles`
--
ALTER TABLE `grupos_estudiantiles`
  ADD CONSTRAINT `fk_grupos_horario` FOREIGN KEY (`fk_horario`) REFERENCES `horarios` (`id_horario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grupos_estudiantiles_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `habilidades`
--
ALTER TABLE `habilidades`
  ADD CONSTRAINT `habilidades_ibfk_1` FOREIGN KEY (`fk_representante`) REFERENCES `representantes` (`id_representante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`fk_area`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_3` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_4` FOREIGN KEY (`fk_momento`) REFERENCES `momentos_academicos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `imparticion_clases`
--
ALTER TABLE `imparticion_clases`
  ADD CONSTRAINT `fk_imparticion_aula` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_imparticion_docente` FOREIGN KEY (`fk_docente`) REFERENCES `personal` (`id_personal`) ON UPDATE CASCADE,
  ADD CONSTRAINT `imparticion_clases_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos_academicos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imparticion_clases_ibfk_2` FOREIGN KEY (`fk_area_aprendizaje`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD CONSTRAINT `indicadores_ibfk_1` FOREIGN KEY (`fk_competencia`) REFERENCES `competencias` (`id_competencia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `indicadores_descriptores`
--
ALTER TABLE `indicadores_descriptores`
  ADD CONSTRAINT `indicadores_descriptores_ibfk_1` FOREIGN KEY (`fk_indicador`) REFERENCES `indicadores` (`id_indicador`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `indicadores_descriptores_ibfk_2` FOREIGN KEY (`fk_literal`) REFERENCES `literal` (`id_literal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `indicador_evaluacion_contenido`
--
ALTER TABLE `indicador_evaluacion_contenido`
  ADD CONSTRAINT `indicador_evaluacion_contenido_ibfk_1` FOREIGN KEY (`fk_indicador`) REFERENCES `indicadores` (`id_indicador`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `indicador_evaluacion_contenido_ibfk_2` FOREIGN KEY (`fk_contenido`) REFERENCES `contenidos` (`id_contenido`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `indicador_evaluacion_contenido_ibfk_3` FOREIGN KEY (`fk_evaluacion`) REFERENCES `evaluaciones` (`id_evaluacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`fk_representante`) REFERENCES `representantes` (`id_representante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_3` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  ADD CONSTRAINT `lista_alergias_ibfk_1` FOREIGN KEY (`fk_alergia`) REFERENCES `alergias` (`id_alergia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lista_alergias_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `momentos_academicos`
--
ALTER TABLE `momentos_academicos`
  ADD CONSTRAINT `momentos_academicos_ibfk_1` FOREIGN KEY (`fk_anio_escolar`) REFERENCES `anios_escolares` (`id_anio_escolar`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD CONSTRAINT `parentesco_ibfk_1` FOREIGN KEY (`fk_representante`) REFERENCES `representantes` (`id_representante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `parentesco_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal`
--
ALTER TABLE `personal`
  ADD CONSTRAINT `personal_ibfk_1` FOREIGN KEY (`fk_cargo`) REFERENCES `cargos` (`id_cargo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `personal_ibfk_2` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `personal_ibfk_3` FOREIGN KEY (`fk_funcion`) REFERENCES `funcion_personal` (`id_funcion_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  ADD CONSTRAINT `planificaciones_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos_academicos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_2` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_3` FOREIGN KEY (`fk_area`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_4` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  ADD CONSTRAINT `planificaciones_individuales_ibfk_1` FOREIGN KEY (`fk_planificacion`) REFERENCES `planificaciones` (`id_planificacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_individuales_ibfk_2` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `prosecucion`
--
ALTER TABLE `prosecucion`
  ADD CONSTRAINT `prosecucion_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prosecucion_ibfk_4` FOREIGN KEY (`fk_momento`) REFERENCES `momentos_academicos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prosecucion_ibfk_5` FOREIGN KEY (`fk_literal`) REFERENCES `literal` (`id_literal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `representantes`
--
ALTER TABLE `representantes`
  ADD CONSTRAINT `fk_representantes_persona` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`id_persona`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `respaldos`
--
ALTER TABLE `respaldos`
  ADD CONSTRAINT `respaldos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `resultado_evaluacion`
--
ALTER TABLE `resultado_evaluacion`
  ADD CONSTRAINT `resultado_evaluacion_ibfk_2` FOREIGN KEY (`fk_literal`) REFERENCES `literal` (`id_literal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resultado_evaluacion_ibfk_4` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resultado_evaluacion_ibfk_5` FOREIGN KEY (`fk_ind_eva_con`) REFERENCES `indicador_evaluacion_contenido` (`id_ind_eva_con`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD CONSTRAINT `sesiones_usuario_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `socioeconomico`
--
ALTER TABLE `socioeconomico`
  ADD CONSTRAINT `socioeconomico_ibfk_1` FOREIGN KEY (`fk_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `socioeconomico_ibfk_2` FOREIGN KEY (`fk_representante`) REFERENCES `representantes` (`id_representante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`fk_contenido`) REFERENCES `contenidos` (`id_contenido`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `vacunas_estudiante`
--
ALTER TABLE `vacunas_estudiante`
  ADD CONSTRAINT `vacunas_estudiante_ibfk_1` FOREIGN KEY (`fk_vacuna`) REFERENCES `vacuna` (`id_vacuna`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vacunas_estudiante_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
