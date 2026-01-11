import React, { useEffect, useMemo, useState } from "react";
import {
  obtenerContextoEvaluacion,
  obtenerAulasPorComponente,
  obtenerGridEvaluacion,
  guardarEvaluaciones,
} from "../../api/rendimientoAcademicoService";
import {
  contenidosLayout,
  contenidosFormClasses,
  typography,
  typePillBase,
} from "../EstilosCliente/EstilosClientes";

const controlDeshabilitado = "disabled:cursor-not-allowed disabled:opacity-60";
const tarjetaDatoClass =
  "flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4";
const selectTablaClass =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const selectEncabezadoClass =
  "rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const alertaExitoClass =
  "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";
const alertaErrorClass =
  "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700";
const badgePlanClass = `${typePillBase} bg-blue-50 text-blue-600`;

const buildInitialSelections = (estudiantes = []) => {
  const resultado = {};
  estudiantes.forEach((est) => {
    const estudianteKey = String(est?.id_estudiante ?? "");
    if (!estudianteKey) return;
    const indicadores = est?.indicadores ?? [];
    const mapa = {};
    indicadores.forEach((item) => {
      const indicadorId = item?.indicador?.id_indicador;
      if (!indicadorId) return;
      const letra = item?.evaluacion?.letra ?? "";
      if (letra) {
        mapa[String(indicadorId)] = letra;
      }
    });
    resultado[estudianteKey] = mapa;
  });
  return resultado;
};

const buildPermitidosMapa = (permitidos = {}) => {
  const mapa = {};
  Object.entries(permitidos).forEach(([estudianteId, lista]) => {
    const key = String(estudianteId);
    if (!Array.isArray(lista)) {
      mapa[key] = new Set();
      return;
    }
    const valores = lista.map((valor) => String(valor));
    mapa[key] = new Set(valores);
  });
  return mapa;
};

const obtenerEtiquetaPlan = (plan) => {
  if (!plan) return "Plan general";
  const origen = plan.origen ?? plan.tipo ?? "general";
  if (origen === "individual") {
    return "Plan individual";
  }
  if (origen === "general") {
    return "Plan general";
  }
  return "Plan";
};

const seleccionarLetraValida = (valor) => {
  if (typeof valor !== "string") return "";
  const letra = valor.trim().toUpperCase();
  if (["A", "B", "C", "D", "E"].includes(letra)) {
    return letra;
  }
  return "";
};

const EncabezadoRendimiento = ({
  estaCargandoContexto,
  estaGuardando,
  hayMatriz,
  hayCambios,
  onRecargar,
  onGuardar,
}) => {
  const deshabilitarGuardar = estaGuardando || !hayMatriz || !hayCambios;
  return (
    <section className={contenidosLayout.container}>
      <div className={contenidosLayout.header}>
        <div className="space-y-2">
          <h1 className={contenidosLayout.title}>
            Gestión del rendimiento académico
          </h1>
          <p className={contenidosLayout.description}>
            Evalúa a cada estudiante asignando las literales permitidas en los
            indicadores de desempeño.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRecargar}
            className={`${contenidosFormClasses.ghostButton} ${controlDeshabilitado}`}
            disabled={estaCargandoContexto || estaGuardando}
          >
            {estaCargandoContexto ? "Actualizando..." : "Recargar contexto"}
          </button>
          <button
            type="button"
            onClick={onGuardar}
            className={`${contenidosLayout.addButton} ${controlDeshabilitado}`}
            disabled={deshabilitarGuardar}
          >
            {estaGuardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
};

const DatoContexto = ({ etiqueta, valor }) => (
  <div className={tarjetaDatoClass}>
    <span className={contenidosFormClasses.label}>{etiqueta}</span>
    <span className="text-sm font-semibold text-slate-800">{valor}</span>
  </div>
);

const PanelContexto = ({ contexto }) => {
  if (!contexto) {
    return null;
  }

  const usuario = contexto.usuario ?? {};
  const anio = contexto.anio ?? {};
  const momento = contexto.momento ?? {};

  return (
    <section className={`${contenidosLayout.container} space-y-4`}>
      <header className="space-y-1">
        <h2 className={typography.titleSm}>Contexto de evaluación</h2>
        <p className={typography.bodyMutedSm}>
          Confirma que los datos del periodo y del perfil sean los correctos
          antes de registrar los resultados.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DatoContexto etiqueta="Usuario" valor={usuario.nombre ?? "-"} />
        <DatoContexto etiqueta="Rol" valor={usuario.rol ?? "-"} />
        <DatoContexto
          etiqueta="Año escolar"
          valor={
            anio.fecha_inicio && anio.fecha_fin
              ? `${anio.fecha_inicio} - ${anio.fecha_fin}`
              : "-"
          }
        />
        <DatoContexto
          etiqueta="Momento"
          valor={momento.nombre_momento ?? momento.nombre ?? "-"}
        />
      </div>
    </section>
  );
};

const CampoSeleccion = ({
  id,
  etiqueta,
  valor,
  opciones,
  onChange,
  deshabilitado,
  ayuda,
}) => (
  <label htmlFor={id} className="flex flex-col gap-2">
    <span className={contenidosFormClasses.label}>{etiqueta}</span>
    <select
      id={id}
      name={id}
      value={valor}
      onChange={onChange}
      className={`${contenidosFormClasses.select} ${controlDeshabilitado}`}
      disabled={deshabilitado}
    >
      {opciones.map((opcion) => (
        <option key={String(opcion.value)} value={opcion.value}>
          {opcion.label}
        </option>
      ))}
    </select>
    {ayuda ? <p className={contenidosFormClasses.helper}>{ayuda}</p> : null}
  </label>
);

const PanelFiltros = ({
  componentes,
  componenteId,
  aulas,
  aulaId,
  cargandoAulas,
  deshabilitarComponentes,
  deshabilitarAulas,
  onSeleccionComponente,
  onSeleccionAula,
}) => (
  <section className={`${contenidosLayout.container} space-y-4`}>
    <header className="space-y-1">
      <h2 className={typography.titleSm}>Selecciona el componente y el aula</h2>
      <p className={typography.bodyMutedSm}>
        Primero elige el componente de aprendizaje; luego selecciona el aula
        disponible para cargar la lista de estudiantes.
      </p>
    </header>
    <div className={contenidosFormClasses.grid}>
      <CampoSeleccion
        id="seleccion-componente"
        etiqueta="Componente"
        valor={componenteId}
        onChange={onSeleccionComponente}
        deshabilitado={deshabilitarComponentes}
        opciones={[{ value: "", label: "Selecciona un componente" }].concat(
          componentes.map((item) => ({
            value: item.id_componente,
            label: item.nombre_componente,
          }))
        )}
        ayuda="Necesitas permisos para visualizar los componentes asignados."
      />
      <CampoSeleccion
        id="seleccion-aula"
        etiqueta="Aula"
        valor={aulaId}
        onChange={onSeleccionAula}
        deshabilitado={deshabilitarAulas || !componenteId}
        opciones={[{ value: "", label: "Selecciona un aula" }].concat(
          aulas.map((item) => ({
            value: item.id_aula,
            label: `Grado ${item.grado ?? "?"} · Sección ${
              item.seccion ?? "?"
            }`,
          }))
        )}
        ayuda={
          cargandoAulas
            ? "Cargando aulas disponibles..."
            : "Solo se listan las aulas asociadas al componente seleccionado."
        }
      />
    </div>
  </section>
);

const TablaEvaluacion = ({
  grid,
  literales,
  selecciones,
  permitidos,
  estaGuardando,
  onActualizar,
  onAplicarColumna,
}) => {
  if (!grid) {
    return (
      <section className={contenidosLayout.container}>
        <p className={`${typography.bodyMutedSm} text-center`}>
          Selecciona un componente y un aula para mostrar la matriz de
          evaluación.
        </p>
      </section>
    );
  }

  const indicadores = grid.indicadores ?? [];
  const estudiantes = grid.estudiantes ?? [];

  if (!indicadores.length || !estudiantes.length) {
    return (
      <section className={contenidosLayout.container}>
        <p className={`${typography.bodyMutedSm} text-center`}>
          No hay indicadores o estudiantes registrados para este contexto.
        </p>
      </section>
    );
  }

  const momento =
    grid.metadata?.momento?.nombre_momento ?? grid.metadata?.momento?.nombre;
  const componente = grid.metadata?.componente?.nombre_componente;
  const aula = grid.metadata?.aula?.descripcion ?? grid.metadata?.aula?.nombre;

  return (
    <section className={`${contenidosLayout.container} space-y-4`}>
      <header className="space-y-1">
        <h2 className={typography.titleSm}>Matriz de calificación</h2>
        <p className={typography.bodyMutedSm}>
          Aplica una literal a todos los estudiantes desde el encabezado del
          indicador o ajusta los valores individualmente.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {componente ? <span>Componente: {componente}</span> : null}
          {aula ? <span>Aula: {aula}</span> : null}
          {momento ? <span>Momento: {momento}</span> : null}
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">
                Estudiante
              </th>
              {indicadores.map((indicador) => {
                const id = indicador.id_indicador;
                return (
                  <th
                    key={id}
                    className="border-b border-slate-200 px-4 py-3 align-top"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {indicador.nombre_indicador ?? `Indicador ${id}`}
                      </span>
                      <select
                        className={`${selectEncabezadoClass} ${controlDeshabilitado}`}
                        defaultValue=""
                        onChange={(event) => {
                          onAplicarColumna(id, event.target.value);
                          event.target.value = "";
                        }}
                        disabled={
                          estaGuardando || !literales || !literales.length
                        }
                      >
                        <option value="">Aplicar a todos</option>
                        {literales.map((letra) => (
                          <option key={letra} value={letra}>
                            {letra}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => {
              const estudianteKey = String(estudiante.id_estudiante ?? "");
              if (!estudianteKey) {
                return null;
              }
              const indicadoresSeleccionados = selecciones[estudianteKey] ?? {};
              const permitidosEstudiante = permitidos[estudianteKey];
              const planLabel = obtenerEtiquetaPlan(estudiante.planificacion);
              return (
                <tr key={estudianteKey} className="border-b border-slate-100">
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {estudiante.nombre}
                      </p>
                      <span className={badgePlanClass}>{planLabel}</span>
                    </div>
                  </td>
                  {indicadores.map((indicador) => {
                    const indicadorKey = String(indicador.id_indicador ?? "");
                    const valor = indicadoresSeleccionados[indicadorKey] ?? "";
                    const habilitado = permitidosEstudiante
                      ? permitidosEstudiante.has(indicadorKey)
                      : true;
                    return (
                      <td
                        key={`${estudianteKey}-${indicadorKey}`}
                        className="px-4 py-3 align-top"
                      >
                        <select
                          value={valor}
                          className={`${selectTablaClass} ${controlDeshabilitado}`}
                          onChange={(event) =>
                            onActualizar(
                              estudiante.id_estudiante,
                              indicador.id_indicador,
                              event.target.value
                            )
                          }
                          disabled={estaGuardando || !habilitado}
                        >
                          <option value="">Sin definir</option>
                          {literales.map((letra) => (
                            <option key={letra} value={letra}>
                              {letra}
                            </option>
                          ))}
                        </select>
                        {!habilitado ? (
                          <p className="mt-2 text-xs text-slate-400">
                            Este indicador no está habilitado para el
                            estudiante.
                          </p>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const RendimientoAcademico = () => {
  const [contexto, setContexto] = useState(null);
  const [componentes, setComponentes] = useState([]);
  const [literales, setLiterales] = useState([]);
  const [componenteId, setComponenteId] = useState("");
  const [aulas, setAulas] = useState([]);
  const [aulaId, setAulaId] = useState("");
  const [grid, setGrid] = useState(null);
  const [selecciones, setSelecciones] = useState({});
  const [originalSelecciones, setOriginalSelecciones] = useState({});
  const [cargandoContexto, setCargandoContexto] = useState(true);
  const [cargandoAulas, setCargandoAulas] = useState(false);
  const [cargandoGrid, setCargandoGrid] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const literalesDisponibles = useMemo(() => {
    if (!Array.isArray(literales)) {
      return [];
    }
    return literales
      .map((item) => seleccionarLetraValida(item?.letra ?? item?.literal ?? ""))
      .filter(
        (valor, indice, arreglo) => valor && arreglo.indexOf(valor) === indice
      );
  }, [literales]);

  const permitidosPorEstudiante = useMemo(() => {
    if (!grid?.permitidos_por_estudiante) return {};
    return buildPermitidosMapa(grid.permitidos_por_estudiante);
  }, [grid]);

  const cargarContexto = async () => {
    setCargandoContexto(true);
    setError("");
    const respuesta = await obtenerContextoEvaluacion();
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setContexto(datos);
      setComponentes(datos.componentes ?? []);
      setLiterales(datos.literales ?? []);
    } else {
      setContexto(null);
      setComponentes([]);
      setLiterales([]);
      setError(respuesta.message || "No se pudo obtener el contexto inicial.");
    }
    setCargandoContexto(false);
  };

  useEffect(() => {
    cargarContexto();
  }, []);

  const reiniciarSeleccion = () => {
    setGrid(null);
    setSelecciones({});
    setOriginalSelecciones({});
    setMensaje("");
    setError("");
  };

  const manejarCambioComponente = async (event) => {
    const valor = event.target.value;
    setComponenteId(valor);
    setAulaId("");
    setAulas([]);
    reiniciarSeleccion();
    if (!valor) {
      return;
    }
    setCargandoAulas(true);
    const respuesta = await obtenerAulasPorComponente(valor);
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setAulas(datos.aulas ?? []);
      setError("");
    } else {
      setAulas([]);
      setError(respuesta.message || "No se pudieron cargar las aulas.");
    }
    setCargandoAulas(false);
  };

  const cargarGrid = async (idComponente, idAula) => {
    if (!idComponente || !idAula) {
      reiniciarSeleccion();
      return false;
    }
    setCargandoGrid(true);
    const respuesta = await obtenerGridEvaluacion(idComponente, idAula);
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setGrid(datos);
      if (Array.isArray(datos.literales) && datos.literales.length) {
        setLiterales(datos.literales);
      }
      const inicial = buildInitialSelections(datos.estudiantes ?? []);
      setSelecciones(inicial);
      setOriginalSelecciones(inicial);
      setError("");
    } else {
      setGrid(null);
      setSelecciones({});
      setOriginalSelecciones({});
      setError(
        respuesta.message || "No se pudo generar la matriz de evaluación."
      );
    }
    setCargandoGrid(false);
    return respuesta.success;
  };

  const manejarCambioAula = async (event) => {
    const valor = event.target.value;
    setAulaId(valor);
    setMensaje("");
    await cargarGrid(componenteId, valor);
  };

  const actualizarSeleccion = (estudianteId, indicadorId, letra) => {
    const letraNormalizada = seleccionarLetraValida(letra);
    setSelecciones((prev) => {
      const copia = { ...prev };
      const estudianteKey = String(estudianteId);
      const indicadorKey = String(indicadorId);
      const indicadoresPrevios = { ...(copia[estudianteKey] ?? {}) };
      if (letraNormalizada) {
        indicadoresPrevios[indicadorKey] = letraNormalizada;
      } else {
        delete indicadoresPrevios[indicadorKey];
      }
      copia[estudianteKey] = indicadoresPrevios;
      return copia;
    });
    setMensaje("");
  };

  const aplicarColumna = (indicadorId, letra) => {
    const letraNormalizada = seleccionarLetraValida(letra);
    if (!letraNormalizada || !grid?.estudiantes) return;
    setSelecciones((prev) => {
      const copia = { ...prev };
      grid.estudiantes.forEach((est) => {
        const estudianteKey = String(est.id_estudiante ?? "");
        if (!estudianteKey) return;
        const permitidos = permitidosPorEstudiante[estudianteKey];
        if (permitidos && !permitidos.has(String(indicadorId))) {
          return;
        }
        const indicadoresPrevios = { ...(copia[estudianteKey] ?? {}) };
        indicadoresPrevios[String(indicadorId)] = letraNormalizada;
        copia[estudianteKey] = indicadoresPrevios;
      });
      return copia;
    });
  };

  const hayCambiosPendientes = useMemo(() => {
    const estudiantesClaves = Object.keys(selecciones);
    for (const estudianteKey of estudiantesClaves) {
      const indicadores = selecciones[estudianteKey] ?? {};
      const originales = originalSelecciones[estudianteKey] ?? {};
      const indicadorKeys = new Set([
        ...Object.keys(indicadores),
        ...Object.keys(originales),
      ]);
      for (const indicadorKey of indicadorKeys) {
        const actual = indicadores[indicadorKey] ?? "";
        const previo = originales[indicadorKey] ?? "";
        if (actual !== previo) {
          return true;
        }
      }
    }
    return false;
  }, [selecciones, originalSelecciones]);

  const manejarGuardar = async () => {
    if (!componenteId || !aulaId) {
      setMensaje("Selecciona un componente y un aula antes de guardar.");
      return;
    }
    const evaluaciones = [];
    Object.entries(selecciones).forEach(([estudianteKey, indicadores]) => {
      Object.entries(indicadores).forEach(([indicadorKey, letra]) => {
        const previo =
          originalSelecciones?.[estudianteKey]?.[indicadorKey] ?? "";
        const letraNormalizada = seleccionarLetraValida(letra);
        if (!letraNormalizada || letraNormalizada === previo) {
          return;
        }
        evaluaciones.push({
          estudiante_id: Number(estudianteKey),
          indicador_id: Number(indicadorKey),
          valor: letraNormalizada,
        });
      });
    });

    if (!evaluaciones.length) {
      setMensaje("No hay cambios por guardar.");
      return;
    }

    setGuardando(true);
    setMensaje("");
    setError("");
    const payload = {
      componente_id: Number(componenteId),
      aula_id: Number(aulaId),
      momento_id:
        grid?.metadata?.momento?.id_momento ??
        contexto?.momento?.id_momento ??
        undefined,
      evaluaciones,
    };

    const respuesta = await guardarEvaluaciones(payload);
    if (respuesta.success) {
      setMensaje(respuesta.message || "Evaluaciones guardadas correctamente.");
      setError("");
      await cargarGrid(componenteId, aulaId);
    } else {
      setMensaje("");
      setError(respuesta.message || "No se pudieron guardar las evaluaciones.");
    }
    setGuardando(false);
  };

  return (
    <div className="space-y-6">
      <EncabezadoRendimiento
        estaCargandoContexto={cargandoContexto}
        estaGuardando={guardando}
        hayMatriz={Boolean(grid)}
        hayCambios={hayCambiosPendientes}
        onRecargar={cargarContexto}
        onGuardar={manejarGuardar}
      />

      {mensaje ? <div className={alertaExitoClass}>{mensaje}</div> : null}
      {error ? <div className={alertaErrorClass}>{error}</div> : null}

      {cargandoContexto ? (
        <section className={contenidosLayout.container}>
          <p className={`${typography.bodyMutedSm} text-center`}>
            Cargando contexto...
          </p>
        </section>
      ) : (
        <>
          <PanelContexto contexto={contexto} />
          <PanelFiltros
            componentes={componentes}
            componenteId={componenteId}
            aulas={aulas}
            aulaId={aulaId}
            cargandoAulas={cargandoAulas}
            deshabilitarComponentes={cargandoContexto || guardando}
            deshabilitarAulas={guardando}
            onSeleccionComponente={manejarCambioComponente}
            onSeleccionAula={manejarCambioAula}
          />

          {cargandoGrid ? (
            <section className={contenidosLayout.container}>
              <p className={`${typography.bodyMutedSm} text-center`}>
                Generando matriz de evaluación...
              </p>
            </section>
          ) : (
            <TablaEvaluacion
              grid={grid}
              literales={literalesDisponibles}
              selecciones={selecciones}
              permitidos={permitidosPorEstudiante}
              estaGuardando={guardando}
              onActualizar={actualizarSeleccion}
              onAplicarColumna={aplicarColumna}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RendimientoAcademico;
