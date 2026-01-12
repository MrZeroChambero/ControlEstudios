import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const API_BASE = "http://localhost:8080/controlestudios/servidor/aulas";

const withCredentials = { withCredentials: true };

const adaptResponse = (payload, fallbackMessage) => {
  const compat = normalizarRespuesta(payload, fallbackMessage);
  return {
    success: compat.success,
    message: compat.message,
    data: compat.data,
    errors: compat.errors,
  };
};

const extractError = (error, fallbackMessage) => {
  if (error?.response?.data) {
    return adaptResponse(
      asegurarCompatibilidad(error.response.data),
      fallbackMessage
    );
  }

  return {
    success: false,
    message: fallbackMessage,
    data: null,
    errors: null,
  };
};

export const obtenerResumenAulas = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/apertura`, withCredentials);
    return adaptResponse(
      asegurarCompatibilidad(data),
      "No se pudo obtener la informacion de las aulas."
    );
  } catch (error) {
    return extractError(
      error,
      "No se pudo obtener la informacion de las aulas."
    );
  }
};

export const aperturarAulas = async (payload) => {
  try {
    const { data } = await axios.post(`${API_BASE}/apertura`, payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return adaptResponse(
      asegurarCompatibilidad(data),
      "No fue posible aperturar las aulas solicitadas."
    );
  } catch (error) {
    return extractError(
      error,
      "No fue posible aperturar las aulas solicitadas."
    );
  }
};

export const actualizarEstadoAula = async (idAula, estado) => {
  try {
    const { data } = await axios.patch(
      `${API_BASE}/${idAula}/estado`,
      { estado },
      {
        ...withCredentials,
        headers: { "Content-Type": "application/json" },
      }
    );
    return adaptResponse(
      asegurarCompatibilidad(data),
      "No fue posible cambiar el estado del aula."
    );
  } catch (error) {
    return extractError(error, "No fue posible cambiar el estado del aula.");
  }
};

export const actualizarCuposAula = async (idAula, cupos) => {
  try {
    const { data } = await axios.patch(
      `${API_BASE}/${idAula}/cupos`,
      { cupos },
      {
        ...withCredentials,
        headers: { "Content-Type": "application/json" },
      }
    );
    return adaptResponse(
      asegurarCompatibilidad(data),
      "No fue posible actualizar los cupos del aula."
    );
  } catch (error) {
    return extractError(error, "No fue posible actualizar los cupos del aula.");
  }
};
