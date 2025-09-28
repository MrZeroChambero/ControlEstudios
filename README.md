# Sistema de Control de Estudios

Este es un sistema de gestión académica diseñado para administrar la información de estudiantes, inscripciones, evaluaciones y personal de una institución educativa. La aplicación está construida con un backend en PHP que sirve una API REST y un frontend en React.

## Características Principales

- **Gestión de Usuarios:** Creación, lectura, actualización y eliminación (CRUD) de cuentas de usuario con diferentes roles.
- **Autenticación Segura:** Inicio de sesión basado en tokens con contraseñas hasheadas y manejo de sesiones a través de cookies HttpOnly.
- **Módulo de Estudiantes:** Administración completa de la información personal y académica de los estudiantes.
- **Módulo de Inscripciones:** Manejo del proceso de inscripción de estudiantes en años escolares y secciones específicas.
- **Módulo de Evaluaciones:** Registro de calificaciones y observaciones de los estudiantes por asignatura.
- **API RESTful:** Arquitectura de backend desacoplada que permite consumir los servicios desde cualquier cliente.
- **Validación de Datos:** Validación robusta tanto en el backend (con Valitron) como en el frontend.

## Pila Tecnológica (Tech Stack)

### Backend (servidor)

- **Lenguaje:** PHP 8+
- **Servidor:** Apache (a través de XAMPP)
- **Base de Datos:** MySQL/MariaDB
- **Manejo de Dependencias:** Composer
- **Enrutamiento:** `altorouter/altorouter`
- **Validación:** `vlucas/valitron`
- **Interacción con BD:** PDO (PHP Data Objects)

### Frontend (cliente)

- **Librería:** React 18+
- **Enrutamiento:** `react-router-dom`
- **Peticiones HTTP:** `axios`
- **Alertas y Notificaciones:** `sweetalert2`
- **Estilos:** TailwindCSS (inferido por las clases `className`)
- **Manejo de Dependencias:** npm o yarn

## Prerrequisitos

- XAMPP (o una pila equivalente con Apache, MySQL y PHP 8+).
- Composer para las dependencias de PHP.
- Node.js y npm para el entorno de frontend.

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar el entorno de desarrollo local.

### 1. Configuración del Backend (`servidor`)

1.  **Clonar el repositorio** (o asegurarse de que los archivos estén en su lugar).
2.  Coloca la carpeta del proyecto (`controlestudios`) dentro del directorio `htdocs` de tu instalación de XAMPP. La ruta final debería ser `C:/xampp/htdocs/controlestudios`.
3.  **Instalar dependencias de PHP:**
    ```bash
    cd c:\xampp\htdocs\controlestudios\servidor
    composer install
    ```
4.  **Crear la Base de Datos:**
    - Abre phpMyAdmin (o tu cliente de MySQL preferido).
    - Crea una nueva base de datos (ej. `control_estudios`).
    - Importa el archivo `.sql` con la estructura de las tablas. (Nota: Este archivo debe ser creado a partir de los modelos existentes).
5.  **Configurar la Conexión:**
    - Abre el archivo `servidor/src/Config/Conexion.php`.
    - Asegúrate de que los datos de conexión (host, nombre de la base de datos, usuario y contraseña) coincidan con tu configuración local.
6.  **Iniciar Apache y MySQL** desde el panel de control de XAMPP.

### 2. Configuración del Frontend (`cliente`)

1.  **Instalar dependencias de Node.js:**
    ```bash
    cd c:\xampp\htdocs\controlestudios\cliente
    npm install
    ```
2.  **Iniciar el servidor de desarrollo de React:**
    ```bash
    npm run dev
    ```
3.  Abre tu navegador y visita http://localhost:5173 para ver la aplicación en funcionamiento.

## Estructura de la API

El backend expone varios endpoints para gestionar los recursos de la aplicación. El punto de entrada base es `http://localhost:8080/controlestudios/servidor`.

### Autenticación

- `POST /iniciar-sesion`: Autentica a un usuario y crea una sesión.
- `GET /verificar-sesion`: Comprueba si existe una sesión activa.

### Usuarios (`/usuarios`)

- `GET /`: Obtiene una lista de todos los usuarios.
- `GET /[i:id]`: Obtiene un usuario específico por su ID.
- `POST /`: Crea un nuevo usuario.
- `PUT /[i:id]`: Actualiza un usuario existente.
- `DELETE /[i:id]`: Elimina un usuario.

_(Se pueden documentar aquí otros endpoints para Estudiantes, Inscripciones, etc., siguiendo el mismo formato)._

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
