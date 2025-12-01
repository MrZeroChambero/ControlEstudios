import axios from "axios";
import Swal from "sweetalert2";

export const solicitudAreasAprendizaje = async ({ setIsLoading, setAreas }) => {
  const API_URL =
    "http://localhost:8080/controlestudios/servidor/areas_aprendizaje";

  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });

    console.log(
      "Áreas de aprendizaje cargadas:",
      response.status,
      response.data
    );

    // Verificar si el backend respondió
    if (!response.data || response.data.exito !== true) {
      console.error("El backend no respondió correctamente:", response.data);
      Swal.fire(
        "Error",
        response.data?.mensaje ||
          "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
      setAreas([]);
      return;
    }

    setAreas(response.data.datos ?? []);
  } catch (error) {
    console.error("Error al obtener áreas de aprendizaje:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.exito === false) {
      console.error("Error del backend:", errorData.mensaje, errorData.errores);
      Swal.fire(
        "Error",
        errorData.mensaje || "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudieron cargar las áreas de aprendizaje.",
        "error"
      );
    }
  } finally {
    setIsLoading(false);
  }
};
