# Archivos específicos a modificar

PHP / Servidor (servidor/src/ y root del servidor)

- servidor/src/Personal/OperacionesControladorPersonal.php
- servidor/src/Personal/Personal.php
- servidor/src/Usuarios/Usuarios.php
- servidor/src/AnioEscolar/AnioEscolar.php
- models/PersonalModel.php
- models/CargoModel.php
- models/UsuarioModel.php
- controllers/PersonalController.php
- controllers/UsuarioController.php
- controllers/ReportesController.php
- controllers/InscripcionesController.php
- models/InscripcionModel.php
- controllers/PlanificacionController.php
- models/PlanificacionModel.php
- helpers/validation_helper.php
- middleware/AuthMiddleware.php
- config/permissions.php

Vistas / Cliente

- views/personal/listar.php
- views/personal/form.php
- views/usuarios/asignar_rol.php
- views/inscripciones/form.php

API / Cliente

- cliente/src/api/personal.php
- cliente/src/api/usuarios.php
- cliente/src/api/reportes.php

SQL / Base de datos

- database/procedures.sql
- servidor/sql/\*.sql
- database/migrations/componentes_aprendizaje.sql

Reportes

- reportes/personal_por_tipo.php
- reportes/horarios_especialistas.php
- reportes/estadisticas_personal.php

Notas

- Antes de modificar, hacer backup de los archivos listados.
- Buscar referencias exactas: 'funcion_personal', 'fk_funcion_personal', 'tipo_funcion', 'funcion'.
