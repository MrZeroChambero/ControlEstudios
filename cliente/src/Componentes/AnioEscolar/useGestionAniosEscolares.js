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
        await Swal.fire(
          "Éxito",
          respuesta.message || "Año escolar eliminado.",
          "success"
        );
        cargarAnios();
      } else {
        Swal.fire(
          "Error",
          respuesta.message || "No se pudo eliminar el año escolar.",
          "error"
        );
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
      const respuesta = await cambiarEstadoAnioEscolar(
        registro.id,
        activar ? "activar" : "desactivar"
      );

      if (respuesta.success) {
        await Swal.fire(
          "Éxito",
          respuesta.message || "Estado actualizado.",
          "success"
        );
        cargarAnios();
      } else {
        Swal.fire(
          "Error",
          respuesta.message || "No se pudo cambiar el estado.",
          "error"
        );
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
            registro.aulas_asignadas ?? 0
          }</p>
        </div>
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
