import axios from "axios";
const BASE = "http://localhost:8080/controlestudios/servidor/estudiantes";

export const fetchEstudiantes = () =>
  axios.get(BASE, { withCredentials: true }).then((r) => r.data);
export const fetchEstudianteDetalle = (id) =>
  axios
    .get(`${BASE}/${encodeURIComponent(id)}`, { withCredentials: true })
    .then((r) => r.data);
export const crearEstudiante = (payload) =>
  axios.post(BASE, payload, { withCredentials: true }).then((r) => r.data);
export const actualizarEstudiante = (id, payload) =>
  axios
    .put(`${BASE}/${encodeURIComponent(id)}`, payload, {
      withCredentials: true,
    })
    .then((r) => r.data);
export const activarEstudiante = (id) =>
  axios
    .patch(
      `${BASE}/${encodeURIComponent(id)}/activar`,
      {},
      { withCredentials: true }
    )
    .then((r) => r.data);
export const desactivarEstudiante = (id) =>
  axios
    .patch(
      `${BASE}/${encodeURIComponent(id)}/desactivar`,
      {},
      { withCredentials: true }
    )
    .then((r) => r.data);
export const eliminarEstudiante = (id) =>
  axios
    .delete(`${BASE}/${encodeURIComponent(id)}`, { withCredentials: true })
    .then((r) => r.data);
