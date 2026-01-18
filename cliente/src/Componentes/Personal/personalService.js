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
      Swal.fire("Error", "No se pudo cargar el personal.", "error");
      setPersonal([]);
    }
  } catch (error) {
    console.error("Error al obtener personal:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudo cargar el personal.",
      "error"
    );
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
    Swal.fire(
      "Error",
      errorData?.message || "No se pudo cargar la información del personal.",
      "error"
    );
    return null;
  }
};

export const actualizarPersonal = async (id, formData, Swal) => {
  try {
    // Remover cualquier intento de cambiar estado del personal (si llegara)
    const datos = { ...formData };
    delete datos.estado; // estado de personal no editable
    const response = await axios.put(`${API_URL}/${id}`, datos, {
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
    if (errorData?.errors) {
      const errors = Object.entries(errorData.errors).map(
        ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
      );
      Swal.fire("Error de validación", errors.join("\n"), "error");
    } else {
      Swal.fire(
        "Error",
        errorData?.message || "Ocurrió un error al actualizar.",
        "error"
      );
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

export const solicitarPersonasParaPersonal = async (setPersonas, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/personas-candidatas`, {
      withCredentials: true,
    });
    if (response.data && response.data.back === true) {
      setPersonas(response.data.data);
    } else {
      Swal.fire("Error", "No se pudieron cargar las personas.", "error");
    }
  } catch (error) {
    console.error("Error al obtener personas:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudieron cargar las personas.",
      "error"
    );
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
    if (errorData?.errors) {
      const errors = Object.entries(errorData.errors).map(
        ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
      );
      Swal.fire("Error de validación", errors.join("\n"), "error");
    } else {
      Swal.fire(
        "Error",
        errorData?.message || "Ocurrió un error al crear la persona.",
        "error"
      );
    }
    return null;
  }
};

export const completarPersonal = async (idPersona, formData, Swal) => {
  try {
    const datos = { ...formData };
    delete datos.estado; // siempre será 'activo' en backend
    const response = await axios.post(
      `${API_URL}/persona/${idPersona}/completar`,
      datos,
      { withCredentials: true }
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
    if (errorData?.errors) {
      const errors = Object.entries(errorData.errors).map(
        ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
      );
      Swal.fire("Error de validación", errors.join("\n"), "error");
    } else {
      Swal.fire(
        "Error",
        errorData?.message || "Ocurrió un error al completar el personal.",
        "error"
      );
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
      Swal.fire("Error", "No se pudieron cargar los cargos.", "error");
    }
  } catch (error) {
    console.error("Error al obtener cargos:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudieron cargar los cargos.",
      "error"
    );
  }
};

export const solicitarFunciones = async (setFunciones, Swal) => {
  try {
    // El backend migró funciones a cargos; solicitamos cargos y los mapeamos
    const response = await axios.get(`${API_URL}/cargos`, {
      withCredentials: true,
    });
    if (response.data && response.data.back === true) {
      // Mapear cargos a la forma legacy que espera el modal de Personal
      const mapped = (response.data.data || []).map((c) => ({
        id_funcion_personal: c.id_cargo,
        nombre: c.nombre_cargo,
        tipo: c.tipo,
      }));
      setFunciones(mapped);
    } else {
      Swal.fire(
        "Error",
        "No se pudieron cargar las funciones (cargos).",
        "error"
      );
    }
  } catch (error) {
    console.error("Error al obtener funciones:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudieron cargar las funciones (cargos).",
      "error"
    );
  }
};

// Cambio de estado (afecta personas.estado)
export const cambioEstadoPersonal = async (id, cargarDatos, Swal) => {
  try {
    const personalResponse = await axios.get(`${API_URL}/${id}`, {
      withCredentials: true,
    });
    if (personalResponse.data?.back === true) {
      const estadoActual = personalResponse.data.data.estado; // persona.estado
      const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
      const response = await axios.patch(
        `${API_URL}/${id}/estado`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );
      if (response.data?.back === true) {
        Swal.fire(
          "¡Éxito!",
          `Estado cambiado a ${nuevoEstado} correctamente.`,
          "success"
        );
        cargarDatos();
      } else {
        throw new Error("Respuesta inválida");
      }
    }
  } catch (error) {
    console.error("Error al cambiar estado del personal:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudo cambiar el estado.",
      "error"
    );
  }
};
