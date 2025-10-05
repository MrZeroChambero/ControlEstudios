import axios from "axios";
import Swal from "sweetalert2";
export const solicitudUsuarios = async ({ setIsLoading, setUsuarios }) => {
  const API_URL = "http://localhost:8080/controlestudios/servidor/usuarios";
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });
    console.log("Usuarios cargados:", response.status, response.data);
    if (response.data.back === undefined) {
      // Manejar el caso cuando 'back' es 'true'
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
      setUsuarios([]);
      return;
    }
    setUsuarios(response.data.data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
  } finally {
    setIsLoading(false);
  }
};
