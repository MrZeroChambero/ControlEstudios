import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const formatearErrores = (errores) => {
  if (!errores) {
    return "No se pudo eliminar el componente de aprendizaje.";
  }

  return Object.values(errores)
    .flat()
    .map((mensaje) => `• ${mensaje}`)
    .join("\n");
};

export const eliminarComponenteAprendizaje = ({
  id,
  API_URL,
  refetchData,
  Swal,
}) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#475569",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
      });

      const compat = normalizarRespuesta(
        asegurarCompatibilidad(response.data),
        "No se pudo eliminar el componente de aprendizaje."
      );

      if (compat.success) {
        Swal.fire(
          "¡Eliminado!",
          compat.message ||
            "El componente de aprendizaje fue eliminado correctamente.",
          "success"
        );
        refetchData();
        return;
      }

      const detalle = formatearErrores(compat.errors) || compat.message;
      Swal.fire(
        "Error",
        (detalle || "No se pudo eliminar el componente.").replace(
          /\n/g,
          "<br>"
        ),
        "error"
      );
    } catch (error) {
      console.error("Error al eliminar el componente de aprendizaje:", error);
      const compat = normalizarRespuesta(
        asegurarCompatibilidad(error.response?.data),
        "No se pudo eliminar el componente de aprendizaje."
      );
      const detalle = formatearErrores(compat.errors) || compat.message;
      Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
    }
  });
};
