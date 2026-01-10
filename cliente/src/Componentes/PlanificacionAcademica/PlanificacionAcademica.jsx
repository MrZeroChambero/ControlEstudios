import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaExchangeAlt, FaEye, FaClone } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  listarPlanificaciones,
  cambiarEstadoPlanificacion,
  obtenerPlanificacion,
  obtenerAsignacionDocente,
  crearPlanificacion,
} from "../../api/planificacionesService";
import { obtenerCatalogosPlanificacion } from "../../api/planificacionCatalogosService";
import { PlanificacionDetallePanel } from "./PlanificacionDetallePanel";
import { PlanificacionFormModal } from "./PlanificacionFormModal";
import { EncabezadoPlanificacion } from "./componentes/EncabezadoPlanificacion";
import { FiltrosPlanificacion } from "./componentes/FiltrosPlanificacion";

const filtrosIniciales = {
  estado: "activo",
  tipo: "",
  fk_momento: "",
  fk_personal: "",
  fk_aula: "",
  fk_componente: "",
};

const catalogosIniciales = {
  personal: [],
  aulas: [],
  componentes: [],
  momentos: [],
};

const normalizarClave = (valor) => {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  if (Number.isFinite(numero)) return numero;
  const cadena = String(valor).trim();
  return cadena === "" ? null : cadena;
};

const crearMapaPorId = (items = []) => {
  const mapa = new Map();
  items.forEach((item) => {
    const clave = normalizarClave(item?.id);
    if (clave === null) return;
    mapa.set(clave, item);
  });
  return mapa;
};

const estadoLabel = (estado) => {
  if (estado === "activo") return "Activo";
  if (estado === "inactivo") return "Inactivo";
  return "Sin estado";
};

const tipoLabel = (tipo) => {
  if (tipo === "individual") return "Individual";
  if (tipo === "aula") return "Aula";
  return "Sin tipo";
};

export const PlanificacionAcademica = () => {
  const [planificaciones, setPlanificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [planSeleccionada, setPlanSeleccionada] = useState(null);
  const [catalogos, setCatalogos] = useState(catalogosIniciales);
  const [catalogosLoading, setCatalogosLoading] = useState(false);
  const [catalogosError, setCatalogosError] = useState("");
  const [contexto, setContexto] = useState(null);
  const [docenteAsignacion, setDocenteAsignacion] = useState({
    loading: false,
    data: null,
    error: "",
  });
  const [modalFormulario, setModalFormulario] = useState({
    abierto: false,
    modo: "crear",
    inicial: null,
  });
  const [nivelUsuario, setNivelUsuario] = useState("");

  useEffect(() => {
    const storedNivel = localStorage.getItem("nivel");
    if (storedNivel) {
      setNivelUsuario(storedNivel);
    }
  }, []);

  const fetchPlanificaciones = useCallback(async () => {
    setIsLoading(true);
    setErrorMensaje("");
    const respuesta = await listarPlanificaciones(filtrosAplicados);
    if (!respuesta.success) {
      setErrorMensaje(respuesta.message);
      Swal.fire(
        "Sin resultados",
        respuesta.message || "No pudimos obtener planificaciones.",
        "warning"
      );
      setPlanificaciones([]);
      setContexto(null);
    } else {
      const payload = respuesta.data;
      const coleccion = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.planificaciones)
        ? payload.planificaciones
        : [];
      setPlanificaciones(coleccion);
      setContexto(payload?.contexto ?? null);
    }
    setIsLoading(false);
  }, [filtrosAplicados]);

  useEffect(() => {
    fetchPlanificaciones();
  }, [fetchPlanificaciones]);

  // El contexto se mantiene sincronizado mediante los datos devueltos por listarPlanificaciones.

  useEffect(() => {
    let activo = true;

    if (!filtros.fk_personal) {
      setDocenteAsignacion({ loading: false, data: null, error: "" });
      return () => {
        activo = false;
      };
    }

    const buscarAsignacion = async () => {
      setDocenteAsignacion((prev) => ({ ...prev, loading: true, error: "" }));
      const params = {};
      if (filtros.fk_momento) {
        params.fk_momento = filtros.fk_momento;
      }
      const respuesta = await obtenerAsignacionDocente(
        filtros.fk_personal,
        params
      );
      if (!activo) return;
      if (respuesta.success) {
        setDocenteAsignacion({
          loading: false,
          data: respuesta.data?.asignacion ?? null,
          error: "",
        });
      } else {
        setDocenteAsignacion({
          loading: false,
          data: null,
          error: respuesta.message || "No se encontró la asignación.",
        });
      }
    };

    buscarAsignacion();
    return () => {
      activo = false;
    };
  }, [filtros.fk_personal, filtros.fk_momento]);

  useEffect(() => {
    let activo = true;
    const cargarCatalogos = async () => {
      setCatalogosLoading(true);
      const resultado = await obtenerCatalogosPlanificacion();
      if (!activo) return;
      setCatalogos(resultado.data);
      if (resultado.errores.length) {
        const mensaje = resultado.errores.join(" ").trim();
        setCatalogosError(mensaje);
        Swal.fire("Aviso", mensaje, "warning");
      } else {
        setCatalogosError("");
      }
      setCatalogosLoading(false);
    };

    cargarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const total = planificaciones.length;
    const activos = planificaciones.filter((p) => p.estado === "activo").length;
    const individuales = planificaciones.filter(
      (p) => p.tipo === "individual"
    ).length;
    return { total, activos, individuales };
  }, [planificaciones]);

  const contextoEditable = contexto?.editable === true;
  const contextoMotivo = contexto?.motivo_bloqueo ?? null;
  const puedeGestionarPlanificaciones = useMemo(
    () => nivelUsuario === "Director" || nivelUsuario === "Docente",
    [nivelUsuario]
  );
  const puedeCrearPlanificacion =
    contextoEditable && puedeGestionarPlanificaciones;
  const botonCrearTitulo = !puedeGestionarPlanificaciones
    ? "Tu rol no tiene permisos para registrar planificaciones."
    : !contextoEditable
    ? contextoMotivo || "El contexto actual es de solo lectura."
    : "Registrar una nueva planificación.";
  const botonClonarTitulo = !puedeGestionarPlanificaciones
    ? "Tu rol no tiene permisos para clonar planificaciones."
    : !contextoEditable
    ? contextoMotivo || "El contexto actual es de solo lectura."
    : "Clonar planificación";

  const docentesMap = useMemo(
    () => crearMapaPorId(catalogos.personal),
    [catalogos.personal]
  );
  const aulasMap = useMemo(
    () => crearMapaPorId(catalogos.aulas),
    [catalogos.aulas]
  );
  const componentesMap = useMemo(
    () => crearMapaPorId(catalogos.componentes),
    [catalogos.componentes]
  );
  const momentosMap = useMemo(
    () => crearMapaPorId(catalogos.momentos),
    [catalogos.momentos]
  );

  const contextoMomentoNombre = useMemo(() => {
    if (!contexto?.momento) return null;
    return (
      contexto.momento.nombre ??
      contexto.momento.momento_nombre ??
      contexto.momento.nombre_momento ??
      null
    );
  }, [contexto]);

  const contextoMomentoId = useMemo(() => {
    if (!contexto?.momento) return null;
    return normalizarClave(contexto.momento.id_momento ?? contexto.momento.id);
  }, [contexto]);

  const contextoAnioId = useMemo(() => {
    if (!contexto?.anio) return null;
    return normalizarClave(
      contexto.anio.id_anio_escolar ??
        contexto.anio.id_anio ??
        contexto.anio.id ??
        contexto.anio.codigo
    );
  }, [contexto]);

  const contextoResumen = useMemo(() => {
    if (!contexto) return null;
    const partes = [];
    if (contexto.anio?.id_anio_escolar) {
      partes.push(`Año #${contexto.anio.id_anio_escolar}`);
    }
    if (contextoMomentoNombre) {
      partes.push(`Momento ${contextoMomentoNombre}`);
    }
    const descripcion = partes.length ? partes.join(" · ") : "Sin contexto";
    return {
      descripcion,
      editable: contexto.editable === true,
    };
  }, [contexto, contextoMomentoNombre]);

  const momentosActivosContexto = useMemo(() => {
    if (!Array.isArray(catalogos.momentos)) {
      return [];
    }

    return catalogos.momentos.filter((momento) => {
      const estado = (
        momento.estado ??
        momento.raw?.estado ??
        momento.raw?.estado_momento ??
        momento.raw?.momento_estado ??
        ""
      )
        .toString()
        .toLowerCase();
      if (estado !== "activo") {
        return false;
      }

      const fkAnio = normalizarClave(
        momento.fk_anio_escolar ??
          momento.raw?.fk_anio_escolar ??
          momento.raw?.fk_anio ??
          momento.raw?.id_anio_escolar
      );

      if (contextoAnioId !== null && fkAnio !== contextoAnioId) {
        return false;
      }

      if (contextoMomentoId !== null) {
        const idMomento = normalizarClave(momento.id_momento ?? momento.id);
        return idMomento === contextoMomentoId;
      }

      return true;
    });
  }, [catalogos.momentos, contextoAnioId, contextoMomentoId]);

  const hayMomentoActivoContexto = momentosActivosContexto.length > 0;

  const asignacionAula = docenteAsignacion.data?.aula ?? null;
  const componentesAsignados = docenteAsignacion.data?.componentes ?? [];

  const resolverDocente = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "-";
      const clave = normalizarClave(id);
      const registro = clave !== null ? docentesMap.get(clave) : null;
      if (registro) {
        const descripcion = registro.descripcion
          ? ` (${registro.descripcion})`
          : "";
        return `${registro.label}${descripcion}`;
      }
      return `Docente #${id}`;
    },
    [docentesMap]
  );

  const resolverAula = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "-";
      const clave = normalizarClave(id);
      const registro = clave !== null ? aulasMap.get(clave) : null;
      if (registro) {
        const detalle =
          registro.grado || registro.seccion
            ? ` (Grado ${registro.grado ?? "?"} - Seccion ${
                registro.seccion ?? "?"
              })`
            : "";
        return `${registro.label}${detalle}`;
      }
      return `Aula #${id}`;
    },
    [aulasMap]
  );

  const resolverComponente = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "-";
      const clave = normalizarClave(id);
      const registro = clave !== null ? componentesMap.get(clave) : null;
      if (registro) {
        return registro.label;
      }
      return `Componente #${id}`;
    },
    [componentesMap]
  );

  const resolverMomento = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return "-";
      const clave = normalizarClave(id);
      const registro = clave !== null ? momentosMap.get(clave) : null;
      if (registro) {
        const rango = registro.rango ? ` (${registro.rango})` : "";
        const estado = registro.estado
          ? ` - ${estadoLabel(registro.estado)}`
          : "";
        return `${registro.label}${rango}${estado}`;
      }
      return `Momento #${id}`;
    },
    [momentosMap]
  );

  const alCambiarFiltro = (event) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const alEnviarFiltros = (event) => {
    event.preventDefault();
    setFiltrosAplicados(filtros);
  };

  const alReiniciarFiltros = () => {
    setFiltros(filtrosIniciales);
    setFiltrosAplicados(filtrosIniciales);
  };

  const alRefrescar = () => {
    fetchPlanificaciones();
  };

  const alAbrirModal = useCallback(
    (modo = "crear", inicial = null) => {
      if (!puedeGestionarPlanificaciones) {
        Swal.fire(
          "Acceso restringido",
          "Tu rol no tiene permisos para gestionar planificaciones académicas.",
          "warning"
        );
        return;
      }
      if (!contextoEditable) {
        Swal.fire(
          "Contexto bloqueado",
          contextoMotivo ||
            "El contexto actual es de solo lectura; no es posible registrar planificaciones.",
          "warning"
        );
        return;
      }
      if (modo === "crear" && !hayMomentoActivoContexto) {
        Swal.fire(
          "Sin momento activo",
          "No hay un momento académico activo configurado para el año escolar vigente. Configure el momento en el módulo correspondiente antes de registrar planificaciones.",
          "warning"
        );
        return;
      }
      setModalFormulario({ abierto: true, modo, inicial });
    },
    [
      contextoEditable,
      contextoMotivo,
      hayMomentoActivoContexto,
      puedeGestionarPlanificaciones,
    ]
  );

  const alCerrarModal = () => {
    setModalFormulario({ abierto: false, modo: "crear", inicial: null });
  };

  const alCrearPlanificacion = async (payload) => {
    const lote = Array.isArray(payload) ? payload : [payload];
    for (const item of lote) {
      const respuesta = await crearPlanificacion(item);
      if (!respuesta.success) {
        const error = new Error(
          respuesta.message || "No fue posible registrar la planificación."
        );
        error.validation = respuesta.errors;
        throw error;
      }
    }

    Swal.fire(
      lote.length > 1
        ? "Planificaciones registradas"
        : "Planificación registrada",
      lote.length > 1
        ? `Se registraron ${lote.length} planificaciones.`
        : "La planificación se guardó correctamente.",
      "success"
    );
    fetchPlanificaciones();
  };

  const alClonarPlanificacion = async (planificacion) => {
    if (!planificacion?.id_planificacion) {
      return;
    }

    if (!puedeGestionarPlanificaciones) {
      Swal.fire(
        "Acceso restringido",
        "Tu rol no tiene permisos para clonar planificaciones.",
        "warning"
      );
      return;
    }

    if (!contextoEditable) {
      Swal.fire(
        "Contexto bloqueado",
        contextoMotivo ||
          "El contexto actual es de solo lectura; no es posible clonar planificaciones.",
        "warning"
      );
      return;
    }

    const respuesta = await obtenerPlanificacion(
      planificacion.id_planificacion
    );
    if (!respuesta.success) {
      Swal.fire(
        "Error",
        respuesta.message || "No fue posible cargar la planificación base.",
        "error"
      );
      return;
    }

    const datos = respuesta.data || planificacion;
    alAbrirModal("clonar", {
      ...datos,
      id_planificacion: undefined,
      estado: "activo",
    });
  };

  const alAlternarEstadoPlanificacion = async (planificacion) => {
    if (!planificacion?.id_planificacion) return;
    if (!puedeGestionarPlanificaciones) {
      Swal.fire(
        "Acceso restringido",
        "Tu rol no tiene permisos para cambiar el estado de una planificación.",
        "warning"
      );
      return;
    }
    if (!contextoEditable) {
      Swal.fire(
        "Contexto bloqueado",
        contextoMotivo ||
          "El contexto actual es de solo lectura; no es posible modificar planificaciones.",
        "warning"
      );
      return;
    }
    const nuevoEstado =
      planificacion.estado === "activo" ? "inactivo" : "activo";
    const confirmacion = await Swal.fire({
      title: "Confirmar estado",
      text: `¿Deseas cambiar a ${nuevoEstado} la planificación #${planificacion.id_planificacion}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    const respuesta = await cambiarEstadoPlanificacion(
      planificacion.id_planificacion,
      nuevoEstado
    );
    if (!respuesta.success) {
      Swal.fire(
        "Error",
        respuesta.message || "No se pudo cambiar el estado.",
        "error"
      );
      return;
    }

    Swal.fire(
      "Actualizado",
      "El estado se actualizó correctamente.",
      "success"
    );
    fetchPlanificaciones();
  };

  const alVerDetalle = async (planificacion) => {
    if (!planificacion?.id_planificacion) return;
    setPlanSeleccionada(planificacion);
    setDetalle(planificacion);
    setDetalleAbierto(true);
    setDetalleCargando(true);

    const respuesta = await obtenerPlanificacion(
      planificacion.id_planificacion
    );
    if (!respuesta.success) {
      setDetalleCargando(false);
      Swal.fire(
        "Error",
        respuesta.message || "No fue posible obtener el detalle.",
        "error"
      );
      return;
    }

    setDetalle(respuesta.data);
    setDetalleCargando(false);
  };

  const alCerrarDetalle = () => {
    setDetalleAbierto(false);
    setDetalle(null);
    setPlanSeleccionada(null);
    setDetalleCargando(false);
  };

  const generarFilasTabla = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="8" className="py-6 text-center text-slate-500">
            Cargando planificaciones...
          </td>
        </tr>
      );
    }

    if (!planificaciones.length) {
      return (
        <tr>
          <td colSpan="8" className="py-6 text-center text-slate-500">
            {errorMensaje || "No hay planificaciones registradas."}
          </td>
        </tr>
      );
    }

    return planificaciones.map((plan) => (
      <tr
        key={plan.id_planificacion}
        className="border-b border-slate-100 text-sm"
      >
        <td className="px-4 py-3 font-semibold text-slate-700">
          #{plan.id_planificacion}
        </td>
        <td className="px-4 py-3">{resolverDocente(plan.fk_personal)}</td>
        <td className="px-4 py-3">{resolverAula(plan.fk_aula)}</td>
        <td className="px-4 py-3">{resolverComponente(plan.fk_componente)}</td>
        <td className="px-4 py-3">{resolverMomento(plan.fk_momento)}</td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {tipoLabel(plan.tipo)}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              plan.estado === "activo"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {estadoLabel(plan.estado)}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-sm">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {plan.competencias?.length ?? 0} competencias
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {plan.estudiantes?.length ?? 0} estudiantes
            </span>
            <button
              type="button"
              onClick={() => alVerDetalle(plan)}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              <FaEye />
              Ver detalle
            </button>
            <button
              type="button"
              onClick={() => alAlternarEstadoPlanificacion(plan)}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!puedeGestionarPlanificaciones || !contextoEditable}
              title={
                !puedeGestionarPlanificaciones
                  ? "Tu rol no tiene permisos para cambiar el estado."
                  : !contextoEditable
                  ? contextoMotivo ||
                    "El contexto actual es de solo lectura; no se puede cambiar el estado."
                  : "Cambiar estado"
              }
            >
              <FaExchangeAlt />
              Cambiar estado
            </button>
            <button
              type="button"
              onClick={() => alClonarPlanificacion(plan)}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!puedeGestionarPlanificaciones || !contextoEditable}
              title={botonClonarTitulo}
            >
              <FaClone />
              Clonar
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <section className="space-y-6">
      <EncabezadoPlanificacion
        resumen={resumen}
        contextoResumen={contextoResumen}
        contextoEditable={contextoEditable}
        contextoMotivo={contextoMotivo}
        puedeCrearPlanificacion={puedeCrearPlanificacion}
        tituloBotonCrear={botonCrearTitulo}
        alRefrescar={alRefrescar}
        alAbrirModal={alAbrirModal}
      />

      <FiltrosPlanificacion
        filtros={filtros}
        catalogos={catalogos}
        catalogosLoading={catalogosLoading}
        catalogosError={catalogosError}
        planificacionesCargando={isLoading}
        docenteAsignacion={docenteAsignacion}
        asignacionAula={asignacionAula}
        componentesAsignados={componentesAsignados}
        alCambiarFiltro={alCambiarFiltro}
        alEnviarFiltros={alEnviarFiltros}
        alReiniciarFiltros={alReiniciarFiltros}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Docente</th>
                <th className="px-4 py-3">Aula</th>
                <th className="px-4 py-3">Componente</th>
                <th className="px-4 py-3">Momento</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Resumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {generarFilasTabla()}
            </tbody>
          </table>
        </div>
      </div>

      <PlanificacionDetallePanel
        isOpen={detalleAbierto}
        planificacion={detalle || planSeleccionada}
        isLoading={detalleCargando}
        onClose={alCerrarDetalle}
        resolvers={{
          docente: resolverDocente,
          aula: resolverAula,
          componente: resolverComponente,
          momento: resolverMomento,
        }}
      />
      <PlanificacionFormModal
        isOpen={modalFormulario.abierto}
        modo={modalFormulario.modo}
        initialData={modalFormulario.inicial}
        contexto={contexto}
        catalogos={catalogos}
        onClose={alCerrarModal}
        onSubmit={alCrearPlanificacion}
        cargarAsignacionDocente={obtenerAsignacionDocente}
        bloqueado={contextoEditable ? null : contextoMotivo}
      />
    </section>
  );
};
