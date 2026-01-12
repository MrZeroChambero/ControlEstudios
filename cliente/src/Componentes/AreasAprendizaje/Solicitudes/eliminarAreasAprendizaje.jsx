import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../../utilidades/respuestaBackend";

export const eliminarAreasAprendizaje = async (props) => {
  const {
    Swal,
    axios,
    solicitudAreasAprendizaje,
    API_URL,
    setIsLoading,
    setAreas,
  } = props;
  const { id } = props;

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
        const response = await axios.delete(`${API_URL}/${id}`, {
          withCredentials: true,
        });

        const compat = normalizarRespuesta(
          asegurarCompatibilidad(response.data),
          "No se pudo eliminar el área de aprendizaje."
        );

        if (!compat.success) {
          throw {
            response: {
              data: compat.raw,
            },
            message: compat.message,
          };
        }

        Swal.fire("¡Borrado!", compat.message, "success");
        solicitudAreasAprendizaje({ setIsLoading, setAreas });
      } catch (error) {
        console.error("Error al eliminar área de aprendizaje:", error);
        const compat = normalizarRespuesta(
          asegurarCompatibilidad(error.response?.data),
          "No se pudo eliminar el área de aprendizaje."
        );

        Swal.fire("Error", compat.message, "error");
      }
    }
  });
};
