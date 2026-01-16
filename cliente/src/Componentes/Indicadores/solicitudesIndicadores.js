import {
  obtenerAreasSelect,
  obtenerComponentesSelect,
  obtenerCompetencias,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
  actualizarVisibilidadIndicador,
} from "../Competencias/competenciasService";

export const solicitarAreasIndicadores = () => obtenerAreasSelect();
export const solicitarComponentesIndicadores = () => obtenerComponentesSelect();
export const solicitarCompetenciasIndicadores = (filtros) =>
  obtenerCompetencias(filtros);
export const registrarIndicador = (payload) => crearIndicador(payload);
export const actualizarIndicadorExistente = (idIndicador, payload) =>
  actualizarIndicador(idIndicador, payload);
export const eliminarIndicadorPorId = (idIndicador) =>
  eliminarIndicador(idIndicador);
export const actualizarVisibilidadIndicadorPorId = (idIndicador, ocultar) =>
  actualizarVisibilidadIndicador(idIndicador, ocultar);
