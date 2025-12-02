import axios from "axios";

const BASE = "http://localhost:8080/controlestudios/servidor";

const ENDPOINTS = {
  list: `${BASE}/anios-escolares-listar.php`,
  create: `${BASE}/anio-escolar-crear.php`,
  update: (id) => `${BASE}/anio-escolar-editar.php?id=${id}`,
  remove: (id) => `${BASE}/anio-escolar-eliminar.php?id=${id}`,
  state: (id) => `${BASE}/anio-escolar-activar.php?id=${id}`,
};

const withCredentials = { withCredentials: true };

const fallbackError = (message) => ({
  success: false,
  message,
  data: [],
  errors: {},
});

const extractError = (error, message) => {
  if (error?.response?.data) return error.response.data;
  return fallbackError(message);
};

export const listarAniosEscolares = async () => {
  try {
    const { data } = await axios.get(ENDPOINTS.list, withCredentials);
    return data;
  } catch (error) {
    return extractError(error, "No se pudieron obtener los años escolares.");
  }
};

export const crearAnioEscolar = async (payload) => {
  try {
    const { data } = await axios.post(ENDPOINTS.create, payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    return extractError(error, "Error al crear el año escolar.");
  }
};

export const actualizarAnioEscolar = async (id, payload) => {
  try {
    const { data } = await axios.put(ENDPOINTS.update(id), payload, {
      ...withCredentials,
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    return extractError(error, "Error al actualizar el año escolar.");
  }
};

export const eliminarAnioEscolar = async (id) => {
  try {
    const { data } = await axios.delete(ENDPOINTS.remove(id), withCredentials);
    return data;
  } catch (error) {
    return extractError(error, "Error al eliminar el año escolar.");
  }
};

export const cambiarEstadoAnioEscolar = async (id, accion) => {
  try {
    const { data } = await axios.patch(
      ENDPOINTS.state(id),
      { accion },
      {
        ...withCredentials,
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  } catch (error) {
    return extractError(error, "Error al cambiar el estado del año escolar.");
  }
};
