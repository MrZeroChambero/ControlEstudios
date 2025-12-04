import axios from "axios";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";

const buildError = (error) => {
  const response = error.response?.data;
  const validation = response?.errores;
  const message = response?.mensaje ?? error.message ?? "Error inesperado.";
  const err = new Error(message);
  if (validation) {
    err.validation = validation;
  }
  return err;
};

export const obtenerGestionDocentes = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/aulas/gestion-docentes`, {
      withCredentials: true,
    });
    return data?.datos;
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
    return data?.datos;
  } catch (error) {
    throw buildError(error);
  }
};

export const eliminarDocenteTitular = async (aulaId) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/aulas/${aulaId}/docente`, {
      withCredentials: true,
    });
    return data?.datos;
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
    return data?.datos;
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
    return data?.datos;
  } catch (error) {
    throw buildError(error);
  }
};
