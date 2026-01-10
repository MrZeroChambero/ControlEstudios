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
    const status =
      error?.response?.status ?? (error?.request ? "NO_RESPONSE" : "UNKNOWN");

    // Funciones flecha para manejar cada tipo de respuesta
    const handle400 = (err) => {
      const payload = err.response.data;
      const detalleIntentos = formatAttemptMessage(payload);
      onAttemptUpdate?.(detalleIntentos);
      const baseMessage = payload?.msg;
      Swal.fire({
        icon: "error",
        title: "Error en la solicitud",
        text: baseMessage || "La solicitud no es válida. Revisa los datos.",
      });
    };

    const handle401 = (err) => {
      const payload = err.response.data;
      const detalleIntentos = formatAttemptMessage(payload);
      onAttemptUpdate?.(detalleIntentos);
      const baseMessage = payload?.msg;
      Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        html: buildAttemptHtml(baseMessage, detalleIntentos),
      });
    };

    const handle423 = (err) => {
      const payload = err.response.data;
      const detalleIntentos = formatAttemptMessage(payload);
      onAttemptUpdate?.(detalleIntentos);
      const baseMessage = payload?.msg;
      Swal.fire({
        icon: "warning",
        title: "Demasiados intentos",
        html: buildAttemptHtml(baseMessage, detalleIntentos),
      });
    };

    const handle500 = (err) => {
      const payload = err.response.data;
      const detalleIntentos = formatAttemptMessage(payload);
      onAttemptUpdate?.(detalleIntentos);
      const baseMessage = payload?.msg;
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text:
          baseMessage ||
          "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.",
      });
    };

    const handleNoResponse = () => {
      onAttemptUpdate?.(null);
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "El servidor está fuera de servicio.",
      });
    };

    const handleUnknown = () => {
      onAttemptUpdate?.(null);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado. Por favor, contacta al soporte técnico.",
      });
    };

    switch (status) {
      case 400:
        handle400(error);
        break;
      case 401:
        handle401(error);
        break;
      case 423:
        handle423(error);
        break;
      case 500:
        handle500(error);
        break;
      case "NO_RESPONSE":
        handleNoResponse();
        break;
      case "UNKNOWN":
      default:
        handleUnknown();
        break;
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
