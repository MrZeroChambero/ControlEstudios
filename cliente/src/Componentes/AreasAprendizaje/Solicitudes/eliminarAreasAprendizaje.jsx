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

        if (!response.data || response.data.exito !== true) {
          throw {
            response: {
              data: response.data ?? {
                exito: false,
                mensaje: "No se pudo eliminar el área de aprendizaje.",
              },
            },
          };
        }

        Swal.fire("¡Borrado!", response.data.mensaje, "success");
        solicitudAreasAprendizaje({ setIsLoading, setAreas });
      } catch (error) {
        console.error("Error al eliminar área de aprendizaje:", error);
        const errorData = error.response?.data;

        if (errorData && errorData.exito === false) {
          console.error(
            "Error del backend:",
            errorData.mensaje,
            errorData.errores
          );
          Swal.fire(
            "Error",
            errorData.mensaje || "No se pudo eliminar el área de aprendizaje.",
            "error"
          );
        } else {
          Swal.fire(
            "Error",
            "No se pudo eliminar el área de aprendizaje.",
            "error"
          );
        }
      }
    }
  });
};
