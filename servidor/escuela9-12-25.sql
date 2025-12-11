-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-12-2025 a las 01:30:36
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
  `estado` enum('activo','inactivo','incompleto','finalizado') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `anios_escolares`
--

INSERT INTO `anios_escolares` (`id_anio_escolar`, `fecha_inicio`, `fecha_fin`, `limite_inscripcion`, `estado`) VALUES
(1, '2025-09-01', '2026-07-20', '2025-09-01', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aprobo`
--

CREATE TABLE `aprobo` (
  `id_aprobo` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `grado` varchar(50) DEFAULT NULL,
  `fk_literal` int(11) DEFAULT NULL,
  `paso` enum('si','no') DEFAULT 'si',
  `observaciones` varchar(255) DEFAULT NULL,
  `final` enum('si','no') DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_aprendizaje`
--

CREATE TABLE `areas_aprendizaje` (
  `id_area_aprendizaje` int(11) NOT NULL,
  `nombre_area` varchar(100) NOT NULL,
  `estado_area` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas_aprendizaje`
--

INSERT INTO `areas_aprendizaje` (`id_area_aprendizaje`, `nombre_area`, `estado_area`) VALUES
(1, 'Lenguaje, Comunicación y Cultura', 'activo'),
(2, 'Matemática', 'activo'),
(3, 'Ciencias Naturales y Sociedad', 'activo'),
(4, 'Ciencias Sociales, Ciudadanía e Identidad', 'activo'),
(5, 'Educación Física, Deporte y Recreación', 'activo'),
(6, 'Arte y Patrimonio', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `fk_componente` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6') NOT NULL,
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
  `cupos` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aula`
--

INSERT INTO `aula` (`id_aula`, `fk_anio_escolar`, `fk_grado_seccion`, `cupos`, `estado`) VALUES
(1, 1, 1, 37, 'activo'),
(2, 1, 4, 37, 'activo'),
(3, 1, 7, 37, 'activo'),
(4, 1, 10, 37, 'activo'),
(5, 1, 13, 37, 'activo'),
(6, 1, 16, 37, 'activo'),
(7, 1, 2, 37, 'activo'),
(8, 1, 3, 37, 'inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bloqueos`
--

CREATE TABLE `bloqueos` (
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
  `fk_componente` int(11) NOT NULL,
  `nombre_competencia` int(11) NOT NULL,
  `descripcion_competencia` varchar(255) NOT NULL,
  `reutilizable` enum('si','no') NOT NULL DEFAULT 'si'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `competencias`
--

INSERT INTO `competencias` (`id_competencia`, `fk_componente`, `nombre_competencia`, `descripcion_competencia`, `reutilizable`) VALUES
(1, 1, 1, 'Desarrolla habilidades comunicativas para expresarse oralmente y por escrito de manera efectiva en diferentes contextos.', 'si'),
(2, 2, 1, 'Desarrolla habilidades básicas de comunicación en inglés para interactuar en situaciones cotidianas.', 'si'),
(3, 3, 1, 'Aplica conceptos y procedimientos matemáticos para resolver problemas de la vida cotidiana.', 'si'),
(4, 4, 1, 'Comprende los fenómenos naturales y desarrolla actitudes científicas para cuidar el medio ambiente.', 'si'),
(5, 5, 1, 'Analiza la realidad social y geográfica para comprender la organización de la sociedad.', 'si'),
(6, 6, 1, 'Desarrolla valores y actitudes para la convivencia democrática y el ejercicio ciudadano.', 'si'),
(7, 7, 1, 'Desarrolla habilidades motrices y hábitos para una vida saludable a través de la actividad física.', 'si'),
(8, 8, 1, 'Expresa ideas y emociones mediante diferentes técnicas y materiales artísticos.', 'si'),
(9, 9, 1, 'Desarrolla la sensibilidad artística y la expresión a través del lenguaje musical.', 'si'),
(10, 10, 1, 'Expresa sentimientos e ideas a través del movimiento corporal y la danza.', 'si'),
(11, 11, 1, 'Desarrolla la creatividad y la expresión a través de la dramatización y el teatro.', 'si'),
(12, 12, 1, 'Utiliza herramientas tecnológicas de manera responsable para el aprendizaje y la comunicación.', 'si'),
(13, 106, 1, 'Analiza procesos históricos y geográficos para comprender la realidad social actual.', 'si');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `componentes_aprendizaje`
--

CREATE TABLE `componentes_aprendizaje` (
  `id_componente` int(11) NOT NULL,
  `fk_area` int(11) NOT NULL,
  `nombre_componente` varchar(100) NOT NULL,
  `especialista` varchar(50) NOT NULL,
  `evalua` enum('si','no') NOT NULL,
  `estado_componente` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `componentes_aprendizaje`
--

INSERT INTO `componentes_aprendizaje` (`id_componente`, `fk_area`, `nombre_componente`, `especialista`, `evalua`, `estado_componente`) VALUES
(1, 1, 'Lengua y Literatura', 'Docente de aula', 'si', 'activo'),
(2, 1, 'Inglés y otros Idiomas', 'Especialista en idiomas', 'si', 'activo'),
(3, 2, 'Matemática', 'Docente de aula', 'si', 'activo'),
(4, 3, 'Ciencias Naturales', 'Docente de aula', 'si', 'activo'),
(5, 4, 'Ciencias Sociales', 'Docente de aula', 'si', 'activo'),
(6, 4, 'Formación Ciudadana', 'Docente de aula', 'si', 'activo'),
(7, 5, 'Educación Física', 'Especialista en educación física', 'si', 'activo'),
(8, 6, 'Artes Plásticas', 'Especialista en artes', 'si', 'activo'),
(9, 6, 'Música', 'Especialista en música', 'si', 'activo'),
(10, 6, 'Danza y Expresión Corporal', 'Especialista en danza', 'si', 'activo'),
(11, 6, 'Teatro y Dramatización', 'Especialista en teatro', 'si', 'activo'),
(12, 3, 'Tecnología y Computación', 'Especialista CBIT/Informática', 'si', 'activo'),
(106, 4, 'Ciencias Sociales', 'Docente de aula', 'si', 'activo');

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

--
-- Volcado de datos para la tabla `condiciones_salud`
--

INSERT INTO `condiciones_salud` (`id_condicion`, `fk_estudiante`, `fk_patologia`, `afectado`, `presente_en`, `tipo_familiar`, `fecha_deteccion`, `cronica`, `impedimento_fisico`, `observaciones`) VALUES
(3, 50, 1, 'estudiante', 'estudiante', NULL, '2020-05-10', 'si', 'no', 'Asma controlado con inhalador');

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

--
-- Volcado de datos para la tabla `consultas_medicas`
--

INSERT INTO `consultas_medicas` (`id_consulta`, `fk_estudiante`, `tipo_consulta`, `motivo`, `tiene_informe_medico`, `fecha_consulta`, `observaciones`) VALUES
(3, 48, 'psicologo', 'Evaluación inicial', 'si', '2025-09-10', 'Seguimiento mensual recomendado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenidos`
--

CREATE TABLE `contenidos` (
  `id_contenido` int(11) NOT NULL,
  `nombre_contenido` varchar(255) NOT NULL,
  `fk_componente` int(11) NOT NULL,
  `grado` enum('1','2','3','4','5','6','general') NOT NULL DEFAULT 'general',
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `contenidos`
--

INSERT INTO `contenidos` (`id_contenido`, `nombre_contenido`, `fk_componente`, `grado`, `descripcion`, `estado`) VALUES
(707, 'Comprensión Lectora', 1, 'general', 'Desarrollo de habilidades para comprender y analizar textos escritos', 'activo'),
(708, 'Expresión Escrita', 1, 'general', 'Desarrollo de habilidades para redactar textos coherentes y cohesionados', 'activo'),
(709, 'Vocabulario Básico en Inglés', 2, '1', 'Aprendizaje de vocabulario básico para comunicación inicial', 'activo'),
(710, 'Gramática Inglesa Básica', 2, 'general', 'Estructuras gramaticales fundamentales del inglés', 'activo'),
(711, 'Operaciones Aritméticas Básicas', 3, 'general', 'Fundamentos de las operaciones matemáticas básicas', 'activo'),
(712, 'Geometría Básica', 3, 'general', 'Conceptos fundamentales de formas y espacios', 'activo'),
(713, 'Los Seres Vivos', 4, 'general', 'Características y clasificación de los seres vivos', 'activo'),
(714, 'El Cuerpo Humano', 4, 'general', 'Estructura y funcionamiento del cuerpo humano', 'activo'),
(715, 'Historia y Geografía Local', 5, 'general', 'Conocimiento del entorno histórico y geográfico local', 'activo'),
(716, 'Valores y Convivencia Ciudadana', 6, 'general', 'Desarrollo de valores para la convivencia social', 'activo'),
(717, 'Desarrollo de Habilidades Motoras', 7, 'general', 'Desarrollo de capacidades físicas básicas', 'activo'),
(718, 'Expresión y Creación Plástica', 8, 'general', 'Desarrollo de la creatividad a través de las artes plásticas', 'activo'),
(719, 'Educación Musical Básica', 9, 'general', 'Introducción a los elementos fundamentales de la música', 'activo'),
(720, 'Expresión Corporal y Danza', 10, 'general', 'Desarrollo de la expresión a través del movimiento', 'activo'),
(721, 'Expresión Dramática y Teatro', 11, 'general', 'Desarrollo de habilidades de expresión a través del teatro', 'activo'),
(722, 'Alfabetización Digital Básica', 12, 'general', 'Introducción al uso de la tecnología y computadoras', 'activo'),
(723, 'Herramientas Ofimáticas Básicas', 12, 'general', 'Introducción a programas de oficina básicos', 'activo'),
(724, 'Lectura de Sílabas y Palabras Cortas', 1, '1', 'Iniciación a la lectura de sílabas y palabras simples', 'activo'),
(725, 'Números del 1 al 100', 3, '1', 'Reconocimiento y escritura de números del 1 al 100', 'activo'),
(726, 'El Entorno Natural Inmediato', 4, '1', 'Observación y descripción del entorno natural cercano', 'activo'),
(727, 'Análisis de Textos Literarios', 1, '6', 'Análisis y comprensión de textos literarios complejos', 'activo'),
(728, 'Álgebra Básica', 3, '6', 'Introducción a conceptos algebraicos elementales', 'activo'),
(729, 'Sistema Solar y Universo', 4, '6', 'Estudio del sistema solar y elementos del universo', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenido_indicador`
--

CREATE TABLE `contenido_indicador` (
  `id_contenido_indicador` int(11) NOT NULL,
  `fk_contenido` int(11) NOT NULL,
  `fk_indicador` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Volcado de datos para la tabla `documentos_academicos`
--

INSERT INTO `documentos_academicos` (`id_documento`, `fk_estudiante`, `tipo_documento`, `grado`, `entregado`, `observaciones`) VALUES
(3, 48, 'Partida Nacimiento', 'Primero', 'si', 'Original entregado');

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
(48, 86, '2025-30123456', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(49, 87, '2025-31234567', '2025-09-01', 'si', 2, 8, 'si', 'cesaria', 'si', 'si', 'activo'),
(50, 88, '2025-32345678', '2025-09-01', 'no', 3, 9, 'no', 'normal', 'si', 'si', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluar`
--

CREATE TABLE `evaluar` (
  `id_evaluar` int(11) NOT NULL,
  `fk_indicador` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_literal` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Volcado de datos para la tabla `grado_seccion`
--

INSERT INTO `grado_seccion` (`id_grado_seccion`, `grado`, `seccion`) VALUES
(1, '1', 'A'),
(2, '1', 'B'),
(3, '1', 'C'),
(4, '2', 'A'),
(5, '2', 'B'),
(6, '2', 'C'),
(7, '3', 'A'),
(8, '3', 'B'),
(9, '3', 'C'),
(10, '4', 'A'),
(11, '4', 'B'),
(12, '4', 'C'),
(13, '5', 'A'),
(14, '5', 'B'),
(15, '5', 'C'),
(16, '6', 'A'),
(17, '6', 'B'),
(18, '6', 'C');

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

--
-- Volcado de datos para la tabla `habilidades`
--

INSERT INTO `habilidades` (`id_habilidad`, `fk_representante`, `nombre_habilidad`) VALUES
(11, 10, 'Manejo de herramientas tecnológicas'),
(12, 10, 'Primeros auxilios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `fk_componente` int(11) NOT NULL,
  `fk_personal` int(11) NOT NULL,
  `grupo` enum('completo','subgrupo') NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `hora_inicio` float NOT NULL,
  `hora_fin` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imparte`
--

CREATE TABLE `imparte` (
  `id_imparte` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_personal` int(11) NOT NULL,
  `fk_momento` int(11) NOT NULL,
  `fk_componente` int(11) NOT NULL,
  `tipo_docente` enum('aula','Especialista') NOT NULL,
  `clases_totales` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imparte`
--

INSERT INTO `imparte` (`id_imparte`, `fk_aula`, `fk_personal`, `fk_momento`, `fk_componente`, `tipo_docente`, `clases_totales`) VALUES
(62, 1, 14, 11, 4, 'aula', NULL),
(63, 1, 14, 12, 4, 'aula', NULL),
(64, 1, 14, 13, 4, 'aula', NULL),
(65, 1, 14, 11, 5, 'aula', NULL),
(66, 1, 14, 12, 5, 'aula', NULL),
(67, 1, 14, 13, 5, 'aula', NULL),
(68, 1, 14, 11, 106, 'aula', NULL),
(69, 1, 14, 12, 106, 'aula', NULL),
(70, 1, 14, 13, 106, 'aula', NULL),
(71, 1, 14, 11, 6, 'aula', NULL),
(72, 1, 14, 12, 6, 'aula', NULL),
(73, 1, 14, 13, 6, 'aula', NULL),
(74, 1, 14, 11, 1, 'aula', NULL),
(75, 1, 14, 12, 1, 'aula', NULL),
(76, 1, 14, 13, 1, 'aula', NULL),
(77, 1, 14, 11, 3, 'aula', NULL),
(78, 1, 14, 12, 3, 'aula', NULL),
(79, 1, 14, 13, 3, 'aula', NULL),
(80, 2, 15, 11, 4, 'aula', NULL),
(81, 2, 15, 12, 4, 'aula', NULL),
(82, 2, 15, 13, 4, 'aula', NULL),
(83, 2, 15, 11, 5, 'aula', NULL),
(84, 2, 15, 12, 5, 'aula', NULL),
(85, 2, 15, 13, 5, 'aula', NULL),
(86, 2, 15, 11, 106, 'aula', NULL),
(87, 2, 15, 12, 106, 'aula', NULL),
(88, 2, 15, 13, 106, 'aula', NULL),
(89, 2, 15, 11, 6, 'aula', NULL),
(90, 2, 15, 12, 6, 'aula', NULL),
(91, 2, 15, 13, 6, 'aula', NULL),
(92, 2, 15, 11, 1, 'aula', NULL),
(93, 2, 15, 12, 1, 'aula', NULL),
(94, 2, 15, 13, 1, 'aula', NULL),
(95, 2, 15, 11, 3, 'aula', NULL),
(96, 2, 15, 12, 3, 'aula', NULL),
(97, 2, 15, 13, 3, 'aula', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores`
--

CREATE TABLE `indicadores` (
  `id_indicador` int(11) NOT NULL,
  `fk_competencia` int(11) NOT NULL,
  `nombre_indicador` varchar(255) NOT NULL,
  `aspecto` enum('ser','hacer','conocer','convivir') NOT NULL,
  `orden` int(3) NOT NULL,
  `ocultar` enum('si','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `indicadores`
--

INSERT INTO `indicadores` (`id_indicador`, `fk_competencia`, `nombre_indicador`, `aspecto`, `orden`, `ocultar`) VALUES
(1, 1, 'Muestra respeto por las ideas de los demás durante intercambios comunicativos.', 'ser', 1, 'no'),
(2, 1, 'Redacta textos cortos aplicando normas gramaticales básicas.', 'hacer', 2, 'no'),
(3, 1, 'Identifica la estructura básica de diferentes tipos de textos.', 'conocer', 3, 'no'),
(4, 1, 'Participa en discusiones grupales escuchando activamente a sus compañeros.', 'convivir', 4, 'no'),
(5, 2, 'Muestra interés por conocer otras culturas a través del idioma.', 'ser', 1, 'no'),
(6, 2, 'Utiliza vocabulario básico para saludar y presentarse en inglés.', 'hacer', 2, 'no'),
(7, 2, 'Reconoce palabras y frases comunes en inglés relacionadas con su entorno.', 'conocer', 3, 'no'),
(8, 2, 'Colabora en actividades grupales para practicar el idioma.', 'convivir', 4, 'no'),
(9, 3, 'Muestra perseverancia al resolver problemas matemáticos.', 'ser', 1, 'no'),
(10, 3, 'Aplica operaciones aritméticas básicas en situaciones cotidianas.', 'hacer', 2, 'no'),
(11, 3, 'Identifica formas geométricas en su entorno inmediato.', 'conocer', 3, 'no'),
(12, 3, 'Trabaja en equipo para resolver problemas matemáticos.', 'convivir', 4, 'no'),
(13, 4, 'Muestra curiosidad por explorar fenómenos naturales.', 'ser', 1, 'no'),
(14, 4, 'Realiza observaciones sencillas de seres vivos de su entorno.', 'hacer', 2, 'no'),
(15, 4, 'Describe las partes básicas del cuerpo humano y su función.', 'conocer', 3, 'no'),
(16, 4, 'Participa en actividades grupales de cuidado del medio ambiente.', 'convivir', 4, 'no'),
(17, 5, 'Valora el patrimonio cultural y natural de su localidad.', 'ser', 1, 'no'),
(18, 5, 'Elabora representaciones sencillas del espacio geográfico.', 'hacer', 2, 'no'),
(19, 5, 'Identifica características principales de su comunidad.', 'conocer', 3, 'no'),
(20, 5, 'Respeta las normas de convivencia en su entorno escolar y familiar.', 'convivir', 4, 'no'),
(21, 6, 'Demuestra honestidad en sus acciones cotidianas.', 'ser', 1, 'no'),
(22, 6, 'Cumple con sus responsabilidades escolares y familiares.', 'hacer', 2, 'no'),
(23, 6, 'Reconoce sus derechos y deberes como niño/a.', 'conocer', 3, 'no'),
(24, 6, 'Participa en actividades de grupo respetando las diferencias.', 'convivir', 4, 'no'),
(25, 7, 'Muestra entusiasmo por participar en actividades físicas.', 'ser', 1, 'no'),
(26, 7, 'Realiza ejercicios de coordinación y equilibrio básicos.', 'hacer', 2, 'no'),
(27, 7, 'Identifica los beneficios de la actividad física para la salud.', 'conocer', 3, 'no'),
(28, 7, 'Trabaja en equipo durante juegos y actividades deportivas.', 'convivir', 4, 'no'),
(29, 8, 'Expresa sus emociones a través del uso del color y la forma.', 'ser', 1, 'no'),
(30, 8, 'Utiliza diferentes materiales para crear composiciones artísticas.', 'hacer', 2, 'no'),
(31, 8, 'Reconoce elementos básicos del lenguaje visual.', 'conocer', 3, 'no'),
(32, 8, 'Comparte sus producciones artísticas con sus compañeros.', 'convivir', 4, 'no'),
(33, 9, 'Muestra sensibilidad al escuchar diferentes tipos de música.', 'ser', 1, 'no'),
(34, 9, 'Reproduce ritmos sencillos con percusión corporal o instrumentos.', 'hacer', 2, 'no'),
(35, 9, 'Identifica elementos básicos de la música (ritmo, melodía).', 'conocer', 3, 'no'),
(36, 9, 'Participa en actividades musicales grupales.', 'convivir', 4, 'no'),
(37, 10, 'Se expresa con confianza a través del movimiento corporal.', 'ser', 1, 'no'),
(38, 10, 'Realiza movimientos corporales coordinados siguiendo ritmos.', 'hacer', 2, 'no'),
(39, 10, 'Reconoce las posibilidades expresivas de su cuerpo.', 'conocer', 3, 'no'),
(40, 10, 'Colabora en la creación de coreografías grupales.', 'convivir', 4, 'no'),
(41, 11, 'Se desinhibe al representar personajes y situaciones.', 'ser', 1, 'no'),
(42, 11, 'Improvisa escenas cortas a partir de consignas dadas.', 'hacer', 2, 'no'),
(43, 11, 'Reconoce elementos básicos de una obra teatral.', 'conocer', 3, 'no'),
(44, 11, 'Trabaja en equipo para la preparación de una dramatización.', 'convivir', 4, 'no'),
(45, 12, 'Muestra responsabilidad en el uso de equipos tecnológicos.', 'ser', 1, 'no'),
(46, 12, 'Utiliza programas básicos para crear documentos digitales.', 'hacer', 2, 'no'),
(47, 12, 'Identifica las partes principales de una computadora.', 'conocer', 3, 'no'),
(48, 12, 'Comparte información digital de manera respetuosa.', 'convivir', 4, 'no'),
(49, 13, 'Valora la diversidad cultural de su país.', 'ser', 1, 'no'),
(50, 13, 'Elabora líneas de tiempo sencillas con hechos históricos.', 'hacer', 2, 'no'),
(51, 13, 'Describe características geográficas de su región.', 'conocer', 3, 'no'),
(52, 13, 'Participa en actividades que promueven la identidad nacional.', 'convivir', 4, 'no');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_inscripcion` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `fk_representante` int(11) DEFAULT NULL,
  `fk_personal` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
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
  `motivo_retiro` varchar(255) DEFAULT NULL,
  `tipo_vivienda` varchar(60) NOT NULL,
  `zona_vivienda` varchar(60) NOT NULL,
  `tenencia_viviencia` varchar(60) NOT NULL,
  `ingreso_familiar` float NOT NULL,
  `miembros_familia` int(2) NOT NULL,
  `tareas_comunitarias` enum('si','no') NOT NULL,
  `participar_comite` enum('si','no') NOT NULL,
  `detalles_participacion` varchar(60) NOT NULL,
  `tipo_inscripcion` enum('regular','nuevo_ingreso','traslado','educado_en_casa') NOT NULL DEFAULT 'regular'
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

--
-- Volcado de datos para la tabla `lista_alergias`
--

INSERT INTO `lista_alergias` (`id_lista_alergia`, `fk_alergia`, `fk_estudiante`) VALUES
(5, 1, 48),
(6, 5, 48);

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
-- Estructura de tabla para la tabla `momentos`
--

CREATE TABLE `momentos` (
  `id_momento` int(11) NOT NULL,
  `fk_anio_escolar` int(11) NOT NULL,
  `nombre_momento` enum('1','2','3') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado_momento` enum('activo','finalizado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `momentos`
--

INSERT INTO `momentos` (`id_momento`, `fk_anio_escolar`, `nombre_momento`, `fecha_inicio`, `fecha_fin`, `estado_momento`) VALUES
(11, 1, '1', '2025-09-01', '2025-12-20', 'activo'),
(12, 1, '2', '2026-01-10', '2026-03-29', 'activo'),
(13, 1, '3', '2026-04-12', '2026-07-20', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

CREATE TABLE `parentesco` (
  `id_parentesco` int(11) NOT NULL,
  `fk_representante` int(11) NOT NULL,
  `fk_estudiante` int(11) NOT NULL,
  `tipo_parentesco` enum('madre','padre','abuelo','tio','hermano','otro','abuela','hermana','tia') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parentesco`
--

INSERT INTO `parentesco` (`id_parentesco`, `fk_representante`, `fk_estudiante`, `tipo_parentesco`) VALUES
(26, 10, 48, 'padre'),
(27, 11, 48, 'madre'),
(28, 10, 49, 'padre'),
(29, 11, 49, 'madre'),
(30, 12, 50, 'abuelo');

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
(14, 89, 1, '2020-09-01', 'Licenciatura en Educación', 44, NULL, 'Católica', 2, 0, 'activo', 1, 'DOC-001'),
(15, 90, 4, '2015-09-01', 'Maestría en Matemáticas', 40, NULL, 'Sin preferencia', 1, 1, 'activo', 2, 'DOC-002'),
(16, 91, 5, '2018-09-01', 'Licenciatura en Educación Física', 36, NULL, 'Cristiana', 0, 0, 'activo', 15, 'ESP-001');

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
(35, 'Adriana', 'Lucía', 'Yépez', 'Chacón', '2006-10-17', 'F', '50050607', 'Venezolana', 'Carrera 5, Edif. Amarillo', '04245005060', '02812109875', 'adriana.yepez@email.com', 'estudiante', 'O-', 'activo'),
(86, 'Juan', 'Carlos', 'Pérez', 'González', '2010-05-15', 'M', '30123456', 'Venezolana', 'Av. Principal, Los Rosales, Caracas', '04141234567', NULL, 'juan.perez.est@email.com', 'estudiante', 'O+', 'activo'),
(87, 'María', 'Gabriela', 'Rodríguez', 'López', '2011-08-22', 'F', '31234567', 'Venezolana', 'Calle 12, El Valle, Caracas', '04147654321', NULL, 'maria.rodriguez.est@email.com', 'estudiante', 'A+', 'activo'),
(88, 'Carlos', 'Andrés', 'García', 'Martínez', '2012-03-10', 'M', '32345678', 'Venezolana', 'Urb. Las Acacias, Calle 5, Casa 12, Caracas', '04241122334', NULL, 'carlos.garcia.est@email.com', 'estudiante', 'B+', 'activo'),
(89, 'Ana', 'María', 'López', 'Pérez', '1985-08-20', 'F', '43456789', 'Venezolana', 'Urb. El Paraíso, Calle 5, Casa 10, Caracas', '04247654321', NULL, 'ana.lopez.doc@email.com', 'personal', 'A+', 'activo'),
(90, 'Luis', 'Alberto', 'González', 'Ramírez', '1978-11-15', 'M', '44567890', 'Venezolana', 'Av. Bolívar, Edif. Las Torres, Apto 5B, Caracas', '04149876543', NULL, 'luis.gonzalez.doc@email.com', 'personal', 'O+', 'activo'),
(91, 'María', 'Fernanda', 'Hernández', 'Castro', '1990-04-25', 'F', '45678901', 'Venezolana', 'Calle Los Manguitos, Quinta Luz, Caracas', '04245678901', NULL, 'maria.hernandez.doc@email.com', 'personal', 'AB+', 'activo'),
(92, 'Pedro', 'José', 'Pérez', 'González', '1975-03-10', 'M', '56789012', 'Venezolana', 'Av. Principal, Los Rosales, Caracas', '04141112233', NULL, 'pedro.perez.rep@email.com', 'representante', 'B+', 'activo'),
(93, 'Laura', 'Beatriz', 'Rodríguez', 'López', '1978-07-18', 'F', '57890123', 'Venezolana', 'Calle 12, El Valle, Caracas', '04244455566', NULL, 'laura.rodriguez.rep@email.com', 'representante', 'A-', 'activo'),
(94, 'José', 'Gregorio', 'García', 'Pérez', '1950-12-05', 'M', '58901234', 'Venezolana', 'Urb. Las Acacias, Calle 5, Casa 12, Caracas', '04167788899', NULL, 'jose.garcia.rep@email.com', 'representante', 'O+', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificaciones`
--

CREATE TABLE `planificaciones` (
  `id_planificacion` int(11) NOT NULL,
  `fk_personal` int(11) NOT NULL,
  `fk_aula` int(11) NOT NULL,
  `fk_componente` int(11) NOT NULL,
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
  `fk_estudiante` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_competencias`
--

CREATE TABLE `plan_competencias` (
  `id_plan_com` int(11) NOT NULL,
  `fk_competencias` int(11) NOT NULL,
  `fk_planificacion` int(11) NOT NULL
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

--
-- Volcado de datos para la tabla `representantes`
--

INSERT INTO `representantes` (`id_representante`, `fk_persona`, `oficio`, `nivel_educativo`, `profesion`, `lugar_trabajo`) VALUES
(10, 92, 'Ingeniero', 'Licenciatura', 'Ingeniero de Sistemas', 'Empresa Tecnológica XYZ'),
(11, 93, 'Médico', 'Doctorado', 'Pediatra', 'Hospital Central'),
(12, 94, 'Pensionado', 'Bachiller', 'Contador (Jubilado)', 'Casa');

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
(37, 1, '1cc82aa84d35881e01ade80f395eff422684bb52a484cb83edb0f5c20b0b12f1', '2025-12-10', '2025-12-11');

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
(59, 707, 'Identificación de ideas principales y secundarias', 'activo'),
(60, 707, 'Inferencia y deducción de información implícita', 'activo'),
(61, 707, 'Análisis de estructura textual', 'activo'),
(62, 707, 'Comprensión de vocabulario en contexto', 'activo'),
(63, 708, 'Redacción de párrafos coherentes', 'activo'),
(64, 708, 'Uso adecuado de signos de puntuación', 'activo'),
(65, 708, 'Cohesión y coherencia textual', 'activo'),
(66, 708, 'Diferentes tipos de textos (narrativo, descriptivo, argumentativo)', 'activo'),
(67, 709, 'Saludos y presentaciones', 'activo'),
(68, 709, 'Números y colores', 'activo'),
(69, 709, 'Familia y partes del cuerpo', 'activo'),
(70, 709, 'Animales y objetos comunes', 'activo'),
(71, 710, 'Verbo To Be (ser/estar)', 'activo'),
(72, 710, 'Presente simple', 'activo'),
(73, 710, 'Pronombres personales y posesivos', 'activo'),
(74, 710, 'Artículos definidos e indefinidos', 'activo'),
(75, 711, 'Suma y resta', 'activo'),
(76, 711, 'Multiplicación y división', 'activo'),
(77, 711, 'Propiedades de las operaciones', 'activo'),
(78, 711, 'Resolución de problemas aritméticos', 'activo'),
(79, 712, 'Figuras geométricas planas', 'activo'),
(80, 712, 'Cuerpos geométricos', 'activo'),
(81, 712, 'Perímetro y área', 'activo'),
(82, 712, 'Sistema de coordenadas básico', 'activo'),
(83, 713, 'Características de los seres vivos', 'activo'),
(84, 713, 'Clasificación de animales y plantas', 'activo'),
(85, 713, 'Ecosistemas y hábitats', 'activo'),
(86, 713, 'Cadena alimenticia', 'activo'),
(87, 714, 'Sistemas del cuerpo humano', 'activo'),
(88, 714, 'Órganos y sus funciones', 'activo'),
(89, 714, 'Cuidado de la salud', 'activo'),
(90, 714, 'Nutrición y alimentación saludable', 'activo'),
(91, 715, 'Fundación de la localidad', 'activo'),
(92, 715, 'Personajes históricos locales', 'activo'),
(93, 715, 'Geografía física del entorno', 'activo'),
(94, 715, 'Tradiciones y costumbres', 'activo'),
(95, 716, 'Respeto y tolerancia', 'activo'),
(96, 716, 'Responsabilidad y honestidad', 'activo'),
(97, 716, 'Participación ciudadana', 'activo'),
(98, 716, 'Derechos y deberes', 'activo'),
(99, 717, 'Coordinación y equilibrio', 'activo'),
(100, 717, 'Fuerza y resistencia', 'activo'),
(101, 717, 'Flexibilidad y agilidad', 'activo'),
(102, 717, 'Juegos predeportivos', 'activo'),
(103, 718, 'Técnicas de dibujo básico', 'activo'),
(104, 718, 'Uso del color y la forma', 'activo'),
(105, 718, 'Modelado con diferentes materiales', 'activo'),
(106, 718, 'Composición y diseño', 'activo'),
(107, 719, 'Ritmo y percusión corporal', 'activo'),
(108, 719, 'Melodía y entonación', 'activo'),
(109, 719, 'Instrumentos musicales básicos', 'activo'),
(110, 719, 'Canto y expresión vocal', 'activo'),
(111, 720, 'Movimiento y espacio', 'activo'),
(112, 720, 'Coordinación rítmica', 'activo'),
(113, 720, 'Juegos de expresión corporal', 'activo'),
(114, 720, 'Coreografías básicas', 'activo'),
(115, 721, 'Juegos dramáticos', 'activo'),
(116, 721, 'Improvisación teatral', 'activo'),
(117, 721, 'Creación de personajes', 'activo'),
(118, 721, 'Representación de situaciones', 'activo'),
(119, 722, 'Partes de la computadora', 'activo'),
(120, 722, 'Uso básico del teclado y mouse', 'activo'),
(121, 722, 'Programas educativos', 'activo'),
(122, 722, 'Navegación segura en internet', 'activo'),
(123, 723, 'Procesador de texto básico', 'activo'),
(124, 723, 'Presentaciones digitales simples', 'activo'),
(125, 723, 'Hojas de cálculo elementales', 'activo'),
(126, 723, 'Creación de gráficos sencillos', 'activo'),
(127, 722, 'Vocales y consonantes básicas', 'activo'),
(128, 722, 'Formación de sílabas simples', 'activo'),
(129, 723, 'Conteo y agrupación de objetos', 'activo'),
(130, 723, 'Relación número-cantidad', 'activo'),
(131, 724, 'Animales y plantas del entorno', 'activo'),
(132, 724, 'Estaciones del año y clima', 'activo'),
(133, 725, 'Géneros literarios', 'activo'),
(134, 725, 'Figuras literarias básicas', 'activo'),
(135, 726, 'Expresiones algebraicas simples', 'activo'),
(136, 726, 'Ecuaciones de primer grado', 'activo'),
(137, 727, 'Planetas del sistema solar', 'activo'),
(138, 727, 'Movimientos de la Tierra', 'activo');

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
-- Volcado de datos para la tabla `vacunas_estudiante`
--

INSERT INTO `vacunas_estudiante` (`id_vacuna_estudiante`, `fk_vacuna`, `fk_estudiante`, `fecha_aplicacion`, `refuerzos`) VALUES
(5, 1, 49, '2011-09-15', 1),
(6, 3, 49, '2011-10-20', 3);

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
-- Indices de la tabla `aprobo`
--
ALTER TABLE `aprobo`
  ADD PRIMARY KEY (`id_aprobo`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_literal` (`fk_literal`);

--
-- Indices de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  ADD PRIMARY KEY (`id_area_aprendizaje`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_componente` (`fk_componente`);

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
  ADD KEY `fk_grado_seccion` (`fk_grado_seccion`);

--
-- Indices de la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
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
  ADD KEY `id_planificacion` (`fk_componente`);

--
-- Indices de la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  ADD PRIMARY KEY (`id_componente`),
  ADD KEY `fk_area` (`fk_area`);

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
  ADD KEY `fk_componente` (`fk_componente`);

--
-- Indices de la tabla `contenido_indicador`
--
ALTER TABLE `contenido_indicador`
  ADD PRIMARY KEY (`id_contenido_indicador`),
  ADD KEY `fk_contenido` (`fk_contenido`),
  ADD KEY `fk_indicador` (`fk_indicador`);

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
-- Indices de la tabla `evaluar`
--
ALTER TABLE `evaluar`
  ADD PRIMARY KEY (`id_evaluar`),
  ADD KEY `fk_indicador` (`fk_indicador`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_literal` (`fk_literal`);

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
  ADD KEY `fk_personal` (`fk_personal`),
  ADD KEY `fk_componente` (`fk_componente`);

--
-- Indices de la tabla `imparte`
--
ALTER TABLE `imparte`
  ADD PRIMARY KEY (`id_imparte`),
  ADD KEY `fk_momento` (`fk_momento`),
  ADD KEY `fk_componente` (`fk_componente`),
  ADD KEY `fk_personal` (`fk_personal`),
  ADD KEY `fk_aula` (`fk_aula`);

--
-- Indices de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD PRIMARY KEY (`id_indicador`),
  ADD KEY `fk_competencia` (`fk_competencia`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `fk_personal` (`fk_personal`),
  ADD KEY `fk_representante` (`fk_representante`),
  ADD KEY `fk_estudiante` (`fk_estudiante`),
  ADD KEY `fk_aula` (`fk_aula`);

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
-- Indices de la tabla `momentos`
--
ALTER TABLE `momentos`
  ADD PRIMARY KEY (`id_momento`),
  ADD KEY `fk_anio_escolar` (`fk_anio_escolar`);

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
  ADD KEY `fk_aula` (`fk_aula`),
  ADD KEY `fk_componente` (`fk_componente`);

--
-- Indices de la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  ADD PRIMARY KEY (`id_planificaciones_individuales`),
  ADD KEY `fk_planificacion` (`fk_planificacion`),
  ADD KEY `fk_estudiante` (`fk_estudiante`);

--
-- Indices de la tabla `plan_competencias`
--
ALTER TABLE `plan_competencias`
  ADD PRIMARY KEY (`id_plan_com`),
  ADD KEY `fk_competencias` (`fk_competencias`),
  ADD KEY `fk_planificacion` (`fk_planificacion`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id_preguntas`),
  ADD KEY `preguntas_ibfk_1` (`fk_usuario`);

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
-- Indices de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`fk_usuario`);

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
  MODIFY `id_anio_escolar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `aprobo`
--
ALTER TABLE `aprobo`
  MODIFY `id_aprobo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  MODIFY `id_area_aprendizaje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

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
  MODIFY `id_aula` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
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
  MODIFY `id_competencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  MODIFY `id_componente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT de la tabla `condiciones_salud`
--
ALTER TABLE `condiciones_salud`
  MODIFY `id_condicion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `consultas_medicas`
--
ALTER TABLE `consultas_medicas`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `contenidos`
--
ALTER TABLE `contenidos`
  MODIFY `id_contenido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=731;

--
-- AUTO_INCREMENT de la tabla `contenido_indicador`
--
ALTER TABLE `contenido_indicador`
  MODIFY `id_contenido_indicador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `documentos_academicos`
--
ALTER TABLE `documentos_academicos`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `evaluar`
--
ALTER TABLE `evaluar`
  MODIFY `id_evaluar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `funcion_personal`
--
ALTER TABLE `funcion_personal`
  MODIFY `id_funcion_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `grado_seccion`
--
ALTER TABLE `grado_seccion`
  MODIFY `id_grado_seccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `grupos_estudiantiles`
--
ALTER TABLE `grupos_estudiantiles`
  MODIFY `id_grupos_estudiantiles` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `habilidades`
--
ALTER TABLE `habilidades`
  MODIFY `id_habilidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imparte`
--
ALTER TABLE `imparte`
  MODIFY `id_imparte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  MODIFY `id_indicador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  MODIFY `id_lista_alergia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `literal`
--
ALTER TABLE `literal`
  MODIFY `id_literal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `momentos`
--
ALTER TABLE `momentos`
  MODIFY `id_momento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

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
-- AUTO_INCREMENT de la tabla `plan_competencias`
--
ALTER TABLE `plan_competencias`
  MODIFY `id_plan_com` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id_preguntas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `representantes`
--
ALTER TABLE `representantes`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `respaldos`
--
ALTER TABLE `respaldos`
  MODIFY `id_respaldos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `vacunas_estudiante`
--
ALTER TABLE `vacunas_estudiante`
  MODIFY `id_vacuna_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aprobo`
--
ALTER TABLE `aprobo`
  ADD CONSTRAINT `aprobo_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `aprobo_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `aprobo_ibfk_3` FOREIGN KEY (`fk_literal`) REFERENCES `literal` (`id_literal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`fk_momento`) REFERENCES `momentos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asistencia_ibfk_3` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Filtros para la tabla `bloqueos`
--
ALTER TABLE `bloqueos`
  ADD CONSTRAINT `bloqueos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  ADD CONSTRAINT `componentes_aprendizaje_ibfk_1` FOREIGN KEY (`fk_area`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `contenidos_ibfk_1` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `contenido_indicador`
--
ALTER TABLE `contenido_indicador`
  ADD CONSTRAINT `contenido_indicador_ibfk_1` FOREIGN KEY (`fk_indicador`) REFERENCES `indicadores` (`id_indicador`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contenido_indicador_ibfk_2` FOREIGN KEY (`fk_contenido`) REFERENCES `contenidos` (`id_contenido`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `documentos_academicos`
--
ALTER TABLE `documentos_academicos`
  ADD CONSTRAINT `documentos_academicos_ibfk_1` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `evaluar`
--
ALTER TABLE `evaluar`
  ADD CONSTRAINT `evaluar_ibfk_1` FOREIGN KEY (`fk_indicador`) REFERENCES `indicadores` (`id_indicador`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `evaluar_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `evaluar_ibfk_3` FOREIGN KEY (`fk_literal`) REFERENCES `literal` (`id_literal`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `horarios_ibfk_3` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_4` FOREIGN KEY (`fk_momento`) REFERENCES `momentos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_5` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `imparte`
--
ALTER TABLE `imparte`
  ADD CONSTRAINT `imparte_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imparte_ibfk_2` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imparte_ibfk_4` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imparte_ibfk_5` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD CONSTRAINT `indicadores_ibfk_1` FOREIGN KEY (`fk_competencia`) REFERENCES `competencias` (`id_competencia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`fk_representante`) REFERENCES `representantes` (`id_representante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_3` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_4` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  ADD CONSTRAINT `lista_alergias_ibfk_1` FOREIGN KEY (`fk_alergia`) REFERENCES `alergias` (`id_alergia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lista_alergias_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `planificaciones_ibfk_1` FOREIGN KEY (`fk_momento`) REFERENCES `momentos` (`id_momento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_2` FOREIGN KEY (`fk_personal`) REFERENCES `personal` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_4` FOREIGN KEY (`fk_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_ibfk_5` FOREIGN KEY (`fk_componente`) REFERENCES `componentes_aprendizaje` (`id_componente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  ADD CONSTRAINT `planificaciones_individuales_ibfk_1` FOREIGN KEY (`fk_planificacion`) REFERENCES `planificaciones` (`id_planificacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `planificaciones_individuales_ibfk_2` FOREIGN KEY (`fk_estudiante`) REFERENCES `inscripciones` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_competencias`
--
ALTER TABLE `plan_competencias`
  ADD CONSTRAINT `plan_competencias_ibfk_1` FOREIGN KEY (`fk_competencias`) REFERENCES `competencias` (`id_competencia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plan_competencias_ibfk_2` FOREIGN KEY (`fk_planificacion`) REFERENCES `planificaciones` (`id_planificacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD CONSTRAINT `preguntas_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `representantes`
--
ALTER TABLE `representantes`
  ADD CONSTRAINT `representantes_ibfk_1` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `respaldos`
--
ALTER TABLE `respaldos`
  ADD CONSTRAINT `respaldos_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD CONSTRAINT `sesiones_usuario_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

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
