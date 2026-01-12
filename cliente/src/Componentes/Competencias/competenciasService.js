import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";
const AREAS_URL = `${BASE_URL}/areas_aprendizaje/listar-select`;
const COMPONENTES_URL = `${BASE_URL}/componentes_aprendizaje/listar-select`;
const COMPETENCIAS_URL = `${BASE_URL}/competencias`;
const INDICADORES_URL = `${BASE_URL}/indicadores`;
const INDICADORES_POR_COMPETENCIA_URL = (id) =>
  `${BASE_URL}/competencias/${id}/indicadores`;

const manejarError = (error, mensajePorDefecto) => {
  const compat = normalizarRespuesta(
    asegurarCompatibilidad(error?.response?.data),
    mensajePorDefecto || "Ocurrió un problema en la solicitud."
  );
  return (
    compat.message ||
    mensajePorDefecto ||
    "Ocurrió un problema en la solicitud."
  );
};

const compatRespuesta = (data, fallback) =>
  normalizarRespuesta(asegurarCompatibilidad(data), fallback);

export const obtenerAreasSelect = async () => {
  try {
    const { data } = await axios.get(AREAS_URL, { withCredentials: true });
    const compat = compatRespuesta(
      data,
      "No fue posible cargar las áreas disponibles."
    );
    if (!compat.success) {
      throw new Error(compat.message);
    }
    return Array.isArray(compat.data) ? compat.data : [];
  } catch (error) {
    throw new Error(
      manejarError(error, "No fue posible cargar las areas disponibles.")
    );
  }
};

export const obtenerComponentesSelect = async () => {
  try {
    const { data } = await axios.get(COMPONENTES_URL, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible cargar los componentes disponibles."
    );

    if (!compat.success) {
      throw new Error(compat.message);
    }

    return Array.isArray(compat.data) ? compat.data : [];
  } catch (error) {
    throw new Error(
      manejarError(error, "No fue posible cargar los componentes disponibles.")
    );
  }
};

export const obtenerCompetencias = async ({ areaId, componenteId }) => {
  try {
    const params = {};
    if (areaId) {
      params.area = areaId;
    }
    if (componenteId) {
      params.componente = componenteId;
    }

    const { data } = await axios.get(COMPETENCIAS_URL, {
      withCredentials: true,
      params,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible recuperar las competencias registradas."
    );

    if (!compat.success) {
      throw new Error(compat.message);
    }

    const registros = Array.isArray(compat.data?.competencias)
      ? compat.data.competencias
      : Array.isArray(compat.data)
      ? compat.data
      : [];
    return registros;
  } catch (error) {
    throw new Error(
      manejarError(
        error,
        "No fue posible recuperar las competencias registradas."
      )
    );
  }
};

export const crearCompetencia = async (payload) => {
  try {
    const { data } = await axios.post(COMPETENCIAS_URL, payload, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible registrar la competencia indicada."
    );

    if (compat.success) {
      return compat.data ?? null;
    }

    const error = new Error(compat.message);
    if (compat.errors) {
      error.validation = compat.errors;
    }
    throw error;
  } catch (error) {
    if (error.validation) {
      throw error;
    }
    throw new Error(
      manejarError(error, "No fue posible registrar la competencia indicada.")
    );
  }
};

export const actualizarCompetencia = async (idCompetencia, payload) => {
  try {
    const { data } = await axios.put(
      `${COMPETENCIAS_URL}/${idCompetencia}`,
      payload,
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible actualizar la competencia indicada."
    );

    if (compat.success) {
      return compat.data ?? null;
    }

    const error = new Error(compat.message);
    if (compat.errors) {
      error.validation = compat.errors;
    }
    throw error;
  } catch (error) {
    if (error.validation) {
      throw error;
    }
    throw new Error(
      manejarError(error, "No fue posible actualizar la competencia indicada.")
    );
  }
};

export const eliminarCompetencia = async (idCompetencia) => {
  try {
    const { data } = await axios.delete(
      `${COMPETENCIAS_URL}/${idCompetencia}`,
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible eliminar la competencia."
    );

    if (compat.success) {
      return true;
    }

    throw new Error(compat.message);
  } catch (error) {
    throw new Error(
      manejarError(
        error,
        "No fue posible eliminar la competencia seleccionada."
      )
    );
  }
};

export const obtenerIndicadoresPorCompetencia = async (idCompetencia) => {
  try {
    const { data } = await axios.get(
      INDICADORES_POR_COMPETENCIA_URL(idCompetencia),
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible obtener los indicadores asociados."
    );

    if (compat.success) {
      const registros = Array.isArray(compat.data?.indicadores)
        ? compat.data.indicadores
        : Array.isArray(compat.data)
        ? compat.data
        : [];
      return {
        indicadores: registros,
        competencia: compat.data?.competencia ?? null,
      };
    }

    throw new Error(compat.message);
  } catch (error) {
    throw new Error(
      manejarError(error, "No fue posible obtener los indicadores asociados.")
    );
  }
};

export const crearIndicador = async (payload) => {
  try {
    const { data } = await axios.post(INDICADORES_URL, payload, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible registrar el indicador indicado."
    );

    if (compat.success) {
      return compat.data ?? null;
    }

    const error = new Error(compat.message);
    if (compat.errors) {
      error.validation = compat.errors;
    }
    throw error;
  } catch (error) {
    if (error.validation) {
      throw error;
    }
    throw new Error(
      manejarError(error, "No fue posible registrar el indicador indicado.")
    );
  }
};

export const actualizarIndicador = async (idIndicador, payload) => {
  try {
    const { data } = await axios.put(
      `${INDICADORES_URL}/${idIndicador}`,
      payload,
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible actualizar el indicador indicado."
    );

    if (compat.success) {
      return compat.data ?? null;
    }

    const error = new Error(compat.message);
    if (compat.errors) {
      error.validation = compat.errors;
    }
    throw error;
  } catch (error) {
    if (error.validation) {
      throw error;
    }
    throw new Error(
      manejarError(error, "No fue posible actualizar el indicador indicado.")
    );
  }
};

export const eliminarIndicador = async (idIndicador) => {
  try {
    const { data } = await axios.delete(`${INDICADORES_URL}/${idIndicador}`, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible eliminar el indicador."
    );

    if (compat.success) {
      return true;
    }

    throw new Error(compat.message);
  } catch (error) {
    throw new Error(
      manejarError(error, "No fue posible eliminar el indicador seleccionado.")
    );
  }
};

export const actualizarVisibilidadIndicador = async (idIndicador, ocultar) => {
  try {
    const { data } = await axios.patch(
      `${INDICADORES_URL}/${idIndicador}/ocultar`,
      { ocultar },
      { withCredentials: true }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible actualizar la visibilidad del indicador."
    );

    if (compat.success) {
      return compat.data ?? null;
    }

    throw new Error(compat.message);
  } catch (error) {
    throw new Error(
      manejarError(
        error,
        "No fue posible actualizar la visibilidad del indicador seleccionado."
      )
    );
  }
};
