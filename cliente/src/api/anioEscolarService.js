import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../utilidades/respuestaBackend";

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
  const normalizada = normalizarRespuesta(payload, fallbackMessage);

  if (!normalizada.success) {
    return {
      ...normalizada,
      data: normalizada.data ?? [],
      errors: normalizada.errors ?? {},
    };
  }

  return {
    success: true,
    message: normalizada.message,
    data: normalizada.data ?? [],
    errors: normalizada.errors ?? {},
  };
};

const extractError = (error, message) => {
  if (error?.response?.data) {
    return adaptResponse(asegurarCompatibilidad(error.response.data), message);
  }
  return fallbackError(message);
};

export const listarAniosEscolares = async () => {
  try {
    const { data } = await axios.get(ENDPOINTS.list, withCredentials);
    return adaptResponse(
      asegurarCompatibilidad(data),
      "No se pudieron obtener los años escolares."
    );
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
    return adaptResponse(
      asegurarCompatibilidad(data),
      "Error al crear el año escolar."
    );
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
    return adaptResponse(
      asegurarCompatibilidad(data),
      "Error al actualizar el año escolar."
    );
  } catch (error) {
    return extractError(error, "Error al actualizar el año escolar.");
  }
};

export const eliminarAnioEscolar = async (id) => {
  try {
    const { data } = await axios.delete(ENDPOINTS.remove(id), withCredentials);
    return adaptResponse(
      asegurarCompatibilidad(data),
      "Error al eliminar el año escolar."
    );
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
    return adaptResponse(
      asegurarCompatibilidad(data),
      "Error al cambiar el estado del año escolar."
    );
  } catch (error) {
    return extractError(error, "Error al cambiar el estado del año escolar.");
  }
};
