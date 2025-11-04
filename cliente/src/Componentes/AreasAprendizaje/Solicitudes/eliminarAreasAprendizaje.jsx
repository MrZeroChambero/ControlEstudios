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
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
        Swal.fire(
          "¡Borrado!",
          "El área de aprendizaje ha sido eliminada.",
          "success"
        );
        solicitudAreasAprendizaje({ setIsLoading, setAreas });
      } catch (error) {
        console.error("Error al eliminar área de aprendizaje:", error);
        const errorData = error.response?.data;

        if (errorData && errorData.back === false) {
          console.error(
            "Error del backend:",
            errorData.message,
            errorData.error_details
          );
          Swal.fire(
            "Error",
            errorData.message || "No se pudo eliminar el área de aprendizaje.",
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
