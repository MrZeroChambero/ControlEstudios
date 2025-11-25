import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_PAREN = `${API_BASE}/parentescos`;
const API_EST = `${API_BASE}/estudiantes`;
const API_REP = `${API_BASE}/representantes`;

export const listarParentescos = async (setData, Swal) => {
  try {
    const res = await axios.get(API_PAREN, { withCredentials: true });
    if (res.data?.back) setData(res.data.data || []);
    else throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire("Error", "No se pudieron cargar parentescos", "error");
    setData?.([]);
  }
};

export const listarParentescosPorEstudiante = async (id_estudiante, Swal) => {
  try {
    const res = await axios.get(`${API_PAREN}/estudiante/${id_estudiante}`, {
      withCredentials: true,
    });
    if (res.data?.back) return res.data.data || [];
    throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire(
      "Error",
      "No se pudieron cargar parentescos del estudiante",
      "error"
    );
    return [];
  }
};

export const listarParentescosPorRepresentante = async (
  id_representante,
  Swal
) => {
  try {
    const res = await axios.get(
      `${API_PAREN}/representante/${id_representante}`,
      { withCredentials: true }
    );
    if (res.data?.back) return res.data.data || [];
    throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire(
      "Error",
      "No se pudieron cargar parentescos del representante",
      "error"
    );
    return [];
  }
};

export const crearParentesco = async (payload, Swal) => {
  try {
    const res = await axios.post(API_PAREN, payload, { withCredentials: true });
    if (res.data?.back) return res.data.data;
    throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire(
      "Error",
      e?.response?.data?.message || "No se pudo crear parentesco",
      "error"
    );
    return null;
  }
};

export const actualizarParentesco = async (id_parentesco, payload, Swal) => {
  try {
    const res = await axios.put(`${API_PAREN}/${id_parentesco}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back) return res.data.data;
    throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire(
      "Error",
      e?.response?.data?.message || "No se pudo actualizar parentesco",
      "error"
    );
    return null;
  }
};

export const eliminarParentesco = async (id_parentesco, Swal) => {
  try {
    const res = await axios.delete(`${API_PAREN}/${id_parentesco}`, {
      withCredentials: true,
    });
    if (res.data?.back) return true;
    throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire(
      "Error",
      e?.response?.data?.message || "No se pudo eliminar parentesco",
      "error"
    );
    return false;
  }
};

export const listarEstudiantesActivos = async (setData, Swal) => {
  try {
    const res = await axios.get(API_EST, { withCredentials: true });
    if (res.data?.back) {
      const lista = (res.data.data || []).filter(
        (e) => e.estado === "activo" || e.estado_estudiante === "activo"
      );
      setData(lista);
    } else throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire("Error", "No se pudieron cargar estudiantes", "error");
    setData?.([]);
  }
};

export const listarRepresentantesActivos = async (setData, Swal) => {
  try {
    const res = await axios.get(API_REP, { withCredentials: true });
    if (res.data?.back) {
      const lista = (res.data.data || []).filter(
        (r) => (r.estado || r.estado_persona) === "activo"
      );
      setData(lista);
    } else throw new Error();
  } catch (e) {
    console.error(e);
    Swal?.fire("Error", "No se pudieron cargar representantes", "error");
    setData?.([]);
  }
};

export const inferirTipoPadreMadre = (genero) => {
  if (genero === "F") return "madre";
  if (genero === "M") return "padre";
  return "representante";
};

export const TIPOS_OPCIONALES = ["representante", "tutor", "encargado"];
