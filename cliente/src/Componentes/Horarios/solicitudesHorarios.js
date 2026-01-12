import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const compatRespuesta = (data, fallback) =>
  normalizarRespuesta(asegurarCompatibilidad(data), fallback);

const extraerColeccion = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.datos)) {
    return payload.datos;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.registros)) {
    return payload.registros;
  }

  return [];
};

const BASE_URL = "http://localhost:8080/controlestudios/servidor";
const HORARIOS_URL = `${BASE_URL}/horarios`;

export const listarHorarios = async ({
  filtros = {},
  setHorarios,
  setIsLoading,
  Swal,
}) => {
  try {
    setIsLoading?.(true);
    const params = new URLSearchParams();

    if (filtros.fk_aula) {
      params.append("fk_aula", filtros.fk_aula);
    }

    if (filtros.fk_momento) {
      params.append("fk_momento", filtros.fk_momento);
    }

    if (filtros.fk_componente) {
      params.append("fk_componente", filtros.fk_componente);
    }
    if (filtros.dia_semana) {
      params.append("dia_semana", filtros.dia_semana);
    }

    const { data } = await axios.get(
      `${HORARIOS_URL}${params.toString() ? `?${params.toString()}` : ""}`,
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(data, "No fue posible cargar los horarios.");

    if (compat.success) {
      const registros = extraerColeccion(compat.data);
      if (typeof setHorarios === "function") {
        setHorarios(registros);
      }
      return registros;
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para ver los horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }

    if (typeof setHorarios === "function") {
      setHorarios([]);
    }
    return [];
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible cargar los horarios."
    );
    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para ver los horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }

    if (typeof setHorarios === "function") {
      setHorarios([]);
    }
    return [];
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

export const obtenerCatalogosHorarios = async ({ filtros = {}, Swal }) => {
  try {
    const params = new URLSearchParams();

    if (filtros.fk_anio_escolar) {
      params.append("fk_anio_escolar", filtros.fk_anio_escolar);
    }

    if (filtros.fk_aula) {
      params.append("fk_aula", filtros.fk_aula);
    }

    const { data } = await axios.get(
      `${HORARIOS_URL}/catalogos${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        withCredentials: true,
      }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible cargar los catálogos."
    );

    if (compat.success) {
      const registros = compat.data ?? {};
      return registros;
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los catálogos.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }
    return {};
  } catch (error) {
    console.error("Error al obtener catálogos de horarios:", error);
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible cargar los catálogos."
    );
    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los catálogos.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }
    return {};
  }
};

export const crearHorario = async ({ datos, Swal }) => {
  try {
    const { data } = await axios.post(HORARIOS_URL, datos, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible registrar el horario."
    );

    if (compat.success) {
      Swal?.fire(
        "Hecho",
        compat.message || "Horario registrado correctamente.",
        "success"
      );
      return compat.data;
    }

    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para registrar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }
    return null;
  } catch (error) {
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible registrar el horario."
    );
    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para registrar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }
    return null;
  }
};

export const actualizarHorario = async ({ idHorario, datos, Swal }) => {
  try {
    const { data } = await axios.put(`${HORARIOS_URL}/${idHorario}`, datos, {
      withCredentials: true,
    });

    const compat = compatRespuesta(
      data,
      "No fue posible actualizar el horario."
    );

    if (compat.success) {
      Swal?.fire("Hecho", compat.message || "Horario actualizado.", "success");
      return compat.data;
    }

    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }
    return null;
  } catch (error) {
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible actualizar el horario."
    );
    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }
    return null;
  }
};

export const eliminarHorario = async ({ idHorario, Swal }) => {
  try {
    const { data } = await axios.delete(`${HORARIOS_URL}/${idHorario}`, {
      withCredentials: true,
    });

    const compat = compatRespuesta(data, "No fue posible eliminar el horario.");

    if (compat.success) {
      Swal?.fire("Hecho", compat.message || "Horario eliminado.", "success");
      return true;
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para eliminar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }
    return false;
  } catch (error) {
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible eliminar el horario."
    );
    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para eliminar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }
    return false;
  }
};

export const sincronizarSubgrupo = async ({ idHorario, estudiantes, Swal }) => {
  try {
    const { data } = await axios.patch(
      `${HORARIOS_URL}/${idHorario}/subgrupo`,
      { estudiantes },
      { withCredentials: true }
    );

    const compat = compatRespuesta(
      data,
      "No fue posible actualizar el subgrupo."
    );

    if (compat.success) {
      Swal?.fire(
        "Hecho",
        compat.message || "Subgrupo actualizado correctamente.",
        "success"
      );
      return compat.data;
    }

    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar subgrupos.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", compat.message, "warning");
    }
    return null;
  } catch (error) {
    const compat = compatRespuesta(
      error.response?.data,
      "No fue posible actualizar el subgrupo."
    );
    if (compat.errors) {
      return Promise.reject(compat.errors);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar subgrupos.",
        "warning"
      );
    } else {
      Swal?.fire("Error", compat.message, "error");
    }
    return null;
  }
};
