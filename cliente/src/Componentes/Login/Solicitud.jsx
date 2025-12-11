import axios from "axios";
import Swal from "sweetalert2";
import {
  formatAttemptMessage,
  buildAttemptHtml,
} from "../../utils/attemptMessages";

export const Solicitud = async (
  e,
  username,
  password,
  navigate,
  onAttemptUpdate
) => {
  e.preventDefault();

  if (username.trim() === "" || password.trim() === "") {
    onAttemptUpdate?.(null);
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Ambos campos deben ser rellenados.",
    });
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:8080/controlestudios/servidor/iniciar-sesion",
      { username, password },
      { withCredentials: true }
    );

    if (response.status === 200) {
      onAttemptUpdate?.(null);
      RespuestaPositiva(response.data, navigate);
    }
  } catch (error) {
    if (error.response) {
      const payload = error.response.data;
      const detalleIntentos = formatAttemptMessage(payload);
      onAttemptUpdate?.(detalleIntentos);

      const baseMessage = payload?.msg;
      const alertaConIntentos = (titulo, icono = "error") => {
        Swal.fire({
          icon: icono,
          title: titulo,
          html: buildAttemptHtml(baseMessage, detalleIntentos),
        });
      };

      switch (error.response.status) {
        case 400:
          Swal.fire({
            icon: "error",
            title: "Error en la solicitud",
            text: baseMessage || "La solicitud no es válida. Revisa los datos.",
          });
          break;
        case 401:
          alertaConIntentos("Credenciales incorrectas");
          break;
        case 423:
          alertaConIntentos("Demasiados intentos", "warning");
          break;
        case 500:
          Swal.fire({
            icon: "error",
            title: "Error del servidor",
            text:
              baseMessage ||
              "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.",
          });
          break;
        default:
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              baseMessage ||
              `El servidor respondió con el código: ${error.response.status}`,
          });
          break;
      }
    } else if (error.request) {
      onAttemptUpdate?.(null);
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Verifica que el servidor (XAMPP) esté en ejecución y que la URL sea correcta.",
      });
    } else {
      onAttemptUpdate?.(null);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado. Por favor, contacta al soporte técnico.",
      });
    }
  }
};

export const RespuestaPositiva = (data, navigate) => {
  // Desestructuración de la respuesta del servidor
  const { msg, nombre_usuario, rol, back } = data;

  // Validar que los datos esenciales están presentes
  if (nombre_usuario && rol && msg && back) {
    // El token ya no se guarda en localStorage, se maneja como una cookie HttpOnly.
    // Mantenemos los otros datos para la UI si es necesario.
    localStorage.setItem("usuario", nombre_usuario);
    localStorage.setItem("nivel", rol);
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: msg || "Inicio de sesión exitoso.",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      // Redirigir al dashboard después de la alerta
      navigate("/dashboard");
    });
  } else {
    // Si los datos esperados no están, mostrar un error
    Swal.fire({
      icon: "error",
      title: "Error de autenticación",
      text: "La respuesta del servidor no es válida. Por favor, contacta al soporte técnico.",
    });
    console.error("Respuesta inválida del servidor:", data);
  }
};
