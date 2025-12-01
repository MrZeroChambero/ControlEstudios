-- Correcciones de llaves foráneas y verificación de orfandad
-- Base de datos: escuela

START TRANSACTION;

-- 1) Corregir FK de contenidos.fk_componente -> componentes_aprendizaje.id_componente
-- Nota: verificar existencia de la FK previa y orfandad

-- Remover FK previa si apunta a areas_aprendizaje
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE kcu
  WHERE kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.TABLE_NAME = 'contenidos'
    AND kcu.CONSTRAINT_NAME = 'contenidos_ibfk_1'
);

SET @sql_drop := IF(@has_fk > 0,
  'ALTER TABLE `contenidos` DROP FOREIGN KEY `contenidos_ibfk_1`',
  NULL
);

PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Verificar orfandad entre contenidos.fk_componente y componentes_aprendizaje.id_componente
SELECT COUNT(*) AS contenidos_huerfanos
FROM contenidos c
LEFT JOIN componentes_aprendizaje ca ON ca.id_componente = c.fk_componente
WHERE c.fk_componente IS NOT NULL AND ca.id_componente IS NULL;

-- Corregir la FK a componentes_aprendizaje
ALTER TABLE `contenidos`
  ADD CONSTRAINT `contenidos_ibfk_1`
  FOREIGN KEY (`fk_componente`)
  REFERENCES `componentes_aprendizaje` (`id_componente`)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 2) Asegurar FK de temas.fk_contenido -> contenidos.id_contenido
SET @has_fk_temas := (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE kcu
  WHERE kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.TABLE_NAME = 'temas'
    AND kcu.COLUMN_NAME = 'fk_contenido'
    AND kcu.REFERENCED_TABLE_NAME = 'contenidos'
);

SET @sql_add_temas_fk := IF(@has_fk_temas = 0,
  'ALTER TABLE `temas`\n   ADD CONSTRAINT `temas_ibfk_1`\n   FOREIGN KEY (`fk_contenido`)\n   REFERENCES `contenidos` (`id_contenido`)\n   ON UPDATE CASCADE\n   ON DELETE CASCADE',
  NULL
);

PREPARE stmt2 FROM @sql_add_temas_fk; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

COMMIT;

-- Notas:
-- - ON DELETE CASCADE en temas garantiza borrado en cascada de temas al eliminar un contenido.
-- - Si existen huerfanos en contenidos.fk_componente, se debe corregir manualmente (update) antes de re-crear la FK.
