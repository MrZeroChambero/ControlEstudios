import axios from "axios";
import SwalLib from "sweetalert2";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_INSCRIPCIONES = `${API_BASE}/inscripciones`;

const extraerDebug = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.debug && typeof payload.debug === "object") {
    return payload.debug;
  }
  return null;
};

const clonarDebug = (debug) => {
  if (!debug || typeof debug !== "object") {
    return null;
  }

  const mensajes = Array.isArray(debug.mensajes) ? [...debug.mensajes] : [];
  const sql =
    debug.sql && typeof debug.sql === "object"
      ? Object.fromEntries(
          Object.entries(debug.sql).map(([clave, info]) => [
            clave,
            info && typeof info === "object" ? { ...info } : {},
          ])
        )
      : {};

  return { mensajes, sql };
};

let ultimoDebugEstudiantes = null;
const resumenInscripcion = {
  precondiciones: null,
  estudiantes: null,
};

const resetResumenInscripcion = () => {
  resumenInscripcion.precondiciones = null;
  resumenInscripcion.estudiantes = null;
};

const guardarResumenInscripcion = (seccion, mensaje, debug) => {
  if (!Object.prototype.hasOwnProperty.call(resumenInscripcion, seccion)) {
    return;
  }

  resumenInscripcion[seccion] = {
    mensaje: mensaje || "",
    debug: debug ? clonarDebug(debug) : null,
    timestamp: new Date().toISOString(),
  };
};

const logRespuesta = (titulo, payload, debug) => {
  try {
    console.log([`[${titulo}] Mensaje`, payload?.message || "Sin mensaje"]);
    if (payload?.data) {
      console.log([`[${titulo}] Datos`, payload.data]);
    }
    if (debug) {
      console.log([`[${titulo}] Mensajes backend`, debug.mensajes || []]);
      console.log([`[${titulo}] SQL ejecutado`, debug.sql || {}]);
    }
  } catch (logError) {
    console.warn([
      `[${titulo}] No se pudo registrar la traza en consola`,
      logError,
    ]);
  }
};

const obtenerInstanciaSwal = (Swal) => {
  if (Swal && typeof Swal.fire === "function") {
    return Swal;
  }
  return SwalLib;
};

const combinarDebugConUltimosEstudiantes = (debugEntrada) => {
  const debugEstudiantes = ultimoDebugEstudiantes?.debug;
  const baseClonada = clonarDebug(debugEntrada);

  if (!debugEstudiantes) {
    return {
      debug:
        baseClonada ||
        (debugEntrada && typeof debugEntrada === "object"
          ? debugEntrada
          : null),
      combinado: false,
    };
  }

  const resultado = baseClonada || { mensajes: [], sql: {} };
  if (!Array.isArray(resultado.mensajes)) {
    resultado.mensajes = [];
  }
  if (!resultado.sql || typeof resultado.sql !== "object") {
    resultado.sql = {};
  }

  const mensajesEstudiantes = Array.isArray(debugEstudiantes.mensajes)
    ? debugEstudiantes.mensajes
        .filter((texto) => typeof texto === "string" && texto.trim().length > 0)
        .map((texto) => `[Estudiantes] ${texto}`)
    : [];

  if (ultimoDebugEstudiantes.mensaje) {
    mensajesEstudiantes.unshift(
      `[Estudiantes] ${ultimoDebugEstudiantes.mensaje}`
    );
  }

  if (typeof ultimoDebugEstudiantes.total === "number") {
    mensajesEstudiantes.push(
      `[Estudiantes] Total recibidos: ${ultimoDebugEstudiantes.total}`
    );
  }

  resultado.mensajes = [...mensajesEstudiantes, ...resultado.mensajes];
  resultado.sql = {
    ...(debugEstudiantes.sql || {}),
    ...(resultado.sql || {}),
  };

  return { debug: resultado, combinado: true };
};

const generarResumenInscripcion = (mensajeAulas, debugAulas) => {
  const partesMensaje = [];

  const anexarTextoResumen = (titulo, registro, respaldo) => {
    if (!registro) {
      return;
    }
    const texto = (registro.mensaje || respaldo || "").trim();
    if (texto.length > 0) {
      partesMensaje.push(`${titulo}: ${texto}`);
    }
  };

  anexarTextoResumen(
    "Precondiciones",
    resumenInscripcion.precondiciones,
    "Verificación ejecutada."
  );
  anexarTextoResumen(
    "Estudiantes",
    resumenInscripcion.estudiantes,
    "Estudiantes elegibles consultados."
  );

  const textoAulas = (mensajeAulas || "Aulas disponibles consultadas.").trim();
  if (textoAulas.length > 0) {
    partesMensaje.push(`Aulas: ${textoAulas}`);
  }

  const combinado = combinarDebugConUltimosEstudiantes(debugAulas);
  const debugBase = combinado?.debug ||
    clonarDebug(debugAulas) || {
      mensajes: [],
      sql: {},
    };

  if (!Array.isArray(debugBase.mensajes)) {
    debugBase.mensajes = [];
  }
  if (!debugBase.sql || typeof debugBase.sql !== "object") {
    debugBase.sql = {};
  }

  const anexarDetalle = (titulo, registro, respaldo) => {
    if (!registro) {
      return;
    }
    const texto = (registro.mensaje || respaldo || "").trim();
    if (texto.length > 0) {
      debugBase.mensajes.push(`[${titulo}] ${texto}`);
    }

    const mensajesExtra = registro.debug?.mensajes;
    if (Array.isArray(mensajesExtra)) {
      mensajesExtra
        .filter((item) => typeof item === "string" && item.trim().length > 0)
        .forEach((item) => {
          debugBase.mensajes.push(`[${titulo}] ${item}`);
        });
    }

    if (registro.debug?.sql && typeof registro.debug.sql === "object") {
      debugBase.sql = { ...debugBase.sql, ...registro.debug.sql };
    }
  };

  anexarDetalle(
    "Precondiciones",
    resumenInscripcion.precondiciones,
    "Verificación ejecutada."
  );
  anexarDetalle(
    "Estudiantes",
    resumenInscripcion.estudiantes,
    "Estudiantes elegibles consultados."
  );

  if (Array.isArray(debugAulas?.mensajes)) {
    debugAulas.mensajes
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .forEach((item) => {
        debugBase.mensajes.push(`[Aulas] ${item}`);
      });
  } else if (textoAulas.length > 0) {
    debugBase.mensajes.push(`[Aulas] ${textoAulas}`);
  }

  if (debugAulas?.sql && typeof debugAulas.sql === "object") {
    debugBase.sql = { ...debugBase.sql, ...debugAulas.sql };
  }

  const mensajeResumen =
    partesMensaje.length > 0
      ? partesMensaje.join(" ")
      : "Resumen de la verificación de inscripción.";

  return {
    mensaje: mensajeResumen,
    debug: debugBase,
  };
};

const mostrarDetalleBackend = (
  Swal,
  titulo,
  mensaje,
  debug,
  icono = "info"
) => {
  const swalInstance = obtenerInstanciaSwal(Swal);

  if (!swalInstance) {
    console.info([`[${titulo}] Mensaje`, mensaje]);
    if (Array.isArray(debug?.mensajes)) {
      console.info([`[${titulo}] Mensajes backend`, debug.mensajes]);
    }
    return;
  }

  const mensajesAdicionales = Array.isArray(debug?.mensajes)
    ? debug.mensajes.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    : [];

  const texto = [mensaje, ...mensajesAdicionales]
    .filter((fragmento) => typeof fragmento === "string" && fragmento.trim())
    .join("\n\n");

  swalInstance.fire({
    title: titulo,
    text: texto || mensaje || "",
    icon: icono,
  });
};

const showError = (Swal, error, mensajeDefecto) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  const errorData = error?.response?.data;
  const status = error?.response?.status;

  if (errorData?.errors) {
    const errores = Object.entries(errorData.errors)
      .map(([campo, detalle]) => {
        const valor = Array.isArray(detalle) ? detalle.join(", ") : detalle;
        return `${campo}: ${valor}`;
      })
      .join("\n");

    swalInstance.fire({
      title: "Error de validación",
      text: errores || mensajeDefecto,
      icon: "error",
    });
    return;
  }

  const motivos = Array.isArray(errorData?.data?.motivos)
    ? errorData.data.motivos
        .filter(
          (motivo) => typeof motivo === "string" && motivo.trim().length > 0
        )
        .join("\n")
    : "";

  const mensajeBase = errorData?.message || mensajeDefecto;
  const descripcion = motivos ? `${mensajeBase}\n${motivos}` : mensajeBase;

  const titulo = status === 428 ? "Inscripcion no disponible" : "Error";
  const icono = status === 428 ? "info" : "error";
  swalInstance.fire({
    title: titulo,
    text: descripcion,
    icon: icono,
  });
};

export const verificarPrecondicionesInscripcion = async (Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    resetResumenInscripcion();
    const respuesta = await axios.get(`${API_INSCRIPCIONES}/precondiciones`, {
      withCredentials: true,
    });

    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Precondiciones", respuesta.data, debug);
      guardarResumenInscripcion(
        "precondiciones",
        respuesta.data?.message,
        debug
      );
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      swalInstance,
      error,
      "No se pudieron verificar las precondiciones de inscripción."
    );
    resetResumenInscripcion();
    return null;
  }
};

export const listarEstudiantesElegibles = async (Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.get(`${API_INSCRIPCIONES}/estudiantes`, {
      withCredentials: true,
    });
    console.log(["estudiantes:", respuesta]);
    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Estudiantes elegibles", respuesta.data, debug);
      guardarResumenInscripcion("estudiantes", respuesta.data?.message, debug);
      const sqlEstudiantes = debug?.sql?.estudiantes_elegibles?.sql;
      if (sqlEstudiantes) {
        console.log(["[Estudiantes elegibles] SQL principal", sqlEstudiantes]);
      }
      const listado = respuesta.data?.data?.estudiantes;
      if (Array.isArray(listado)) {
        console.log([
          "[Estudiantes elegibles] Total de estudiantes recibidos",
          listado.length,
        ]);
        if (listado.length > 0) {
          console.table(listado, [
            "id",
            "nombre_completo",
            "edad",
            "cedula_escolar",
          ]);
        }
      }
      ultimoDebugEstudiantes = {
        debug: clonarDebug(debug),
        timestamp: new Date().toISOString(),
        mensaje: respuesta.data?.message || "",
        total: Array.isArray(listado) ? listado.length : null,
      };
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    const debugError = extraerDebug(error?.response?.data?.data);
    if (debugError) {
      ultimoDebugEstudiantes = {
        debug: clonarDebug(debugError),
        timestamp: new Date().toISOString(),
        mensaje:
          error?.response?.data?.message ||
          "No se pudieron cargar los estudiantes elegibles.",
        total: null,
      };
    }
    guardarResumenInscripcion(
      "estudiantes",
      error?.response?.data?.message ||
        "No se pudieron cargar los estudiantes elegibles.",
      debugError || null
    );
    console.error([
      "[Estudiantes elegibles] Falló la carga de estudiantes elegibles",
      error,
    ]);
    return null;
  }
};

export const listarAulasDisponibles = async (Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.get(
      `${API_INSCRIPCIONES}/aulas-disponibles`,
      {
        withCredentials: true,
      }
    );
    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Aulas disponibles", respuesta.data, debug);
      const resultadoResumen = generarResumenInscripcion(
        respuesta.data?.message,
        debug
      );

      console.log(["[Aulas disponibles] Resumen combinado", resultadoResumen]);

      // mostrarDetalleBackend(
      //   swalInstance,
      //   "Inscripción",
      //   resultadoResumen.mensaje,
      //   resultadoResumen.debug,
      //   "info"
      // );
      resetResumenInscripcion();
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      swalInstance,
      error,
      "No se pudieron cargar los grados y secciones disponibles."
    );
    resetResumenInscripcion();
    return null;
  }
};

export const listarResumenInscripciones = async (Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.get(`${API_INSCRIPCIONES}/resumen`, {
      withCredentials: true,
    });

    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Resumen inscripciones", respuesta.data, debug);
      mostrarDetalleBackend(
        swalInstance,
        "Resumen de inscripciones",
        respuesta.data?.message,
        debug,
        "info"
      );
      return respuesta.data.data;
    }

    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      swalInstance,
      error,
      "No se pudo cargar el resumen de inscripciones."
    );
    return null;
  }
};

export const listarRepresentantesPorEstudiante = async (estudianteId, Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.get(
      `${API_INSCRIPCIONES}/estudiantes/${estudianteId}/representantes`,
      {
        withCredentials: true,
      }
    );
    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Representantes", respuesta.data, debug);
      mostrarDetalleBackend(
        swalInstance,
        "Representantes",
        respuesta.data?.message,
        debug,
        "info"
      );
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      swalInstance,
      error,
      "No se pudieron cargar los representantes asociados."
    );
    return null;
  }
};

export const registrarInscripcion = async (payload, Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.post(`${API_INSCRIPCIONES}`, payload, {
      withCredentials: true,
    });
    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Registro de inscripción", respuesta.data, debug);
      mostrarDetalleBackend(
        swalInstance,
        "Registro de inscripción",
        respuesta.data?.message,
        debug,
        "success"
      );
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(swalInstance, error, "No se pudo registrar la inscripción.");
    return null;
  }
};

export const retirarInscripcion = async (idInscripcion, datos, Swal) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  try {
    const respuesta = await axios.patch(
      `${API_INSCRIPCIONES}/${idInscripcion}/retiro`,
      datos,
      {
        withCredentials: true,
      }
    );

    if (respuesta.data?.back === true) {
      const debug = extraerDebug(respuesta.data?.data);
      logRespuesta("Retiro de inscripción", respuesta.data, debug);
      mostrarDetalleBackend(
        swalInstance,
        "Retiro de inscripción",
        respuesta.data?.message,
        debug,
        "success"
      );
      return respuesta.data.data;
    }

    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      swalInstance,
      error,
      "No se pudo completar el retiro de la inscripción."
    );
    return null;
  }
};
