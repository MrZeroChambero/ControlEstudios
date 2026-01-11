import axios from "axios";

const API_BASE =
  "http://localhost:8080/controlestudios/servidor/api/rendimiento";

const ENDPOINTS = {
  contexto: () => `${API_BASE}/contexto`,
  componentes: () => `${API_BASE}/componentes`,
  aulas: (componenteId) => `${API_BASE}/componentes/${componenteId}/aulas`,
  grid: (componenteId, aulaId) =>
    `${API_BASE}/componentes/${componenteId}/aulas/${aulaId}/grid`,
  guardar: () => `${API_BASE}/evaluaciones`,
  historial: (estudianteId) =>
    `${API_BASE}/evaluaciones/estudiantes/${estudianteId}/historial`,
};

const withCredentials = { withCredentials: true };

const fallbackError = (message) => ({
  success: false,
  message,
  data: null,
  errors: {},
  errorDetails: message,
});

const adaptResponse = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== "object") {
    return fallbackError(fallbackMessage);
  }

  const success =
    payload.back === true ||
    payload.success === true ||
    payload.exito === true ||
    payload.estado === "exito";

  return {
    success,
    message: payload.mensaje ?? payload.message ?? fallbackMessage,
    data: payload.datos ?? payload.data ?? null,
    errors: payload.errores ?? payload.errors ?? {},
    errorDetails: payload.error_details ?? payload.detalle ?? null,
  };
};

const extractError = (error, fallbackMessage) => {
  if (error?.response?.data) {
    return adaptResponse(error.response.data, fallbackMessage);
  }
  return fallbackError(fallbackMessage);
};

export const obtenerContextoEvaluacion = async (params = {}) => {
  try {
    const { data } = await axios.get(ENDPOINTS.contexto(), {
      ...withCredentials,
      params,
    });
    return adaptResponse(data, "No se pudo cargar el contexto de evaluacion.");
  } catch (error) {
    return extractError(error, "No se pudo cargar el contexto de evaluacion.");
  }
};

export const obtenerComponentesEvaluacion = async (params = {}) => {
  try {
    const { data } = await axios.get(ENDPOINTS.componentes(), {
      ...withCredentials,
      params,
    });
    return adaptResponse(data, "No se pudo obtener la lista de componentes.");
  } catch (error) {
    return extractError(error, "No se pudo obtener la lista de componentes.");
  }
};

export const obtenerAulasPorComponente = async (componenteId) => {
  try {
    const { data } = await axios.get(
      ENDPOINTS.aulas(componenteId),
      withCredentials
    );
    return adaptResponse(
      data,
      "No se pudieron obtener las aulas del componente."
    );
  } catch (error) {
    return extractError(
      error,
      "No se pudieron obtener las aulas del componente."
    );
  }
};

export const obtenerGridEvaluacion = async (componenteId, aulaId) => {
  try {
    const { data } = await axios.get(
      ENDPOINTS.grid(componenteId, aulaId),
      withCredentials
    );
    return adaptResponse(data, "No se pudo construir la matriz de evaluacion.");
  } catch (error) {
    return extractError(error, "No se pudo construir la matriz de evaluacion.");
  }
};

export const guardarEvaluaciones = async (payload) => {
  try {
    const { data } = await axios.post(ENDPOINTS.guardar(), payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return adaptResponse(data, "No se pudieron guardar las evaluaciones.");
  } catch (error) {
    return extractError(error, "No se pudieron guardar las evaluaciones.");
  }
};

export const obtenerHistorialEvaluaciones = async (estudianteId) => {
  try {
    const { data } = await axios.get(
      ENDPOINTS.historial(estudianteId),
      withCredentials
    );
    return adaptResponse(
      data,
      "No se pudo obtener el historial de evaluaciones."
    );
  } catch (error) {
    return extractError(
      error,
      "No se pudo obtener el historial de evaluaciones."
    );
  }
};
