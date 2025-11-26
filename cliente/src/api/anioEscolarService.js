import axios from "axios";

const BASE = "http://localhost:8080/controlestudios/servidor";

export const solicitarAnios = async (setAnios, Swal) => {
  try {
    const res = await axios.get(`${BASE}/anios_escolares`, {
      withCredentials: true,
    });
    if (res.data && res.data.back === true) setAnios(res.data.data);
    else
      Swal.fire("Error", "No se pudieron obtener los años escolares.", "error");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron obtener los años escolares.", "error");
  }
};

export const crearAnio = async (payload, Swal) => {
  try {
    const res = await axios.post(`${BASE}/anios_escolares`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    console.error(e);
    const err = e.response?.data;
    if (err) return err;
    return { back: false, message: "Error al crear año escolar." };
  }
};

export const aperturarAnio = async (id, Swal) => {
  try {
    const res = await axios.patch(
      `${BASE}/anios_escolares/${id}/aperturar`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (e) {
    console.error(e);
    const err = e.response?.data;
    if (err) return err;
    return { back: false, message: "Error al aperturar año escolar." };
  }
};

export const solicitarMomentos = async (setMomentos, Swal) => {
  try {
    const res = await axios.get(`${BASE}/momentos_academicos`, {
      withCredentials: true,
    });
    if (res.data && res.data.back === true) setMomentos(res.data.data);
    else Swal.fire("Error", "No se pudieron cargar los momentos.", "error");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los momentos.", "error");
  }
};

export const solicitarMomentosPorAnio = async (idAnio, setMomentos, Swal) => {
  try {
    const res = await axios.get(`${BASE}/anios_escolares/${idAnio}/momentos`, {
      withCredentials: true,
    });
    if (res.data && res.data.back === true) setMomentos(res.data.data);
    else
      Swal.fire(
        "Error",
        "No se pudieron cargar los momentos del año.",
        "error"
      );
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los momentos del año.", "error");
  }
};

export const actualizarMomento = async (id, payload, Swal) => {
  try {
    const res = await axios.put(`${BASE}/momentos_academicos/${id}`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    console.error(e);
    return { back: false, message: "Error al actualizar momento." };
  }
};
