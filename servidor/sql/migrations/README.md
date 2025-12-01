# Migraciones de integridad referencial (Escuela)

Este directorio contiene migraciones para corregir llaves foráneas y asegurar la integridad de la jerarquía:

Áreas → Componentes → Contenidos → Temas

## Pasos

1. Respaldar la base de datos `escuela`.
2. Revisar orfandad reportada por la migración (consulta incluida).
3. Ejecutar `2025-12-01-fk-fixes.sql` en MariaDB/MySQL.
4. Corregir manualmente cualquier registro huérfano (updates a `contenidos.fk_componente`).
5. Verificar que:
   - `contenidos.fk_componente` referencia `componentes_aprendizaje.id_componente`.
   - `temas.fk_contenido` referencia `contenidos.id_contenido`.

## Comandos sugeridos (Windows PowerShell)

```powershell
# Abrir MySQL con credenciales locales
mysql -u root -p

# Dentro del cliente MySQL, seleccionar BD y ejecutar el archivo
USE escuela;
SOURCE c:/xampp/htdocs/controlestudios/servidor/sql/migrations/2025-12-01-fk-fixes.sql;
```

## Notas

- `ON DELETE CASCADE` en `temas` asegura borrado en cascada cuando se elimina un contenido.
- `ON DELETE RESTRICT` en `contenidos` evita eliminar componentes si hay contenidos asociados.
- Si hay orfandad, la FK no podrá crearse hasta corregir los datos.
