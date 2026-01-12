import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_RESPALDOS = `${API_BASE}/respaldos`;

export const listarRespaldos = async () => {
  try {
    const { data } = await axios.get(API_RESPALDOS, {
      withCredentials: true,
    });
    console.log(["respaldos:listado", data]);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo obtener el historial de respaldos."
    );
    if (!compat.success) {
      throw new Error(compat.message);
    }
    return compat.data?.respaldos ?? compat.data ?? [];
  } catch (error) {
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error?.response?.data),
      "No se pudo obtener el historial de respaldos."
    );
    throw new Error(compat.message || error?.message);
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
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo crear el respaldo."
    );
    if (!compat.success) {
      throw new Error(compat.message);
    }
    return compat.data?.respaldo ?? compat.data ?? null;
  } catch (error) {
    console.log(["respaldos:crear", error]);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error?.response?.data),
      "No se pudo crear el respaldo."
    );
    throw new Error(compat.message || error?.message);
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
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo restaurar el respaldo."
    );
    if (!compat.success) {
      throw new Error(compat.message);
    }
    return compat.data?.respaldo ?? compat.data ?? null;
  } catch (error) {
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error?.response?.data),
      "No se pudo restaurar el respaldo."
    );
    throw new Error(compat.message || error?.message);
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

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo restaurar la base de datos."
    );
    if (!compat.success) {
      throw new Error(compat.message);
    }
    return compat.data?.respaldo ?? compat.data ?? null;
  } catch (error) {
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error?.response?.data),
      "No se pudo restaurar la base de datos."
    );
    throw new Error(compat.message || error?.message);
  }
};

export const construirUrlDescarga = (nombre) =>
  `${API_RESPALDOS}/descargar/${encodeURIComponent(nombre)}`;
