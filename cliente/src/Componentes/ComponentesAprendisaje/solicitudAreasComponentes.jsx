import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const API_URL =
  "http://localhost:8080/controlestudios/servidor/areas_aprendizaje/listar-select";

export const solicitudAreasComponentes = async ({ setAreas, Swal }) => {
  try {
    const response = await axios.get(API_URL, { withCredentials: true });
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      "No se pudieron cargar las áreas de aprendizaje activas."
    );

    if (compat.success) {
      const datos = Array.isArray(compat.data) ? compat.data : [];
      setAreas(datos);
    } else {
      Swal.fire("Aviso", compat.message, "warning");
      setAreas([]);
    }
  } catch (error) {
    console.error("Error al obtener las áreas disponibles:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar las áreas de aprendizaje."
    );
    Swal.fire("Error", compat.message, "error");
    setAreas([]);
  }
};
