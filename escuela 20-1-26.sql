-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-01-2026 a las 04:12:49
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
(1, '2025-09-01', '2026-07-20', '2026-05-13', 'activo');

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
(8, 1, 3, 37, 'activo');

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

--
-- Volcado de datos para la tabla `bloqueos`
--

INSERT INTO `bloqueos` (`id_bloqueo`, `fk_usuario`, `intentos`, `fecha_desbloqueo`, `bloqueos_seguidos`, `fecha_ultimo_bloqueo`, `tipo_bloqueo`) VALUES
(4, 43, 0, '2026-01-12 03:39:28', 0, '2026-01-12 03:39:28', 'preguntas_de_seguridad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bloqueos_ip`
--

CREATE TABLE `bloqueos_ip` (
  `id_bloqueo_ip` int(11) NOT NULL,
  `ip_hash` char(64) NOT NULL,
  `intentos` int(3) NOT NULL,
  `fecha_desbloqueo` datetime NOT NULL,
  `bloqueos_seguidos` int(3) NOT NULL,
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
  `tipo` enum('Docente de aula','Administrativo','Obrero','Docente especialista','Docente de Cultura') NOT NULL DEFAULT 'Docente de aula',
  `codigo` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id_cargo`, `nombre_cargo`, `tipo`, `codigo`) VALUES
(1, 'Docente de Aula', 'Docente de aula', 'DOC-AULA-001'),
(2, 'Subdirector', 'Administrativo', 'SUB-001'),
(3, 'Coordinador', 'Administrativo', 'COORD-001'),
(4, 'Secretario', 'Administrativo', 'SEC-001'),
(5, 'Obrero', 'Obrero', 'OBR-001'),
(6, 'Administrativo', 'Administrativo', 'ADM-001'),
(7, 'CBIT', 'Docente especialista', 'CBIT-001'),
(8, 'CNAE', 'Docente especialista', 'CNAE-001'),
(9, 'UPE', 'Administrativo', 'UPE-001'),
(10, 'Director', 'Docente de aula', 'DIR-001'),
(11, 'Psicólogo', 'Administrativo', 'PSI-001'),
(12, 'Enfermero', 'Administrativo', 'ENF-001'),
(13, 'Bibliotecario', 'Administrativo', 'BIB-001'),
(14, 'Coordinador Pedagógico', 'Administrativo', 'CP-001');

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
(13, 106, 1, 'Analiza procesos históricos y geográficos para comprender la realidad social actual.', 'si'),
(14, 1, 1, 'Comprende y produce textos orales y escritos en diversos contextos comunicativos.', 'si'),
(15, 2, 1, 'Se comunica en inglés en situaciones cotidianas y escolares.', 'si'),
(16, 3, 1, 'Resuelve problemas matemáticos aplicando operaciones básicas y razonamiento lógico.', 'si'),
(17, 4, 1, 'Investiga y comprende fenómenos naturales y su relación con el entorno.', 'si'),
(18, 5, 1, 'Analiza la realidad social y geográfica de su localidad y país.', 'si'),
(19, 6, 1, 'Practica valores y actitudes para la convivencia democrática y la ciudadanía.', 'si'),
(20, 7, 1, 'Desarrolla habilidades motrices y hábitos de vida saludable a través de la actividad física.', 'si'),
(21, 8, 1, 'Crea y aprecia manifestaciones artísticas mediante el uso de diversas técnicas y materiales.', 'si'),
(22, 9, 1, 'Expresa y crea a través del lenguaje musical, reconociendo diferentes ritmos y melodías.', 'si'),
(23, 10, 1, 'Utiliza el cuerpo y el movimiento para expresar ideas y emociones en danzas y coreografías.', 'si'),
(24, 11, 1, 'Representa y crea historias a través del teatro y la dramatización.', 'si'),
(25, 12, 1, 'Usa herramientas tecnológicas de manera responsable para el aprendizaje y la comunicación.', 'si'),
(26, 106, 1, 'Analiza procesos históricos y geográficos para comprender la realidad social actual.', 'si'),
(27, 109, 1, 'Aplica conocimientos tecnológicos en la resolución de problemas cotidianos.', 'si'),
(28, 1, 1, 'Desarrolla la capacidad de argumentación y crítica en la producción de textos.', 'si'),
(29, 2, 1, 'Amplía el vocabulario en inglés y lo utiliza en contextos reales.', 'si'),
(30, 3, 1, 'Aplica conceptos matemáticos en la resolución de problemas de la vida diaria.', 'si'),
(31, 4, 1, 'Promueve el cuidado del medio ambiente a través de acciones concretas.', 'si'),
(32, 5, 1, 'Valora el patrimonio cultural e histórico de su comunidad.', 'si'),
(33, 6, 1, 'Participa activamente en la vida democrática de su entorno escolar.', 'si'),
(34, 7, 1, 'Adopta hábitos de higiene y alimentación para una vida saludable.', 'si'),
(35, 8, 1, 'Experimenta con diferentes materiales y técnicas para crear obras artísticas.', 'si'),
(36, 9, 1, 'Disfruta y valora la música de diferentes géneros y culturas.', 'si'),
(37, 10, 1, 'Coordina movimientos corporales para expresar emociones e ideas.', 'si'),
(38, 11, 1, 'Trabaja en equipo para la creación y representación de obras teatrales.', 'si'),
(39, 12, 1, 'Utiliza software educativo para fortalecer sus aprendizajes.', 'si'),
(40, 106, 1, 'Identifica causas y consecuencias de hechos históricos relevantes.', 'si'),
(41, 109, 1, 'Diseña proyectos tecnológicos simples para mejorar su entorno.', 'si'),
(42, 1, 1, 'Reflexiona sobre el uso del lenguaje y su impacto en la comunicación.', 'si'),
(43, 2, 1, 'Intercambia información en inglés sobre temas de interés personal.', 'si');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `componentes_aprendizaje`
--

CREATE TABLE `componentes_aprendizaje` (
  `id_componente` int(11) NOT NULL,
  `fk_area` int(11) NOT NULL,
  `nombre_componente` varchar(100) NOT NULL,
  `especialista` enum('Docente de Aula','Docente especialista') NOT NULL DEFAULT 'Docente de Aula',
  `evalua` enum('si','no') NOT NULL,
  `grupo` enum('Completo','Sub Grupo') NOT NULL DEFAULT 'Completo',
  `estado_componente` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `componentes_aprendizaje`
--

INSERT INTO `componentes_aprendizaje` (`id_componente`, `fk_area`, `nombre_componente`, `especialista`, `evalua`, `grupo`, `estado_componente`) VALUES
(1, 1, 'Lengua y Literatura', 'Docente de Aula', 'si', 'Completo', 'activo'),
(2, 1, 'Inglés y otros Idiomas', 'Docente de Aula', 'si', 'Completo', 'activo'),
(3, 2, 'Matemática', 'Docente de Aula', 'si', 'Completo', 'activo'),
(4, 3, 'Ciencias Naturales', 'Docente de Aula', 'si', 'Completo', 'activo'),
(5, 4, 'Ciencias Sociales', 'Docente de Aula', 'si', 'Completo', 'activo'),
(6, 4, 'Formación Ciudadana', 'Docente de Aula', 'si', 'Completo', 'activo'),
(7, 5, 'Educación Física', 'Docente especialista', 'si', 'Completo', 'activo'),
(8, 6, 'Artes Plásticas', 'Docente especialista', 'si', 'Completo', 'activo'),
(9, 6, 'Música', 'Docente especialista', 'si', 'Completo', 'activo'),
(10, 6, 'Danza y Expresión Corporal', 'Docente especialista', 'si', 'Completo', 'activo'),
(11, 6, 'Teatro y Dramatización', 'Docente especialista', 'si', 'Completo', 'activo'),
(12, 3, 'Tecnología y Computación', 'Docente especialista', 'si', 'Completo', 'activo'),
(106, 4, 'Ciencias Sociales', 'Docente especialista', 'si', 'Completo', 'activo'),
(109, 1, 'Cbit', 'Docente especialista', 'no', 'Sub Grupo', 'activo');

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
(3, 50, 1, 'estudiante', 'estudiante', NULL, '2020-05-10', 'si', 'no', 'Asma controlado con inhalador'),
(4, 28, 1, 'estudiante', 'estudiante', NULL, '2022-03-15', 'si', 'no', 'Asma leve, controlado con inhalador'),
(5, 30, 6, 'estudiante', 'estudiante', NULL, '2023-01-20', 'si', 'no', 'TDAH, en tratamiento'),
(6, 32, 2, 'familiar', 'familiar', 'madre', '2018-05-10', 'si', 'no', 'Diabetes tipo 2 en la madre'),
(7, 34, 4, 'estudiante', 'estudiante', NULL, '2021-11-08', 'si', 'no', 'Epilepsia controlada con medicación'),
(8, 37, 5, 'estudiante', 'estudiante', NULL, '2022-09-14', 'si', 'no', 'Dermatitis atópica, cuidados especiales de piel'),
(9, 39, 3, 'familiar', 'familiar', 'padre', '2019-07-30', 'si', 'no', 'Hipertensión en el padre'),
(10, 42, 7, 'estudiante_y_familiar', 'estudiante', NULL, '2020-12-05', 'si', 'no', 'Trastorno del espectro autista'),
(11, 45, 8, 'estudiante', 'estudiante', NULL, '2021-04-18', 'si', 'si', 'Cardiopatía congénita, limitación para ejercicio intenso'),
(12, 47, 9, 'estudiante', 'estudiante', NULL, '2023-02-22', 'no', 'no', 'Anemia por deficiencia de hierro, en tratamiento'),
(13, 49, 10, 'estudiante', 'estudiante', NULL, '2022-06-10', 'si', 'no', 'Alergia alimentaria a frutos secos'),
(14, 52, 1, 'familiar', 'familiar', 'hermano', '2021-08-25', 'si', 'no', 'Asma en hermano menor'),
(15, 55, 6, 'estudiante', 'estudiante', NULL, '2023-03-12', 'si', 'no', 'TDAH, seguimiento por psicopedagogo'),
(16, 49, 5, 'estudiante', 'estudiante', NULL, '2020-03-15', 'si', 'no', 'Dermatitis leve, controlada con cremas'),
(17, 51, 9, 'estudiante', 'estudiante', NULL, '2021-07-10', 'si', 'no', 'Anemia ferropénica, suplementación con hierro'),
(18, 52, 4, 'familiar', 'familiar', 'padre', '2015-02-20', 'si', 'no', 'Epilepsia controlada con medicación'),
(19, 54, 10, 'estudiante_y_familiar', 'estudiante', 'madre', '2018-05-30', 'si', 'no', 'Alergia alimentaria compartida con la madre'),
(20, 56, 3, 'familiar', 'familiar', 'abuelo', '2010-11-05', 'si', 'si', 'Hipertensión arterial del abuelo paterno');

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
(3, 48, 'psicologo', 'Evaluación inicial', 'si', '2025-09-10', 'Seguimiento mensual recomendado'),
(4, 28, 'psicologo', 'Evaluación por problemas de atención', 'si', '2024-02-10', 'Se recomienda seguimiento mensual'),
(5, 30, 'neurologo', 'Control de epilepsia', 'si', '2024-01-15', 'Medicación ajustada correctamente'),
(6, 34, 'terapista_lenguaje', 'Retraso en el desarrollo del lenguaje', 'si', '2024-03-05', 'Mejoría notable, continuar terapia'),
(7, 39, 'psicopedagogo', 'Dificultades de aprendizaje', 'si', '2024-02-20', 'Necesita adaptación curricular'),
(8, 42, 'orientador', 'Orientación vocacional', 'no', '2024-01-30', 'Intereses definidos hacia áreas técnicas'),
(9, 47, 'psicologo', 'Ansiedad escolar', 'si', '2024-03-12', 'En tratamiento cognitivo-conductual'),
(10, 49, 'psicologo', 'Evaluación por comportamiento en el aula', 'si', '2025-10-15', 'Se recomienda seguimiento trimestral'),
(11, 51, 'terapista_lenguaje', 'Dificultades en pronunciación', 'si', '2025-09-20', 'Sesiones semanales recomendadas'),
(12, 53, 'orientador', 'Orientación vocacional temprana', 'no', '2025-10-05', 'Interés en áreas científicas identificado'),
(13, 55, 'neurologo', 'Evaluación por déficit de atención', 'si', '2025-08-15', 'Requiere evaluación complementaria');

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
(3, 48, 'Partida Nacimiento', 'Primero', 'si', 'Original entregado'),
(4, 28, 'Partida Nacimiento', 'Primero', 'si', 'Original entregado'),
(5, 28, 'Tarjeta Vacunación', 'Primero', 'si', 'Completa'),
(6, 30, 'Partida Nacimiento', 'Tercero', 'si', 'Copia legalizada'),
(7, 32, 'Carta Residencia', 'Quinto', 'si', 'Con sellos correspondientes'),
(8, 34, 'Constancia Act. Extracurricular', 'Segundo', 'no', 'Pendiente de entrega'),
(9, 39, 'Boleta', 'Cuarto', 'si', 'Año anterior'),
(10, 42, 'Certificado Aprendizaje', 'Sexto', 'si', 'Promovido'),
(11, 47, 'Constancia Prosecución', 'Quinto', 'si', 'Para trámite bancario');

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
(50, 88, '2025-32345678', '2025-09-01', 'no', 3, 9, 'no', 'normal', 'si', 'si', 'activo'),
(51, 95, '2025-33456789', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(52, 96, '2025-34567890', '2025-09-01', 'si', 2, 8, 'si', 'cesaria', 'si', 'si', 'activo'),
(53, 97, '2025-35678901', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(54, 98, '2025-36789012', '2025-09-01', 'no', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(55, 99, '2025-37890123', '2025-09-01', 'si', 3, 7, 'no', 'normal', 'si', 'no', 'activo'),
(56, 100, '2025-38901234', '2025-09-01', 'si', 1, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(57, 144, '2025-00000001', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(58, 145, '2025-00000002', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(59, 146, '2025-00000003', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(60, 147, '2025-00000004', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo'),
(61, 148, '2025-00000005', '2025-09-01', 'si', 1, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(62, 149, '2025-00000006', '2025-09-01', 'si', 2, 8, 'si', 'normal', 'si', 'si', 'activo'),
(63, 150, '2025-00000007', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(64, 151, '2025-00000008', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(65, 152, '2025-00000009', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(66, 153, '2025-00000010', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo'),
(67, 154, '2025-00000011', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(68, 155, '2025-00000012', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(69, 156, '2025-00000013', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(70, 157, '2025-00000014', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo'),
(71, 158, '2025-00000015', '2025-09-01', 'si', 1, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(72, 159, '2025-00000016', '2025-09-01', 'si', 2, 8, 'si', 'normal', 'si', 'si', 'activo'),
(73, 160, '2025-00000017', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(74, 161, '2025-00000018', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(75, 162, '2025-00000019', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(76, 163, '2025-00000020', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo'),
(77, 164, '2025-00000021', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(78, 165, '2025-00000022', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(79, 166, '2025-00000023', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(80, 167, '2025-00000024', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo'),
(81, 168, '2025-00000025', '2025-09-01', 'si', 1, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(82, 169, '2025-00000026', '2025-09-01', 'si', 2, 8, 'si', 'normal', 'si', 'si', 'activo'),
(83, 170, '2025-00000027', '2025-09-01', 'si', 1, 9, 'si', 'normal', 'si', 'si', 'activo'),
(84, 171, '2025-00000028', '2025-09-01', 'si', 2, 9, 'si', 'cesaria', 'si', 'si', 'activo'),
(85, 172, '2025-00000029', '2025-09-01', 'si', 1, 8, 'si', 'normal', 'si', 'si', 'activo'),
(86, 173, '2025-00000030', '2025-09-01', 'si', 2, 9, 'si', 'normal', 'si', 'si', 'activo');

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
(12, 10, 'Primeros auxilios'),
(13, 8, 'Primeros auxilios'),
(14, 8, 'Carpintería básica'),
(15, 9, 'Idiomas (inglés avanzado)'),
(16, 10, 'Contabilidad'),
(17, 11, 'Mediación de conflictos'),
(18, 12, 'Tutoría académica'),
(19, 13, 'Cuidado de pacientes'),
(20, 14, 'Dibujo técnico'),
(21, 15, 'Planificación financiera'),
(22, 16, 'Programación'),
(23, 16, 'Redes informáticas'),
(24, 17, 'Terapia cognitivo-conductual'),
(25, 11, 'Primeros auxilios avanzados'),
(26, 11, 'Conocimientos en nutrición infantil'),
(27, 12, 'Cuidado de niños'),
(28, 12, 'Manejo de situaciones de emergencia'),
(29, 13, 'Gestión administrativa'),
(30, 14, 'Planificación de proyectos'),
(31, 15, 'Mediación y resolución de conflictos');

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

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id_horario`, `fk_aula`, `fk_momento`, `fk_componente`, `fk_personal`, `grupo`, `dia_semana`, `hora_inicio`, `hora_fin`) VALUES
(4, 1, 11, 12, 18, 'completo', 'lunes', 7.66667, 8.33333),
(6, 1, 11, 109, 18, 'completo', 'lunes', 8.33333, 9);

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
(97, 2, 15, 13, 3, 'aula', NULL),
(98, 3, 17, 11, 4, 'aula', NULL),
(99, 3, 17, 12, 4, 'aula', NULL),
(100, 3, 17, 13, 4, 'aula', NULL),
(101, 3, 17, 11, 5, 'aula', NULL),
(102, 3, 17, 12, 5, 'aula', NULL),
(103, 3, 17, 13, 5, 'aula', NULL),
(104, 3, 17, 11, 106, 'aula', NULL),
(105, 3, 17, 12, 106, 'aula', NULL),
(106, 3, 17, 13, 106, 'aula', NULL),
(107, 3, 17, 11, 6, 'aula', NULL),
(108, 3, 17, 12, 6, 'aula', NULL),
(109, 3, 17, 13, 6, 'aula', NULL),
(110, 3, 17, 11, 1, 'aula', NULL),
(111, 3, 17, 12, 1, 'aula', NULL),
(112, 3, 17, 13, 1, 'aula', NULL),
(113, 3, 17, 11, 3, 'aula', NULL),
(114, 3, 17, 12, 3, 'aula', NULL),
(115, 3, 17, 13, 3, 'aula', NULL),
(116, 4, 21, 11, 4, 'aula', NULL),
(117, 4, 21, 12, 4, 'aula', NULL),
(118, 4, 21, 13, 4, 'aula', NULL),
(119, 4, 21, 11, 5, 'aula', NULL),
(120, 4, 21, 12, 5, 'aula', NULL),
(121, 4, 21, 13, 5, 'aula', NULL),
(122, 4, 21, 11, 106, 'aula', NULL),
(123, 4, 21, 12, 106, 'aula', NULL),
(124, 4, 21, 13, 106, 'aula', NULL),
(125, 4, 21, 11, 6, 'aula', NULL),
(126, 4, 21, 12, 6, 'aula', NULL),
(127, 4, 21, 13, 6, 'aula', NULL),
(128, 4, 21, 11, 1, 'aula', NULL),
(129, 4, 21, 12, 1, 'aula', NULL),
(130, 4, 21, 13, 1, 'aula', NULL),
(131, 4, 21, 11, 3, 'aula', NULL),
(132, 4, 21, 12, 3, 'aula', NULL),
(133, 4, 21, 13, 3, 'aula', NULL),
(134, 5, 35, 11, 4, 'aula', NULL),
(135, 5, 35, 12, 4, 'aula', NULL),
(136, 5, 35, 13, 4, 'aula', NULL),
(137, 5, 35, 11, 5, 'aula', NULL),
(138, 5, 35, 12, 5, 'aula', NULL),
(139, 5, 35, 13, 5, 'aula', NULL),
(140, 5, 35, 11, 106, 'aula', NULL),
(141, 5, 35, 12, 106, 'aula', NULL),
(142, 5, 35, 13, 106, 'aula', NULL),
(143, 5, 35, 11, 6, 'aula', NULL),
(144, 5, 35, 12, 6, 'aula', NULL),
(145, 5, 35, 13, 6, 'aula', NULL),
(146, 5, 35, 11, 1, 'aula', NULL),
(147, 5, 35, 12, 1, 'aula', NULL),
(148, 5, 35, 13, 1, 'aula', NULL),
(149, 5, 35, 11, 3, 'aula', NULL),
(150, 5, 35, 12, 3, 'aula', NULL),
(151, 5, 35, 13, 3, 'aula', NULL),
(152, 6, 38, 11, 4, 'aula', NULL),
(153, 6, 38, 12, 4, 'aula', NULL),
(154, 6, 38, 13, 4, 'aula', NULL),
(155, 6, 38, 11, 5, 'aula', NULL),
(156, 6, 38, 12, 5, 'aula', NULL),
(157, 6, 38, 13, 5, 'aula', NULL),
(158, 6, 38, 11, 106, 'aula', NULL),
(159, 6, 38, 12, 106, 'aula', NULL),
(160, 6, 38, 13, 106, 'aula', NULL),
(161, 6, 38, 11, 6, 'aula', NULL),
(162, 6, 38, 12, 6, 'aula', NULL),
(163, 6, 38, 13, 6, 'aula', NULL),
(164, 6, 38, 11, 1, 'aula', NULL),
(165, 6, 38, 12, 1, 'aula', NULL),
(166, 6, 38, 13, 1, 'aula', NULL),
(167, 6, 38, 11, 3, 'aula', NULL),
(168, 6, 38, 12, 3, 'aula', NULL),
(169, 6, 38, 13, 3, 'aula', NULL),
(170, 7, 30, 11, 4, 'aula', NULL),
(171, 7, 30, 12, 4, 'aula', NULL),
(172, 7, 30, 13, 4, 'aula', NULL),
(173, 7, 30, 11, 5, 'aula', NULL),
(174, 7, 30, 12, 5, 'aula', NULL),
(175, 7, 30, 13, 5, 'aula', NULL),
(176, 7, 30, 11, 106, 'aula', NULL),
(177, 7, 30, 12, 106, 'aula', NULL),
(178, 7, 30, 13, 106, 'aula', NULL),
(179, 7, 30, 11, 6, 'aula', NULL),
(180, 7, 30, 12, 6, 'aula', NULL),
(181, 7, 30, 13, 6, 'aula', NULL),
(182, 7, 30, 11, 1, 'aula', NULL),
(183, 7, 30, 12, 1, 'aula', NULL),
(184, 7, 30, 13, 1, 'aula', NULL),
(185, 7, 30, 11, 3, 'aula', NULL),
(186, 7, 30, 12, 3, 'aula', NULL),
(187, 7, 30, 13, 3, 'aula', NULL),
(188, 8, 39, 11, 4, 'aula', NULL),
(189, 8, 39, 12, 4, 'aula', NULL),
(190, 8, 39, 13, 4, 'aula', NULL),
(191, 8, 39, 11, 5, 'aula', NULL),
(192, 8, 39, 12, 5, 'aula', NULL),
(193, 8, 39, 13, 5, 'aula', NULL),
(194, 8, 39, 11, 106, 'aula', NULL),
(195, 8, 39, 12, 106, 'aula', NULL),
(196, 8, 39, 13, 106, 'aula', NULL),
(197, 8, 39, 11, 6, 'aula', NULL),
(198, 8, 39, 12, 6, 'aula', NULL),
(199, 8, 39, 13, 6, 'aula', NULL),
(200, 8, 39, 11, 1, 'aula', NULL),
(201, 8, 39, 12, 1, 'aula', NULL),
(202, 8, 39, 13, 1, 'aula', NULL),
(203, 8, 39, 11, 3, 'aula', NULL),
(204, 8, 39, 12, 3, 'aula', NULL),
(205, 8, 39, 13, 3, 'aula', NULL),
(206, 1, 1, 11, 10, 'Especialista', NULL),
(207, 1, 1, 12, 10, 'Especialista', NULL),
(208, 1, 1, 13, 10, 'Especialista', NULL),
(209, 1, 1, 11, 8, 'Especialista', NULL),
(210, 1, 1, 12, 8, 'Especialista', NULL),
(211, 1, 1, 13, 8, 'Especialista', NULL),
(212, 1, 18, 11, 9, 'Especialista', NULL),
(213, 1, 18, 12, 9, 'Especialista', NULL),
(214, 1, 18, 13, 9, 'Especialista', NULL),
(218, 1, 18, 11, 12, 'Especialista', NULL),
(219, 1, 18, 12, 12, 'Especialista', NULL),
(220, 1, 18, 13, 12, 'Especialista', NULL),
(223, 2, 40, 11, 7, 'Especialista', NULL),
(224, 7, 40, 11, 8, 'Especialista', NULL),
(225, 1, 18, 11, 109, 'Especialista', NULL);

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
(52, 13, 'Participa en actividades que promueven la identidad nacional.', 'convivir', 4, 'no'),
(53, 14, 'Muestra interés por la lectura y la escritura como herramientas de comunicación.', 'ser', 1, 'no'),
(54, 14, 'Produce textos orales y escritos coherentes según diferentes propósitos comunicativos.', 'hacer', 2, 'no'),
(55, 14, 'Identifica elementos gramaticales y estructurales de diferentes tipos de textos.', 'conocer', 3, 'no'),
(56, 14, 'Participa en discusiones grupales respetando turnos y opiniones diversas.', 'convivir', 4, 'no'),
(57, 15, 'Muestra apertura hacia el aprendizaje de una lengua extranjera.', 'ser', 1, 'no'),
(58, 15, 'Utiliza expresiones básicas en inglés para comunicarse en situaciones cotidianas.', 'hacer', 2, 'no'),
(59, 15, 'Reconoce vocabulario y estructuras gramaticales básicas del inglés.', 'conocer', 3, 'no'),
(60, 15, 'Colabora en actividades de intercambio lingüístico con compañeros.', 'convivir', 4, 'no'),
(61, 16, 'Manifiesta perseverancia al enfrentar desafíos matemáticos.', 'ser', 1, 'no'),
(62, 16, 'Aplica operaciones matemáticas en la resolución de problemas contextualizados.', 'hacer', 2, 'no'),
(63, 16, 'Comprende conceptos matemáticos fundamentales y sus relaciones.', 'conocer', 3, 'no'),
(64, 16, 'Trabaja colaborativamente en la solución de problemas matemáticos.', 'convivir', 4, 'no'),
(65, 17, 'Demuestra curiosidad científica ante fenómenos naturales.', 'ser', 1, 'no'),
(66, 17, 'Realiza observaciones y experimentos sencillos sobre fenómenos naturales.', 'hacer', 2, 'no'),
(67, 17, 'Describe características y comportamientos de seres vivos y elementos naturales.', 'conocer', 3, 'no'),
(68, 17, 'Participa en proyectos grupales de investigación y conservación ambiental.', 'convivir', 4, 'no'),
(69, 18, 'Valora la diversidad cultural y social de su entorno.', 'ser', 1, 'no'),
(70, 18, 'Elabora representaciones gráficas de espacios geográficos y sociales.', 'hacer', 2, 'no'),
(71, 18, 'Identifica elementos constitutivos de la organización social y territorial.', 'conocer', 3, 'no'),
(72, 18, 'Respeta normas de convivencia en diferentes contextos sociales.', 'convivir', 4, 'no'),
(73, 19, 'Actúa con honestidad y responsabilidad en situaciones cotidianas.', 'ser', 1, 'no'),
(74, 19, 'Cumple con sus deberes y ejerce sus derechos de manera responsable.', 'hacer', 2, 'no'),
(75, 19, 'Reconoce principios y valores fundamentales de la ciudadanía.', 'conocer', 3, 'no'),
(76, 19, 'Participa en actividades democráticas dentro del aula y la escuela.', 'convivir', 4, 'no'),
(77, 20, 'Muestra disposición positiva hacia la actividad física y el deporte.', 'ser', 1, 'no'),
(78, 20, 'Ejecuta movimientos y ejercicios físicos con coordinación y equilibrio.', 'hacer', 2, 'no'),
(79, 20, 'Conoce los beneficios de la actividad física para la salud integral.', 'conocer', 3, 'no'),
(80, 20, 'Colabora en juegos y actividades deportivas respetando las reglas.', 'convivir', 4, 'no'),
(81, 21, 'Expresa emociones e ideas a través de creaciones artísticas.', 'ser', 1, 'no'),
(82, 21, 'Utiliza diversas técnicas y materiales para realizar producciones plásticas.', 'hacer', 2, 'no'),
(83, 21, 'Reconoce elementos del lenguaje visual y principios de composición.', 'conocer', 3, 'no'),
(84, 21, 'Comparte y valora las producciones artísticas propias y ajenas.', 'convivir', 4, 'no'),
(85, 22, 'Manifiesta sensibilidad y aprecio por expresiones musicales diversas.', 'ser', 1, 'no'),
(86, 22, 'Interpreta ritmos y melodías utilizando instrumentos o la voz.', 'hacer', 2, 'no'),
(87, 22, 'Identifica elementos constitutivos de la música (ritmo, melodía, armonía).', 'conocer', 3, 'no'),
(88, 22, 'Participa en actividades musicales grupales con coordinación.', 'convivir', 4, 'no'),
(89, 23, 'Se expresa con libertad y creatividad a través del movimiento corporal.', 'ser', 1, 'no'),
(90, 23, 'Realiza secuencias de movimiento y coreografías sencillas.', 'hacer', 2, 'no'),
(91, 23, 'Comprende las posibilidades expresivas del cuerpo en el espacio.', 'conocer', 3, 'no'),
(92, 23, 'Trabaja en equipo para crear composiciones dancísticas colectivas.', 'convivir', 4, 'no'),
(93, 24, 'Desarrolla confianza al representar personajes y situaciones.', 'ser', 1, 'no'),
(94, 24, 'Improvisa escenas teatrales a partir de consignas específicas.', 'hacer', 2, 'no'),
(95, 24, 'Identifica elementos fundamentales de la estructura dramática.', 'conocer', 3, 'no'),
(96, 24, 'Colabora en montajes teatrales respetando roles y contribuciones.', 'convivir', 4, 'no'),
(97, 25, 'Demuestra responsabilidad en el manejo de herramientas tecnológicas.', 'ser', 1, 'no'),
(98, 25, 'Utiliza programas informáticos para crear documentos y presentaciones.', 'hacer', 2, 'no'),
(99, 25, 'Reconoce componentes básicos de hardware y software.', 'conocer', 3, 'no'),
(100, 25, 'Comparte información digital de manera ética y respetuosa.', 'convivir', 4, 'no'),
(101, 26, 'Valora el patrimonio histórico y cultural de su nación.', 'ser', 1, 'no'),
(102, 26, 'Elabora líneas de tiempo y análisis de procesos históricos.', 'hacer', 2, 'no'),
(103, 26, 'Comprende interrelaciones entre fenómenos históricos y geográficos.', 'conocer', 3, 'no'),
(104, 26, 'Participa en actividades que fomentan la identidad nacional.', 'convivir', 4, 'no'),
(105, 27, 'Muestra interés por la aplicación práctica de la tecnología.', 'ser', 1, 'no'),
(106, 27, 'Aplica herramientas tecnológicas en la solución de problemas cotidianos.', 'hacer', 2, 'no'),
(107, 27, 'Comprende conceptos básicos de funcionamiento tecnológico.', 'conocer', 3, 'no'),
(108, 27, 'Trabaja colaborativamente en proyectos tecnológicos.', 'convivir', 4, 'no'),
(109, 28, 'Desarrolla pensamiento crítico a través del análisis textual.', 'ser', 1, 'no'),
(110, 28, 'Construye textos argumentativos con fundamentos sólidos.', 'hacer', 2, 'no'),
(111, 28, 'Analiza estructuras y recursos retóricos en diferentes textos.', 'conocer', 3, 'no'),
(112, 28, 'Debate temas de interés general respetando la diversidad de opiniones.', 'convivir', 4, 'no'),
(113, 29, 'Muestra confianza al comunicarse en inglés en diferentes contextos.', 'ser', 1, 'no'),
(114, 29, 'Amplía su vocabulario mediante la práctica constante del idioma.', 'hacer', 2, 'no'),
(115, 29, 'Domina estructuras gramaticales complejas del inglés.', 'conocer', 3, 'no'),
(116, 29, 'Participa en intercambios comunicativos fluidos en inglés.', 'convivir', 4, 'no'),
(117, 30, 'Desarrolla interés por la aplicación práctica de las matemáticas.', 'ser', 1, 'no'),
(118, 30, 'Resuelve problemas matemáticos relacionados con situaciones reales.', 'hacer', 2, 'no'),
(119, 30, 'Comprende conceptos matemáticos aplicables al contexto cotidiano.', 'conocer', 3, 'no'),
(120, 30, 'Colabora en la resolución de problemas matemáticos grupales.', 'convivir', 4, 'no'),
(121, 31, 'Manifiesta compromiso con la protección del medio ambiente.', 'ser', 1, 'no'),
(122, 31, 'Implementa acciones concretas de conservación ambiental.', 'hacer', 2, 'no'),
(123, 31, 'Comprende problemáticas ambientales y sus posibles soluciones.', 'conocer', 3, 'no'),
(124, 31, 'Participa en iniciativas colectivas de cuidado ambiental.', 'convivir', 4, 'no'),
(125, 32, 'Valora y respeta las manifestaciones culturales de su comunidad.', 'ser', 1, 'no'),
(126, 32, 'Investiga y documenta elementos del patrimonio cultural local.', 'hacer', 2, 'no'),
(127, 32, 'Conoce aspectos históricos y culturales de su localidad.', 'conocer', 3, 'no'),
(128, 32, 'Comparte y difunde el patrimonio cultural con otros.', 'convivir', 4, 'no'),
(129, 33, 'Muestra interés activo por la participación democrática.', 'ser', 1, 'no'),
(130, 33, 'Ejerce liderazgo y representación en instancias escolares.', 'hacer', 2, 'no'),
(131, 33, 'Comprende los mecanismos de participación democrática.', 'conocer', 3, 'no'),
(132, 33, 'Promueve la organización democrática en su entorno escolar.', 'convivir', 4, 'no'),
(133, 34, 'Adopta una actitud proactiva hacia el cuidado de su salud.', 'ser', 1, 'no'),
(134, 34, 'Practica hábitos de higiene y alimentación balanceada.', 'hacer', 2, 'no'),
(135, 34, 'Conoce principios básicos de nutrición y salud preventiva.', 'conocer', 3, 'no'),
(136, 34, 'Promueve estilos de vida saludable entre sus compañeros.', 'convivir', 4, 'no'),
(137, 35, 'Muestra apertura a la experimentación con diferentes medios artísticos.', 'ser', 1, 'no'),
(138, 35, 'Explora técnicas y materiales diversos en sus creaciones artísticas.', 'hacer', 2, 'no'),
(139, 35, 'Identifica características de diferentes corrientes y estilos artísticos.', 'conocer', 3, 'no'),
(140, 35, 'Comparte experiencias y descubrimientos artísticos con otros.', 'convivir', 4, 'no'),
(141, 36, 'Aprecia la diversidad musical de diferentes culturas y épocas.', 'ser', 1, 'no'),
(142, 36, 'Interpreta piezas musicales de diversos géneros y estilos.', 'hacer', 2, 'no'),
(143, 36, 'Reconoce características distintivas de géneros musicales diversos.', 'conocer', 3, 'no'),
(144, 36, 'Participa en actividades musicales que integran diversidad cultural.', 'convivir', 4, 'no'),
(145, 37, 'Desarrolla autoconfianza en la expresión a través del movimiento.', 'ser', 1, 'no'),
(146, 37, 'Crea secuencias coreográficas con mayor complejidad y creatividad.', 'hacer', 2, 'no'),
(147, 37, 'Comprende principios de composición y espacio en la danza.', 'conocer', 3, 'no'),
(148, 37, 'Colabora en la creación de producciones dancísticas colectivas.', 'convivir', 4, 'no'),
(149, 38, 'Muestra disposición para el trabajo colectivo en teatro.', 'ser', 1, 'no'),
(150, 38, 'Participa activamente en todas las fases de producción teatral.', 'hacer', 2, 'no'),
(151, 38, 'Comprende roles y responsabilidades en una producción teatral.', 'conocer', 3, 'no'),
(152, 38, 'Trabaja coordinadamente con el equipo en montajes teatrales.', 'convivir', 4, 'no'),
(153, 39, 'Muestra interés por el uso educativo de la tecnología.', 'ser', 1, 'no'),
(154, 39, 'Utiliza programas educativos para reforzar sus aprendizajes.', 'hacer', 2, 'no'),
(155, 39, 'Conoce diferentes recursos y software educativo disponible.', 'conocer', 3, 'no'),
(156, 39, 'Comparte conocimientos y recursos tecnológicos con compañeros.', 'convivir', 4, 'no'),
(157, 40, 'Desarrolla pensamiento crítico sobre procesos históricos.', 'ser', 1, 'no'),
(158, 40, 'Investiga y analiza causas y consecuencias de hechos históricos.', 'hacer', 2, 'no'),
(159, 40, 'Comprende relaciones de causalidad en fenómenos históricos.', 'conocer', 3, 'no'),
(160, 40, 'Participa en debates históricos con argumentación fundamentada.', 'convivir', 4, 'no'),
(161, 41, 'Manifiesta creatividad en el diseño de soluciones tecnológicas.', 'ser', 1, 'no'),
(162, 41, 'Diseña y desarrolla proyectos tecnológicos aplicables a su entorno.', 'hacer', 2, 'no'),
(163, 41, 'Comprende fases del diseño y desarrollo de proyectos tecnológicos.', 'conocer', 3, 'no'),
(164, 41, 'Trabaja en equipo para implementar proyectos tecnológicos.', 'convivir', 4, 'no'),
(165, 42, 'Reflexiona sobre el poder del lenguaje en la construcción de realidades.', 'ser', 1, 'no'),
(166, 42, 'Adapta su comunicación a diferentes contextos y audiencias.', 'hacer', 2, 'no'),
(167, 42, 'Analiza funciones y usos del lenguaje en diversos contextos.', 'conocer', 3, 'no'),
(168, 42, 'Respeta y valora diferentes formas de expresión lingüística.', 'convivir', 4, 'no'),
(169, 43, 'Muestra iniciativa para usar el inglés en situaciones reales.', 'ser', 1, 'no'),
(170, 43, 'Intercambia información en inglés sobre temas de interés personal.', 'hacer', 2, 'no'),
(171, 43, 'Amplía vocabulario especializado en áreas de interés.', 'conocer', 3, 'no'),
(172, 43, 'Participa activamente en conversaciones y debates en inglés.', 'convivir', 4, 'no');

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
  `tipo_inscripcion` enum('regular','nuevo_ingreso','traslado','no_escolarizados') NOT NULL DEFAULT 'nuevo_ingreso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`id_inscripcion`, `fk_estudiante`, `fk_representante`, `fk_personal`, `fk_aula`, `fecha_inscripcion`, `vive_con`, `altura`, `talla_zapatos`, `talla_camisa`, `talla_pantalon`, `peso`, `estado_inscripcion`, `foto_estudiante`, `foto_representante`, `cedula_estudiante`, `cedula_representante`, `fecha_retiro`, `motivo_retiro`, `tipo_vivienda`, `zona_vivienda`, `tenencia_viviencia`, `ingreso_familiar`, `miembros_familia`, `tareas_comunitarias`, `participar_comite`, `detalles_participacion`, `tipo_inscripcion`) VALUES
(1, 53, 15, 21, 4, '2025-12-11', 'su papa', 1.3, 40, 12, 29, 40, 'activo', 'si', 'si', 'si', 'si', NULL, NULL, 'casa', 'barrio', 'la debo', 150, 4, 'no', 'no', 'dssad', 'nuevo_ingreso');

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
(6, 5, 48),
(7, 1, 28),
(8, 3, 28),
(9, 5, 30),
(10, 4, 32),
(11, 6, 34),
(12, 2, 37),
(13, 8, 39),
(14, 9, 42),
(15, 10, 45),
(16, 1, 47),
(17, 5, 49),
(18, 3, 52),
(19, 6, 55),
(20, 2, 49),
(21, 4, 51),
(22, 6, 52),
(23, 8, 54),
(24, 10, 56),
(25, 2, 54);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `literal`
--

CREATE TABLE `literal` (
  `id_literal` int(11) NOT NULL,
  `literal` enum('A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','D3','E1','E2','E3') NOT NULL,
  `descripcion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `literal`
--

INSERT INTO `literal` (`id_literal`, `literal`, `descripcion`) VALUES
(6, 'A2', 'Desempeño A2'),
(7, 'B2', 'Desempeño B2'),
(8, 'C2', 'Desempeño C2'),
(9, 'D2', 'Desempeño D2'),
(10, 'E2', 'Desempeño E2');

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
  `estado_momento` enum('activo','pendiente','finalizado') NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `momentos`
--

INSERT INTO `momentos` (`id_momento`, `fk_anio_escolar`, `nombre_momento`, `fecha_inicio`, `fecha_fin`, `estado_momento`) VALUES
(11, 1, '1', '2025-09-01', '2025-12-20', 'activo'),
(12, 1, '2', '2026-01-10', '2026-03-29', 'pendiente'),
(13, 1, '3', '2026-04-12', '2026-07-20', 'pendiente');

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
(30, 12, 50, 'abuelo'),
(31, 13, 51, 'madre'),
(32, 14, 52, 'padre'),
(33, 15, 53, 'madre'),
(34, 16, 54, 'tio'),
(35, 13, 55, 'madre'),
(36, 14, 56, 'padre'),
(37, 8, 28, 'padre'),
(38, 9, 28, 'madre'),
(39, 8, 29, 'padre'),
(40, 9, 29, 'madre'),
(41, 10, 30, 'padre'),
(42, 11, 30, 'madre'),
(43, 10, 31, 'padre'),
(44, 11, 31, 'madre'),
(45, 12, 32, 'padre'),
(46, 13, 32, 'madre'),
(47, 12, 33, 'padre'),
(48, 13, 33, 'madre'),
(49, 14, 34, 'padre'),
(50, 15, 34, 'madre'),
(51, 14, 35, 'padre'),
(52, 15, 35, 'madre'),
(53, 16, 36, 'padre'),
(54, 17, 36, 'madre'),
(55, 16, 37, 'padre'),
(56, 17, 37, 'madre'),
(57, 8, 38, 'padre'),
(58, 9, 39, 'madre'),
(59, 10, 40, 'padre'),
(60, 11, 41, 'madre'),
(61, 12, 42, 'padre'),
(62, 13, 43, 'madre'),
(63, 14, 44, 'padre'),
(64, 15, 45, 'madre'),
(65, 16, 46, 'padre'),
(66, 17, 47, 'madre'),
(67, 8, 48, 'tio'),
(68, 9, 49, 'abuela'),
(69, 10, 50, 'hermano'),
(70, 11, 51, 'tia'),
(71, 12, 52, 'abuelo'),
(72, 13, 53, 'hermana'),
(73, 14, 54, 'otro'),
(74, 15, 55, 'otro'),
(75, 16, 56, 'tio'),
(76, 17, 57, 'abuela'),
(77, 10, 50, 'padre'),
(78, 12, 51, 'padre'),
(79, 16, 53, 'padre'),
(80, 18, 54, 'padre'),
(81, 10, 55, 'padre'),
(82, 14, 57, 'padre'),
(83, 16, 58, 'padre'),
(84, 18, 59, 'padre'),
(85, 10, 60, 'padre'),
(86, 12, 61, 'padre'),
(87, 14, 62, 'padre'),
(88, 16, 63, 'padre'),
(89, 18, 64, 'padre'),
(90, 10, 65, 'padre'),
(91, 12, 66, 'padre'),
(92, 14, 67, 'padre'),
(93, 16, 68, 'padre'),
(94, 18, 69, 'padre'),
(95, 10, 70, 'padre'),
(96, 12, 71, 'padre'),
(97, 14, 72, 'padre'),
(98, 16, 73, 'padre'),
(99, 18, 74, 'padre'),
(100, 10, 75, 'padre'),
(101, 12, 76, 'padre'),
(102, 14, 77, 'padre'),
(103, 16, 78, 'padre'),
(104, 18, 79, 'padre'),
(105, 10, 80, 'padre'),
(106, 12, 81, 'padre'),
(107, 14, 82, 'padre'),
(108, 16, 83, 'padre'),
(109, 18, 84, 'padre'),
(110, 10, 85, 'padre'),
(111, 12, 86, 'padre'),
(140, 11, 50, 'madre'),
(141, 15, 52, 'madre'),
(142, 19, 54, 'madre'),
(143, 13, 56, 'madre'),
(144, 15, 57, 'madre'),
(145, 17, 58, 'madre'),
(146, 19, 59, 'madre'),
(147, 11, 60, 'madre'),
(148, 13, 61, 'madre'),
(149, 15, 62, 'madre'),
(150, 17, 63, 'madre'),
(151, 19, 64, 'madre'),
(152, 11, 65, 'madre'),
(153, 13, 66, 'madre'),
(154, 15, 67, 'madre'),
(155, 17, 68, 'madre'),
(156, 19, 69, 'madre'),
(157, 11, 70, 'madre'),
(158, 13, 71, 'madre'),
(159, 15, 72, 'madre'),
(160, 17, 73, 'madre'),
(161, 19, 74, 'madre'),
(162, 11, 75, 'madre'),
(163, 13, 76, 'madre'),
(164, 15, 77, 'madre'),
(165, 17, 78, 'madre'),
(166, 19, 79, 'madre'),
(167, 11, 80, 'madre'),
(168, 13, 81, 'madre'),
(169, 15, 82, 'madre'),
(170, 17, 83, 'madre'),
(171, 19, 84, 'madre'),
(172, 11, 85, 'madre'),
(173, 13, 86, 'madre');

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

INSERT INTO `personal` (`id_personal`, `fk_persona`, `fecha_contratacion`, `nivel_academico`, `horas_trabajo`, `rif`, `etnia_religion`, `cantidad_hijas`, `cantidad_hijos_varones`, `estado`, `fk_cargo`, `cod_dependencia`) VALUES
(1, 35, '2025-11-11', 'dsadsadas', NULL, NULL, 'sdsadsa', 4, 2, 'activo', 2, ''),
(14, 89, '2020-09-01', 'Licenciatura en Educación', 44, NULL, 'Católica', 2, 0, 'activo', 1, 'DOC-001'),
(15, 90, '2015-09-01', 'Maestría en Matemáticas', 40, NULL, 'Sin preferencia', 1, 1, 'activo', 2, 'DOC-002'),
(17, 101, '2018-09-01', 'Licenciatura en Educación Integral', 44, NULL, 'Católica', 1, 1, 'activo', 1, 'DOC-003'),
(18, 102, '2020-09-01', 'Licenciatura en Idiomas Modernos', 36, NULL, 'Cristiana', 0, 0, 'activo', 7, 'ESP-002'),
(20, 203, '2015-09-01', 'Licenciatura en Educación Integral', 44, 'J-12345678-9', 'Católica', 2, 0, 'activo', 1, 'DOC-101'),
(21, 204, '2010-09-01', 'Maestría en Educación', 44, 'J-23456789-0', 'Católico', 1, 2, 'activo', 1, 'DOC-102'),
(22, 206, '2015-09-01', 'Licenciatura en Educación Integral', 44, 'J-28000001-9', 'Católica', 2, 0, 'activo', 1, 'DOC-101'),
(30, 213, '2010-09-01', 'Licenciatura en Educación Integral', 44, 'J-32098765-1', 'Católica', 1, 1, 'activo', 13, 'DOC-008'),
(31, 214, '2008-09-01', 'Licenciatura en Educación Mención Primaria', 44, 'J-32109876-2', 'Cristiana Evangélica', 0, 2, 'activo', 1, 'DOC-009'),
(32, 215, '2012-09-01', 'Licenciatura en Educación Integral', 44, 'J-32210987-3', 'Católica', 2, 0, 'activo', 1, 'DOC-010'),
(33, 216, '2009-09-01', 'Licenciatura en Educación Mención Matemática', 44, 'J-32321098-4', 'Ateo', 1, 1, 'activo', 1, 'DOC-011'),
(34, 217, '2005-09-01', 'Licenciatura en Educación Mención Ciencias', 44, 'J-32432109-5', 'Católica', 3, 0, 'activo', 1, 'DOC-012'),
(35, 218, '2011-09-01', 'Licenciatura en Educación Integral', 44, 'J-32543210-6', 'Cristiana Evangélica', 0, 1, 'activo', 1, 'DOC-013'),
(36, 219, '2016-09-01', 'Licenciatura en Educación Preescolar', 44, 'J-32654321-7', 'Católica', 1, 0, 'activo', 1, 'DOC-014'),
(37, 220, '2013-09-01', 'Licenciatura en Educación Integral', 44, 'J-32765432-8', 'Sin preferencia', 2, 2, 'activo', 1, 'DOC-015'),
(38, 221, '2007-09-01', 'Licenciatura en Educación Mención Lengua', 44, 'J-32876543-9', 'Católica', 0, 3, 'activo', 1, 'DOC-016'),
(39, 222, '2014-09-01', 'Licenciatura en Educación Integral', 44, 'J-32987654-0', 'Cristiana Evangélica', 1, 1, 'activo', 1, 'DOC-017'),
(40, 105, '2026-01-07', '', 40, '', 'no tengo', 0, 1, 'activo', 7, '2522555');

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
  `tipo_persona` enum('estudiante','representante','personal') DEFAULT NULL,
  `tipo_sangre` enum('No sabe','O-','O+','A-','A+','B-','B+','AB-','AB+') NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo',
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id_persona`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `fecha_nacimiento`, `genero`, `cedula`, `nacionalidad`, `direccion`, `telefono_principal`, `telefono_secundario`, `tipo_persona`, `tipo_sangre`, `estado`, `email`) VALUES
(35, 'Adriana', 'Lucía', 'Yépez', 'Chacón', '2016-12-11', 'F', '50050607', 'Venezolana', 'Carrera 5, Edif. Amarillo', '04245005060', '02812109875', 'estudiante', 'O-', 'activo', ''),
(86, 'Juan', 'Carlos', 'Pérez', 'González', '2020-12-11', 'M', '30123456', 'Venezolana', 'Av. Principal, Los Rosales, Caracas', '04141234567', NULL, 'estudiante', 'O+', 'activo', ''),
(87, 'María', 'Gabriela', 'Rodríguez', 'López', '2019-12-11', 'F', '31234567', 'Venezolana', 'Calle 12, El Valle, Caracas', '04147654321', NULL, 'estudiante', 'A+', 'activo', ''),
(88, 'Carlos', 'Andrés', 'García', 'Martínez', '2016-12-11', 'M', '32345678', 'Venezolana', 'Urb. Las Acacias, Calle 5, Casa 12, Caracas', '04241122334', NULL, 'estudiante', 'B+', 'activo', ''),
(89, 'Ana', 'María', 'López', 'Pérez', '1985-08-20', 'F', '43456789', 'Venezolana', 'Urb. El Paraíso, Calle 5, Casa 10, Caracas', '04247654321', NULL, 'personal', 'A+', 'activo', ''),
(90, 'Luis', 'Alberto', 'González', 'Ramírez', '1978-11-15', 'M', '44567890', 'Venezolana', 'Av. Bolívar, Edif. Las Torres, Apto 5B, Caracas', '04149876543', NULL, 'personal', 'O+', 'activo', ''),
(91, 'María', 'Fernanda', 'Hernández', 'Castro', '1990-04-25', 'F', '45678901', 'Venezolana', 'Calle Los Manguitos, Quinta Luz, Caracas', '04245678901', NULL, 'personal', 'AB+', 'activo', ''),
(92, 'Pedro', 'José', 'Pérez', 'González', '1975-03-10', 'M', '56789012', 'Venezolana', 'Av. Principal, Los Rosales, Caracas', '04141112233', NULL, 'representante', 'B+', 'activo', ''),
(93, 'Laura', 'Beatriz', 'Rodríguez', 'López', '1978-07-18', 'F', '57890123', 'Venezolana', 'Calle 12, El Valle, Caracas', '04244455566', NULL, 'representante', 'A-', 'activo', ''),
(94, 'José', 'Gregorio', 'García', 'Pérez', '1950-12-05', 'M', '58901234', 'Venezolana', 'Urb. Las Acacias, Calle 5, Casa 12, Caracas', '04167788899', NULL, 'representante', 'O+', 'activo', ''),
(95, 'Laura', 'Isabel', 'Fernández', 'Morales', '2014-12-11', 'F', '33456789', 'Venezolana', 'Calle 15, Urb. El Paraíso, Caracas', '04149998877', NULL, 'estudiante', 'O+', 'activo', ''),
(96, 'José', 'Miguel', 'Martínez', 'Gutiérrez', '2017-12-11', 'M', '34567890', 'Venezolana', 'Av. Libertador, Edif. Las Flores, Apto 3A, Caracas', '04243332211', NULL, 'estudiante', 'A-', 'activo', ''),
(97, 'Ana', 'Sofía', 'Pérez', 'Rodríguez', '2016-12-11', 'F', '35678901', 'Venezolana', 'Urb. Santa Mónica, Calle 8, Casa 15, Caracas', '04145556677', NULL, 'estudiante', 'B+', 'activo', ''),
(98, 'Diego', 'Alejandro', 'Hernández', 'López', '2015-12-11', 'M', '36789012', 'Venezolana', 'Carrera 12, El Rosal, Caracas', '04248889900', NULL, 'estudiante', 'AB+', 'activo', ''),
(99, 'Valentina', 'Carolina', 'González', 'Sánchez', '2014-12-11', 'F', '37890123', 'Venezolana', 'Av. Páez, Quinta Los Álamos, Caracas', '04141112233', NULL, 'estudiante', 'O-', 'activo', ''),
(100, 'Andrés', 'Felipe', 'Díaz', 'Ramírez', '2017-12-11', 'M', '38901234', 'Venezolana', 'Calle Los Jardines, Urb. La Floresta, Caracas', '04244445555', NULL, 'estudiante', 'A+', 'activo', ''),
(101, 'Carlos', 'Enrique', 'Rojas', 'Vargas', '1982-03-15', 'M', '46789012', 'Venezolana', 'Av. Universidad, Edif. El Mirador, Apto 7C, Caracas', '04161234567', NULL, 'personal', 'B+', 'activo', ''),
(102, 'Gabriela', 'Elena', 'Castro', 'Mendoza', '1992-06-22', 'F', '47890123', 'Venezolana', 'Calle Los Pinos, Urb. La Paz, Caracas', '04269876543', NULL, 'personal', 'O+', 'activo', ''),
(103, 'Roberto', 'José', 'Silva', 'Paredes', '1988-11-30', 'M', '48901234', 'Venezolana', 'Urb. Los Chaguaramos, Calle 10, Casa 22, Caracas', '04172345678', NULL, 'personal', 'AB-', 'activo', ''),
(104, 'Marta', 'Lucía', 'Morales', 'Pérez', '1979-04-18', 'F', '59012345', 'Venezolana', 'Calle 15, Urb. El Paraíso, Caracas', '04260011223', NULL, 'representante', 'A+', 'activo', ''),
(105, 'Alberto', 'Juan', 'Gutiérrez', 'Fernández', '1976-09-25', 'M', '60123456', 'Venezolana', 'Av. Libertador, Edif. Las Flores, Apto 3A, Caracas', '04174445566', NULL, 'representante', 'O+', 'activo', ''),
(106, 'Isabel', 'Carmen', 'Rodríguez', 'Martínez', '1980-12-10', 'F', '61234567', 'Venezolana', 'Urb. Santa Mónica, Calle 8, Casa 15, Caracas', '04267778899', NULL, 'representante', 'B-', 'activo', ''),
(107, 'Ricardo', 'Antonio', 'López', 'Hernández', '1968-05-03', 'M', '62345678', 'Venezolana', 'Carrera 12, El Rosal, Caracas', '04189990011', NULL, 'representante', 'AB+', 'activo', ''),
(163, 'Carlos', 'Alberto', 'González', 'Pérez', '2018-12-11', 'M', 'V12345678', 'Venezolana', 'Av. Principal #123', '04141234567', '04149876543', 'representante', 'O+', 'activo', 'carlos.gonzalez@email.com'),
(164, 'María', 'Isabel', 'Rodríguez', 'López', '2015-12-11', 'F', 'V23456789', 'Venezolana', 'Calle 5 #45', '04142345678', NULL, 'representante', 'A+', 'activo', 'maria.rodriguez@email.com'),
(165, 'José', 'Luis', 'Martínez', 'García', '2018-12-11', 'M', 'V34567890', 'Venezolana', 'Urb. Las Acacias', '04143456789', '04241234567', NULL, 'B+', 'activo', NULL),
(166, 'Ana', 'Gabriela', 'Pérez', 'Sánchez', '2015-12-11', 'F', 'V45678901', 'Venezolana', 'Sector El Valle', '04144567890', NULL, 'representante', 'AB+', 'activo', 'ana.perez@email.com'),
(167, 'Luis', 'Miguel', 'Hernández', 'Díaz', '2016-12-11', 'M', 'V56789012', 'Venezolana', 'Av. Bolívar #78', '04145678901', '04141237890', 'representante', 'O-', 'activo', 'luis.hernandez@email.com'),
(168, 'Carmen', 'Elena', 'Gómez', 'Ramírez', '2014-12-11', 'F', 'V67890123', 'Venezolana', 'Carrera 8 #23', '04146789012', NULL, 'representante', 'A-', 'activo', NULL),
(169, 'Roberto', 'Carlos', 'Fernández', 'Morales', '2017-12-11', 'M', 'V78901234', 'Venezolana', 'Urb. Santa Rosa', '04147890123', '04249876543', 'representante', 'B-', 'activo', 'roberto.fernandez@email.com'),
(170, 'Patricia', 'Margarita', 'Torres', 'Rojas', '2020-12-11', 'F', 'V89012345', 'Venezolana', 'Sector La Floresta', '04148901234', NULL, 'representante', 'AB-', 'activo', 'patricia.torres@email.com'),
(171, 'Jorge', 'Enrique', 'Silva', 'Vargas', '2015-12-11', 'M', 'V90123456', 'Venezolana', 'Av. Universidad', '04149012345', '04142348901', 'representante', 'O+', 'activo', NULL),
(172, 'Marta', 'Lucía', 'Castro', 'Mendoza', '2016-12-11', 'F', 'V01234567', 'Venezolana', 'Calle 10 #90', '04140123456', NULL, 'representante', 'A+', 'activo', 'marta.castro@email.com'),
(173, 'Sofía', NULL, 'González', 'Pérez', '2015-12-11', 'F', 'E10000001', 'Venezolana', 'Av. Principal #123', '04141000001', NULL, 'estudiante', 'O+', 'activo', NULL),
(174, 'Mateo', 'Alejandro', 'González', 'Pérez', '2017-12-11', 'M', 'E10000002', 'Venezolana', 'Av. Principal #123', '04141000001', NULL, 'estudiante', 'O+', 'activo', NULL),
(175, 'Valentina', NULL, 'Rodríguez', 'López', '2018-12-11', 'F', 'E10000003', 'Venezolana', 'Calle 5 #45', '04142000002', NULL, 'estudiante', 'A+', 'activo', NULL),
(176, 'Sebastián', NULL, 'Rodríguez', 'López', '2020-12-11', 'M', 'E10000004', 'Venezolana', 'Calle 5 #45', '04142000002', NULL, 'estudiante', 'A+', 'activo', NULL),
(177, 'Isabella', 'María', 'Martínez', 'García', '2016-12-11', 'F', 'E10000005', 'Venezolana', 'Urb. Las Acacias', '04143000003', NULL, 'estudiante', 'B+', 'activo', NULL),
(178, 'Diego', NULL, 'Martínez', 'García', '2016-12-11', 'M', 'E10000006', 'Venezolana', 'Urb. Las Acacias', '04143000003', NULL, 'estudiante', 'B+', 'activo', NULL),
(179, 'Camila', NULL, 'Pérez', 'Sánchez', '2017-12-11', 'F', 'E10000007', 'Venezolana', 'Sector El Valle', '04144000004', NULL, 'estudiante', 'AB+', 'activo', NULL),
(180, 'Nicolás', NULL, 'Pérez', 'Sánchez', '2018-12-11', 'M', 'E10000008', 'Venezolana', 'Sector El Valle', '04144000004', NULL, 'estudiante', 'AB+', 'activo', NULL),
(181, 'Lucía', NULL, 'Hernández', 'Díaz', '2018-12-11', 'F', 'E10000009', 'Venezolana', 'Av. Bolívar #78', '04145000005', NULL, 'estudiante', 'O-', 'activo', NULL),
(182, 'Daniel', 'Andrés', 'Hernández', 'Díaz', '2016-12-11', 'M', 'E10000010', 'Venezolana', 'Av. Bolívar #78', '04145000005', NULL, 'estudiante', 'O-', 'activo', NULL),
(183, 'Samuel', NULL, 'Gómez', 'Ramírez', '2019-12-11', 'M', 'E10000011', 'Venezolana', 'Carrera 8 #23', '04146000006', NULL, 'estudiante', 'A-', 'activo', NULL),
(184, 'Mariana', NULL, 'Gómez', 'Ramírez', '2015-12-11', 'F', 'E10000012', 'Venezolana', 'Carrera 8 #23', '04146000006', NULL, 'estudiante', 'A-', 'activo', NULL),
(185, 'Joaquín', NULL, 'Fernández', 'Morales', '2015-12-11', 'M', 'E10000013', 'Venezolana', 'Urb. Santa Rosa', '04147000007', NULL, 'estudiante', 'B-', 'activo', NULL),
(186, 'Renata', NULL, 'Fernández', 'Morales', '2017-12-11', 'F', 'E10000014', 'Venezolana', 'Urb. Santa Rosa', '04147000007', NULL, 'estudiante', 'B-', 'activo', NULL),
(187, 'Emilio', NULL, 'Torres', 'Rojas', '2014-12-11', 'M', 'E10000015', 'Venezolana', 'Sector La Floresta', '04148000008', NULL, 'estudiante', 'AB-', 'activo', NULL),
(188, 'Antonella', NULL, 'Torres', 'Rojas', '2020-12-11', 'F', 'E10000016', 'Venezolana', 'Sector La Floresta', '04148000008', NULL, 'estudiante', 'AB-', 'activo', NULL),
(189, 'Adrián', NULL, 'Silva', 'Vargas', '2017-12-11', 'M', 'E10000017', 'Venezolana', 'Av. Universidad', '04149000009', NULL, 'estudiante', 'O+', 'activo', NULL),
(190, 'Victoria', NULL, 'Silva', 'Vargas', '2017-12-11', 'F', 'E10000018', 'Venezolana', 'Av. Universidad', '04149000009', NULL, 'estudiante', 'O+', 'activo', NULL),
(191, 'Tomás', NULL, 'Castro', 'Mendoza', '2019-12-11', 'M', 'E10000019', 'Venezolana', 'Calle 10 #90', '04140000010', NULL, 'estudiante', 'A+', 'activo', NULL),
(192, 'Florencia', NULL, 'Castro', 'Mendoza', '2017-12-11', 'F', 'E10000020', 'Venezolana', 'Calle 10 #90', '04140000010', NULL, 'estudiante', 'A+', 'activo', NULL),
(193, 'Javier', NULL, 'González', 'Rodríguez', '2015-12-11', 'M', 'E10000021', 'Venezolana', 'Av. Nueva #50', '04141111111', NULL, 'estudiante', 'O+', 'activo', NULL),
(194, 'Ximena', NULL, 'González', 'Rodríguez', '2018-12-11', 'F', 'E10000022', 'Venezolana', 'Av. Nueva #50', '04141111111', NULL, 'estudiante', 'O+', 'activo', NULL),
(195, 'Luciano', NULL, 'López', 'Martínez', '2019-12-11', 'M', 'E10000023', 'Venezolana', 'Calle 20 #15', '04142222222', NULL, 'estudiante', 'A+', 'activo', NULL),
(196, 'Catalina', NULL, 'López', 'Martínez', '2020-12-11', 'F', 'E10000024', 'Venezolana', 'Calle 20 #15', '04142222222', NULL, 'estudiante', 'A+', 'activo', NULL),
(197, 'Maximiliano', NULL, 'Ramírez', 'Gómez', '2014-12-11', 'M', 'E10000025', 'Venezolana', 'Urb. El Paraíso', '04143333333', NULL, 'estudiante', 'B+', 'activo', NULL),
(198, 'Martina', NULL, 'Ramírez', 'Gómez', '2019-12-11', 'F', 'E10000026', 'Venezolana', 'Urb. El Paraíso', '04143333333', NULL, 'estudiante', 'B+', 'activo', NULL),
(199, 'Benjamín', NULL, 'Díaz', 'Fernández', '2020-12-11', 'M', 'E10000027', 'Venezolana', 'Sector Los Olivos', '04144444444', NULL, 'estudiante', 'AB+', 'activo', NULL),
(200, 'Julieta', NULL, 'Díaz', 'Fernández', '2014-12-11', 'F', 'E10000028', 'Venezolana', 'Sector Los Olivos', '04144444444', NULL, 'estudiante', 'AB+', 'activo', NULL),
(201, 'Thiago', NULL, 'Morales', 'Torres', '2016-12-11', 'M', 'E10000029', 'Venezolana', 'Av. Libertador', '04145555555', NULL, 'estudiante', 'O-', 'activo', NULL),
(202, 'Mía', NULL, 'Morales', 'Torres', '2018-12-11', 'F', 'E10000030', 'Venezolana', 'Av. Libertador', '04145555555', NULL, 'estudiante', 'O-', 'activo', NULL),
(203, 'María', 'Elena', 'Rodríguez', 'Pérez', '1985-03-15', 'F', '12345678', 'Venezolana', 'Av. Principal #123, Caracas', '04141234567', '02121234567', 'personal', 'A+', 'activo', 'maria.rodriguez@escuela.edu'),
(204, 'Carlos', 'Alberto', 'González', 'Martínez', '1978-07-22', 'M', '23456789', 'Venezolana', 'Calle 10 #45, Caracas', '04142345678', '02122345678', 'personal', 'O+', 'activo', 'carlos.gonzalez@escuela.edu'),
(206, 'María', 'Elena', 'Rodríguez', 'Pérez', '1985-03-15', 'F', '28000001', 'Venezolana', 'Av. Principal #123, Caracas', '04141234567', '02121234567', 'personal', 'A+', 'activo', 'maria.rodriguez@escuela.edu'),
(213, 'Carmen', 'Elena', 'Rojas', 'Mendoza', '1983-08-12', 'F', 'V-12345678', 'Venezolana', 'Av. Bolívar, Edif. Las Torres, Apt 8B, Caracas', '04121234567', '02127778888', 'personal', 'O+', 'activo', 'carmen.rojas@escuela.edu.ve'),
(214, 'Pedro', 'Luis', 'Gutiérrez', 'Pérez', '1979-11-05', 'M', 'V-13456789', 'Venezolana', 'Calle Los Manguitos, Quinta Sol, Caracas', '04241234567', NULL, 'personal', 'A+', 'activo', 'pedro.gutierrez@escuela.edu.ve'),
(215, 'Lucía', 'María', 'Díaz', 'Fernández', '1986-03-22', 'F', 'V-14567890', 'Venezolana', 'Urb. Santa Rosa, Calle 3, Casa 15, Caracas', '04132345678', '02128887777', 'personal', 'B+', 'activo', 'lucia.diaz@escuela.edu.ve'),
(216, 'Ramón', 'José', 'Castro', 'González', '1980-07-18', 'M', 'V-15678901', 'Venezolana', 'Sector El Valle, Av. Principal, Edif. Montecarlo, Apt 5C', '04243456789', NULL, 'personal', 'AB+', 'activo', 'ramon.castro@escuela.edu.ve'),
(217, 'Teresa', 'Margarita', 'Vargas', 'Rodríguez', '1975-12-30', 'F', 'V-16789012', 'Venezolana', 'Urb. El Paraíso, Calle 10, Casa 8, Caracas', '04144567890', '02129996666', 'personal', 'O-', 'activo', 'teresa.vargas@escuela.edu.ve'),
(218, 'Alberto', 'Jesús', 'Silva', 'Morales', '1982-04-15', 'M', 'V-17890123', 'Venezolana', 'Carrera 8, Residencias Los Pinos, Apt 12D', '04245678901', NULL, 'personal', 'A-', 'activo', 'alberto.silva@escuela.edu.ve'),
(219, 'Rosa', 'Isabel', 'Paredes', 'Hernández', '1988-09-28', 'F', 'V-18901234', 'Venezolana', 'Av. Universidad, Edif. El Mirador, Apt 7A', '04146789012', '02121112222', 'personal', 'B-', 'activo', 'rosa.paredes@escuela.edu.ve'),
(220, 'Miguel', 'Ángel', 'Torres', 'Sánchez', '1984-01-10', 'M', 'V-19012345', 'Venezolana', 'Calle Los Girasoles, Quinta La Esperanza, Caracas', '04247890123', NULL, 'personal', 'AB-', 'activo', 'miguel.torres@escuela.edu.ve'),
(221, 'Gladys', 'Carolina', 'Mendoza', 'López', '1978-06-08', 'F', 'V-20123456', 'Venezolana', 'Sector Los Chorros, Av. Principal, Casa 22', '04148901234', '02123334444', 'personal', 'O+', 'activo', 'gladys.mendoza@escuela.edu.ve'),
(222, 'Héctor', 'Manuel', 'Gómez', 'Ramírez', '1981-10-25', 'M', 'V-21234567', 'Venezolana', 'Urb. La Florida, Calle 5, Edif. Las Margaritas, Apt 9B', '04249012345', NULL, 'personal', 'A+', 'activo', 'hector.gomez@escuela.edu.ve');

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

--
-- Volcado de datos para la tabla `planificaciones`
--

INSERT INTO `planificaciones` (`id_planificacion`, `fk_personal`, `fk_aula`, `fk_componente`, `fk_momento`, `tipo`, `estado`, `reutilizable`) VALUES
(3, 1, 1, 8, 11, 'aula', 'activo', 'no');

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

--
-- Volcado de datos para la tabla `plan_competencias`
--

INSERT INTO `plan_competencias` (`id_plan_com`, `fk_competencias`, `fk_planificacion`) VALUES
(3, 8, 3);

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

--
-- Volcado de datos para la tabla `preguntas`
--

INSERT INTO `preguntas` (`id_preguntas`, `fk_usuario`, `pregunta`, `respuesta`) VALUES
(1, 1, 'hola12345673', '$2y$10$D1LdBo2FHujXNU1qF.mmg.hQMsPF0ImLgzWs8z1FujxcFQHmlKqfq'),
(2, 1, 'hola12345674', '$2y$10$V0Wvh6saWFxCVqhZpeAS7e2f/EoF70rUrOk0sW4XsY4GyECqrtGRi'),
(3, 1, 'hola12345679', '$2y$10$vXPTxw13RizfVYj1LZRHqOPrRCuRhvcWSNXUS4aMKiMVd2WJGqpca'),
(4, 43, 'hola12345678', '$2y$10$Lu5W4gkDLDrGN/7F1.vtROL/0oHltteeuISJjWKJCIP7IlKZK3dqW'),
(5, 43, 'hola12345671', '$2y$10$V1PbtugPP8Md9PF4JDkKEOfDEzItT.BCJ0gspkQ/Qsmihh.y5FaI6'),
(6, 43, 'hola12345677', '$2y$10$.Xx5Tc8zZfY1GUCDBW6c4uNyMN0r.8OVsNiDgNXQp6pid0Txu1CSW');

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
(12, 94, 'Pensionado', 'Bachiller', 'Contador (Jubilado)', 'Casa'),
(13, 104, 'Contadora', 'Licenciatura', 'Contadora Pública', 'Consultoría Financiera ABC'),
(14, 105, 'Ingeniero', 'Maestria', 'Ingeniero Civil', 'Constructora Nacional'),
(15, 106, 'Abogada', 'Doctorado', 'Abogada Penalista', 'Bufete Legal XYZ'),
(16, 107, 'Comerciante', 'Bachiller', 'Empresario', 'Tienda de Electrodomésticos'),
(17, 154, 'Ingeniero', 'Licenciatura', 'Ingeniero Civil', 'Constructora Nacional'),
(18, 155, 'Médico', 'Doctorado', 'Pediatra', 'Hospital Central'),
(19, 156, 'Comerciante', 'Bachiller', 'Empresario', 'Tienda Propia'),
(20, 157, 'Abogada', 'Maestria', 'Abogada', 'Bufete Legal'),
(21, 158, 'Docente', 'Licenciatura', 'Profesor Universitario', 'Universidad Nacional'),
(22, 159, 'Enfermera', 'TSU', 'Enfermera Jefe', 'Clínica Privada'),
(23, 160, 'Arquitecto', 'Licenciatura', 'Arquitecto', 'Estudio de Arquitectura'),
(24, 161, 'Contadora', 'Licenciatura', 'Contadora Pública', 'Consultoría Financiera'),
(25, 162, 'Ingeniero', 'Maestria', 'Ingeniero de Sistemas', 'Empresa Tecnológica'),
(26, 163, 'Psicóloga', 'Licenciatura', 'Psicóloga Clínica', 'Consultorio Privado');

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

--
-- Volcado de datos para la tabla `respaldos`
--

INSERT INTO `respaldos` (`id_respaldos`, `direccion`, `fecha`, `fk_usuario`) VALUES
(1, '12-12-2025_04-55-35.sql', '2025-12-12', 1),
(2, '13-12-2025_00-52-09.sql', '2025-12-13', 1);

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
(83, 43, '5dc23f8f301a59ca20fc1993244ca80aa20ef003a7d95f71b888ab0c46489225', '2026-01-20', '2026-01-21');

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
  `rol` enum('Director','Docente','Secretaria') DEFAULT NULL,
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `fecha_bloqueo` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `fk_personal`, `nombre_usuario`, `contrasena_hash`, `estado`, `rol`, `ultimo_login`, `intentos_fallidos`, `fecha_bloqueo`) VALUES
(1, 1, 'usuario', '$2y$10$9qQDpCH5pvRJ.dWocshMtONhwF4RhhLATmb3ZKEophNlsR6g7/S4S', 'activo', 'Director', NULL, 0, NULL),
(43, 14, 'el pepe', '$2y$10$FwfiPBJcd/TUHpkol6zLMOlONM4z3BAkwnilk8AwnwYktpGKqcH52', 'activo', 'Director', NULL, 0, NULL),
(44, 20, 'mrodriguez', '$2y$10$TuHashDeContraseñaAquí1', 'activo', 'Docente', NULL, 0, NULL),
(45, 21, 'cgonzalez', '$2y$10$TuHashDeContraseñaAquí2', 'activo', 'Docente', NULL, 0, NULL);

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
(6, 3, 49, '2011-10-20', 3),
(7, 1, 28, '2020-05-10', 1),
(8, 2, 28, '2020-06-15', 3),
(9, 3, 29, '2019-08-20', 3),
(10, 4, 30, '2020-03-12', 2),
(11, 5, 32, '2020-09-05', 1),
(12, 6, 34, '2019-11-18', 2),
(13, 7, 37, '2020-01-25', 1),
(14, 8, 39, '2020-10-30', 1),
(15, 9, 42, '2021-03-15', 2),
(16, 10, 45, '2020-07-22', 1),
(17, 11, 47, '2020-04-08', 2),
(18, 12, 49, '2020-08-14', 1),
(19, 1, 52, '2019-12-10', 1),
(20, 3, 55, '2020-02-28', 3),
(21, 2, 48, '2010-06-10', 3),
(22, 5, 50, '2012-04-15', 2),
(23, 8, 51, '2010-11-30', 1),
(24, 9, 53, '2021-08-20', 2),
(25, 12, 55, '2011-03-12', 4),
(26, 10, 56, '2012-05-25', 1);

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
-- Indices de la tabla `bloqueos_ip`
--
ALTER TABLE `bloqueos_ip`
  ADD PRIMARY KEY (`id_bloqueo_ip`),
  ADD UNIQUE KEY `idx_bloqueos_ip_hash_tipo` (`ip_hash`,`tipo_bloqueo`);

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
  ADD KEY `fk_persona` (`fk_persona`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id_persona`),
  ADD UNIQUE KEY `cedula` (`cedula`);

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
  MODIFY `id_bloqueo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `bloqueos_ip`
--
ALTER TABLE `bloqueos_ip`
  MODIFY `id_bloqueo_ip` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id_cargo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `competencias`
--
ALTER TABLE `competencias`
  MODIFY `id_competencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `componentes_aprendizaje`
--
ALTER TABLE `componentes_aprendizaje`
  MODIFY `id_componente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT de la tabla `condiciones_salud`
--
ALTER TABLE `condiciones_salud`
  MODIFY `id_condicion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `consultas_medicas`
--
ALTER TABLE `consultas_medicas`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de la tabla `evaluar`
--
ALTER TABLE `evaluar`
  MODIFY `id_evaluar` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_habilidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `imparte`
--
ALTER TABLE `imparte`
  MODIFY `id_imparte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=226;

--
-- AUTO_INCREMENT de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  MODIFY `id_indicador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `lista_alergias`
--
ALTER TABLE `lista_alergias`
  MODIFY `id_lista_alergia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `literal`
--
ALTER TABLE `literal`
  MODIFY `id_literal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `momentos`
--
ALTER TABLE `momentos`
  MODIFY `id_momento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=203;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id_personal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;

--
-- AUTO_INCREMENT de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  MODIFY `id_planificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `planificaciones_individuales`
--
ALTER TABLE `planificaciones_individuales`
  MODIFY `id_planificaciones_individuales` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_competencias`
--
ALTER TABLE `plan_competencias`
  MODIFY `id_plan_com` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id_preguntas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `representantes`
--
ALTER TABLE `representantes`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `respaldos`
--
ALTER TABLE `respaldos`
  MODIFY `id_respaldos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `vacunas_estudiante`
--
ALTER TABLE `vacunas_estudiante`
  MODIFY `id_vacuna_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
  ADD CONSTRAINT `personal_ibfk_2` FOREIGN KEY (`fk_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE;

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
