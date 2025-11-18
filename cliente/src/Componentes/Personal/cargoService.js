import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/cargos";

// Servicios para Cargos
export const solicitarCargos = async (setCargos, Swal) => {
  try {
    const response = await axios.get(`${API_URL}`, { withCredentials: true });

    if (response.data && response.data.back === true) {
      setCargos(response.data.data);
    } else {
      console.error("Backend no respondió para cargos:", response.data);
      Swal.fire("Error", "No se pudieron cargar los cargos.", "error");
    }
  } catch (error) {
    console.error("Error al obtener cargos:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar los cargos.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar los cargos.", "error");
    }
  }
};

export const solicitarCargosSelect = async (setCargos, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/select`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      setCargos(response.data.data);
    } else {
      console.error("Backend no respondió para cargos select:", response.data);
      Swal.fire("Error", "No se pudieron cargar los cargos.", "error");
    }
  } catch (error) {
    console.error("Error al obtener cargos select:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar los cargos.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar los cargos.", "error");
    }
  }
};

export const obtenerCargo = async (id, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al obtener cargo:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudo cargar la información del cargo.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudo cargar la información del cargo.",
        "error"
      );
    }
    return null;
  }
};

export const crearCargo = async (formData, Swal) => {
  try {
    const response = await axios.post(`${API_URL}`, formData, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      Swal.fire("¡Éxito!", response.data.message, "success");
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al crear cargo:", error);
    const errorData = error.response?.data;

    if (errorData) {
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
    return null;
  }
};

export const actualizarCargo = async (id, formData, Swal) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      Swal.fire("¡Éxito!", response.data.message, "success");
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al actualizar cargo:", error);
    const errorData = error.response?.data;

    if (errorData) {
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
    return null;
  }
};

export const eliminarCargo = async (id, cargarDatos, Swal) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
        Swal.fire("¡Borrado!", "El cargo ha sido eliminado.", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar cargo:", error);
        const errorData = error.response?.data;
        Swal.fire(
          "Error",
          errorData?.message || "No se pudo eliminar el cargo.",
          "error"
        );
      }
    }
  });
};
