export const eliminar = async (props) => {
  const { Swal, axios, solicitudUsuarios, API_URL, setIsLoading, setUsuarios } = props;
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
        Swal.fire("¡Borrado!", "El usuario ha sido eliminado.", "success");
        solicitudUsuarios({ setIsLoading, setUsuarios });
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  });
};
