import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const RESOURCE = `${API_BASE}/anios_escolares`;

const ENDPOINTS = {
  list: RESOURCE,
  detail: (id) => `${RESOURCE}/${id}`,
  create: RESOURCE,
  update: (id) => `${RESOURCE}/${id}`,
  remove: (id) => `${RESOURCE}/${id}`,
  state: (id) => `${RESOURCE}/${id}/estado`,
};

const withCredentials = { withCredentials: true };

const fallbackError = (message) => ({
  success: false,
  message,
  data: [],
  errors: {},
});

const adaptResponse = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== "object") {
    return fallbackError(fallbackMessage);
  }

  const success =
    payload.success === true ||
    payload.exito === true ||
    payload.estado === "exito";

  return {
    success,
    message: payload.mensaje ?? payload.message ?? fallbackMessage,
    data: payload.datos ?? payload.data ?? null,
    errors: payload.errores ?? payload.errors ?? {},
  };
};

const extractError = (error, message) => {
  if (error?.response?.data) {
    return adaptResponse(error.response.data, message);
  }
  return fallbackError(message);
};

export const listarAniosEscolares = async () => {
  try {
    const { data } = await axios.get(ENDPOINTS.list, withCredentials);
    return adaptResponse(data, "No se pudieron obtener los años escolares.");
  } catch (error) {
    return extractError(error, "No se pudieron obtener los años escolares.");
  }
};

export const crearAnioEscolar = async (payload) => {
  try {
    console.log("crear año escolar:", payload);
    const { data } = await axios.post(ENDPOINTS.create, payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    console.log("respuesta crear año escolar:", data);
    return adaptResponse(data, "Error al crear el año escolar.");
  } catch (error) {
    console.log("respuesta crear año escolar:", error);

    return extractError(error, "Error al crear el año escolar.");
  }
};

export const actualizarAnioEscolar = async (id, payload) => {
  try {
    const { data } = await axios.put(ENDPOINTS.update(id), payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return adaptResponse(data, "Error al actualizar el año escolar.");
  } catch (error) {
    return extractError(error, "Error al actualizar el año escolar.");
  }
};

export const eliminarAnioEscolar = async (id) => {
  try {
    const { data } = await axios.delete(ENDPOINTS.remove(id), withCredentials);
    return adaptResponse(data, "Error al eliminar el año escolar.");
  } catch (error) {
    return extractError(error, "Error al eliminar el año escolar.");
  }
};

export const cambiarEstadoAnioEscolar = async (id, payload) => {
  const cuerpo =
    typeof payload === "string" ? { accion: payload } : { ...(payload || {}) };

  try {
    const { data } = await axios.patch(ENDPOINTS.state(id), cuerpo, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return adaptResponse(data, "Error al cambiar el estado del año escolar.");
  } catch (error) {
    return extractError(error, "Error al cambiar el estado del año escolar.");
  }
};
