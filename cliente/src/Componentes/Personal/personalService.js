import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/personal";

// Servicios para Personal
export const solicitarPersonal = async (setPersonal, setIsLoading, Swal) => {
  try {
    setIsLoading(true);
    const response = await axios.get(`${API_URL}`, { withCredentials: true });

    if (response.data && response.data.back === true) {
      setPersonal(response.data.data);
    } else {
      console.error("Backend no respondió para personal:", response.data);
      Swal.fire("Error", "No se pudieron cargar el personal.", "error");
      setPersonal([]);
    }
  } catch (error) {
    console.error("Error al obtener personal:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar el personal.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar el personal.", "error");
    }
  } finally {
    setIsLoading(false);
  }
};

export const obtenerPersonalCompleto = async (id, Swal) => {
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
    console.error("Error al obtener personal completo:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudo cargar la información del personal.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudo cargar la información del personal.",
        "error"
      );
    }
    return null;
  }
};

export const actualizarPersonal = async (id, formData, Swal) => {
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
    console.error("Error al actualizar personal:", error);
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

export const eliminarPersonal = async (id, cargarDatos, Swal) => {
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
        Swal.fire("¡Borrado!", "El personal ha sido eliminado.", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar personal:", error);
        const errorData = error.response?.data;
        Swal.fire(
          "Error",
          errorData?.message || "No se pudo eliminar el personal.",
          "error"
        );
      }
    }
  });
};

// Servicios para creación de personal (ya existentes)
export const solicitarPersonasParaPersonal = async (setPersonas, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/personas-candidatas`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      setPersonas(response.data.data);
    } else {
      console.error("Backend no respondió para personas:", response.data);
      Swal.fire("Error", "No se pudieron cargar las personas.", "error");
    }
  } catch (error) {
    console.error("Error al obtener personas:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar las personas.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar las personas.", "error");
    }
  }
};

export const crearPersona = async (formData, Swal) => {
  try {
    const response = await axios.post(`${API_URL}/persona`, formData, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      Swal.fire("¡Éxito!", response.data.message, "success");
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al crear persona:", error);
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

export const completarPersonal = async (idPersona, formData, Swal) => {
  try {
    const response = await axios.post(
      `${API_URL}/persona/${idPersona}/completar`,
      formData,
      {
        withCredentials: true,
      }
    );

    if (response.data && response.data.back === true) {
      Swal.fire("¡Éxito!", response.data.message, "success");
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al completar personal:", error);
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

export const solicitarCargos = async (setCargos, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/cargos`, {
      withCredentials: true,
    });

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

export const solicitarFunciones = async (setFunciones, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/funciones`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      setFunciones(response.data.data);
    } else {
      console.error("Backend no respondió para funciones:", response.data);
      Swal.fire("Error", "No se pudieron cargar las funciones.", "error");
    }
  } catch (error) {
    console.error("Error al obtener funciones:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar las funciones.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar las funciones.", "error");
    }
  }
};

// Cambio de estado del personal (actualiza el estado de la persona asociada)
export const cambioEstadoPersonal = async (id, cargarDatos, Swal) => {
  try {
    // Obtener el personal actual para saber el estado actual de la persona
    const personalResponse = await axios.get(`${API_URL}/${id}`, {
      withCredentials: true,
    });

    if (personalResponse.data && personalResponse.data.back === true) {
      const personal = personalResponse.data.data;
      // El estado actual de la persona
      const estadoActual = personal.estado;
      const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

      // Se envía el nuevo estado para la persona
      const response = await axios.patch(
        `${API_URL}/${id}/estado`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );

      if (response.data && response.data.back === true) {
        Swal.fire(
          "¡Éxito!",
          `Estado del personal cambiado a ${nuevoEstado} correctamente.`,
          "success"
        );
        cargarDatos();
      } else {
        throw new Error("El backend no respondió correctamente");
      }
    }
  } catch (error) {
    console.error("Error al cambiar estado del personal:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudo cambiar el estado del personal.",
      "error"
    );
    throw error;
  }
};

// Actualizar una persona (para edición)
export const actualizarPersona = async (id, formData, Swal) => {
  try {
    const response = await axios.put(
      `http://localhost:8080/controlestudios/servidor/personas/${id}`,
      formData,
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      // No mostrar alerta de éxito aquí porque se mostrará al actualizar el personal
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al actualizar persona:", error);
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
