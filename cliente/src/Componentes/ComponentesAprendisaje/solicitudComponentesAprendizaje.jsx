import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

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
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      "No se pudieron cargar los componentes de aprendizaje."
    );

    if (compat.success) {
      const datos = Array.isArray(compat.data) ? compat.data : [];
      setComponentes(datos);
    } else {
      Swal.fire("Error", compat.message, "error");
      setComponentes([]);
    }
  } catch (error) {
    console.error("Error al obtener componentes de aprendizaje:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar los componentes de aprendizaje."
    );
    Swal.fire("Error", compat.message, "error");
    setComponentes([]);
  } finally {
    setIsLoading(false);
  }
};
