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

const obtenerDetalleServidor = (compat, respuestaOriginal) => {
  const candidatos = [
    compat?.errorDetails,
    compat?.raw?.error_details,
    compat?.raw?.error_detail,
    compat?.raw?.detalle,
    compat?.raw?.error,
    typeof compat?.raw === "string" ? compat.raw : null,
    typeof respuestaOriginal === "string" ? respuestaOriginal : null,
  ];

  for (const candidato of candidatos) {
    if (typeof candidato === "string" && candidato.trim()) {
      return candidato.trim();
    }
  }

  return null;
};

const construirMensajeServidor = (compat, fallback, respuestaOriginal) => {
  const base = (compat?.message || fallback || "").trim();
  const detalle = obtenerDetalleServidor(compat, respuestaOriginal);

  if (detalle && base) {
    if (detalle.includes(base)) {
      return detalle;
    }
    return `${base}\n${detalle}`;
  }

  if (detalle) {
    return detalle;
  }

  return base || fallback || "Solicitud procesada.";
};

const registrarErrorServidor = (contexto, detalle) => {
  if (!detalle) {
    return;
  }
  const etiqueta = contexto ? `[Horarios/${contexto}]` : "[Horarios]";
  console.error(`${etiqueta} ${detalle}`);
};

const registrarErroresValidacion = (contexto, errores, detalle = null) => {
  const etiqueta = contexto ? `[Horarios/${contexto}]` : "[Horarios]";
  const cuerpo = errores
    ? JSON.stringify(errores, null, 2)
    : "Sin detalle de validación.";
  if (detalle) {
    console.error(`${etiqueta} Validaciones fallidas. ${detalle}\n${cuerpo}`);
  } else {
    console.error(`${etiqueta} Validaciones fallidas.\n${cuerpo}`);
  }
};

export const listarHorarios = async ({
  filtros = {},
  setHorarios,
  setIsLoading,
  Swal,
}) => {
  const mensajeFallo = "No fue posible cargar los horarios.";
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

    if (filtros.fk_personal) {
      params.append("fk_personal", filtros.fk_personal);
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

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      const registros = extraerColeccion(compat.data);
      if (typeof setHorarios === "function") {
        setHorarios(registros);
      }
      return registros;
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("listarHorarios", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para ver los horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }

    if (typeof setHorarios === "function") {
      setHorarios([]);
    }
    return [];
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    registrarErrorServidor("listarHorarios", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para ver los horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
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

export const listarBloquesHorario = async ({ Swal } = {}) => {
  const mensajeFallo = "No fue posible cargar los bloques de horarios.";
  try {
    const { data } = await axios.get(`${HORARIOS_URL}/bloques`, {
      withCredentials: true,
    });

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      const payload = compat.data ?? compat.raw ?? {};
      const bloques = extraerColeccion(payload?.bloques ?? payload);
      const dependencias = payload?.dependencias ?? {};
      return {
        bloques,
        dependencias,
      };
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("bloquesHorarios", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los bloques.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }

    return null;
  } catch (error) {
    console.error("Error al obtener bloques de horarios:", error);
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    registrarErrorServidor("bloquesHorarios", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los bloques.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return null;
  }
};

export const obtenerCatalogosHorarios = async ({ filtros = {}, Swal }) => {
  const mensajeFallo = "No fue posible cargar los catálogos.";
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

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      const registros = compat.data ?? {};
      return registros;
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("catalogosHorarios", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los catálogos.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return {};
  } catch (error) {
    console.error("Error al obtener catálogos de horarios:", error);
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    registrarErrorServidor("catalogosHorarios", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para obtener los catálogos.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
    }
    return {};
  }
};

export const crearHorario = async ({ datos, Swal }) => {
  const mensajeFallo = "No fue posible registrar el horario.";
  try {
    const { data } = await axios.post(HORARIOS_URL, datos, {
      withCredentials: true,
    });

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      Swal?.fire(
        "Hecho",
        compat.message || "Horario registrado correctamente.",
        "success"
      );
      return compat.data;
    }

    if (compat.errors) {
      registrarErroresValidacion(
        "crearHorario",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("crearHorario", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para registrar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return null;
  } catch (error) {
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    if (compat.errors) {
      registrarErroresValidacion(
        "crearHorario",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    registrarErrorServidor("crearHorario", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para registrar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
    }
    return null;
  }
};

export const actualizarHorario = async ({ idHorario, datos, Swal }) => {
  const mensajeFallo = "No fue posible actualizar el horario.";
  try {
    const { data } = await axios.put(`${HORARIOS_URL}/${idHorario}`, datos, {
      withCredentials: true,
    });

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      Swal?.fire("Hecho", compat.message || "Horario actualizado.", "success");
      return compat.data;
    }

    if (compat.errors) {
      registrarErroresValidacion(
        "actualizarHorario",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("actualizarHorario", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return null;
  } catch (error) {
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    if (compat.errors) {
      registrarErroresValidacion(
        "actualizarHorario",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    registrarErrorServidor("actualizarHorario", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
    }
    return null;
  }
};

export const eliminarHorario = async ({ idHorario, Swal }) => {
  const mensajeFallo = "No fue posible eliminar el horario.";
  try {
    const { data } = await axios.delete(`${HORARIOS_URL}/${idHorario}`, {
      withCredentials: true,
    });

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      Swal?.fire("Hecho", compat.message || "Horario eliminado.", "success");
      return true;
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("eliminarHorario", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para eliminar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return false;
  } catch (error) {
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    registrarErrorServidor("eliminarHorario", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para eliminar horarios.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
    }
    return false;
  }
};

export const sincronizarSubgrupo = async ({ idHorario, estudiantes, Swal }) => {
  const mensajeFallo = "No fue posible actualizar el subgrupo.";
  try {
    const { data } = await axios.patch(
      `${HORARIOS_URL}/${idHorario}/subgrupo`,
      { estudiantes },
      { withCredentials: true }
    );

    const compat = compatRespuesta(data, mensajeFallo);

    if (compat.success) {
      Swal?.fire(
        "Hecho",
        compat.message || "Subgrupo actualizado correctamente.",
        "success"
      );
      return compat.data;
    }

    if (compat.errors) {
      registrarErroresValidacion(
        "sincronizarSubgrupo",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      data
    );

    if (!compat.raw?.blocked) {
      registrarErrorServidor("sincronizarSubgrupo", mensajeServidor);
    }

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar subgrupos.",
        "warning"
      );
    } else {
      Swal?.fire("Aviso", mensajeFallo, "warning");
    }
    return null;
  } catch (error) {
    const respuestaServidor = error.response?.data;
    const compat = compatRespuesta(respuestaServidor, mensajeFallo);
    const mensajeServidor = construirMensajeServidor(
      compat,
      mensajeFallo,
      respuestaServidor
    );
    if (compat.errors) {
      registrarErroresValidacion(
        "sincronizarSubgrupo",
        compat.errors,
        compat.message || mensajeFallo
      );
      return Promise.reject(compat.errors);
    }

    registrarErrorServidor("sincronizarSubgrupo", mensajeServidor);

    if (compat.raw?.blocked) {
      Swal?.fire(
        "Sesión requerida",
        compat.message || "Debes iniciar sesión para actualizar subgrupos.",
        "warning"
      );
    } else {
      Swal?.fire("Error", mensajeFallo, "error");
    }
    return null;
  }
};
