import axios from "axios";

const BASE = "http://localhost:8080/controlestudios/servidor";

export const solicitarAulas = async (setAulas, Swal) => {
  try {
    const res = await axios.get(`${BASE}/aulas`, { withCredentials: true });
    if (res.data && res.data.back === true) setAulas(res.data.data);
    else Swal.fire("Error", "No se pudieron obtener las aulas.", "error");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron obtener las aulas.", "error");
  }
};

export const actualizarAula = async (id, payload, Swal) => {
  try {
    const res = await axios.put(`${BASE}/aulas/${id}`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    console.error(e);
    const err = e.response?.data;
    if (err) return err;
    return { back: false, message: "Error al actualizar aula." };
  }
};

export const solicitarAreas = async (setAreas, Swal) => {
  try {
    const res = await axios.get(`${BASE}/areas_aprendizaje`, {
      withCredentials: true,
    });
    if (res.data && res.data.back === true) setAreas(res.data.data);
    else Swal.fire("Error", "No se pudieron obtener las áreas.", "error");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron obtener las áreas.", "error");
  }
};

export const solicitarPersonal = async (setPersonal, Swal) => {
  try {
    const res = await axios.get(`${BASE}/personal`, { withCredentials: true });
    if (res.data && res.data.back === true) setPersonal(res.data.data);
    else Swal.fire("Error", "No se pudo obtener el personal.", "error");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudo obtener el personal.", "error");
  }
};
