-- Ajustes para el nuevo sistema de gestión de años escolares
ALTER TABLE anios_escolares
  ADD COLUMN IF NOT EXISTS fecha_limite_inscripcion DATE NULL AFTER fecha_fin;

UPDATE anios_escolares
SET fecha_limite_inscripcion = COALESCE(fecha_limite_inscripcion, fecha_inicio);
