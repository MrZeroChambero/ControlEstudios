import axios from "axios";
import Swal from "sweetalert2";

export const solicitudComponentesAprendizaje = async ({ setIsLoading, setComponentes }) => {
  const API_URL = "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje";
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });
    if (response.data.back) {
      setComponentes(response.data.data);
    } else {
      Swal.fire("Error", "No se pudieron cargar los componentes de aprendizaje.", "error");
      setComponentes([]);
    }
  } catch (error) {
    console.error("Error al obtener componentes de aprendizaje:", error);
    Swal.fire("Error", "No se pudieron cargar los componentes de aprendizaje.", "error");
  } finally {
    setIsLoading(false);
  }
};
