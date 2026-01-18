import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

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
  const DatosFormulario = {
    fk_area: formData.fk_area ? Number(formData.fk_area) : null,
    nombre_componente: formData.nombre_componente.trim().replace(/\s+/g, " "),
    especialista: formData.especialista.trim().replace(/\s+/g, " "),
    evalua: formData.evalua,
    grupo: formData.grupo,
  };

  try {
    const url = currentComponente
      ? `${API_URL}/${currentComponente.id_componente}`
      : API_URL;
    const metodo = currentComponente ? axios.put : axios.post;

    const response = await metodo(url, DatosFormulario, { withCredentials: true });
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      currentComponente
        ? "No se pudo actualizar el componente."
        : "No se pudo crear el componente."
    );
    console.log({ Accion: "Resgistrar Componente de aprendizaje", response });
    if (compat.success) {
      const mensaje =
        compat.message ||
        (currentComponente
          ? "Componente actualizado correctamente."
          : "Componente creado correctamente.");
      Swal.fire("¡Éxito!", mensaje, "success");
      refetchData();
      closeModal();
      return;
    }

    const mensajeError =
      formatearErrores(compat.errors) ||
      compat.message ||
      "Los datos enviados no son válidos.";
    Swal.fire(
      "Error de validación",
      mensajeError.replace(/\n/g, "<br>"),
      "error"
    );
  } catch (error) {
    console.error("Error al guardar el componente de aprendizaje:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo comunicar con el servidor."
    );

    if (compat.errors) {
      const detalle = formatearErrores(compat.errors);
      Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
      return;
    }

    Swal.fire("Error", compat.message, "error");
  }
};


