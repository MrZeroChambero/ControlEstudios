import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/temas";

export const crearTema = async (data, Swal) => {
  try {
    const response = await axios.post(API_URL, data, { withCredentials: true });

    if (response.data && response.data.back === true) {
      Swal.fire("¡Creado!", "Tema creado exitosamente.", "success");
      return response.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al crear tema:", error);
    const errorData = error.response?.data;

    if (errorData) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );

      if (errorData.back === false) {
        if (errorData.errors) {
          const errors = Object.entries(errorData.errors).map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          );
          const errorMsg = errors.join("\n");
          Swal.fire("Error de validación", errorMsg, "error");
        } else {
          Swal.fire("Error", errorData.message || "Ocurrió un error.", "error");
        }
      } else {
        Swal.fire("Error", "Error de comunicación con el servidor.", "error");
      }
    } else {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    }
    throw error;
  }
};

export const actualizarTema = async (id, data, Swal) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      Swal.fire("¡Actualizado!", "Tema actualizado exitosamente.", "success");
      return response.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al actualizar tema:", error);
    const errorData = error.response?.data;

    if (errorData) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );

      if (errorData.back === false) {
        if (errorData.errors) {
          const errors = Object.entries(errorData.errors).map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          );
          const errorMsg = errors.join("\n");
          Swal.fire("Error de validación", errorMsg, "error");
        } else {
          Swal.fire("Error", errorData.message || "Ocurrió un error.", "error");
        }
      } else {
        Swal.fire("Error", "Error de comunicación con el servidor.", "error");
      }
    } else {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    }
    throw error;
  }
};

export const eliminarTema = async (id, Swal) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      return response.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al eliminar tema:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      Swal.fire(
        "Error",
        errorData.message || "No se pudo eliminar el tema.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudo eliminar el tema.", "error");
    }
    throw error;
  }
};

export const cambioEstadoTema = async (id, Swal) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/estado`,
      {},
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      return response.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al cambiar estado del tema:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      Swal.fire(
        "Error",
        errorData.message || "No se pudo cambiar el estado del tema.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudo cambiar el estado del tema.", "error");
    }
    throw error;
  }
};
