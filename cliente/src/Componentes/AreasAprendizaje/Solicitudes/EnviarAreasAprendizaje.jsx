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
      response = await axios.put(
        `${API_URL}/${currentArea.id_area_aprendizaje}`,
        dataToSend,
        { withCredentials: true }
      );
    } else {
      response = await axios.post(API_URL, dataToSend, {
        withCredentials: true,
      });
    }

    if (!response.data || response.data.exito !== true) {
      throw {
        response: {
          data: response.data ?? {
            exito: false,
            mensaje: "No se pudo completar la operación.",
          },
        },
      };
    }

    const successMessage = currentArea ? "¡Actualizado!" : "¡Creado!";
    Swal.fire(successMessage, response.data.mensaje, "success");
    solicitudAreasAprendizaje({ setIsLoading, setAreas });
    closeModal();
  } catch (error) {
    console.error("Error al guardar área de aprendizaje:", error);
    const errorData = error.response?.data;
    console.log(error);

    if (errorData) {
      console.error("Error del backend:", errorData.mensaje, errorData.errores);

      if (errorData.exito === false) {
        if (errorData.errores) {
          const erroresFormateados = Object.entries(errorData.errores).map(
            ([campo, mensajes]) =>
              `${campo}: ${
                Array.isArray(mensajes) ? mensajes.join(", ") : mensajes
              }`
          );
          const errorMsg = erroresFormateados.join("\n");
          Swal.fire("Error de validación", errorMsg, "error");
        } else {
          Swal.fire("Error", errorData.mensaje || "Ocurrió un error.", "error");
        }
      } else {
        Swal.fire("Error", "Error de comunicación con el servidor.", "error");
      }
    } else {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    }
  }
};
