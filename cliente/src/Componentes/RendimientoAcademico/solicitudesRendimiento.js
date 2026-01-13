import {
  obtenerContextoEvaluacion,
  obtenerAulasPorComponente,
  obtenerGridEvaluacion,
  guardarEvaluaciones,
} from "../../api/rendimientoAcademicoService";
import { formatearFechaHoraCorta } from "../../utilidades/formatoFechas";

const adjuntarMarcaTemporal = (respuesta) => ({
  ...(respuesta || {}),
  fechaRespuesta: formatearFechaHoraCorta(new Date()),
});

export const solicitarContextoEvaluacion = async () => {
  const respuesta = await obtenerContextoEvaluacion();
  return adjuntarMarcaTemporal(respuesta);
};

export const solicitarAulasPorComponente = async (componenteId) => {
  const respuesta = await obtenerAulasPorComponente(componenteId);
  return adjuntarMarcaTemporal(respuesta);
};

export const solicitarGridEvaluacion = async (componenteId, aulaId) => {
  const respuesta = await obtenerGridEvaluacion(componenteId, aulaId);
  return adjuntarMarcaTemporal(respuesta);
};

export const solicitarGuardarEvaluaciones = async (payload) => {
  const respuesta = await guardarEvaluaciones(payload);
  return adjuntarMarcaTemporal(respuesta);
};
