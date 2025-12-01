import axios from "axios";

const API_URL =
  "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje";

export const solicitudComponentesAprendizaje = async ({
  setIsLoading,
  setComponentes,
  Swal,
}) => {
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });

    if (response.data?.exito === true) {
      const datos = Array.isArray(response.data.datos)
        ? response.data.datos
        : [];
      setComponentes(datos);
    } else {
      const mensaje =
        response.data?.mensaje ||
        "No se pudieron cargar los componentes de aprendizaje.";
      Swal.fire("Error", mensaje, "error");
      setComponentes([]);
    }
  } catch (error) {
    console.error("Error al obtener componentes de aprendizaje:", error);
    const mensajeError =
      error.response?.data?.mensaje ||
      "No se pudieron cargar los componentes de aprendizaje.";
    Swal.fire("Error", mensajeError, "error");
    setComponentes([]);
  } finally {
    setIsLoading(false);
  }
};
