import axios from "axios";
import Swal from "sweetalert2";

export const Solicitud = async (e, username, password, navigate) => {
  console.log("Solicitud function called");
  e.preventDefault();

  if (username.trim() === "" || password.trim() === "") {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Ambos campos deben ser rellenados.",
    });
    return;
  }

  try {
    const response = await axios.post("URL_DE_TU_BACKEND/login", {
      username,
      password,
    });

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
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.",
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

const RespuestaPositiva = (data, navigate) => {
  // Desestructuración de la respuesta del servidor
  const { msg, token, usuario, nivel, url } = data;

  // Almacenamiento en localStorage para persistir la sesión
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", usuario);
  localStorage.setItem("nivel", nivel);
  localStorage.setItem("url_foto", url);

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
};
