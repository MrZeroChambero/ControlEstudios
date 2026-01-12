import axios from "axios";
import Swal from "sweetalert2";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../../utilidades/respuestaBackend";

export const solicitudAreasAprendizaje = async ({ setIsLoading, setAreas }) => {
  const API_URL =
    "http://localhost:8080/controlestudios/servidor/areas_aprendizaje";

  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      "No se pudieron cargar las áreas de aprendizaje."
    );

    console.log("Áreas de aprendizaje cargadas:", response.status, compat);

    if (!compat.success) {
      console.error("El backend no respondió correctamente:", compat.raw);
      Swal.fire("Error", compat.message, "error");
      setAreas([]);
      return;
    }

    setAreas(Array.isArray(compat.data) ? compat.data : []);
  } catch (error) {
    console.error("Error al obtener áreas de aprendizaje:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar las áreas de aprendizaje."
    );

    Swal.fire("Error", compat.message, "error");
  } finally {
    setIsLoading(false);
  }
};
