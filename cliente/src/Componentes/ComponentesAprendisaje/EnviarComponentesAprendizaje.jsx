import axios from "axios";

const formatearErrores = (errores) => {
  if (!errores) {
    return "Ocurrió un error inesperado.";
  }

  return Object.values(errores)
    .flat()
    .map((mensaje) => `• ${mensaje}`)
    .join("\n");
};

export const enviarComponenteAprendizaje = async ({
  formData,
  currentComponente,
  API_URL,
  refetchData,
  closeModal,
  Swal,
}) => {
  const payload = {
    fk_area: formData.fk_area ? Number(formData.fk_area) : null,
    nombre_componente: formData.nombre_componente.trim().replace(/\s+/g, " "),
    especialista: formData.especialista.trim().replace(/\s+/g, " "),
    evalua: formData.evalua,
  };

  try {
    const url = currentComponente
      ? `${API_URL}/${currentComponente.id_componente}`
      : API_URL;
    const metodo = currentComponente ? axios.put : axios.post;

    const response = await metodo(url, payload, { withCredentials: true });

    if (response.data?.exito) {
      const mensaje =
        response.data.mensaje ||
        (currentComponente
          ? "Componente actualizado correctamente."
          : "Componente creado correctamente.");
      Swal.fire("¡Éxito!", mensaje, "success");
      refetchData();
      closeModal();
      return;
    }

    const mensajeError =
      formatearErrores(response.data?.errores) ||
      response.data?.mensaje ||
      "Los datos enviados no son válidos.";
    Swal.fire(
      "Error de validación",
      mensajeError.replace(/\n/g, "<br>"),
      "error"
    );
  } catch (error) {
    console.error("Error al guardar el componente de aprendizaje:", error);
    const respuesta = error.response?.data;

    if (respuesta?.errores) {
      const detalle = formatearErrores(respuesta.errores);
      Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
      return;
    }

    const mensaje =
      respuesta?.mensaje ||
      (error.response
        ? `Error ${error.response.status} del servidor.`
        : "No se pudo comunicar con el servidor.");

    Swal.fire("Error", mensaje, "error");
  }
};
