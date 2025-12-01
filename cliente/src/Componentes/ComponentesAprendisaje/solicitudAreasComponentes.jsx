import axios from "axios";

const API_URL =
  "http://localhost:8080/controlestudios/servidor/areas_aprendizaje/listar-select";

export const solicitudAreasComponentes = async ({ setAreas, Swal }) => {
  try {
    const response = await axios.get(API_URL, { withCredentials: true });

    if (response.data?.exito === true) {
      const datos = Array.isArray(response.data.datos)
        ? response.data.datos
        : [];
      setAreas(datos);
    } else {
      const mensaje =
        response.data?.mensaje ||
        "No se pudieron cargar las áreas de aprendizaje activas.";
      Swal.fire("Aviso", mensaje, "warning");
      setAreas([]);
    }
  } catch (error) {
    console.error("Error al obtener las áreas disponibles:", error);
    const mensaje =
      error.response?.data?.mensaje ||
      "No se pudieron cargar las áreas de aprendizaje.";
    Swal.fire("Error", mensaje, "error");
    setAreas([]);
  }
};
