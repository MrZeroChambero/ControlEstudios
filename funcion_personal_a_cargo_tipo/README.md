# PLAN DE MIGRACIÓN: FUNCIÓN_PERSONAL → CARGO.TIPO

## Resumen

Esta carpeta contiene el plan y artefactos para migrar todas las referencias de `funcion_personal` hacia el modelo `cargo.tipo` en el proyecto.

## Contenido

- `checklist_tareas.txt`: Lista numerada de las 12 tareas y su estado.
- `archivos_a_modificar.md`: Lista de archivos PHP/SQL concretos a modificar.
- `consultas_actualizadas.sql`: Consultas SQL de referencia antes/después.
- `CHANGELOG.md`: Registro de cambios (entrada inicial).

## Instrucciones rápidas

1. Ejecutar búsquedas globales para localizar `funcion_personal`, `fk_funcion_personal`, `tipo_funcion`.
2. Aplicar los reemplazos propuestos en `archivos_a_modificar.md` y `consultas_actualizadas.sql`.
3. Actualizar modelos, controladores, vistas y pruebas.
4. Marcar tareas completadas en `checklist_tareas.txt` y actualizar `CHANGELOG.md`.

## Contacto

Si necesitas que aplique los cambios automáticamente, indícame y lo haré por fases (buscar/reemplazar, modificar modelos, controladores, vistas, pruebas).
