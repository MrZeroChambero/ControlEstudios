import axios from "axios";
import Swal from "sweetalert2";
import { RespuestaPositiva } from "./Solicitud.jsx";
export const verificarSesion = async (navigate) => {
  console.log("Verificando sesión...");
  try {
    // Hacemos una petición a un endpoint que verifique la sesión.
    // Axios enviará la cookie 'session_token' automáticamente.
    const response = await axios.get(
      "http://localhost:8080/controlestudios/servidor/verificar-sesion",
      {
        withCredentials: true,
      }
    );

    // Manejo de respuesta exitosa (código 200)
    if (response.status === 200) {
      RespuestaPositiva(response.data, navigate);
    }
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      switch (error.response.status) {
        case 400: // Bad Request
          Swal.fire({
            icon: "error",
            title: "Error en la solicitud",
            text:
              error.response.data.msg ||
              "La solicitud no es válida. Revisa los datos.",
          });
          break;
        case 401: // Unauthorized
          Swal.fire({
            icon: "error",
            title: "Credenciales incorrectas",
            text: error.response.data.msg || "Usuario o contraseña inválidos.",
          });
          break;
        case 500: // Internal Server Error
          Swal.fire({
            icon: "error",
            title: "Error del servidor",
            text:
              error.response.data.msg ||
              "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.",
          });
          break;
        default:
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response.data.msg ||
              `El servidor respondió con el código: ${error.response.status}`,
          });
          break;
      }
    } else if (error.request) {
      // La solicitud fue hecha, pero no se recibió respuesta
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Verifica que el servidor (XAMPP) esté en ejecución y que la URL sea correcta.",
      });
    } else {
      // Algo más causó el error
      console.error("Error inesperado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado. Por favor, contacta al soporte técnico.",
      });
    }
  }
};
