import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/evaluaciones";

export const solicitarEvaluaciones = async (
  setEvaluaciones,
  setIsLoading,
  Swal
) => {
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });

    console.log("Evaluaciones cargadas:", response.status, response.data);

    if (response.data && response.data.back === true) {
      setEvaluaciones(response.data.data);
    } else {
      console.error("El backend no respondió correctamente:", response.data);
      Swal.fire("Error", "No se pudieron cargar las evaluaciones.", "error");
      setEvaluaciones([]);
    }
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar las evaluaciones.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar las evaluaciones.", "error");
    }
  } finally {
    setIsLoading(false);
  }
};

export const eliminarEvaluacion = async (id, cargarDatos, Swal) => {
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
        Swal.fire("¡Borrado!", "La evaluación ha sido eliminada.", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar evaluación:", error);
        const errorData = error.response?.data;

        if (errorData && errorData.back === false) {
          console.error(
            "Error del backend:",
            errorData.message,
            errorData.error_details
          );
          Swal.fire(
            "Error",
            errorData.message || "No se pudo eliminar la evaluación.",
            "error"
          );
        } else {
          Swal.fire("Error", "No se pudo eliminar la evaluación.", "error");
        }
      }
    }
  });
};

export const enviarEvaluacion = async (
  e,
  formData,
  currentEvaluacion,
  closeModal,
  cargarDatos,
  Swal
) => {
  e.preventDefault();

  // Limpiar el texto (eliminar espacios extras)
  const dataToSend = {
    ...formData,
    nombre_evaluacion: formData.nombre_evaluacion.trim().replace(/\s+/g, " "),
    descripcion: formData.descripcion.trim().replace(/\s+/g, " "),
  };

  try {
    let response;
    if (currentEvaluacion) {
      // Actualizar evaluación
      response = await axios.put(
        `${API_URL}/${currentEvaluacion.id_evaluacion}`,
        dataToSend,
        { withCredentials: true }
      );
    } else {
      // Crear evaluación
      response = await axios.post(API_URL, dataToSend, {
        withCredentials: true,
      });
    }

    // Verificar si el backend respondió
    if (response.data && response.data.back === true) {
      const successMessage = currentEvaluacion ? "¡Actualizado!" : "¡Creado!";
      Swal.fire(successMessage, response.data.message, "success");
      cargarDatos();
      closeModal();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al guardar evaluación:", error);
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

export const cambioEstadoEvaluacion = async (id, cargarDatos, Swal) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/estado`,
      {},
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      Swal.fire(
        "¡Éxito!",
        "Estado de la evaluación cambiado correctamente.",
        "success"
      );
      cargarDatos();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al cambiar estado de la evaluación:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      console.error(
        "Error del backend:",
        errorData.message,
        errorData.error_details
      );
      throw new Error(
        errorData.message || "No se pudo cambiar el estado de la evaluación"
      );
    }
    throw error;
  }
};
