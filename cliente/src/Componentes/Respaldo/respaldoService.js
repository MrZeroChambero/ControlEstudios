import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_RESPALDOS = `${API_BASE}/respaldos`;

export const listarRespaldos = async () => {
  try {
    const { data } = await axios.get(API_RESPALDOS, {
      withCredentials: true,
    });
    console.log(["respaldos:listado", data]);
    if (data?.estado !== "exito") {
      throw new Error("No se pudo obtener el historial de respaldos.");
    }
    return data.datos?.respaldos ?? [];
  } catch (error) {
    const mensaje =
      error?.response?.data?.mensaje ||
      error?.message ||
      "No se pudo obtener el historial de respaldos.";
    throw new Error(mensaje);
  }
};

export const crearRespaldo = async () => {
  try {
    const respuesta = await axios.post(
      `${API_RESPALDOS}/crear`,
      {},
      {
        withCredentials: true,
      }
    );
    const { data } = respuesta;
    console.log(["respaldos:crear", respuesta]);
    if (data?.estado !== "exito") {
      throw new Error("No se pudo crear el respaldo.");
    }
    return data.datos?.respaldo ?? null;
  } catch (error) {
    console.log(["respaldos:crear", error]);
    const mensaje =
      error?.response?.data?.mensaje ||
      error?.message ||
      "No se pudo crear el respaldo.";
    throw new Error(mensaje);
  }
};

export const restaurarRespaldo = async (nombre) => {
  try {
    const { data } = await axios.post(
      `${API_RESPALDOS}/restaurar`,
      { nombre },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(["respaldos:restaurar-nombre", nombre, data]);
    if (data?.estado !== "exito") {
      throw new Error("No se pudo restaurar el respaldo.");
    }
    return data.datos?.respaldo ?? null;
  } catch (error) {
    const mensaje =
      error?.response?.data?.mensaje ||
      error?.message ||
      "No se pudo restaurar el respaldo.";
    throw new Error(mensaje);
  }
};

export const restaurarDesdeArchivo = async (archivo) => {
  const formData = new FormData();
  formData.append("archivo_sql", archivo);

  try {
    const { data } = await axios.post(`${API_RESPALDOS}/restaurar`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(["respaldos:restaurar-archivo", archivo?.name, data]);

    if (data?.estado !== "exito") {
      throw new Error("No se pudo restaurar la base de datos.");
    }
    return data.datos?.respaldo ?? null;
  } catch (error) {
    const mensaje =
      error?.response?.data?.mensaje ||
      error?.message ||
      "No se pudo restaurar la base de datos.";
    throw new Error(mensaje);
  }
};

export const construirUrlDescarga = (nombre) =>
  `${API_RESPALDOS}/descargar/${encodeURIComponent(nombre)}`;
