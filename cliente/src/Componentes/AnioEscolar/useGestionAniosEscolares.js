import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  listarAniosEscolares,
  crearAnioEscolar,
  actualizarAnioEscolar,
  eliminarAnioEscolar,
  cambiarEstadoAnioEscolar,
} from "../../api/anioEscolarService";
import {
  construirFormularioBase,
  combinarMomentos,
  construirNombrePeriodo,
  formatearFecha,
  generarMomentosAutomaticos,
  normalizarMomento,
  normalizarRegistroAnio,
  validarFormulario,
} from "./utilidadesAnioEscolar";

const MENSAJE_ERROR_CARGA = "No se pudo cargar la lista de años escolares.";

const mapearErroresServidor = (errores = {}) => {
  if (!errores || typeof errores !== "object") {
    return {};
  }

  const adaptados = { ...errores };

  if (adaptados.limite_inscripcion && !adaptados.fecha_limite_inscripcion) {
    adaptados.fecha_limite_inscripcion = adaptados.limite_inscripcion;
  }

  return adaptados;
};

const construirHtmlErroresDocentes = (errores = {}) => {
  const mensajes = [];
  const detalleDocentes = errores.docentes;
  if (Array.isArray(detalleDocentes)) {
    detalleDocentes
      .filter(Boolean)
      .forEach((texto) => mensajes.push(String(texto)));
  } else if (detalleDocentes) {
    mensajes.push(String(detalleDocentes));
  }

  const aulas = Array.isArray(errores.aulas_sin_docente)
    ? errores.aulas_sin_docente
    : [];

  const bloques = [];
  if (mensajes.length > 0) {
    bloques.push(
      mensajes
        .map(
          (texto) =>
            `<p style="margin:4px 0; text-align:left; line-height:1.4;">${texto}</p>`
        )
        .join("")
    );
  }

  if (aulas.length > 0) {
    const items = aulas
      .map((aula) => {
        const etiqueta = aula?.descripcion
          ? String(aula.descripcion)
          : `Aula #${aula?.id_aula ?? ""}`;
        return `<li style="margin:2px 0;">${etiqueta}</li>`;
      })
      .join("");

    bloques.push(
      `<div style="margin-top:8px; text-align:left;">` +
        `<p style="margin:0 0 4px; font-weight:600;">Aulas pendientes:</p>` +
        `<ul style="padding-left:18px; margin:0;">${items}</ul>` +
        `</div>`
    );
  }

  return bloques.join("");
};

const construirHtmlResumenDocentes = (resumen) => {
  if (!resumen) {
    return "";
  }

  const total = resumen.total_aulas ?? 0;
  const asignadas = resumen.aulas_con_docente ?? 0;
  const pendientes = Array.isArray(resumen.aulas_sin_docente)
    ? resumen.aulas_sin_docente.length
    : 0;

  const partes = [
    `<p style="margin:0; text-align:left;">Docentes asignados: <strong>${asignadas}</strong> de <strong>${total}</strong> aulas.</p>`,
  ];

  if (pendientes > 0) {
    const items = resumen.aulas_sin_docente
      .map((aula) => {
        const etiqueta = aula?.descripcion
          ? String(aula.descripcion)
          : `Aula #${aula?.id_aula ?? ""}`;
        return `<li style="margin:2px 0;">${etiqueta}</li>`;
      })
      .join("");

    partes.push(
      `<div style="margin-top:8px; text-align:left;">` +
        `<p style="margin:0 0 4px; font-weight:600;">Pendientes:</p>` +
        `<ul style="padding-left:18px; margin:0;">${items}</ul>` +
        `</div>`
    );
  }

  return partes.join("");
};

const construirHtmlRelaciones = (relaciones) => {
  if (!Array.isArray(relaciones) || relaciones.length === 0) {
    return "";
  }

  const items = relaciones
    .map((texto) => `<li style="margin:2px 0;">${String(texto)}</li>`)
    .join("");

  return (
    `<p style="margin:0 0 4px; text-align:left;">Existen dependencias que impiden eliminar el registro:</p>` +
    `<ul style="padding-left:18px; margin:0;">${items}</ul>`
  );
};

const construirHtmlMensajes = (entrada) => {
  if (!entrada) {
    return "";
  }

  const mensajes = Array.isArray(entrada) ? entrada : [entrada];

  return mensajes
    .filter(Boolean)
    .map(
      (texto) =>
        `<p style="margin:4px 0; text-align:left; line-height:1.4;">${String(
          texto
        )}</p>`
    )
    .join("");
};

export const useGestionAniosEscolares = () => {
  const [anios, setAnios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ abierto: false, modo: "crear" });
  const [formulario, setFormulario] = useState(null);
  const [errores, setErrores] = useState({});

  const cargarAnios = useCallback(async () => {
    setCargando(true);
    const respuesta = await listarAniosEscolares();
    if (respuesta.success) {
      const coleccion = Array.isArray(respuesta.data) ? respuesta.data : [];
      const normalizados = coleccion
        .map((item) => normalizarRegistroAnio(item))
        .filter(Boolean);
      setAnios(normalizados);
    } else {
      Swal.fire("Error", respuesta.message || MENSAJE_ERROR_CARGA, "error");
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarAnios();
  }, [cargarAnios]);

  useEffect(() => {
    if (!formulario) {
      return;
    }
    setErrores(validarFormulario(formulario));
  }, [formulario]);

  const actualizarFiltro = useCallback((valor) => {
    setFiltro(valor);
  }, []);

  const abrirCrear = useCallback(() => {
    setModal({ abierto: true, modo: "crear" });
    const base = construirFormularioBase();
    setFormulario(normalizarRegistroAnio(base));
  }, []);

  const abrirEditar = useCallback((registro) => {
    if (!registro) {
      return;
    }

    const momentosNormalizados = (registro.momentos || []).map(
      normalizarMomento
    );
    const limiteNormalizado =
      registro.fecha_limite_inscripcion ||
      registro.limite_inscripcion ||
      registro.fecha_inicio;
    const base = {
      id: registro.id ?? registro.id_anio_escolar,
      fecha_inicio: registro.fecha_inicio,
      fecha_fin: registro.fecha_fin,
      fecha_limite_inscripcion: limiteNormalizado,
      estado: registro.estado || "incompleto",
    };

    const calculados = generarMomentosAutomaticos(base);
    base.momentos = combinarMomentos(momentosNormalizados, calculados);

    setModal({ abierto: true, modo: "editar" });
    setFormulario(base);
  }, []);

  const cerrarModal = useCallback(() => {
    setModal({ abierto: false, modo: "crear" });
    setFormulario(null);
    setErrores({});
  }, []);

  const cambiarCampo = useCallback((campo, valor) => {
    setFormulario((previo) => {
      if (!previo) {
        return previo;
      }
      const siguiente = { ...previo, [campo]: valor };

      if (campo === "fecha_inicio" || campo === "fecha_fin") {
        const recalculados = generarMomentosAutomaticos(siguiente);
        siguiente.momentos = combinarMomentos(
          previo.momentos || [],
          recalculados
        );

        if (
          campo === "fecha_inicio" &&
          previo.fecha_limite_inscripcion === previo.fecha_inicio
        ) {
          siguiente.fecha_limite_inscripcion = valor;
        }
      }

      return siguiente;
    });
  }, []);

  const cambiarMomento = useCallback((orden, campo, valor) => {
    setFormulario((previo) => {
      if (!previo) {
        return previo;
      }
      const momentosActualizados = (previo.momentos || []).map((momento) =>
        momento.orden === orden ? { ...momento, [campo]: valor } : momento
      );
      return { ...previo, momentos: momentosActualizados };
    });
  }, []);

  const guardarFormulario = useCallback(async () => {
    if (!formulario) {
      return;
    }

    const validaciones = validarFormulario(formulario);
    setErrores(validaciones);

    if (Object.keys(validaciones).length > 0) {
      Swal.fire("Error", "Revisa los datos del formulario.", "error");
      return;
    }

    const payload = {
      fecha_inicio: formulario.fecha_inicio,
      fecha_fin: formulario.fecha_fin,
      fecha_limite_inscripcion: formulario.fecha_limite_inscripcion,
      limite_inscripcion: formulario.fecha_limite_inscripcion,
      momentos: (formulario.momentos || []).map((momento) => ({
        id: momento.id,
        orden: momento.orden,
        nombre: momento.nombre,
        fecha_inicio: momento.fecha_inicio,
        fecha_fin: momento.fecha_fin,
        estado: momento.estado,
      })),
    };

    const respuesta =
      modal.modo === "crear"
        ? await crearAnioEscolar(payload)
        : await actualizarAnioEscolar(formulario.id, payload);

    if (respuesta.success) {
      await Swal.fire(
        "Éxito",
        respuesta.message || "Operación completada.",
        "success"
      );
      cerrarModal();
      cargarAnios();
    } else {
      setErrores(mapearErroresServidor(respuesta.errors));
      Swal.fire(
        "Error",
        respuesta.message || "No se pudo completar la operación.",
        "error"
      );
    }
  }, [cargarAnios, cerrarModal, formulario, modal.modo]);

  const eliminarRegistro = useCallback(
    async (registro) => {
      if (!registro?.id) {
        return;
      }

      const confirmacion = await Swal.fire({
        title: "¿Eliminar año escolar?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });

      if (!confirmacion.isConfirmed) {
        return;
      }

      const respuesta = await eliminarAnioEscolar(registro.id);
      if (respuesta.success) {
        await Swal.fire({
          icon: "success",
          title: "Éxito",
          text: respuesta.message || "Año escolar eliminado.",
          confirmButtonText: "Aceptar",
        });
        await cargarAnios();
      } else {
        const detalleRelaciones = construirHtmlRelaciones(
          respuesta.errors?.relaciones
        );
        await Swal.fire({
          icon: "error",
          title: "No se pudo eliminar",
          ...(detalleRelaciones
            ? { html: detalleRelaciones }
            : {
                text:
                  respuesta.message || "No se pudo eliminar el año escolar.",
              }),
          confirmButtonText: "Entendido",
        });
      }
    },
    [cargarAnios]
  );

  const cambiarEstadoRegistro = useCallback(
    async (registro) => {
      if (!registro?.id) {
        return;
      }

      const activar = registro.estado !== "activo";
      const periodo = construirNombrePeriodo(
        registro.fecha_inicio,
        registro.fecha_fin,
        "Año escolar"
      );

      const payload = {
        accion: activar ? "activar" : "desactivar",
      };

      if (!activar) {
        const solicitud = await Swal.fire({
          title: `Confirmar desactivación`,
          html: `<p style="margin-bottom:12px;">Confirma tu contraseña para desactivar <strong>${periodo}</strong>.</p>`,
          input: "password",
          inputPlaceholder: "Contraseña",
          inputAttributes: { autofocus: true },
          showCancelButton: true,
          confirmButtonText: "Desactivar",
          cancelButtonText: "Cancelar",
          preConfirm: (valor) => {
            if (!valor) {
              Swal.showValidationMessage("Debes ingresar tu contraseña.");
            }
            return valor;
          },
        });

        if (!solicitud.isConfirmed) {
          return;
        }

        payload.contrasena = solicitud.value;
      }

      const respuesta = await cambiarEstadoAnioEscolar(registro.id, payload);

      if (respuesta.success) {
        const resumenHtml = construirHtmlResumenDocentes(
          respuesta.data?.resumen_docentes
        );

        await Swal.fire({
          icon: "success",
          title: respuesta.message || "Estado actualizado.",
          ...(resumenHtml
            ? { html: resumenHtml }
            : { text: respuesta.message || "Estado actualizado." }),
          confirmButtonText: "Aceptar",
        });
        await cargarAnios();
      } else {
        const { errors = {} } = respuesta;
        let contenidoHtml = "";

        if (errors.docentes || errors.aulas_sin_docente) {
          contenidoHtml = construirHtmlErroresDocentes(errors);
        } else if (errors.contrasena) {
          contenidoHtml = construirHtmlMensajes(errors.contrasena);
        } else if (errors.autenticacion) {
          contenidoHtml = construirHtmlMensajes(errors.autenticacion);
        } else if (errors.accion) {
          contenidoHtml = construirHtmlMensajes(errors.accion);
        }

        await Swal.fire({
          icon: "error",
          title: respuesta.message || "No se pudo cambiar el estado.",
          ...(contenidoHtml
            ? { html: contenidoHtml }
            : {
                text: respuesta.message || "No se pudo cambiar el estado.",
              }),
          confirmButtonText: "Entendido",
        });
      }
    },
    [cargarAnios]
  );

  const mostrarDetalle = useCallback((registro) => {
    if (!registro) {
      return;
    }

    const momentos = (registro.momentos || []).map(normalizarMomento);
    const listado = momentos
      .map(
        (momento) =>
          `<li><strong>${momento.nombre}</strong>: ${formatearFecha(
            momento.fecha_inicio
          )} al ${formatearFecha(momento.fecha_fin)} · Estado: ${(
            momento.estado || "activo"
          ).toUpperCase()}</li>`
      )
      .join("");

    const resumenHtml = construirHtmlResumenDocentes(registro.resumen_docentes);

    Swal.fire({
      title: "Detalle del año escolar",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Período:</strong> ${formatearFecha(
            registro.fecha_inicio
          )} al ${formatearFecha(registro.fecha_fin)}</p>
          <p><strong>Límite inscripción:</strong> ${formatearFecha(
            registro.fecha_limite_inscripcion
          )}</p>
          <p><strong>Estado:</strong> ${(
            registro.estado || ""
          ).toUpperCase()}</p>
          <p><strong>Aulas asociadas:</strong> ${
            registro.aulas_asignadas ??
            registro.resumen_docentes?.total_aulas ??
            0
          }</p>
        </div>
        ${
          resumenHtml
            ? `<div style="margin-top:12px; text-align:left;">${resumenHtml}</div>`
            : ""
        }
        <h4 class="mt-4 text-sm font-semibold text-slate-600">Momentos</h4>
        <ul class="mt-2 space-y-2 text-sm text-slate-600">
          ${listado || "<li>Sin momentos registrados.</li>"}
        </ul>
      `,
      width: 600,
    });
  }, []);

  return {
    anios,
    cargando,
    filtro,
    actualizarFiltro,
    modal,
    formulario,
    errores,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    cambiarCampo,
    cambiarMomento,
    guardarFormulario,
    eliminarRegistro,
    cambiarEstadoRegistro,
    mostrarDetalle,
  };
};

export default useGestionAniosEscolares;
