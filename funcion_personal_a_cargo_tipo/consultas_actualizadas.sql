-- Consultas ejemplo: antes → después

-- 1) Archivo: database/procedures.sql
-- Consulta antigua:
-- SELECT p.*, fp.nombre as funcion FROM personal p JOIN funcion_personal fp ON p.fk_funcion_personal = fp.id;

-- Consulta nueva sugerida:
SELECT p.*, c.tipo as tipo_cargo
FROM personal p
JOIN cargos c ON p.fk_cargo = c.id_cargo;

-- 2) Archivo: models/PersonalModel.php
-- Consulta antigua (ejemplo):
-- WHERE fp.nombre = 'Docente'

-- Consulta nueva sugerida:
WHERE c.tipo IN ('Docente de aula', 'Docente especialista', 'Docente de Cultura')

-- 3) Archivo: controllers/PersonalController.php
-- Validación antigua (ejemplo):
-- if($personal['funcion'] == 'Docente') { ... }

-- Validación nueva sugerida (ejemplo PHP):
-- $tipos_docente = ['Docente de aula', 'Docente especialista', 'Docente de Cultura'];
-- if(in_array($personal['tipo_cargo'], $tipos_docente)) { ... }

-- Nota: Ajustar nombres de columnas según el esquema real (`fk_cargo`, `id_cargo`, `tipo`).
