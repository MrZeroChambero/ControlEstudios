import axios from "axios";

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

      if (response.data?.exito) {
        Swal.fire(
          "¡Eliminado!",
          response.data.mensaje ||
            "El componente de aprendizaje fue eliminado correctamente.",
          "success"
        );
        refetchData();
        return;
      }

      const detalle =
        formatearErrores(response.data?.errores) || response.data?.mensaje;
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
      const respuesta = error.response?.data;
      const detalle =
        formatearErrores(respuesta?.errores) ||
        respuesta?.mensaje ||
        "No se pudo eliminar el componente de aprendizaje.";
      Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
    }
  });
};
