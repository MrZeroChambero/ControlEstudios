import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../../utilidades/respuestaBackend";

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

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      "No se pudo completar la operación."
    );

    if (!compat.success) {
      throw {
        response: { data: compat.raw },
        message: compat.message,
      };
    }

    const successMessage = currentArea ? "¡Actualizado!" : "¡Creado!";
    Swal.fire(successMessage, compat.message, "success");
    solicitudAreasAprendizaje({ setIsLoading, setAreas });
    closeModal();
  } catch (error) {
    console.error("Error al guardar área de aprendizaje:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "Error de comunicación con el servidor."
    );

    if (compat.errors && Object.keys(compat.errors).length > 0) {
      const erroresFormateados = Object.entries(compat.errors).map(
        ([campo, mensajes]) =>
          `${campo}: ${
            Array.isArray(mensajes) ? mensajes.join(", ") : mensajes
          }`
      );
      Swal.fire("Error de validación", erroresFormateados.join("\n"), "error");
    } else {
      Swal.fire("Error", compat.message, "error");
    }
  }
};
