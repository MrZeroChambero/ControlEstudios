import Swal from 'sweetalert2';
import axios from 'axios';

export const eliminarComponenteAprendizaje = (id, API_URL, refetchData) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, ¡elimínalo!',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
        if (response.data.back) {
          Swal.fire(
            '¡Eliminado!',
            'El componente de aprendizaje ha sido eliminado.',
            'success'
          );
          refetchData();
        } else {
          Swal.fire(
            'Error',
            response.data.message || 'No se pudo eliminar el componente.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error al eliminar el componente de aprendizaje:', error);
        Swal.fire(
          'Error',
          'No se pudo eliminar el componente de aprendizaje.',
          'error'
        );
      }
    }
  });
};
