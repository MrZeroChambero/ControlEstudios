import axios from "axios";

const BASE_URL = "http://localhost/controlestudios/servidor/horarios";
const ESTUDIANTES_URL = "http://localhost/controlestudios/servidor/estudiantes";

const defaultConfig = { withCredentials: true };

/**
 * Filtra los horarios según los criterios proporcionados.
 * @param {object} params - Objeto con criterios de filtro (fk_anio_escolar, fk_aula, fk_momento, dia_semana).
 * @returns {Promise<any>}
 */
export const getHorarios = (params) => {
  return axios.get(BASE_URL, { params, ...defaultConfig }).then((r) => r.data);
};

/**
 * Obtiene los catálogos necesarios para los formularios de horarios.
 * @param {object} params - Objeto con IDs para filtrar los catálogos (fk_anio_escolar, fk_aula).
 * @returns {Promise<any>}
 */
export const getCatalogos = (params) => {
  return axios.get(`${BASE_URL}/catalogos`, { params, ...defaultConfig }).then((r) => r.data);
};

/**
 * Crea un nuevo bloque de horario.
 * @param {object} payload - Datos del horario a crear.
 * @returns {Promise<any>}
 */
export const createHorario = (payload) => {
  return axios.post(BASE_URL, payload, defaultConfig).then((r) => r.data);
};

/**
 * Actualiza un bloque de horario existente.
 * @param {number} id - ID del horario a actualizar.
 * @param {object} payload - Nuevos datos para el horario.
 * @returns {Promise<any>}
 */
export const updateHorario = (id, payload) => {
  return axios.put(`${BASE_URL}/${id}`, payload, defaultConfig).then((r) => r.data);
};

/**
 * Elimina un bloque de horario.
 * @param {number} id - ID del horario a eliminar.
 * @returns {Promise<any>}
 */
export const deleteHorario = (id) => {
  return axios.delete(`${BASE_URL}/${id}`, defaultConfig).then((r) => r.data);
};

/**
 * Obtiene la lista de estudiantes inscritos en un aula específica.
 * @param {number} idAula - ID del aula.
 * @returns {Promise<any>}
 */
export const getEstudiantesPorAula = (idAula) => {
  return axios.get(`${ESTUDIANTES_URL}/aula/${idAula}`, defaultConfig).then((r) => r.data);
};

/**
 * Sincroniza la lista de estudiantes en un subgrupo de horario.
 * @param {number} idHorario - ID del horario (subgrupo).
 * @param {number[]} estudiantes - Array con los IDs de los estudiantes a asignar.
 * @returns {Promise<any>}
 */
export const sincronizarSubgrupo = (idHorario, estudiantes) => {
  return axios.post(`${BASE_URL}/${idHorario}/estudiantes`, { estudiantes }, defaultConfig).then((r) => r.data);
};

/**
 * Remueve un estudiante de un subgrupo de horario.
 * @param {number} idHorario - ID del horario (subgrupo).
 * @param {number} idEstudiante - ID del estudiante a remover.
 * @returns {Promise<any>}
 */
export const removerEstudianteDeSubgrupo = (idHorario, idEstudiante) => {
  return axios.delete(`${BASE_URL}/${idHorario}/estudiantes/${idEstudiante}`, defaultConfig).then((r) => r.data);
};
