import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChalkboardTeacher,
  FaUserCheck,
  FaUserCog,
  FaUserMinus,
  FaSyncAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  contenidosLayout,
  helperTextBase,
  neutralButtonBase,
} from "../EstilosCliente/EstilosClientes";
import {
  obtenerGestionDocentes,
  asignarDocenteTitular,
  asignarEspecialista,
  eliminarEspecialista,
} from "../../api/gestionAulasService";
import { cambiarEstadoAnioEscolar } from "../../api/anioEscolarService";
import { DocenteTitularModal } from "./DocenteTitularModal";
import { EspecialistaModal } from "./EspecialistaModal";
import { formatearFechaCorta } from "../../utilidades/formatoFechas";

const layout = contenidosLayout;

const crearResumenVacio = () => ({
  anio: null,
  momentos: [],
  areas: [],
  aulas: [],
  docentes: [],
  especialistas: [],
  anios: [],
});

export const GestionGradosSecciones = () => {
  const [resumen, setResumen] = useState(() => crearResumenVacio());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [docenteModal, setDocenteModal] = useState({
    abierto: false,
    aula: null,
  });
  const [especialistaModal, setEspecialistaModal] = useState({
    abierto: false,
    aula: null,
    componente: null,
  });
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [filtroComponentes, setFiltroComponentes] = useState("todos");
  const [activandoAnio, setActivandoAnio] = useState(false);

  const aniosDisponibles = useMemo(
    () => resumen?.anios ?? [],
    [resumen?.anios]
  );

  const aulasActivas = useMemo(() => {
    return (resumen?.aulas ?? []).filter((aula) => aula?.estado === "activo");
  }, [resumen?.aulas]);

  const faltanDocentesActivos = useMemo(() => {
    return aulasActivas.some((aula) => !aula?.docente);
  }, [aulasActivas]);

  const puedeActivarAnio = useMemo(() => {
    if (!resumen?.anio || (resumen.anio.estado ?? "") !== "incompleto") {
      return false;
    }
    if (aulasActivas.length === 0) {
      return false;
    }
    return !faltanDocentesActivos;
  }, [resumen?.anio, aulasActivas, faltanDocentesActivos]);

  const mensajeEstadoActivacion = useMemo(() => {
    if (!resumen?.anio || (resumen.anio.estado ?? "") !== "incompleto") {
      return "";
    }

    if (aulasActivas.length === 0) {
      return "Habilita al menos una seccion activa para activar el anio escolar.";
    }

    if (faltanDocentesActivos) {
      return "Asigna un docente titular a cada aula activa antes de activar el anio escolar.";
    }

    return "Todas las aulas activas tienen docente titular. Puedes activar el anio escolar cuando lo necesites.";
  }, [resumen?.anio, aulasActivas, faltanDocentesActivos]);

  const gradosDisponibles = useMemo(() => {
    const conjunto = new Set();
    aulasActivas.forEach((aula) => {
      if (aula?.grado !== undefined && aula?.grado !== null) {
        conjunto.add(String(aula.grado));
      }
    });
    return Array.from(conjunto).sort((a, b) => Number(a) - Number(b));
  }, [aulasActivas]);

  const seccionesDisponibles = useMemo(() => {
    if (!gradoSeleccionado) {
      return [];
    }
    const conjunto = new Set();
    aulasActivas.forEach((aula) => {
      if (String(aula?.grado) === gradoSeleccionado && aula?.seccion) {
        conjunto.add(String(aula.seccion));
      }
    });
    return Array.from(conjunto).sort((a, b) => a.localeCompare(b));
  }, [gradoSeleccionado, aulasActivas]);

  const aulaSeleccionada = useMemo(() => {
    if (!gradoSeleccionado || !seccionSeleccionada) {
      return null;
    }
    return (
      aulasActivas.find(
        (aula) =>
          String(aula?.grado) === gradoSeleccionado &&
          String(aula?.seccion) === seccionSeleccionada
      ) ?? null
    );
  }, [gradoSeleccionado, seccionSeleccionada, aulasActivas]);

  const cargarResumen = useCallback(async (opciones = {}) => {
    const { anioId = null, mantenerSeleccion = false } = opciones;
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerGestionDocentes(anioId);
      const resumenObtenido = datos ?? crearResumenVacio();
      setResumen(resumenObtenido);

      const anioActivo = resumenObtenido?.anio?.id ?? null;
      setAnioSeleccionado(anioActivo ? String(anioActivo) : "");

      if (!mantenerSeleccion) {
        setGradoSeleccionado("");
        setSeccionSeleccionada("");
      }
    } catch (err) {
      setError(
        err?.message ?? "No fue posible obtener la informacion de las aulas."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    if (resumen?.anio?.id) {
      setAnioSeleccionado(String(resumen.anio.id));
    }
  }, [resumen?.anio?.id]);

  const manejarCambioAnio = async (evento) => {
    const valor = evento.target.value;
    setAnioSeleccionado(valor);
    setFiltroComponentes("todos");
    await cargarResumen({
      anioId: valor ? parseInt(valor, 10) : null,
      mantenerSeleccion: false,
    });
  };

  const refrescarResumen = useCallback(() => {
    const anioId = anioSeleccionado ? parseInt(anioSeleccionado, 10) : null;
    cargarResumen({ anioId, mantenerSeleccion: true });
  }, [anioSeleccionado, cargarResumen]);

  const manejarActivarAnioEscolar = useCallback(async () => {
    if (!puedeActivarAnio || !resumen?.anio?.id) {
      return;
    }

    setActivandoAnio(true);

    try {
      const respuesta = await cambiarEstadoAnioEscolar(resumen.anio.id, {
        accion: "activar",
      });

      if (!respuesta.success) {
        const errores = respuesta.errors ?? {};
        const mensajes = new Set();

        if (typeof respuesta.message === "string" && respuesta.message.length) {
          mensajes.add(respuesta.message);
        }

        if (Array.isArray(errores.docentes)) {
          errores.docentes.forEach((mensaje) => {
            if (typeof mensaje === "string" && mensaje.length) {
              mensajes.add(mensaje);
            }
          });
        }

        if (Array.isArray(errores.momentos)) {
          errores.momentos.forEach((mensaje) => {
            if (typeof mensaje === "string" && mensaje.length) {
              mensajes.add(mensaje);
            }
          });
        }

        if (Array.isArray(errores.aulas_sin_docente)) {
          errores.aulas_sin_docente.forEach((detalle) => {
            if (detalle && typeof detalle === "object") {
              const descripcion =
                detalle.descripcion ?? detalle.aula ?? detalle.seccion ?? null;
              if (descripcion) {
                mensajes.add(`Aula pendiente: ${descripcion}`);
                return;
              }
            }
            if (detalle) {
              mensajes.add(String(detalle));
            }
          });
        }

        const detalle =
          mensajes.size > 0
            ? Array.from(mensajes).join("\n")
            : "No se pudo activar el anio escolar. Verifique la configuracion.";

        Swal.fire("No se pudo activar", detalle, "warning");
        return;
      }

      await cargarResumen({
        anioId: resumen.anio.id,
        mantenerSeleccion: true,
      });

      Swal.fire(
        "Listo",
        respuesta.message ?? "Anio escolar activado correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Activar año escolar", error);
      Swal.fire(
        "Error",
        "Ocurrio un error al intentar activar el anio escolar.",
        "error"
      );
    } finally {
      setActivandoAnio(false);
    }
  }, [puedeActivarAnio, resumen?.anio?.id, cargarResumen]);

  useEffect(() => {
    if (gradoSeleccionado && !gradosDisponibles.includes(gradoSeleccionado)) {
      setGradoSeleccionado("");
    }
  }, [gradoSeleccionado, gradosDisponibles]);

  useEffect(() => {
    if (!gradoSeleccionado) {
      if (seccionSeleccionada !== "") {
        setSeccionSeleccionada("");
      }
      return;
    }

    if (
      seccionSeleccionada &&
      !seccionesDisponibles.includes(seccionSeleccionada)
    ) {
      setSeccionSeleccionada("");
    }
  }, [gradoSeleccionado, seccionSeleccionada, seccionesDisponibles]);

  const renderAula = (aula) => {
    const componentesDocente = new Set(
      (aula?.componentes_docente ?? []).map((id) => Number(id))
    );
    const mapaEspecialistas = construirMapaEspecialistas(aula);

    const coincideConFiltro = (componente) => {
      if (filtroComponentes === "docente") {
        return componentesDocente.has(Number(componente.id));
      }
      if (filtroComponentes === "especialistas") {
        return componente.requiere_especialista === true;
      }
      return true;
    };

    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Grado {aula.grado} — Seccion {aula.seccion}
            </h3>
            <p className="text-sm text-slate-500">
              {aula.docente
                ? `Docente titular: ${aula.docente.nombre_completo}`
                : "Sin docente titular asignado."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => abrirModalDocente(aula)}
              className={`${neutralButtonBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300/60`}
            >
              <FaChalkboardTeacher />
              {aula.docente ? "Editar docente" : "Asignar docente de aula"}
            </button>
            {aula.docente && (
              <button
                type="button"
                onClick={() => abrirModalDocente(aula)}
                className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus:ring-slate-300/60`}
              >
                <FaChalkboardTeacher /> Cambiar docente de aula
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "todos", etiqueta: "Todos los componentes" },
            { id: "docente", etiqueta: "Componentes del docente" },
            { id: "especialistas", etiqueta: "Componentes con especialista" },
          ].map((opcion) => {
            const activo = filtroComponentes === opcion.id;
            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setFiltroComponentes(opcion.id)}
                className={`${
                  activo
                    ? `${neutralButtonBase} bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-400/60`
                    : `${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-200/60`
                }`}
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-5">
          {(resumen?.areas ?? []).map((area) => {
            const componentesFiltrados = area.componentes.filter((componente) =>
              coincideConFiltro(componente)
            );

            if (componentesFiltrados.length === 0) {
              return (
                <div
                  key={`${aula.id}-area-${area.id}`}
                  className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {area.nombre}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400">
                      Sin componentes por mostrar
                    </span>
                  </div>
                  <div
                    className={`${helperTextBase} mt-3 text-center text-slate-500`}
                  >
                    No hay componentes que coincidan con el filtro seleccionado
                    en esta area.
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${aula.id}-area-${area.id}`}
                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {area.nombre}
                  </h4>
                  <span className="text-xs font-semibold text-slate-400">
                    {componentesFiltrados.length} componente
                    {componentesFiltrados.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-3 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {componentesFiltrados.map((componente) => {
                    const componenteId = Number(componente.id);
                    const cubiertoTitular =
                      componentesDocente.has(componenteId);
                    const registroEspecialista =
                      mapaEspecialistas.get(componenteId);
                    const requiereEspecialista =
                      componente.requiere_especialista === true;
                    const especialistaNombre =
                      registroEspecialista?.personal?.nombre_completo ??
                      "Sin asignar";

                    return (
                      <div
                        key={`${aula.id}-${componente.id}`}
                        className="flex flex-col gap-3 rounded-2xl border border-white bg-white p-5 shadow-sm"
                      >
                        <div className="space-y-2">
                          <span className="block text-base font-semibold text-slate-800 break-words">
                            {componente.nombre}
                          </span>
                          <p className="text-xs text-slate-500 break-words">
                            {cubiertoTitular
                              ? "A cargo del docente titular"
                              : requiereEspecialista
                              ? `Especialista: ${especialistaNombre}`
                              : "Pendiente de asignar docente titular"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {cubiertoTitular && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                              <FaUserCheck className="h-4 w-4" /> Titular
                            </span>
                          )}
                          {!cubiertoTitular &&
                            requiereEspecialista &&
                            registroEspecialista && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700">
                                <FaUserCog className="h-4 w-4" /> Especialista
                              </span>
                            )}
                          {!cubiertoTitular && !requiereEspecialista && (
                            <span
                              className={`${helperTextBase} text-amber-600`}
                            >
                              Asigna un docente titular para cubrir este
                              componente
                            </span>
                          )}
                          {!cubiertoTitular &&
                            requiereEspecialista &&
                            !registroEspecialista && (
                              <span
                                className={`${helperTextBase} text-amber-600`}
                              >
                                Pendiente de asignar especialista
                              </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!cubiertoTitular && requiereEspecialista && (
                            <button
                              type="button"
                              onClick={() =>
                                abrirModalEspecialista(aula, componente)
                              }
                              className={`${neutralButtonBase} bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-400/60`}
                            >
                              <FaUserCog />
                              {registroEspecialista
                                ? "Cambiar"
                                : "Asignar especialista"}
                            </button>
                          )}
                          {!cubiertoTitular &&
                            requiereEspecialista &&
                            registroEspecialista && (
                              <button
                                type="button"
                                onClick={() =>
                                  quitarEspecialistaAsignado(aula, componente)
                                }
                                className={`${neutralButtonBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus:ring-rose-200/60`}
                              >
                                <FaUserMinus /> Quitar
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const construirMapaEspecialistas = useCallback((aula) => {
    const mapa = new Map();
    (aula?.especialistas ?? []).forEach((registro) => {
      if (registro?.componente?.id) {
        mapa.set(Number(registro.componente.id), registro);
      }
    });
    return mapa;
  }, []);

  const estadisticas = useMemo(() => {
    const aulas = aulasActivas;
    let aulasSinDocente = 0;
    let pendientesEspecialistas = 0;

    aulas.forEach((aula) => {
      if (!aula?.docente) {
        aulasSinDocente += 1;
      }

      const componentesDocente = new Set(
        (aula?.componentes_docente ?? []).map((id) => Number(id))
      );
      const mapaEspecialistas = construirMapaEspecialistas(aula);

      (resumen?.areas ?? []).forEach((area) => {
        (area?.componentes ?? []).forEach((componente) => {
          if (componente?.requiere_especialista === true) {
            const componenteId = Number(componente.id);
            if (componentesDocente.has(componenteId)) {
              return;
            }
            if (!mapaEspecialistas.has(componenteId)) {
              pendientesEspecialistas += 1;
            }
          }
        });
      });
    });

    return {
      totalAulas: aulas.length,
      aulasSinDocente,
      pendientesEspecialistas,
    };
  }, [aulasActivas, construirMapaEspecialistas, resumen?.areas]);

  const resumenAsignaciones = useMemo(() => {
    return aulasActivas.map((aula) => {
      const especialistasListado = (aula?.especialistas ?? []).map(
        (registro) => {
          const componenteNombre = registro?.componente?.nombre ?? "Componente";
          const especialistaNombre =
            registro?.personal?.nombre_completo ?? "Sin especialista";
          return `${componenteNombre}: ${especialistaNombre}`;
        }
      );

      return {
        id: aula?.id ?? `${aula?.grado ?? "?"}-${aula?.seccion ?? "?"}`,
        grado: aula?.grado ?? "-",
        seccion: aula?.seccion ?? "-",
        docente:
          aula?.docente?.nombre_completo ?? "Sin docente titular asignado",
        especialistas: especialistasListado,
        pendientes: aula?.pendientes?.especialistas ?? 0,
      };
    });
  }, [aulasActivas]);

  const contenidoPrincipal = () => {
    if (cargando) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
          <FaSyncAlt className="h-6 w-6 animate-spin" />
          <span>Cargando informacion de aulas...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-700">
          {error}
        </div>
      );
    }

    if (!resumen?.anio) {
      return (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-sm text-amber-700">
          No hay un año escolar activo o incompleto. Configure el año escolar y
          las secciones antes de gestionar las asignaciones.
        </div>
      );
    }

    if (aulasActivas.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No se encontraron aulas para el año escolar seleccionado. Realice la
          apertura de secciones antes de continuar.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="grado-select"
            >
              Seleccione un grado
            </label>
            <select
              id="grado-select"
              value={gradoSeleccionado}
              onChange={(evento) => setGradoSeleccionado(evento.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">-- Seleccione --</option>
              {gradosDisponibles.map((grado) => (
                <option key={grado} value={grado}>
                  Grado {grado}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="seccion-select"
            >
              Seleccione una seccion
            </label>
            <select
              id="seccion-select"
              value={seccionSeleccionada}
              onChange={(evento) => setSeccionSeleccionada(evento.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={!gradoSeleccionado || seccionesDisponibles.length === 0}
            >
              <option value="">-- Seleccione --</option>
              {seccionesDisponibles.map((seccion) => (
                <option key={seccion} value={seccion}>
                  Seccion {seccion}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!gradoSeleccionado ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Selecciona un grado para mostrar las secciones disponibles.
          </div>
        ) : !seccionSeleccionada ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            {seccionesDisponibles.length === 0
              ? "No hay secciones registradas para el grado seleccionado."
              : "Selecciona una seccion para gestionar sus asignaciones."}
          </div>
        ) : !aulaSeleccionada ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-sm text-amber-700">
            No se encontro un aula que coincida con el grado y la seccion
            seleccionados.
          </div>
        ) : (
          renderAula(aulaSeleccionada)
        )}
      </div>
    );
  };

  const abrirModalDocente = (aula) => {
    setDocenteModal({ abierto: true, aula });
  };

  const cerrarModalDocente = () => {
    setDocenteModal({ abierto: false, aula: null });
  };

  const guardarDocenteTitular = async (payload) => {
    const aula = docenteModal?.aula;
    if (!aula?.id) {
      throw new Error("No se selecciono un aula valida.");
    }

    try {
      const datos = await asignarDocenteTitular(aula.id, payload);
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Docente titular asignado correctamente.", "success");
    } catch (err) {
      if (!err?.validation) {
        Swal.fire(
          "Error",
          err?.message ??
            "No fue posible guardar la asignacion del docente titular.",
          "error"
        );
      }
      throw err;
    }
  };

  const abrirModalEspecialista = (aula, componente) => {
    setEspecialistaModal({ abierto: true, aula, componente });
  };

  const cerrarModalEspecialista = () => {
    setEspecialistaModal({ abierto: false, aula: null, componente: null });
  };

  const guardarEspecialista = async (payload) => {
    const aula = especialistaModal?.aula;
    if (!aula?.id) {
      throw new Error("No se selecciono un aula valida.");
    }

    try {
      const datos = await asignarEspecialista(aula.id, payload);
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Especialista asignado correctamente.", "success");
    } catch (err) {
      if (!err?.validation) {
        Swal.fire(
          "Error",
          err?.message ?? "No fue posible guardar la asignacion.",
          "error"
        );
      }
      throw err;
    }
  };

  const quitarEspecialistaAsignado = async (aula, componente) => {
    if (!aula?.id || !componente?.id) {
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Quitar especialista?",
      text: "La asignacion para este componente se eliminara.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, quitar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      const datos = await eliminarEspecialista(aula.id, componente.id);
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Especialista removido correctamente.", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.message ?? "No fue posible quitar al especialista.",
        "error"
      );
    }
  };

  const fechaInicioAnioActivo = useMemo(
    () => formatearFechaCorta(resumen?.anio?.fecha_inicio),
    [resumen?.anio?.fecha_inicio]
  );

  const fechaFinAnioActivo = useMemo(
    () => formatearFechaCorta(resumen?.anio?.fecha_fin),
    [resumen?.anio?.fecha_fin]
  );

  const etiquetaAnioDisponible = useCallback((anio) => {
    if (!anio) {
      return "-";
    }
    const inicio = formatearFechaCorta(anio.fecha_inicio);
    const fin = formatearFechaCorta(anio.fecha_fin);
    return `${inicio || "-"} - ${fin || "-"}`;
  }, []);

  return (
    <section className="p-6">
      <div className={layout.container}>
        <header className={layout.header}>
          <div>
            <h1 className={layout.title}>Gestion de grados y secciones</h1>
            <p className={layout.description}>
              Administre la asignacion de docentes titulares y especialistas por
              aula. Las asignaciones se replican automaticamente en todos los
              momentos activos del año escolar.
            </p>
            {resumen?.anio ? (
              <p className="mt-1 text-xs text-slate-500">
                Mostrando informacion del anio {fechaInicioAnioActivo || "-"} al{" "}
                {fechaFinAnioActivo || "-"} — Estado: {resumen.anio.estado}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                No hay un anio escolar activo. Selecciona uno de la lista para
                revisar asignaciones anteriores.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-600 md:items-end">
            {aniosDisponibles.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor="anio-select">
                  Anio escolar
                </label>
                <select
                  id="anio-select"
                  value={anioSeleccionado}
                  onChange={manejarCambioAnio}
                  disabled={cargando}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Mas reciente disponible</option>
                  {aniosDisponibles.map((anio) => (
                    <option key={anio.id} value={anio.id}>
                      {etiquetaAnioDisponible(anio)} ({anio.estado})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {resumen?.anio?.estado === "incompleto" && (
              <div className="flex max-w-xs flex-col gap-1 text-xs text-emerald-700">
                <button
                  type="button"
                  onClick={manejarActivarAnioEscolar}
                  disabled={activandoAnio || cargando || !puedeActivarAnio}
                  className={`${neutralButtonBase} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {activandoAnio ? "Activando..." : "Activar anio escolar"}
                </button>
                {mensajeEstadoActivacion && (
                  <span>{mensajeEstadoActivacion}</span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={refrescarResumen}
              disabled={cargando}
              className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <FaSyncAlt /> Actualizar
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Aulas configuradas
            </p>
            <span className="text-2xl font-semibold text-slate-900">
              {estadisticas.totalAulas}
            </span>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Aulas sin docente
            </p>
            <span className="text-2xl font-semibold text-amber-700">
              {estadisticas.aulasSinDocente}
            </span>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Componentes pendientes
            </p>
            <span className="text-2xl font-semibold text-sky-700">
              {estadisticas.pendientesEspecialistas}
            </span>
          </div>
        </section>

        {contenidoPrincipal()}

        {resumenAsignaciones.length > 0 && (
          <section className="mt-8 space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-800">
                Resumen de asignaciones por aula
              </h2>
              <p className="text-xs text-slate-500">
                Consulta rapidamente que docente titular y especialistas estan
                asociados a cada grado y seccion.
              </p>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Grado
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Seccion
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Docente titular
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Especialistas
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Pendientes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {resumenAsignaciones.map((fila) => (
                    <tr key={fila.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                        Grado {fila.grado}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        Seccion {fila.seccion}
                      </td>
                      <td className="px-4 py-3">{fila.docente}</td>
                      <td className="px-4 py-3">
                        {fila.especialistas.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-4">
                            {fila.especialistas.map((descripcion, indice) => (
                              <li key={indice}>{descripcion}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400">
                            Sin especialistas asignados
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {fila.pendientes > 0
                          ? `${fila.pendientes} componente(s)`
                          : "Sin pendientes"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <DocenteTitularModal
        isOpen={docenteModal.abierto}
        onClose={cerrarModalDocente}
        onSubmit={guardarDocenteTitular}
        docentes={resumen?.docentes ?? []}
        areas={resumen?.areas ?? []}
        aula={docenteModal.aula}
      />

      <EspecialistaModal
        isOpen={especialistaModal.abierto}
        onClose={cerrarModalEspecialista}
        onSubmit={guardarEspecialista}
        especialistas={resumen?.especialistas ?? []}
        areas={resumen?.areas ?? []}
        aula={especialistaModal.aula}
        componenteSeleccionado={especialistaModal.componente}
      />
    </section>
  );
};
