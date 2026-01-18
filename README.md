# Sistema de Control de Estudios

Este es un sistema de gestión académica diseñado para administrar la información de estudiantes, inscripciones, evaluaciones y personal de una institución educativa. La aplicación está construida con un backend en PHP que sirve una API REST y un frontend en React.

## Pila Tecnológica (Tech Stack)

### Backend (`servidor/`)

- **Lenguaje:** PHP 8+
- **Base de Datos:** MySQL/MariaDB
- **Servidor Web:** Apache (o similar)
- **Manejo de Dependencias:** Composer
- **Librerías Clave:**
  - `altorouter/altorouter` para enrutamiento.
  - `vlucas/valitron` para validación de datos.
  - PDO (PHP Data Objects) para la interacción con la base de datos.

### Frontend (`cliente/`)

- **Librería:** React 18+ (con Vite)
- **Manejo de Dependencias:** npm
- **Librerías Clave:**
  - `react-router-dom` para enrutamiento en el cliente.
  - `axios` para realizar peticiones HTTP a la API.
  - `sweetalert2` para alertas y notificaciones.
  - `react-data-table-component` para la visualización de tablas.
  - `tailwindcss` y `styled-components` para los estilos.

## Prerrequisitos

- **XAMPP:** O una pila de servidor equivalente con Apache, MySQL y PHP 8+.
- **Composer:** Para instalar las dependencias del backend de PHP.
- **Node.js:** (Versión 18 o superior) y npm para el entorno de frontend.
- **Git:** Para clonar el repositorio.

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar el entorno de desarrollo local.

### 1. Clonar y Preparar el Proyecto

1.  Abre tu terminal y navega hasta el directorio `htdocs` de tu instalación de XAMPP.
    ```bash
    cd C:\xampp\htdocs
    ```
2.  Clona el repositorio del proyecto.
    ```bash
    git clone <URL_DEL_REPOSITORIO> controlestudios
    ```
    (Reemplaza `<URL_DEL_REPOSITORIO>` con la URL real del repositorio git). Si ya tienes los archivos, simplemente asegúrate de que la carpeta del proyecto se llame `controlestudios` y esté en `htdocs`.

### 2. Configuración del Backend (`servidor/`)

1.  **Iniciar Servicios:** Inicia los módulos de **Apache** y **MySQL** desde el panel de control de XAMPP.
2.  **Crear la Base de Datos:**
    -   Abre phpMyAdmin (generalmente en `http://localhost/phpmyadmin`).
    -   Crea una nueva base de datos llamada `escuela`.
    -   Selecciona la base de datos `escuela` y ve a la pestaña **Importar**.
    -   Importa el archivo `escuela16-1-12.sql` que se encuentra en la raíz del proyecto.
3.  **Verificar Conexión (Opcional):**
    -   El archivo `servidor/src/Config/Conexion.php` está preconfigurado para conectarse a la base de datos `escuela` en `localhost` con el usuario `root` y sin contraseña. Si tu configuración de MySQL es diferente, ajusta los valores en este archivo.
4.  **Instalar dependencias de PHP:**
    -   Navega al directorio del servidor en tu terminal y ejecuta Composer.
    ```bash
    cd C:\xampp\htdocs\controlestudios\servidor
    composer install
    ```

### 3. Configuración del Frontend (`cliente/`)

1.  **Instalar dependencias de Node.js:**
    -   En una nueva terminal, navega al directorio del cliente.
    ```bash
    cd C:\xampp\htdocs\controlestudios\cliente
    npm install
    ```
2.  **Iniciar el servidor de desarrollo de React:**
    -   Para iniciar el servidor y abrir la aplicación en tu navegador, ejecuta:
    ```bash
    npm run init
    ```
    -   Si prefieres solo iniciar el servidor, usa `npm run dev`.
3.  El servidor de desarrollo se iniciará y la aplicación estará disponible en `http://localhost:5173`.

## Acceso a la Aplicación

-   **Frontend (Cliente):** [http://localhost:5173](http://localhost:5173)
-   **Backend (API):** El punto de entrada de la API es `http://localhost/controlestudios/`. Las rutas específicas (ej. `/servidor/login`, `/servidor/estudiantes`) son manejadas por el enrutador.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.