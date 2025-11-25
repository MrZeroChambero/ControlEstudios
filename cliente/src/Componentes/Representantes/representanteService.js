import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_REP = `${API_BASE}/representantes`;
const API_HAB = `${API_BASE}/habilidades`;
const API_PERSONA = `${API_BASE}/personas`;
const API_PERSONAL = `${API_BASE}/personal`;
const API_PERSONA_ESTADO = `${API_BASE}/personas/estado`;

export const solicitarRepresentantes = async (setData, setLoading, Swal) => {
  try {
    console.log("[Representantes] Iniciando solicitud de lista");
    setLoading(true);
    const res = await axios.get(`${API_REP}`, { withCredentials: true });
    if (res.data?.back === true) setData(res.data.data || []);
    else throw new Error("Respuesta inválida");
    console.log(
      "[Representantes] Lista cargada, total:",
      res.data?.data?.length
    );
    console.log("total:", res);
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo cargar representantes",
      "error"
    );
    setData([]);
  } finally {
    setLoading(false);
  }
};

export const solicitarPersonasCandidatas = async (setData, Swal) => {
  try {
    console.log("[Representantes] Cargando personas candidatas");
    const res = await axios.get(`${API_REP}/personas-candidatas`, {
      withCredentials: true,
    });
    if (res.data?.back === true) setData(res.data.data || []);
    else throw new Error("Respuesta inválida");
    console.log(
      "[Representantes] Candidatas recibidas:",
      res.data?.data?.length
    );
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudieron cargar personas",
      "error"
    );
    setData([]);
  }
};

export const crearRepresentante = async (payload, Swal) => {
  try {
    console.log("[Representantes] Creando representante. Payload:", payload);
    const res = await axios.post(`${API_REP}/persona`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo crear representante",
      "error"
    );
    return null;
  }
};

export const crearHabilidad = async (payload, Swal) => {
  try {
    console.log("[Habilidades] Creando habilidad. Payload:", payload);
    const res = await axios.post(`${API_HAB}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo crear habilidad",
      "error"
    );
    return null;
  }
};

export const listarHabilidades = async (fk_representante, Swal) => {
  try {
    console.log(
      "[Habilidades] Listando habilidades para representante:",
      fk_representante
    );
    const res = await axios.get(
      `${API_HAB}/representante/${fk_representante}`,
      { withCredentials: true }
    );
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudieron cargar habilidades",
      "error"
    );
    return [];
  }
};

export const eliminarHabilidad = async (id, Swal) => {
  try {
    console.log("[Habilidades] Eliminando habilidad id:", id);
    const res = await axios.delete(`${API_HAB}/${id}`, {
      withCredentials: true,
    });
    if (res.data?.back === true) return true;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo eliminar habilidad",
      "error"
    );
    return false;
  }
};

export const eliminarRepresentante = async (id, Swal) => {
  try {
    console.log("[Representantes] Eliminando representante id:", id);
    const res = await axios.delete(`${API_REP}/${id}`, {
      withCredentials: true,
    });
    if (res.data?.back === true) return true;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo eliminar representante",
      "error"
    );
    return false;
  }
};

export const obtenerRepresentante = async (id, Swal) => {
  try {
    console.log("[Representantes] Obteniendo representante id:", id);
    const res = await axios.get(`${API_REP}/${id}`, { withCredentials: true });
    if (res.data?.back === true) return res.data.data || null;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo obtener representante",
      "error"
    );
    return null;
  }
};

export const actualizarRepresentante = async (id, payload, Swal) => {
  try {
    console.log(
      "[Representantes] Actualizando representante id:",
      id,
      "payload:",
      payload
    );
    const res = await axios.put(`${API_REP}/${id}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo actualizar representante",
      "error"
    );
    return null;
  }
};

export const actualizarPersona = async (id_persona, payload, Swal) => {
  try {
    console.log(
      "[Representantes] Actualizando persona id:",
      id_persona,
      "payload:",
      payload
    );
    const res = await axios.put(`${API_PERSONA}/${id_persona}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true || res.data?.status === "success") return true;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo actualizar persona",
      "error"
    );
    return false;
  }
};

export const actualizarHabilidad = async (
  id_habilidad,
  nombre_habilidad,
  Swal
) => {
  try {
    console.log(
      "[Habilidades] Actualizando habilidad id:",
      id_habilidad,
      "nombre:",
      nombre_habilidad
    );
    const res = await axios.put(
      `${API_HAB}/${id_habilidad}`,
      { nombre_habilidad },
      { withCredentials: true }
    );
    if (res.data?.back === true) return true;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo actualizar habilidad",
      "error"
    );
    return false;
  }
};

export const actualizarPersonal = async (id_personal, payload, Swal) => {
  try {
    console.log(
      "[Representantes] Actualizando datos de personal id:",
      id_personal,
      payload
    );
    const res = await axios.put(`${API_PERSONAL}/${id_personal}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo actualizar datos de personal",
      "error"
    );
    return null;
  }
};

export const cambiarEstadoPersona = async (id_persona, estado, Swal) => {
  try {
    console.log("[Persona] Cambiando estado id:", id_persona, "->", estado);
    const res = await axios.put(
      `${API_PERSONA_ESTADO}/${id_persona}`,
      { estado },
      { withCredentials: true }
    );
    if (res.data?.back === true || res.data?.status === "success") return true;
    throw new Error("Respuesta inválida");
  } catch (e) {
    console.error(e);
    Swal.fire(
      "Error",
      e?.response?.data?.message || "No se pudo cambiar estado",
      "error"
    );
    return false;
  }
};
