import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/contenidos";

export const solicitarContenidos = async (
  setContenidos,
  setIsLoading,
  Swal
) => {
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });

    console.log("Contenidos cargados:", response.status, response.data);

    if (response.data && response.data.back === true) {
      setContenidos(response.data.data);
    } else {
      console.error("El backend no respondió correctamente:", response.data);
      Swal.fire("Error", "No se pudieron cargar los contenidos.", "error");
      setContenidos([]);
    }
  } catch (error) {
    console.error("Error al obtener contenidos:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar los contenidos.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar los contenidos.", "error");
    }
  } finally {
    setIsLoading(false);
  }
};

export const solicitarAreas = async (setAreas, Swal) => {
  try {
    const response = await axios.get(
      "http://localhost:8080/controlestudios/servidor/areas_aprendizaje/listar-select",
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      setAreas(response.data.data);
    } else {
      console.error("Backend no respondió para áreas:", response.data);
      Swal.fire(
        "Error",
        "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
    }
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
    }
  }
};

export const solicitarTemasPorContenido = async (idContenido, Swal) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/controlestudios/servidor/temas/contenido/${idContenido}`,
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      return response.data.data;
    } else {
      console.error("Backend no respondió para temas:", response.data);
      throw new Error("No se pudieron cargar los temas");
    }
  } catch (error) {
    console.error("Error al obtener temas:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      throw new Error(errorData.message || "No se pudieron cargar los temas");
    }
    throw error;
  }
};

export const eliminarContenido = async (id, cargarDatos, Swal) => {
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
        Swal.fire("¡Borrado!", "El contenido ha sido eliminado.", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar contenido:", error);
        const errorData = error.response?.data;

        if (errorData && errorData.back === false) {
          console.error(
            "Error del backend:",
            errorData.message,
            errorData.error_details
          );
          Swal.fire(
            "Error",
            errorData.message || "No se pudo eliminar el contenido.",
            "error"
          );
        } else {
          Swal.fire("Error", "No se pudo eliminar el contenido.", "error");
        }
      }
    }
  });
};

export const enviarContenido = async (
  e,
  formData,
  currentContenido,
  closeModal,
  cargarDatos,
  Swal
) => {
  e.preventDefault();

  // Limpiar el texto (eliminar espacios extras)
  const dataToSend = {
    ...formData,
    nombre: formData.nombre.trim().replace(/\s+/g, " "),
    descripcion: formData.descripcion.trim().replace(/\s+/g, " "),
  };

  try {
    let response;
    if (currentContenido) {
      // Actualizar contenido
      response = await axios.put(
        `${API_URL}/${currentContenido.id_contenido}`,
        dataToSend,
        { withCredentials: true }
      );
    } else {
      // Crear contenido
      response = await axios.post(API_URL, dataToSend, {
        withCredentials: true,
      });
    }

    // Verificar si el backend respondió
    if (response.data && response.data.back === true) {
      const successMessage = currentContenido ? "¡Actualizado!" : "¡Creado!";
      Swal.fire(successMessage, response.data.message, "success");
      cargarDatos();
      closeModal();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al guardar contenido:", error);
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
  }
};

export const cambioEstadoContenido = async (id, cargarDatos, Swal) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/estado`,
      {},
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      Swal.fire(
        "¡Éxito!",
        "Estado del contenido cambiado correctamente.",
        "success"
      );
      cargarDatos();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al cambiar estado del contenido:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      throw new Error(
        errorData.message || "No se pudo cambiar el estado del contenido"
      );
    }
    throw error;
  }
};
