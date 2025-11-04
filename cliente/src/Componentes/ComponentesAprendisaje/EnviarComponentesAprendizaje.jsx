import Swal from "sweetalert2";
import axios from "axios";

export const enviarComponenteAprendizaje = async (
  formData,
  currentComponente,
  API_URL,
  refetchData,
  closeModal
) => {
  try {
    let response;
    if (currentComponente) {
      // Actualizar
      response = await axios.put(
        `${API_URL}/${currentComponente.id_componente}`,
        formData,
        { withCredentials: true }
      );
    } else {
      // Crear
      response = await axios.post(API_URL, formData, { withCredentials: true });
    }

    console.log(response.data);

    // Verificar si el backend respondió correctamente
    if (response.data.back === true) {
      Swal.fire("¡Guardado!", response.data.message, "success");
      refetchData();
      closeModal();
    } else {
      // Manejar errores de validación del backend
      const errorMsg = response.data.errors
        ? Object.values(response.data.errors).flat().join("<br>")
        : response.data.message || "Error de validación";
      Swal.fire("Error de validación", errorMsg, "error");
    }
  } catch (error) {
    console.error("Error al guardar el componente de aprendizaje:", error);

    // Manejo de errores HTTP
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 500) {
        Swal.fire(
          "Error del Servidor",
          "Ocurrió un error interno en el servidor. Por favor, inténtelo nuevamente.",
          "error"
        );
      } else if (status === 401) {
        Swal.fire(
          "Error de Credenciales",
          "Su sesión ha expirado o no tiene autorización. Por favor, inicie sesión nuevamente.",
          "warning"
        );
      } else if (status === 200) {
        // Caso especial: Respuesta 200 pero error en el cuerpo
        const errorMsg = errorData.errors
          ? Object.values(errorData.errors).flat().join("<br>")
          : errorData.message || "Error en el formato de respuesta";
        Swal.fire("Error de Procesamiento", errorMsg, "error");
      } else {
        // Otros errores HTTP
        const errorMsg = errorData?.message || `Error ${status} del servidor`;
        Swal.fire("Error", errorMsg, "error");
      }
    } else if (error.request) {
      // Error de red o sin respuesta
      Swal.fire(
        "Error de Red",
        "No se pudo conectar con el servidor. Verifique su conexión e inténtelo nuevamente.",
        "error"
      );
    } else {
      // Otros errores
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  }
};
