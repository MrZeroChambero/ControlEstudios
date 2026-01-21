import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor/api";
const RESOURCE = `${API_BASE}/planificaciones`;

const ENDPOINTS = {
  list: RESOURCE,
  detail: (id) => `${RESOURCE}/${id}`,
  create: RESOURCE,
  update: (id) => `${RESOURCE}/${id}`,
  changeState: (id) => `${RESOURCE}/${id}/estado`,
  docenteAsignacion: (id) => `${RESOURCE}/docentes/${id}/asignacion`,
};

const jsonHeaders = { "Content-Type": "application/json" };
const withCredentials = { withCredentials: true };

const fallbackError = (message) => ({
  success: false,
  message,
  data: null,
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

const limpiarParametros = (params = {}) => {
  const resultado = {};
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor === undefined || valor === null) return;
    if (typeof valor === "string" && valor.trim() === "") return;
    resultado[clave] = valor;
  });
  return resultado;
};

export const listarPlanificaciones = async (params = {}) => {
  const filtrados = limpiarParametros(params);
  // establecer expandir por defecto
  if (!filtrados.expandir) {
    filtrados.expandir = "competencias";
  }
  try {
    const { data } = await axios.get(ENDPOINTS.list, {
      ...withCredentials,
      params: filtrados,
    });
    const respuesta = adaptResponse(
      data,
      "No se pudieron obtener las planificaciones."
    );
    if (!respuesta.success) return respuesta;

    const payload = respuesta.data;
    const coleccion = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.planificaciones)
      ? payload.planificaciones
      : [];

    const normalizadas = coleccion.map((plan) => ({
      id: plan.id_planificacion ?? plan.id ?? plan.id_plan,
      fk_personal: plan.fk_personal ?? plan.fk_docente ?? null,
      docenteNombre:
        plan.docente_nombre ||
        plan.docente?.nombre_completo ||
        plan.docente?.label ||
        null,
      fk_componente: plan.fk_componente ?? plan.componente_id ?? null,
      fk_aula: plan.fk_aula ?? plan.aula_id ?? null,
      fk_momento: plan.fk_momento ?? plan.momento_id ?? null,
      tipo: plan.tipo ?? null,
      estado: plan.estado ?? null,
      competencias: plan.competencias || [],
      raw: plan,
    }));

    return {
      success: true,
      message: respuesta.message,
      data: {
        planificaciones: normalizadas,
        contexto: payload?.contexto ?? payload?.context ?? null,
      },
    };
  } catch (error) {
    return extractError(error, "No se pudieron obtener las planificaciones.");
  }
};

export const obtenerPlanificacion = async (id) => {
  try {
    const { data } = await axios.get(ENDPOINTS.detail(id), withCredentials);
    return adaptResponse(data, "No se encontró la planificación solicitada.");
  } catch (error) {
    return extractError(error, "No se encontró la planificación solicitada.");
  }
};

export const crearPlanificacion = async (payload) => {
  try {
    const { data } = await axios.post(ENDPOINTS.create, payload, {
      ...withCredentials,
      headers: jsonHeaders,
    });
    return adaptResponse(data, "No se pudo crear la planificación.");
  } catch (error) {
    return extractError(error, "No se pudo crear la planificación.");
  }
};

export const actualizarPlanificacion = async (id, payload) => {
  try {
    const { data } = await axios.put(ENDPOINTS.update(id), payload, {
      ...withCredentials,
      headers: jsonHeaders,
    });
    return adaptResponse(data, "No se pudo actualizar la planificación.");
  } catch (error) {
    return extractError(error, "No se pudo actualizar la planificación.");
  }
};

export const cambiarEstadoPlanificacion = async (id, estado) => {
  const cuerpo =
    typeof estado === "string" ? { estado } : { ...(estado || {}) };
  try {
    const { data } = await axios.patch(ENDPOINTS.changeState(id), cuerpo, {
      ...withCredentials,
      headers: jsonHeaders,
    });
    return adaptResponse(
      data,
      "No se pudo cambiar el estado de la planificación."
    );
  } catch (error) {
    return extractError(
      error,
      "No se pudo cambiar el estado de la planificación."
    );
  }
};

export const obtenerAsignacionDocente = async (docenteId, params = {}) => {
  if (!docenteId) {
    return fallbackError("Debe indicar un docente válido.");
  }

  const filtrados = limpiarParametros(params);
  try {
    const { data } = await axios.get(ENDPOINTS.docenteAsignacion(docenteId), {
      ...withCredentials,
      params: filtrados,
    });
    return adaptResponse(data, "No se pudo obtener la asignación del docente.");
  } catch (error) {
    return extractError(error, "No se pudo obtener la asignación del docente.");
  }
};
