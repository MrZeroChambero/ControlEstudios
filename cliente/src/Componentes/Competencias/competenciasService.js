import axios from "axios";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";
const AREAS_URL = `${BASE_URL}/areas_aprendizaje/listar-select`;
const COMPONENTES_URL = `${BASE_URL}/componentes_aprendizaje/listar-select`;
const COMPETENCIAS_URL = `${BASE_URL}/competencias`;
const INDICADORES_URL = `${BASE_URL}/indicadores`;
const INDICADORES_POR_COMPETENCIA_URL = (id) =>
  `${BASE_URL}/competencias/${id}/indicadores`;

const manejarError = (error, mensajePorDefecto) => {
  const respuesta = error?.response?.data;
  return (
    respuesta?.mensaje ||
    respuesta?.errors?.detalle?.[0] ||
    mensajePorDefecto ||
    "Ocurrio un problema en la solicitud."
  );
};

export const obtenerAreasSelect = async () => {
  try {
    const { data } = await axios.get(AREAS_URL, { withCredentials: true });
    if (data?.exito === true) {
      return Array.isArray(data.datos) ? data.datos : [];
    }
    throw new Error(
      data?.mensaje || "No fue posible cargar las areas disponibles."
    );
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

    if (data?.exito === true) {
      return Array.isArray(data.datos) ? data.datos : [];
    }

    throw new Error(
      data?.mensaje || "No fue posible cargar los componentes disponibles."
    );
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

    if (data?.exito === true) {
      const registros = data?.datos?.competencias;
      return Array.isArray(registros) ? registros : [];
    }

    throw new Error(
      data?.mensaje || "No fue posible recuperar las competencias registradas."
    );
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

    if (data?.exito === true) {
      return data?.datos ?? null;
    }

    const errores = data?.errores;
    const mensaje =
      data?.mensaje || "No fue posible registrar la competencia indicada.";
    const error = new Error(mensaje);
    error.validation = errores;
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

    if (data?.exito === true) {
      return data?.datos ?? null;
    }

    const errores = data?.errores;
    const mensaje =
      data?.mensaje || "No fue posible actualizar la competencia indicada.";
    const error = new Error(mensaje);
    error.validation = errores;
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

    if (data?.exito === true) {
      return true;
    }

    throw new Error(data?.mensaje || "No fue posible eliminar la competencia.");
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

    if (data?.exito === true) {
      const registros = data?.datos?.indicadores;
      return {
        indicadores: Array.isArray(registros) ? registros : [],
        competencia: data?.datos?.competencia ?? null,
      };
    }

    throw new Error(
      data?.mensaje || "No fue posible obtener los indicadores asociados."
    );
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

    if (data?.exito === true) {
      return data?.datos ?? null;
    }

    const errores = data?.errores;
    const mensaje =
      data?.mensaje || "No fue posible registrar el indicador indicado.";
    const error = new Error(mensaje);
    error.validation = errores;
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

    if (data?.exito === true) {
      return data?.datos ?? null;
    }

    const errores = data?.errores;
    const mensaje =
      data?.mensaje || "No fue posible actualizar el indicador indicado.";
    const error = new Error(mensaje);
    error.validation = errores;
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

    if (data?.exito === true) {
      return true;
    }

    throw new Error(data?.mensaje || "No fue posible eliminar el indicador.");
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

    if (data?.exito === true) {
      return data?.datos ?? null;
    }

    throw new Error(
      data?.mensaje || "No fue posible actualizar la visibilidad del indicador."
    );
  } catch (error) {
    throw new Error(
      manejarError(
        error,
        "No fue posible actualizar la visibilidad del indicador seleccionado."
      )
    );
  }
};
