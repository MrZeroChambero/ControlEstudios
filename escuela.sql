-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-09-2025 a las 03:38:26
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `anios_escolares`
--

CREATE TABLE `anios_escolares` (
  `id_anio_escolar` int(11) NOT NULL,
  `nombre_anio` varchar(50) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_aprendizaje`
--

CREATE TABLE `areas_aprendizaje` (
  `id_area_aprendizaje` int(11) NOT NULL,
  `nombre_area` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones_grado_seccion`
--

CREATE TABLE `asignaciones_grado_seccion` (
  `id_asignacion_gs` int(11) NOT NULL,
  `id_anio_escolar` int(11) NOT NULL,
  `id_grado` int(11) NOT NULL,
  `id_seccion` int(11) NOT NULL,
  `id_docente_guia` int(11) DEFAULT NULL,
  `cupos_disponibles` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(11) NOT NULL,
  `id_inscripcion` int(11) NOT NULL,
  `fecha_asistencia` date NOT NULL,
  `estado_asistencia` enum('Presente','Ausente','Retardo','Justificado') NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `competencias`
--

CREATE TABLE `competencias` (
  `id_competencia` int(11) NOT NULL,
  `id_planificacion` int(11) NOT NULL,
  `descripcion_competencia` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos_nacimiento_estudiante`
--

CREATE TABLE `datos_nacimiento_estudiante` (
  `id_datos_nacimiento` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `orden_nacimiento` int(11) DEFAULT NULL,
  `duracion_embarazo_semanas` int(11) DEFAULT NULL,
  `complicaciones_embarazo` text DEFAULT NULL,
  `embarazo_planeado_deseado` tinyint(1) DEFAULT NULL,
  `enfermedad_madre_embarazo` text DEFAULT NULL,
  `madre_control_orina_embarazo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enfermedades`
--

CREATE TABLE `enfermedades` (
  `id_enfermedad` int(11) NOT NULL,
  `nombre_enfermedad` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id_estudiante` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `codigo_estudiantil` varchar(20) NOT NULL,
  `grado_actual` varchar(20) NOT NULL,
  `seccion_actual` varchar(10) DEFAULT NULL,
  `fecha_ingreso_escuela` date NOT NULL,
  `vive_con_padres` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grados`
--

CREATE TABLE `grados` (
  `id_grado` int(11) NOT NULL,
  `nombre_grado` varchar(50) NOT NULL,
  `nivel_educativo` varchar(50) DEFAULT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_medico`
--

CREATE TABLE `historial_medico` (
  `id_historial_medico` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `id_enfermedad` int(11) DEFAULT NULL,
  `fecha_diagnostico` date DEFAULT NULL,
  `tratamiento_actual` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `es_cronica` tinyint(1) NOT NULL,
  `tipo_sangre` varchar(10) DEFAULT NULL,
  `patologia_discapacidad_detallada` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `id_anio_escolar` int(11) NOT NULL,
  `id_asignacion_gs` int(11) NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `id_docente` int(11) NOT NULL,
  `id_area_aprendizaje` int(11) DEFAULT NULL,
  `aula` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores`
--

CREATE TABLE `indicadores` (
  `id_indicador` int(11) NOT NULL,
  `id_competencia` int(11) NOT NULL,
  `descripcion_indicador` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_inscripcion` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `id_asignacion_gs` int(11) NOT NULL,
  `fecha_inscripcion` date NOT NULL,
  `estado_inscripcion` enum('Activo','Retirado','En_Proceso') NOT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `motivo_retiro` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `literales`
--

CREATE TABLE `literales` (
  `id_nota` int(11) NOT NULL,
  `id_inscripcion` int(11) NOT NULL,
  `id_planificacion` int(11) NOT NULL,
  `id_indicador` int(11) NOT NULL,
  `literal` varchar(10) NOT NULL,
  `fecha_evaluacion` date NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mediciones_fisicas`
--

CREATE TABLE `mediciones_fisicas` (
  `id_medicion_fisica` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `fecha_medicion` date NOT NULL,
  `id_anio_escolar` int(11) DEFAULT NULL,
  `momento_medicion` varchar(50) DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `estatura` decimal(5,2) DEFAULT NULL,
  `talla_zapatos` varchar(10) DEFAULT NULL,
  `talla_pantalon` varchar(10) DEFAULT NULL,
  `talla_camisa` varchar(10) DEFAULT NULL,
  `observaciones_medicion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_evaluacion`
--

CREATE TABLE `metodos_evaluacion` (
  `id_metodo_evaluacion` int(11) NOT NULL,
  `nombre_metodo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parentesco`
--

CREATE TABLE `parentesco` (
  `id_parentesco` int(11) NOT NULL,
  `id_representante` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `tipo_parentesco` varchar(50) NOT NULL,
  `es_representante_principal` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id_personal` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `codigo_rac` varchar(50) DEFAULT NULL,
  `cargo` varchar(100) NOT NULL,
  `cargo_tipo_personal` varchar(100) DEFAULT NULL,
  `fecha_contratacion` date NOT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `nivel_academico` varchar(100) DEFAULT NULL,
  `anios_servicio` int(11) DEFAULT NULL,
  `horas_academicas` int(11) DEFAULT NULL,
  `horas_adm` int(11) DEFAULT NULL,
  `turno_atiende` varchar(50) DEFAULT NULL,
  `grado_imparte` varchar(50) DEFAULT NULL,
  `seccion_imparte` varchar(10) DEFAULT NULL,
  `situacion_trabajador` varchar(100) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `rif` varchar(20) DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `etnia_religion` varchar(100) DEFAULT NULL,
  `numero_hijos` int(11) DEFAULT NULL,
  `cantidad_hijas` int(11) DEFAULT NULL,
  `cantidad_hijos_varones` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_plantel_externo`
--

CREATE TABLE `personal_plantel_externo` (
  `id_personal_plantel_externo` int(11) NOT NULL,
  `id_personal` int(11) NOT NULL,
  `id_plantel` int(11) NOT NULL,
  `turno_atiende_plantel` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `genero` enum('M','F','Otro') NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `nacionalidad` varchar(50) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono_principal` varchar(20) NOT NULL,
  `telefono_secundario` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tipo_persona` enum('estudiante','representante','personal') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id_persona`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `fecha_nacimiento`, `genero`, `cedula`, `nacionalidad`, `direccion`, `telefono_principal`, `telefono_secundario`, `email`, `tipo_persona`) VALUES
(1, 'José', NULL, 'Pérez', NULL, '1998-12-05', 'M', '31987654', 'Venezolano', 'Av. Libertador, Edif. A', '04161234567', NULL, 'jose.perez@email.com', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificaciones`
--

CREATE TABLE `planificaciones` (
  `id_planificacion` int(11) NOT NULL,
  `id_docente` int(11) NOT NULL,
  `id_area_aprendizaje` int(11) NOT NULL,
  `id_asignacion_gs` int(11) NOT NULL,
  `nombre_planificacion` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` date NOT NULL,
  `fecha_inicio_periodo` date NOT NULL,
  `fecha_fin_periodo` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificacion_metodo_evaluacion`
--

CREATE TABLE `planificacion_metodo_evaluacion` (
  `id_planificacion_metodo` int(11) NOT NULL,
  `id_planificacion` int(11) NOT NULL,
  `id_metodo_evaluacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planteles`
--

CREATE TABLE `planteles` (
  `id_plantel` int(11) NOT NULL,
  `cod_estado` varchar(10) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `municipio` varchar(50) NOT NULL,
  `parroquia` varchar(50) NOT NULL,
  `codigo_dependencia` varchar(20) DEFAULT NULL,
  `codigo_estadistico` varchar(20) DEFAULT NULL,
  `codigo_plantel` varchar(20) NOT NULL,
  `nombre_plantel_nomina` varchar(255) NOT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `modalidad` varchar(50) DEFAULT NULL,
  `ubicacion_geografica` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `representantes`
--

CREATE TABLE `representantes` (
  `id_representante` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `nivel_educativo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

CREATE TABLE `secciones` (
  `id_seccion` int(11) NOT NULL,
  `nombre_seccion` varchar(10) NOT NULL,
  `capacidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessiones`
--

CREATE TABLE `sessiones` (
  `Id` int(20) NOT NULL,
  `Hash` varchar(255) NOT NULL,
  `FechaCreacion` datetime NOT NULL,
  `FechaVencimiento` datetime NOT NULL,
  `SessionUsuario` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL,
  `id_planificacion` int(11) NOT NULL,
  `nombre_tema` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `fecha_creacion_cuenta` datetime NOT NULL,
  `ultima_sesion` datetime DEFAULT NULL,
  `estado` enum('activo','inactivo','incompleto') NOT NULL DEFAULT 'activo',
  `rol` enum('Administrador','Docente','Secretaria','Representante') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `anios_escolares`
--
ALTER TABLE `anios_escolares`
  ADD PRIMARY KEY (`id_anio_escolar`),
  ADD UNIQUE KEY `nombre_anio` (`nombre_anio`);

--
-- Indices de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  ADD PRIMARY KEY (`id_area_aprendizaje`),
  ADD UNIQUE KEY `nombre_area` (`nombre_area`);

--
-- Indices de la tabla `asignaciones_grado_seccion`
--
ALTER TABLE `asignaciones_grado_seccion`
  ADD PRIMARY KEY (`id_asignacion_gs`),
  ADD KEY `id_anio_escolar` (`id_anio_escolar`),
  ADD KEY `id_grado` (`id_grado`),
  ADD KEY `id_seccion` (`id_seccion`),
  ADD KEY `id_docente_guia` (`id_docente_guia`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `id_inscripcion` (`id_inscripcion`);

--
-- Indices de la tabla `competencias`
--
ALTER TABLE `competencias`
  ADD PRIMARY KEY (`id_competencia`),
  ADD KEY `id_planificacion` (`id_planificacion`);

--
-- Indices de la tabla `datos_nacimiento_estudiante`
--
ALTER TABLE `datos_nacimiento_estudiante`
  ADD PRIMARY KEY (`id_datos_nacimiento`),
  ADD UNIQUE KEY `id_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `enfermedades`
--
ALTER TABLE `enfermedades`
  ADD PRIMARY KEY (`id_enfermedad`),
  ADD UNIQUE KEY `nombre_enfermedad` (`nombre_enfermedad`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id_estudiante`),
  ADD UNIQUE KEY `id_persona` (`id_persona`),
  ADD UNIQUE KEY `codigo_estudiantil` (`codigo_estudiantil`);

--
-- Indices de la tabla `grados`
--
ALTER TABLE `grados`
  ADD PRIMARY KEY (`id_grado`),
  ADD UNIQUE KEY `nombre_grado` (`nombre_grado`);

--
-- Indices de la tabla `historial_medico`
--
ALTER TABLE `historial_medico`
  ADD PRIMARY KEY (`id_historial_medico`),
  ADD KEY `id_persona` (`id_persona`),
  ADD KEY `id_enfermedad` (`id_enfermedad`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`),
  ADD KEY `id_anio_escolar` (`id_anio_escolar`),
  ADD KEY `id_asignacion_gs` (`id_asignacion_gs`),
  ADD KEY `id_docente` (`id_docente`),
  ADD KEY `id_area_aprendizaje` (`id_area_aprendizaje`);

--
-- Indices de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD PRIMARY KEY (`id_indicador`),
  ADD KEY `id_competencia` (`id_competencia`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `id_estudiante` (`id_estudiante`),
  ADD KEY `id_asignacion_gs` (`id_asignacion_gs`);

--
-- Indices de la tabla `literales`
--
ALTER TABLE `literales`
  ADD PRIMARY KEY (`id_nota`),
  ADD KEY `id_inscripcion` (`id_inscripcion`),
  ADD KEY `id_planificacion` (`id_planificacion`),
  ADD KEY `id_indicador` (`id_indicador`);

--
-- Indices de la tabla `mediciones_fisicas`
--
ALTER TABLE `mediciones_fisicas`
  ADD PRIMARY KEY (`id_medicion_fisica`),
  ADD KEY `id_persona` (`id_persona`);

--
-- Indices de la tabla `metodos_evaluacion`
--
ALTER TABLE `metodos_evaluacion`
  ADD PRIMARY KEY (`id_metodo_evaluacion`),
  ADD UNIQUE KEY `nombre_metodo` (`nombre_metodo`);

--
-- Indices de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD PRIMARY KEY (`id_parentesco`),
  ADD KEY `id_representante` (`id_representante`),
  ADD KEY `id_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id_personal`),
  ADD UNIQUE KEY `id_persona` (`id_persona`),
  ADD UNIQUE KEY `rif` (`rif`);

--
-- Indices de la tabla `personal_plantel_externo`
--
ALTER TABLE `personal_plantel_externo`
  ADD PRIMARY KEY (`id_personal_plantel_externo`),
  ADD KEY `id_personal` (`id_personal`),
  ADD KEY `id_plantel` (`id_plantel`);

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
  ADD KEY `id_docente` (`id_docente`),
  ADD KEY `id_area_aprendizaje` (`id_area_aprendizaje`),
  ADD KEY `id_asignacion_gs` (`id_asignacion_gs`);

--
-- Indices de la tabla `planificacion_metodo_evaluacion`
--
ALTER TABLE `planificacion_metodo_evaluacion`
  ADD PRIMARY KEY (`id_planificacion_metodo`),
  ADD KEY `id_planificacion` (`id_planificacion`),
  ADD KEY `id_metodo_evaluacion` (`id_metodo_evaluacion`);

--
-- Indices de la tabla `planteles`
--
ALTER TABLE `planteles`
  ADD PRIMARY KEY (`id_plantel`),
  ADD UNIQUE KEY `codigo_plantel` (`codigo_plantel`);

--
-- Indices de la tabla `representantes`
--
ALTER TABLE `representantes`
  ADD PRIMARY KEY (`id_representante`),
  ADD UNIQUE KEY `id_persona` (`id_persona`);

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id_seccion`),
  ADD UNIQUE KEY `nombre_seccion` (`nombre_seccion`);

--
-- Indices de la tabla `sessiones`
--
ALTER TABLE `sessiones`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD KEY `id_planificacion` (`id_planificacion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD UNIQUE KEY `id_persona` (`id_persona`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `anios_escolares`
--
ALTER TABLE `anios_escolares`
  MODIFY `id_anio_escolar` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `areas_aprendizaje`
--
ALTER TABLE `areas_aprendizaje`
  MODIFY `id_area_aprendizaje` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignaciones_grado_seccion`
--
ALTER TABLE `asignaciones_grado_seccion`
  MODIFY `id_asignacion_gs` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `competencias`
--
ALTER TABLE `competencias`
  MODIFY `id_competencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `datos_nacimiento_estudiante`
--
ALTER TABLE `datos_nacimiento_estudiante`
  MODIFY `id_datos_nacimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `enfermedades`
--
ALTER TABLE `enfermedades`
  MODIFY `id_enfermedad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id_estudiante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grados`
--
ALTER TABLE `grados`
  MODIFY `id_grado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_medico`
--
ALTER TABLE `historial_medico`
  MODIFY `id_historial_medico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  MODIFY `id_indicador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `literales`
--
ALTER TABLE `literales`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mediciones_fisicas`
--
ALTER TABLE `mediciones_fisicas`
  MODIFY `id_medicion_fisica` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_evaluacion`
--
ALTER TABLE `metodos_evaluacion`
  MODIFY `id_metodo_evaluacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `parentesco`
--
ALTER TABLE `parentesco`
  MODIFY `id_parentesco` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id_personal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal_plantel_externo`
--
ALTER TABLE `personal_plantel_externo`
  MODIFY `id_personal_plantel_externo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  MODIFY `id_planificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planificacion_metodo_evaluacion`
--
ALTER TABLE `planificacion_metodo_evaluacion`
  MODIFY `id_planificacion_metodo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planteles`
--
ALTER TABLE `planteles`
  MODIFY `id_plantel` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `representantes`
--
ALTER TABLE `representantes`
  MODIFY `id_representante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `secciones`
--
ALTER TABLE `secciones`
  MODIFY `id_seccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sessiones`
--
ALTER TABLE `sessiones`
  MODIFY `Id` int(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignaciones_grado_seccion`
--
ALTER TABLE `asignaciones_grado_seccion`
  ADD CONSTRAINT `asignaciones_grado_seccion_ibfk_1` FOREIGN KEY (`id_anio_escolar`) REFERENCES `anios_escolares` (`id_anio_escolar`),
  ADD CONSTRAINT `asignaciones_grado_seccion_ibfk_2` FOREIGN KEY (`id_grado`) REFERENCES `grados` (`id_grado`),
  ADD CONSTRAINT `asignaciones_grado_seccion_ibfk_3` FOREIGN KEY (`id_seccion`) REFERENCES `secciones` (`id_seccion`),
  ADD CONSTRAINT `asignaciones_grado_seccion_ibfk_4` FOREIGN KEY (`id_docente_guia`) REFERENCES `personal` (`id_personal`);

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`);

--
-- Filtros para la tabla `competencias`
--
ALTER TABLE `competencias`
  ADD CONSTRAINT `competencias_ibfk_1` FOREIGN KEY (`id_planificacion`) REFERENCES `planificaciones` (`id_planificacion`);

--
-- Filtros para la tabla `datos_nacimiento_estudiante`
--
ALTER TABLE `datos_nacimiento_estudiante`
  ADD CONSTRAINT `datos_nacimiento_estudiante_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`);

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`);

--
-- Filtros para la tabla `historial_medico`
--
ALTER TABLE `historial_medico`
  ADD CONSTRAINT `historial_medico_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  ADD CONSTRAINT `historial_medico_ibfk_2` FOREIGN KEY (`id_enfermedad`) REFERENCES `enfermedades` (`id_enfermedad`);

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`id_anio_escolar`) REFERENCES `anios_escolares` (`id_anio_escolar`),
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`id_asignacion_gs`) REFERENCES `asignaciones_grado_seccion` (`id_asignacion_gs`),
  ADD CONSTRAINT `horarios_ibfk_3` FOREIGN KEY (`id_docente`) REFERENCES `personal` (`id_personal`),
  ADD CONSTRAINT `horarios_ibfk_4` FOREIGN KEY (`id_area_aprendizaje`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`);

--
-- Filtros para la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD CONSTRAINT `indicadores_ibfk_1` FOREIGN KEY (`id_competencia`) REFERENCES `competencias` (`id_competencia`);

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`),
  ADD CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`id_asignacion_gs`) REFERENCES `asignaciones_grado_seccion` (`id_asignacion_gs`);

--
-- Filtros para la tabla `literales`
--
ALTER TABLE `literales`
  ADD CONSTRAINT `literales_ibfk_1` FOREIGN KEY (`id_inscripcion`) REFERENCES `inscripciones` (`id_inscripcion`),
  ADD CONSTRAINT `literales_ibfk_2` FOREIGN KEY (`id_planificacion`) REFERENCES `planificaciones` (`id_planificacion`),
  ADD CONSTRAINT `literales_ibfk_3` FOREIGN KEY (`id_indicador`) REFERENCES `indicadores` (`id_indicador`);

--
-- Filtros para la tabla `mediciones_fisicas`
--
ALTER TABLE `mediciones_fisicas`
  ADD CONSTRAINT `mediciones_fisicas_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`);

--
-- Filtros para la tabla `parentesco`
--
ALTER TABLE `parentesco`
  ADD CONSTRAINT `parentesco_ibfk_1` FOREIGN KEY (`id_representante`) REFERENCES `representantes` (`id_representante`),
  ADD CONSTRAINT `parentesco_ibfk_2` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`);

--
-- Filtros para la tabla `personal`
--
ALTER TABLE `personal`
  ADD CONSTRAINT `personal_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`);

--
-- Filtros para la tabla `personal_plantel_externo`
--
ALTER TABLE `personal_plantel_externo`
  ADD CONSTRAINT `personal_plantel_externo_ibfk_1` FOREIGN KEY (`id_personal`) REFERENCES `personal` (`id_personal`),
  ADD CONSTRAINT `personal_plantel_externo_ibfk_2` FOREIGN KEY (`id_plantel`) REFERENCES `planteles` (`id_plantel`);

--
-- Filtros para la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  ADD CONSTRAINT `planificaciones_ibfk_1` FOREIGN KEY (`id_docente`) REFERENCES `personal` (`id_personal`),
  ADD CONSTRAINT `planificaciones_ibfk_2` FOREIGN KEY (`id_area_aprendizaje`) REFERENCES `areas_aprendizaje` (`id_area_aprendizaje`),
  ADD CONSTRAINT `planificaciones_ibfk_3` FOREIGN KEY (`id_asignacion_gs`) REFERENCES `asignaciones_grado_seccion` (`id_asignacion_gs`);

--
-- Filtros para la tabla `planificacion_metodo_evaluacion`
--
ALTER TABLE `planificacion_metodo_evaluacion`
  ADD CONSTRAINT `planificacion_metodo_evaluacion_ibfk_1` FOREIGN KEY (`id_planificacion`) REFERENCES `planificaciones` (`id_planificacion`),
  ADD CONSTRAINT `planificacion_metodo_evaluacion_ibfk_2` FOREIGN KEY (`id_metodo_evaluacion`) REFERENCES `metodos_evaluacion` (`id_metodo_evaluacion`);

--
-- Filtros para la tabla `representantes`
--
ALTER TABLE `representantes`
  ADD CONSTRAINT `representantes_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`);

--
-- Filtros para la tabla `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`id_planificacion`) REFERENCES `planificaciones` (`id_planificacion`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
