import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaFilter, FaSyncAlt, FaExchangeAlt, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  listarPlanificaciones,
  cambiarEstadoPlanificacion,
  obtenerPlanificacion,
  obtenerAsignacionDocente,
} from "../../api/planificacionesService";
import { obtenerCatalogosPlanificacion } from "../../api/planificacionCatalogosService";
import { PlanificacionDetallePanel } from "./PlanificacionDetallePanel";

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

  const contextoResumen = useMemo(() => {
    if (!contexto) return null;
    const partes = [];
    if (contexto.anio?.id_anio_escolar) {
      partes.push(`Año #${contexto.anio.id_anio_escolar}`);
    }
    if (contexto.momento?.nombre_momento) {
      partes.push(`Momento ${contexto.momento.nombre_momento}`);
    }
    const descripcion = partes.length ? partes.join(" · ") : "Sin contexto";
    return {
      descripcion,
      editable: contexto.editable === true,
    };
  }, [contexto]);

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
            ? ` (Gr ${registro.grado ?? "?"} - Secc ${registro.seccion ?? "?"})`
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

  const handleChangeFiltro = (event) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFiltros = (event) => {
    event.preventDefault();
    setFiltrosAplicados(filtros);
  };

  const handleResetFiltros = () => {
    setFiltros(filtrosIniciales);
    setFiltrosAplicados(filtrosIniciales);
  };

  const handleRefrescar = () => {
    fetchPlanificaciones();
  };

  const handleToggleEstado = async (planificacion) => {
    if (!planificacion?.id_planificacion) return;
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

  const handleVerDetalle = async (planificacion) => {
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

  const handleCerrarDetalle = () => {
    setDetalleAbierto(false);
    setDetalle(null);
    setPlanSeleccionada(null);
    setDetalleCargando(false);
  };

  const renderTableBody = () => {
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
              onClick={() => handleVerDetalle(plan)}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              <FaEye />
              Ver detalle
            </button>
            <button
              type="button"
              onClick={() => handleToggleEstado(plan)}
              className="flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              <FaExchangeAlt />
              Cambiar estado
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Planificación Académica
            </p>
            <h1 className="text-2xl font-bold text-slate-800">
              Seguimiento de planificaciones
            </h1>
            <p className="text-sm text-slate-500">
              Consulta el estado de las planificaciones por docente, aula,
              momento o tipo.
            </p>
            {contextoResumen && (
              <p className="text-xs text-slate-500">
                Contexto actual: {contextoResumen.descripcion} —{" "}
                {contextoResumen.editable ? "Editable" : "Solo lectura"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefrescar}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            <FaSyncAlt className="text-base" />
            Actualizar
          </button>
        </div>

        <dl className="mt-6 grid gap-4 text-center sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Total
            </dt>
            <dd className="text-2xl font-bold text-slate-800">
              {resumen.total}
            </dd>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-green-600">
              Activas
            </dt>
            <dd className="text-2xl font-bold text-green-700">
              {resumen.activos}
            </dd>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-indigo-600">
              Individuales
            </dt>
            <dd className="text-2xl font-bold text-indigo-700">
              {resumen.individuales}
            </dd>
          </div>
        </dl>
      </header>

      <form
        onSubmit={handleSubmitFiltros}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <FaFilter />
          <span className="text-sm font-semibold">Filtros rápidos</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm text-slate-600">
            Tipo
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleChangeFiltro}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="aula">Aula completa</option>
              <option value="individual">Individual</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Momento
            <select
              name="fk_momento"
              value={filtros.fk_momento}
              onChange={handleChangeFiltro}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
              disabled={catalogosLoading || !catalogos.momentos.length}
            >
              <option value="">Todos</option>
              {catalogos.momentos.map((momento) => (
                <option key={momento.id} value={momento.id}>
                  {momento.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Docente responsable
            <select
              name="fk_personal"
              value={filtros.fk_personal}
              onChange={handleChangeFiltro}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
              disabled={catalogosLoading || !catalogos.personal.length}
            >
              <option value="">Todos</option>
              {catalogos.personal.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Aula
            <select
              name="fk_aula"
              value={filtros.fk_aula}
              onChange={handleChangeFiltro}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
              disabled={catalogosLoading || !catalogos.aulas.length}
            >
              <option value="">Todas</option>
              {catalogos.aulas.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {aula.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Componente de aprendizaje
            <select
              name="fk_componente"
              value={filtros.fk_componente}
              onChange={handleChangeFiltro}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
              disabled={catalogosLoading || !catalogos.componentes.length}
            >
              <option value="">Todos</option>
              {catalogos.componentes.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.label}
                </option>
              ))}
            </select>
          </label>
          {filtros.fk_personal && (
            <div className="md:col-span-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              {docenteAsignacion.loading ? (
                <span>Buscando asignación del docente...</span>
              ) : docenteAsignacion.error ? (
                <span className="text-red-600">{docenteAsignacion.error}</span>
              ) : asignacionAula ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Aula asignada
                    </p>
                    <p className="font-semibold text-slate-700">
                      Gr {asignacionAula.grado ?? "N/D"} - Sección{" "}
                      {asignacionAula.seccion ?? "N/D"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Componentes vinculados
                    </p>
                    {componentesAsignados.length ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {componentesAsignados.map((componente) => (
                          <span
                            key={componente.id}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                          >
                            {componente.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        El docente no tiene componentes registrados para este
                        momento.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500">
                  No se encontró aula ni componentes asociados al docente para
                  el contexto seleccionado.
                </span>
              )}
            </div>
          )}
        </div>
        {(catalogosLoading || catalogosError) && (
          <p className="mt-3 text-xs text-slate-500">
            {catalogosLoading
              ? "Cargando catálogos de apoyo..."
              : catalogosError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            disabled={isLoading}
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={handleResetFiltros}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            disabled={isLoading}
          >
            Limpiar
          </button>
        </div>
      </form>

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
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      <PlanificacionDetallePanel
        isOpen={detalleAbierto}
        planificacion={detalle || planSeleccionada}
        isLoading={detalleCargando}
        onClose={handleCerrarDetalle}
        resolvers={{
          docente: resolverDocente,
          aula: resolverAula,
          componente: resolverComponente,
          momento: resolverMomento,
        }}
      />
    </section>
  );
};
