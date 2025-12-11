import axios from "axios";
import SwalLib from "sweetalert2";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_INSCRIPCIONES = `${API_BASE}/inscripciones`;

const escapeHtml = (texto = "") =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

const anexarDebugSeccion = (destino, fuente, etiqueta) => {
  if (!fuente || typeof fuente !== "object") {
    return;
  }

  const mensajes = Array.isArray(fuente.mensajes)
    ? fuente.mensajes.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    : [];

  mensajes.forEach((texto) => {
    destino.mensajes.push(`[${etiqueta}] ${texto}`);
  });

  const sqlEntradas =
    fuente.sql && typeof fuente.sql === "object"
      ? Object.entries(fuente.sql)
      : [];

  sqlEntradas.forEach(([clave, info]) => {
    const claveDestino = destino.sql[clave]
      ? `${etiqueta.toLowerCase()}::${clave}`
      : clave;
    destino.sql[claveDestino] =
      info && typeof info === "object" ? { ...info } : {};
  });
};

const generarResumenInscripcion = (mensajeAulas, debugAulas) => {
  const debugCombinado = { mensajes: [], sql: {} };

  const agregarSeccion = (etiqueta, mensaje, debug, extras = []) => {
    if (mensaje) {
      debugCombinado.mensajes.push(`[${etiqueta}] ${mensaje}`);
    }
    extras
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .forEach((item) => {
        debugCombinado.mensajes.push(`[${etiqueta}] ${item}`);
      });
    anexarDebugSeccion(debugCombinado, debug, etiqueta);
  };

  if (resumenInscripcion.precondiciones) {
    agregarSeccion(
      "Precondiciones",
      resumenInscripcion.precondiciones.mensaje ||
        "Precondiciones verificadas.",
      resumenInscripcion.precondiciones.debug
    );
  }

  if (resumenInscripcion.estudiantes) {
    const extrasEstudiantes = [];
    if (typeof ultimoDebugEstudiantes?.total === "number") {
      extrasEstudiantes.push(
        `Total recibidos: ${ultimoDebugEstudiantes.total}`
      );
    }
    agregarSeccion(
      "Estudiantes",
      resumenInscripcion.estudiantes.mensaje ||
        "Estudiantes elegibles consultados.",
      resumenInscripcion.estudiantes.debug,
      extrasEstudiantes
    );
  }

  agregarSeccion(
    "Aulas",
    mensajeAulas || "Aulas disponibles consultadas.",
    debugAulas
  );

  if (debugCombinado.mensajes.length === 0) {
    debugCombinado.mensajes.push(
      `[Aulas] ${mensajeAulas || "Consulta realizada sin detalles."}`
    );
  }

  return {
    mensaje: "Resumen de la verificación de inscripción.",
    debug: debugCombinado,
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
    if (debug) {
      console.info([`[${titulo}] Mensajes backend`, debug.mensajes || []]);
      console.info([`[${titulo}] SQL ejecutado`, debug.sql || {}]);
    }
    return;
  }

  const mensajes = Array.isArray(debug?.mensajes)
    ? debug.mensajes.filter((item) => typeof item === "string" && item.trim())
    : [];
  const sqlEntradas =
    debug?.sql && typeof debug.sql === "object"
      ? Object.entries(debug.sql)
      : [];

  const partes = [];
  if (mensaje) {
    partes.push(`<p style="margin-bottom:8px;">${escapeHtml(mensaje)}</p>`);
  }

  if (mensajes.length > 0) {
    const lista = mensajes
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    partes.push(
      `<div style="text-align:left; margin-bottom:12px;"><strong>Detalle:</strong><ul style="padding-left:18px; margin:4px 0;">${lista}</ul></div>`
    );
  }

  if (sqlEntradas.length > 0) {
    // Mostrar el SQL de estudiantes primero si existe
    sqlEntradas.sort(([claveA], [claveB]) => {
      if (claveA === "estudiantes_elegibles") return -1;
      if (claveB === "estudiantes_elegibles") return 1;
      return claveA.localeCompare(claveB);
    });

    const bloques = sqlEntradas
      .map(([clave, info]) => {
        const sql = escapeHtml(info?.sql || "");
        const parametros =
          info?.parametros && typeof info.parametros === "object"
            ? escapeHtml(JSON.stringify(info.parametros, null, 2))
            : null;

        const parrafoParametros =
          parametros !== null
            ? `<pre style="background:#1f2937; color:#e5e7eb; padding:8px; border-radius:4px; white-space:pre-wrap;">${parametros}</pre>`
            : "";

        const etiqueta =
          clave === "estudiantes_elegibles"
            ? `${escapeHtml(clave)} (consulta principal)`
            : escapeHtml(clave);

        return `
          <div style="margin-bottom:12px; text-align:left;">
            <div style="font-weight:600; margin-bottom:4px;">${etiqueta}</div>
            <pre style="background:#0f172a; color:#f8fafc; padding:8px; border-radius:4px; overflow:auto; white-space:pre-wrap;">${sql}</pre>
            ${parrafoParametros}
          </div>`;
      })
      .join("");

    partes.push(
      `<div style="text-align:left;"><strong>Consultas SQL ejecutadas:</strong>${bloques}</div>`
    );
  }

  swalInstance.fire({
    title: titulo,
    html: partes.join("") || escapeHtml(mensaje || ""),
    icon: icono,
    width: 800,
  });
};

const showError = (Swal, error, mensajeDefecto) => {
  const swalInstance = obtenerInstanciaSwal(Swal);
  const errorData = error?.response?.data;
  const status = error?.response?.status;

  if (errorData?.errors) {
    const errores = Object.entries(errorData.errors).map(([campo, detalle]) => {
      const valor = Array.isArray(detalle) ? detalle.join(", ") : detalle;
      return `${campo}: ${valor}`;
    });
    const { debug: debugConEstudiantes, combinado } =
      combinarDebugConUltimosEstudiantes({
        mensajes: errores,
        sql: {},
      });

    if (combinado && ultimoDebugEstudiantes?.timestamp) {
      console.log([
        "[Errores de validación] SQL estudiantes anexado",
        ultimoDebugEstudiantes.timestamp,
      ]);
    }

    mostrarDetalleBackend(
      swalInstance,
      "Error de validación",
      "Se encontraron errores de validación en el formulario.",
      debugConEstudiantes,
      "error"
    );
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
  const debug = extraerDebug(errorData?.data);
  const { debug: debugConEstudiantes, combinado } =
    combinarDebugConUltimosEstudiantes(debug);

  if (combinado && ultimoDebugEstudiantes?.timestamp) {
    console.log([
      `[${titulo}] SQL estudiantes anexado`,
      ultimoDebugEstudiantes.timestamp,
    ]);
  }

  mostrarDetalleBackend(
    swalInstance,
    titulo,
    descripcion,
    debugConEstudiantes,
    icono
  );
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
