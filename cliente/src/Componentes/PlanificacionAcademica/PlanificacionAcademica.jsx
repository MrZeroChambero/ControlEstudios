import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaToggleOn, FaToggleOff, FaEye, FaClone } from "react-icons/fa";
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
import { TablaEntradas } from "../Tablas/Tablas";
import {
  contenidosTableClasses,
  contenidosIconClasses,
} from "../Contenidos/contenidosEstilos";
import { planificacionTablaClasses } from "./planificacionEstilos";

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
  if (tipo === "individual") return "individual";
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
      // DEBUG: inspeccionar contexto y payload para diagnosticar botones deshabilitados
      // Elimina estos logs una vez resuelto.
      // eslint-disable-next-line no-console
      console.log("[debug] listarPlanificaciones payload:", payload);
      // eslint-disable-next-line no-console
      console.log("[debug] contexto recibido:", payload?.contexto ?? null);
      // eslint-disable-next-line no-console
      console.log(
        "[debug] nivelUsuario localStorage:",
        localStorage.getItem("nivel")
      );
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
  }, [filtros.fk_personal, filtros.fk_]);

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
      partes.push(`${contextoMomentoNombre}`);
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
  const componentesAsignados = useMemo(() => {
    const raw = docenteAsignacion.data?.componentes ?? [];
    return raw.map((comp) => {
      const clave = normalizarClave(comp.id);
      const catalogoItem = clave !== null ? componentesMap.get(clave) : null;
      return {
        ...comp,
        label:
          comp.nombre ??
          comp.label ??
          catalogoItem?.label ??
          `Componente #${comp.id}`,
      };
    });
  }, [docenteAsignacion.data?.componentes, componentesMap]);

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
        return `${registro.grado ?? "?"} "${registro.seccion ?? "?"}"`;
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
        const nombre = registro.nombre_momento ?? registro.label ?? "?";
        return nombre;
      }
      return `Momento #${id}`;
    },
    [momentosMap]
  );

  const columns = [
    {
      name: "Docente",
      selector: (row) => resolverDocente(row.fk_personal),
      sortable: true,
    },
    {
      name: "Grado y Seccion",
      selector: (row) => resolverAula(row.fk_aula),
      sortable: true,
    },
    {
      name: "Componente",
      selector: (row) => resolverComponente(row.fk_componente),
      sortable: true,
    },
    {
      name: "Momento",
      selector: (row) => resolverMomento(row.fk_momento),
      sortable: true,
    },
    {
      name: "Tipo",
      selector: (row) => tipoLabel(row.tipo),
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => estadoLabel(row.estado),
      sortable: true,
      cell: (row) => (
        <span
          className={
            row.estado === "activo"
              ? planificacionTablaClasses.estadoActivoPill
              : planificacionTablaClasses.estadoInactivoPill
          }
        >
          {estadoLabel(row.estado)}
        </span>
      ),
    },
    {
      name: "Resumen",
      cell: (row) => (
        <div className={contenidosTableClasses.actionGroup}>
          <button
            type="button"
            onClick={() => alVerDetalle(row)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.viewButton}`}
            title="Ver detalle"
          >
            <FaEye className={contenidosIconClasses.base} />
          </button>
          <button
            type="button"
            onClick={() => alAlternarEstadoPlanificacion(row)}
            className={`${contenidosTableClasses.actionButton} ${
              row.estado === "activo"
                ? contenidosTableClasses.toggleOn
                : contenidosTableClasses.toggleOff
            }`}
            disabled={!puedeGestionarPlanificaciones || !contextoEditable}
            title={
              !puedeGestionarPlanificaciones
                ? "Tu rol no tiene permisos para cambiar el estado."
                : !contextoEditable
                ? contextoMotivo ||
                  "El contexto actual es de solo lectura; no se puede cambiar el estado."
                : row.estado === "activo"
                ? "Desactivar"
                : "Activar"
            }
          >
            {row.estado === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            type="button"
            onClick={() => alClonarPlanificacion(row)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.editButton}`}
            disabled={!puedeGestionarPlanificaciones || !contextoEditable}
            title={botonClonarTitulo}
          >
            <FaClone className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

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

      <TablaEntradas
        columns={columns}
        data={planificaciones}
        isLoading={isLoading}
        Cargar={errorMensaje || "No hay planificaciones registradas."}
      />

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
