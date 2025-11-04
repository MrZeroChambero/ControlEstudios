export const EnviarAreasAprendizaje = async (props) => {
  const {
    e,
    formData,
    currentArea,
    closeModal,
    API_URL,
    Swal,
    axios,
    solicitudAreasAprendizaje,
    setIsLoading,
    setAreas,
  } = props;

  e.preventDefault();

  // Limpiar el texto del nombre del área (eliminar espacios extras)
  const dataToSend = {
    ...formData,
    nombre_area: formData.nombre_area.trim().replace(/\s+/g, " "),
  };

  try {
    let response;
    if (currentArea) {
      // Actualizar área
      response = await axios.put(
        `${API_URL}/${currentArea.id_area_aprendizaje}`,
        dataToSend,
        { withCredentials: true }
      );
    } else {
      // Crear área
      response = await axios.post(API_URL, dataToSend, {
        withCredentials: true,
      });
    }

    // Verificar si el backend respondió
    if (response.data && response.data.back === true) {
      const successMessage = currentArea ? "¡Actualizado!" : "¡Creado!";
      Swal.fire(successMessage, response.data.message, "success");
      solicitudAreasAprendizaje({ setIsLoading, setAreas });
      closeModal();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al guardar área de aprendizaje:", error);
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
