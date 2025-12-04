import { useEffect, useMemo, useState } from "react";
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
  eliminarDocenteTitular,
  asignarEspecialista,
  eliminarEspecialista,
} from "../../api/gestionAulasService";
import { DocenteTitularModal } from "./DocenteTitularModal";
import { EspecialistaModal } from "./EspecialistaModal";

const layout = contenidosLayout;

const crearResumenVacio = () => ({
  anio: null,
  momentos: [],
  areas: [],
  aulas: [],
  docentes: [],
  especialistas: [],
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

  const cargarResumen = async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerGestionDocentes();
      setResumen(datos ?? crearResumenVacio());
    } catch (err) {
      setError(err.message ?? "No fue posible obtener la informacion.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const estadisticas = useMemo(() => {
    const totalAulas = resumen?.aulas?.length ?? 0;
    const aulasSinDocente =
      resumen?.aulas?.filter((aula) => aula?.pendientes?.docente).length ?? 0;
    const pendientesEspecialistas =
      resumen?.aulas?.reduce(
        (acum, aula) => acum + (aula?.pendientes?.especialistas ?? 0),
        0
      ) ?? 0;

    return {
      totalAulas,
      aulasSinDocente,
      pendientesEspecialistas,
    };
  }, [resumen]);

  const abrirModalDocente = (aula) => {
    setDocenteModal({ abierto: true, aula });
  };

  const cerrarModalDocente = () => {
    setDocenteModal({ abierto: false, aula: null });
  };

  const abrirModalEspecialista = (aula, componente) => {
    setEspecialistaModal({ abierto: true, aula, componente });
  };

  const cerrarModalEspecialista = () => {
    setEspecialistaModal({ abierto: false, aula: null, componente: null });
  };

  const guardarDocenteTitular = async (payload) => {
    if (!docenteModal.aula) {
      return;
    }

    try {
      const datos = await asignarDocenteTitular(docenteModal.aula.id, payload);
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Docente titular asignado correctamente.", "success");
    } catch (err) {
      if (!err?.validation) {
        Swal.fire(
          "Error",
          err.message ?? "Ocurrio un error inesperado al asignar el docente.",
          "error"
        );
      }
      throw err;
    }
  };

  const quitarDocenteTitular = async (aula) => {
    const confirmacion = await Swal.fire({
      title: "¿Quitar docente titular?",
      text: "Esta accion eliminara la asignacion actual para esta aula.",
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
      const datos = await eliminarDocenteTitular(aula.id);
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Docente titular removido correctamente.", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No fue posible quitar la asignacion.",
        "error"
      );
    }
  };

  const guardarEspecialista = async (payload) => {
    if (!especialistaModal.aula) {
      return;
    }

    try {
      const datos = await asignarEspecialista(
        especialistaModal.aula.id,
        payload
      );
      setResumen(datos ?? crearResumenVacio());
      Swal.fire("Hecho", "Especialista asignado correctamente.", "success");
    } catch (err) {
      if (!err?.validation) {
        Swal.fire(
          "Error",
          err.message ?? "No fue posible asignar el especialista.",
          "error"
        );
      }
      throw err;
    }
  };

  const quitarEspecialistaAsignado = async (aula, componente) => {
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
        err.message ?? "No fue posible quitar al especialista.",
        "error"
      );
    }
  };

  const construirMapaEspecialistas = (aula) => {
    const mapa = new Map();
    (aula?.especialistas ?? []).forEach((registro) => {
      if (registro?.componente?.id) {
        mapa.set(registro.componente.id, registro);
      }
    });
    return mapa;
  };

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

    if ((resumen?.aulas ?? []).length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No se encontraron aulas para el año escolar seleccionado. Realice la
          apertura de secciones antes de continuar.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {resumen.aulas.map((aula) => {
          const componentesDocente = new Set(aula?.componentes_docente ?? []);
          const mapaEspecialistas = construirMapaEspecialistas(aula);

          return (
            <div
              key={aula.id}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Grado {aula.grado} — Seccion {aula.seccion}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {aula.docente
                      ? `Titular: ${aula.docente.nombre_completo}`
                      : "Aun no se ha asignado un docente titular."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModalDocente(aula)}
                    className={`${neutralButtonBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300/60`}
                  >
                    <FaChalkboardTeacher />
                    {aula.docente ? "Editar docente" : "Asignar docente"}
                  </button>
                  {aula.docente && (
                    <button
                      type="button"
                      onClick={() => quitarDocenteTitular(aula)}
                      className={`${neutralButtonBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus:ring-rose-200/60`}
                    >
                      <FaUserMinus /> Quitar docente
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-5">
                {resumen.areas.map((area) => (
                  <div
                    key={`${aula.id}-area-${area.id}`}
                    className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {area.nombre}
                      </h4>
                      <span className="text-xs font-semibold text-slate-400">
                        {area.componentes.length} componentes
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {area.componentes.map((componente) => {
                        const cubiertoTitular = componentesDocente.has(
                          componente.id
                        );
                        const registroEspecialista = mapaEspecialistas.get(
                          componente.id
                        );
                        const especialistaNombre =
                          registroEspecialista?.personal?.nombre_completo ??
                          "Sin asignar";

                        return (
                          <div
                            key={`${aula.id}-${componente.id}`}
                            className="flex flex-col gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm"
                          >
                            <div>
                              <span className="text-sm font-semibold text-slate-800">
                                {componente.nombre}
                              </span>
                              <p className="text-xs text-slate-500">
                                {cubiertoTitular
                                  ? "A cargo del docente titular"
                                  : `Especialista: ${especialistaNombre}`}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {cubiertoTitular && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                                  <FaUserCheck className="h-4 w-4" /> Titular
                                </span>
                              )}
                              {!cubiertoTitular && registroEspecialista && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700">
                                  <FaUserCog className="h-4 w-4" /> Especialista
                                </span>
                              )}
                              {!cubiertoTitular && !registroEspecialista && (
                                <span
                                  className={`${helperTextBase} text-amber-600`}
                                >
                                  Pendiente de asignar
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!cubiertoTitular && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirModalEspecialista(aula, componente)
                                  }
                                  className={`${neutralButtonBase} bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-400/60`}
                                >
                                  <FaUserCog />
                                  {registroEspecialista ? "Cambiar" : "Asignar"}
                                </button>
                              )}
                              {!cubiertoTitular && registroEspecialista && (
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
            {resumen?.anio && (
              <p className="mt-1 text-xs text-slate-500">
                Año escolar activo: {resumen.anio.fecha_inicio} al{" "}
                {resumen.anio.fecha_fin} — Estado: {resumen.anio.estado}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={cargarResumen}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-200/60`}
          >
            <FaSyncAlt /> Actualizar
          </button>
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
