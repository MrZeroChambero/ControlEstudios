import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_PAREN = `${API_BASE}/parentescos`;
const API_EST = `${API_BASE}/estudiantes`;
const API_REP = `${API_BASE}/representantes`;
const API_TIPOS = `${API_PAREN}/tipos`;

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
    if (res.status === 200 && res.data?.back) return res.data.data || [];
    // No alertar al usuario si no hay parentescos
    if (res.status === 404) return [];
    if (Array.isArray(res.data?.data)) return res.data.data;
    throw new Error(res.data?.message || "Respuesta inesperada");
  } catch (e) {
    console.error(e);
    if (e?.response?.status !== 404) {
      const msg =
        e?.response?.data?.message ||
        "No se pudieron cargar parentescos del estudiante";
      Swal?.fire("Error", msg, "error");
    }
    return [];
  }
};

export const listarParentescosPorRepresentante = async (
  id_representante,
  Swal
) => {
  try {
    console.log(
      "[Parentesco] Listando parentescos del representante:",
      id_representante
    );
    const res = await axios.get(
      `${API_PAREN}/representante/${id_representante}`,
      { withCredentials: true }
    );
    console.log(res);
    if (res.status === 200 && res.data?.back) return res.data.data || [];
    if (res.status === 404) return [];
    if (Array.isArray(res.data?.data)) return res.data.data;
    throw new Error(res.data?.message || "Respuesta inesperada");
  } catch (e) {
    console.error(e);
    if (e?.response?.status !== 404) {
      const msg =
        e?.response?.data?.message ||
        "No se pudieron cargar parentescos del representante";
      Swal?.fire("Error", msg, "error");
    }
    return [];
  }
};

export const crearParentesco = async (payload, Swal) => {
  try {
    console.log("[Parentesco] Creando parentesco. Payload:", payload);
    const res = await axios.post(API_PAREN, payload, { withCredentials: true });
    console.log(res);
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
    console.log(
      "[Parentesco] Actualizando parentesco id:",
      id_parentesco,
      "Payload:",
      payload
    );
    const res = await axios.put(`${API_PAREN}/${id_parentesco}`, payload, {
      withCredentials: true,
    });
    console.log(res);
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
    console.log("[Estudiantes] Cargando estudiantes");
    const res = await axios.get(API_EST, { withCredentials: true });
    console.log(res);
    const ok = !!res.data?.back;
    const base = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.items)
      ? res.data.items
      : [];
    // Confiar en el backend para el filtrado; evitar ocultar datos por claves distintas
    setData(base);
    if (!ok) {
      Swal?.fire(
        "Aviso",
        res.data?.message || "Respuesta inesperada al cargar estudiantes",
        "warning"
      );
    }
  } catch (e) {
    console.error(e);
    const msg =
      e?.response?.data?.message || "No se pudieron cargar estudiantes";
    Swal?.fire("Error", msg, "error");
    setData?.([]);
  }
};

export const listarRepresentantesActivos = async (setData, Swal) => {
  try {
    console.log("[Representantes] Cargando representantes");
    const res = await axios.get(API_REP, { withCredentials: true });
    console.log(res);
    const ok = !!res.data?.back;
    const base = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.items)
      ? res.data.items
      : [];
    // Confiar en el backend para el filtrado; evitar ocultar datos por claves distintas
    setData(base);
    if (!ok) {
      // Mostrar mensaje si el backend no marcó back=true
      Swal?.fire(
        "Aviso",
        res.data?.message || "Respuesta inesperada al cargar representantes",
        "warning"
      );
    }
  } catch (e) {
    console.error(e);
    const msg =
      e?.response?.data?.message || "No se pudieron cargar representantes";
    Swal?.fire("Error", msg, "error");
    setData?.([]);
  }
};

export const inferirTipoPadreMadre = (genero) => {
  if (genero === "F") return "madre";
  if (genero === "M") return "padre";
  return "representante";
};

export const obtenerTiposParentesco = async (Swal) => {
  try {
    const res = await axios.get(API_TIPOS, { withCredentials: true });
    const ok = !!res.data?.back;
    const tipos = Array.isArray(res.data?.data) ? res.data.data : [];
    if (!ok) {
      Swal?.fire(
        "Aviso",
        res.data?.message || "Respuesta inesperada al cargar tipos",
        "warning"
      );
    }
    return tipos.length
      ? tipos
      : [
          "madre",
          "padre",
          "abuelo",
          "tio",
          "hermano",
          "otro",
          "abuela",
          "hermana",
          "tia",
        ];
  } catch (e) {
    console.error(e);
    const msg =
      e?.response?.data?.message || "No se pudieron cargar tipos de parentesco";
    Swal?.fire("Error", msg, "error");
    return [
      "madre",
      "padre",
      "abuelo",
      "tio",
      "hermano",
      "otro",
      "abuela",
      "hermana",
      "tia",
    ];
  }
};
