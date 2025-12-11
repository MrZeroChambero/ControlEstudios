import { useEffect, useMemo, useState } from "react";
import { FaChalkboardTeacher, FaSyncAlt, FaUserCog } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  contenidosLayout,
  contenidosFormClasses,
  helperTextBase,
  primaryButtonBase,
} from "../EstilosCliente/EstilosClientes";
import {
  obtenerGestionDocentes,
  asignarDocenteTitular,
  asignarEspecialista,
} from "../../api/gestionAulasService";
import { formatearFechaCorta } from "../../utilidades/formatoFechas";

const layout = contenidosLayout;
const formClasses = contenidosFormClasses;

const crearResumenVacio = () => ({
  anio: null,
  momentos: [],
  areas: [],
  aulas: [],
  docentes: [],
  especialistas: [],
});

const normalizarNumero = (valor) => {
  if (valor === "" || valor === null || valor === undefined) {
    return null;
  }

  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.trunc(numero);
};

export const DiasClases = () => {
  const [resumen, setResumen] = useState(() => crearResumenVacio());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aulaSeleccionadaId, setAulaSeleccionadaId] = useState(null);
  const [clasesDocente, setClasesDocente] = useState("");
  const [clasesEspecialistas, setClasesEspecialistas] = useState({});
  const [erroresDocente, setErroresDocente] = useState([]);
  const [erroresEspecialistas, setErroresEspecialistas] = useState({});
  const [guardandoDocente, setGuardandoDocente] = useState(false);
  const [guardandoEspecialistas, setGuardandoEspecialistas] = useState({});

  const inicioAnio = useMemo(
    () => formatearFechaCorta(resumen?.anio?.fecha_inicio),
    [resumen?.anio?.fecha_inicio]
  );
  const finAnio = useMemo(
    () => formatearFechaCorta(resumen?.anio?.fecha_fin),
    [resumen?.anio?.fecha_fin]
  );

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

  useEffect(() => {
    if (!resumen.aulas || resumen.aulas.length === 0) {
      setAulaSeleccionadaId(null);
      return;
    }

    setAulaSeleccionadaId((prev) => {
      if (prev && resumen.aulas.some((aula) => aula.id === prev)) {
        return prev;
      }
      return resumen.aulas[0].id;
    });
  }, [resumen.aulas]);

  const componentesCatalogo = useMemo(() => {
    const mapa = new Map();
    resumen.areas.forEach((area) => {
      (area.componentes ?? []).forEach((componente) => {
        mapa.set(componente.id, componente);
      });
    });
    return mapa;
  }, [resumen.areas]);

  const aulaSeleccionada = useMemo(() => {
    if (!aulaSeleccionadaId) {
      return null;
    }

    return resumen.aulas.find((aula) => aula.id === aulaSeleccionadaId) ?? null;
  }, [aulaSeleccionadaId, resumen.aulas]);

  useEffect(() => {
    if (!aulaSeleccionada) {
      setClasesDocente("");
      setClasesEspecialistas({});
      return;
    }

    const docenteValor = aulaSeleccionada?.docente?.clases_totales;
    setClasesDocente(
      docenteValor === null || docenteValor === undefined
        ? ""
        : String(docenteValor)
    );

    const especialistasValores = {};
    (aulaSeleccionada.especialistas ?? []).forEach((registro) => {
      const componenteId = registro?.componente?.id;
      if (!componenteId) {
        return;
      }

      especialistasValores[componenteId] =
        registro.clases_totales === null ||
        registro.clases_totales === undefined
          ? ""
          : String(registro.clases_totales);
    });
    setClasesEspecialistas(especialistasValores);
    setErroresDocente([]);
    setErroresEspecialistas({});
  }, [aulaSeleccionada]);

  const momentosActivos = useMemo(
    () => resumen.momentos.filter((momento) => momento.estado === "activo"),
    [resumen.momentos]
  );

  const actualizarDocente = async () => {
    if (!aulaSeleccionada?.docente) {
      return;
    }

    const valor = normalizarNumero(clasesDocente);
    if (valor !== null && valor < 0) {
      setErroresDocente(["El numero de clases debe ser un valor positivo."]);
      return;
    }

    setGuardandoDocente(true);
    setErroresDocente([]);

    try {
      const payload = {
        id_personal: aulaSeleccionada.docente.id_personal,
        componentes: aulaSeleccionada.componentes_docente ?? [],
        clases_totales: valor,
      };

      const datos = await asignarDocenteTitular(aulaSeleccionada.id, payload);
      setResumen(datos ?? crearResumenVacio());
      await Swal.fire(
        "Hecho",
        "Las clases del docente titular fueron actualizadas.",
        "success"
      );
    } catch (err) {
      if (err?.validation) {
        setErroresDocente(err.validation.clases_totales ?? []);
        return;
      }

      await Swal.fire(
        "Error",
        err.message ?? "No fue posible actualizar la informacion.",
        "error"
      );
    } finally {
      setGuardandoDocente(false);
    }
  };

  const actualizarEspecialista = async (registro) => {
    const componenteId = registro?.componente?.id;
    if (!aulaSeleccionada || !componenteId) {
      return;
    }

    const valor = normalizarNumero(clasesEspecialistas[componenteId] ?? "");
    if (valor !== null && valor < 0) {
      setErroresEspecialistas((prev) => ({
        ...prev,
        [componenteId]: ["El numero de clases debe ser un valor positivo."],
      }));
      return;
    }

    setGuardandoEspecialistas((prev) => ({
      ...prev,
      [componenteId]: true,
    }));
    setErroresEspecialistas((prev) => ({
      ...prev,
      [componenteId]: [],
    }));

    try {
      const payload = {
        id_personal: registro.personal?.id_personal,
        componentes: [componenteId],
        clases_totales: valor,
      };

      const datos = await asignarEspecialista(aulaSeleccionada.id, payload);
      setResumen(datos ?? crearResumenVacio());
      await Swal.fire(
        "Hecho",
        "Las clases del especialista fueron actualizadas.",
        "success"
      );
    } catch (err) {
      if (err?.validation) {
        setErroresEspecialistas((prev) => ({
          ...prev,
          [componenteId]: err.validation.clases_totales ?? [],
        }));
        return;
      }

      await Swal.fire(
        "Error",
        err.message ?? "No fue posible actualizar la informacion.",
        "error"
      );
    } finally {
      setGuardandoEspecialistas((prev) => ({
        ...prev,
        [componenteId]: false,
      }));
    }
  };

  const buttonRecargar = `${formClasses.ghostButton} inline-flex items-center gap-2`; // aligns with contenidos buttons
  const cardBase = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";
  const badgeBase =
    "inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600";

  return (
    <div className={layout.container}>
      <div className={`${layout.header} items-start`}>
        <div>
          <h2 className={layout.title}>Registro de Clases Impartidas</h2>
          <p className={layout.description}>
            Actualice las clases impartidas por docentes titulares y
            especialistas durante el año escolar activo.
          </p>
        </div>
        <button
          type="button"
          className={buttonRecargar}
          onClick={cargarResumen}
          disabled={cargando}
        >
          <FaSyncAlt className="h-4 w-4" />
          Recargar datos
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {cargando ? (
        <p className={helperTextBase}>Cargando informacion...</p>
      ) : resumen.anio === null ? (
        <div className={cardBase}>
          <p className={helperTextBase}>
            No hay un año escolar activo o incompleto para registrar las clases
            impartidas. Configure uno desde la gestion de años escolares.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <section className={cardBase}>
            <h3 className="text-lg font-semibold text-slate-800">
              Año escolar en curso
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className={badgeBase}>
                {resumen.anio.estado ?? "Desconocido"}
              </span>
              <span>
                Inicio: <strong>{inicioAnio || "N/D"}</strong>
              </span>
              <span>
                Fin: <strong>{finAnio || "N/D"}</strong>
              </span>
              {momentosActivos.length > 0 ? (
                <span>
                  Momentos activos:{" "}
                  {momentosActivos.map((momento) => momento.nombre).join(", ")}
                </span>
              ) : (
                <span>Sin momentos activos asignados.</span>
              )}
            </div>
          </section>

          <section className={cardBase}>
            <div className="grid gap-4 md:grid-cols-[1.2fr_2fr] md:items-end">
              <div className={formClasses.group}>
                <label className={formClasses.label} htmlFor="aula-select">
                  Seleccione el aula
                </label>
                <select
                  id="aula-select"
                  className={formClasses.select}
                  value={
                    aulaSeleccionadaId !== null
                      ? String(aulaSeleccionadaId)
                      : ""
                  }
                  onChange={(evento) =>
                    setAulaSeleccionadaId(
                      evento.target.value ? Number(evento.target.value) : null
                    )
                  }
                >
                  {(resumen.aulas ?? []).map((aula) => (
                    <option key={aula.id} value={String(aula.id)}>
                      Grado {aula.grado} - Seccion {aula.seccion}
                    </option>
                  ))}
                </select>
                <p className={formClasses.helper}>
                  Solo se muestran las aulas activas del año escolar actual.
                </p>
              </div>

              {aulaSeleccionada && (
                <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-700">
                  <p>
                    Aula seleccionada:{" "}
                    <strong>Grado {aulaSeleccionada.grado}</strong>, seccion{" "}
                    <strong>{aulaSeleccionada.seccion}</strong>.
                  </p>
                  <p>
                    Estado:{" "}
                    <strong>{aulaSeleccionada.estado ?? "sin estado"}</strong>
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className={cardBase}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <FaChalkboardTeacher className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Docente titular
                  </h3>
                  <p className={helperTextBase}>
                    Registre el total de clases impartidas para la asignacion
                    del docente titular del aula.
                  </p>
                </div>
              </div>

              {aulaSeleccionada?.docente ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-base font-semibold text-slate-900">
                      {aulaSeleccionada.docente.nombre_completo}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Componentes asignados
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(aulaSeleccionada.componentes_docente ?? []).length >
                      0 ? (
                        (aulaSeleccionada.componentes_docente ?? []).map(
                          (componenteId) => {
                            const componente = componentesCatalogo.get(
                              Number(componenteId)
                            );
                            return (
                              <span
                                key={componenteId}
                                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                              >
                                {componente?.nombre ??
                                  `Componente ${componenteId}`}
                              </span>
                            );
                          }
                        )
                      ) : (
                        <span className={helperTextBase}>
                          No hay componentes asociados al docente.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={formClasses.group}>
                    <label
                      className={formClasses.label}
                      htmlFor="clases-docente"
                    >
                      Total de clases impartidas
                    </label>
                    <input
                      id="clases-docente"
                      type="number"
                      min="0"
                      step="1"
                      className={
                        erroresDocente.length > 0
                          ? formClasses.inputInvalid
                          : formClasses.input
                      }
                      value={clasesDocente}
                      onChange={(evento) =>
                        setClasesDocente(evento.target.value)
                      }
                    />
                    <p className={formClasses.helper}>
                      Puede dejar el campo en blanco si aun no desea registrar
                      la cantidad de clases.
                    </p>
                    {erroresDocente.length > 0 && (
                      <ul className="space-y-1">
                        {erroresDocente.map((mensaje, indice) => (
                          <li key={indice} className={formClasses.error}>
                            {mensaje}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className={formClasses.actions}>
                    <button
                      type="button"
                      className={`${primaryButtonBase} bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60`}
                      onClick={actualizarDocente}
                      disabled={guardandoDocente}
                    >
                      {guardandoDocente ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className={helperTextBase}>
                  Este aula no cuenta con un docente titular asignado.
                </p>
              )}
            </div>

            <div className={cardBase}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
                  <FaUserCog className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Especialistas asignados
                  </h3>
                  <p className={helperTextBase}>
                    Defina las clases impartidas por cada especialista y su
                    componente correspondiente.
                  </p>
                </div>
              </div>

              {aulaSeleccionada?.especialistas?.length ? (
                <div className="space-y-5">
                  {aulaSeleccionada.especialistas.map((registro) => {
                    const componenteId = registro?.componente?.id;
                    const registroKey = `${
                      registro?.personal?.id_personal ?? "especialista"
                    }-${componenteId ?? "componente"}`;
                    const erroresComponente =
                      erroresEspecialistas[componenteId] ?? [];
                    const guardando =
                      guardandoEspecialistas[componenteId] ?? false;

                    return (
                      <div
                        key={registroKey}
                        className="rounded-3xl border border-slate-200 p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-slate-900">
                              {registro.personal?.nombre_completo ??
                                "Especialista"}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              {registro.componente?.nombre ??
                                `Componente ${componenteId}`}
                            </p>
                          </div>
                          <span className={badgeBase}>
                            {registro.componente?.requiere_especialista
                              ? "Requiere especialista"
                              : "Complementario"}
                          </span>
                        </div>

                        <div className={formClasses.group}>
                          <label
                            className={formClasses.label}
                            htmlFor={`clases-especialista-${componenteId}`}
                          >
                            Total de clases impartidas
                          </label>
                          <input
                            id={`clases-especialista-${componenteId}`}
                            type="number"
                            min="0"
                            step="1"
                            className={
                              erroresComponente.length > 0
                                ? formClasses.inputInvalid
                                : formClasses.input
                            }
                            value={clasesEspecialistas[componenteId] ?? ""}
                            onChange={(evento) =>
                              setClasesEspecialistas((prev) => ({
                                ...prev,
                                [componenteId]: evento.target.value,
                              }))
                            }
                          />
                          <p className={formClasses.helper}>
                            Introduzca el total de clases impartidas para este
                            componente.
                          </p>
                          {erroresComponente.length > 0 && (
                            <ul className="space-y-1">
                              {erroresComponente.map((mensaje, indice) => (
                                <li key={indice} className={formClasses.error}>
                                  {mensaje}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className={formClasses.actions}>
                          <button
                            type="button"
                            className={`${primaryButtonBase} bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60`}
                            onClick={() => actualizarEspecialista(registro)}
                            disabled={guardando}
                          >
                            {guardando ? "Guardando..." : "Guardar cambios"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={helperTextBase}>
                  Esta aula no tiene especialistas registrados.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
