import axios from "axios";
import {
  asegurarCompatibilidad,
  normalizarRespuesta,
} from "../utilidades/respuestaBackend";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";

const buildError = (error) => {
  const response = asegurarCompatibilidad(error?.response?.data);
  console.error("API Error:", error, response);
  const compat = normalizarRespuesta(response, "Error inesperado.");
  const validation = compat.errors;
  const message = compat.message ?? error?.message ?? "Error inesperado.";
  const err = new Error(message);
  if (validation) {
    err.validation = validation;
  }
  if (response) {
    err.response = { data: response };
  }
  return err;
};

const ensureOk = (respuesta) => {
  const compat = normalizarRespuesta(asegurarCompatibilidad(respuesta));
  if (!compat.success) {
    const err = new Error(
      compat.message || "La operación no pudo completarse."
    );
    if (compat.errors) {
      err.validation = compat.errors;
    }
    err.response = { data: compat.raw };
    throw err;
  }
  return compat.data;
};

export const obtenerGestionDocentes = async (anioId) => {
  try {
    const parametros = new URLSearchParams();
    if (anioId !== undefined && anioId !== null && anioId !== "") {
      parametros.append("anio_id", anioId);
    }

    const endpoint = parametros.toString()
      ? `${BASE_URL}/aulas/gestion-docentes?${parametros.toString()}`
      : `${BASE_URL}/aulas/gestion-docentes`;

    const { data } = await axios.get(endpoint, {
      withCredentials: true,
    });
    return ensureOk(data);
  } catch (error) {
    throw buildError(error);
  }
};

export const asignarDocenteTitular = async (aulaId, payload) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/aulas/${aulaId}/docente`,
      payload,
      { withCredentials: true }
    );
    return ensureOk(data);
  } catch (error) {
    throw buildError(error);
  }
};

export const eliminarDocenteTitular = async (aulaId) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/aulas/${aulaId}/docente`, {
      withCredentials: true,
    });
    return ensureOk(data);
  } catch (error) {
    throw buildError(error);
  }
};

export const asignarEspecialista = async (aulaId, payload) => {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/aulas/${aulaId}/especialistas`,
      payload,
      { withCredentials: true }
    );
    return ensureOk(data);
  } catch (error) {
    throw buildError(error);
  }
};

export const eliminarEspecialista = async (aulaId, componenteId) => {
  try {
    const { data } = await axios.delete(
      `${BASE_URL}/aulas/${aulaId}/especialistas/${componenteId}`,
      { withCredentials: true }
    );
    return ensureOk(data);
  } catch (error) {
    throw buildError(error);
  }
};
