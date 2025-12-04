import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaExchangeAlt } from "react-icons/fa";
import {
  listarEstudiantesActivos,
  listarRepresentantesActivos,
  listarParentescosPorEstudiante,
  listarParentescosPorRepresentante,
  crearParentesco,
  actualizarParentesco,
  eliminarParentesco,
  inferirTipoPadreMadre,
  obtenerTiposParentesco,
} from "./parentescoService";
import SeleccionEntidad from "./SeleccionEntidad";
import TablaParentescosEstudiante from "./TablaParentescosEstudiante";
import TablaParentescosRepresentante from "./TablaParentescosRepresentante";
import {
  contenidosLayout,
  contenidosFormClasses,
  primaryButtonBase,
} from "../EstilosCliente/EstilosClientes";

// Componente principal de gestión de Parentescos
export const Parentesco = () => {
  const [tab, setTab] = useState("estudiante"); // 'estudiante' | 'representante'
  const [estudiantes, setEstudiantes] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  const [estudianteSel, setEstudianteSel] = useState(null);
  const [representanteSel, setRepresentanteSel] = useState(null);
  const [parentescosEstudiante, setParentescosEstudiante] = useState([]);
  const [parentescosRepresentante, setParentescosRepresentante] = useState([]);
  // loading local removido (no se usa actualmente)
  const [tipoManual, setTipoManual] = useState(""); // Para otros tipos distintos padre/madre
  const [editando, setEditando] = useState(null); // id_parentesco en edición
  const [tipoEdicion, setTipoEdicion] = useState("");
  const [tiposPermitidos, setTiposPermitidos] = useState(["representante"]);

  // Tipos válidos según género del representante (F/M) + 'otro'
  const tiposPorGenero = (genero) => {
    if (genero === "F") return ["madre", "abuela", "hermana", "tia", "otro"];
    if (genero === "M") return ["padre", "abuelo", "hermano", "tio", "otro"];
    return tiposPermitidos;
  };

  // Cargar listas base
  useEffect(() => {
    listarEstudiantesActivos(setEstudiantes, Swal);
    listarRepresentantesActivos(setRepresentantes, Swal);
    (async () => {
      const tipos = await obtenerTiposParentesco(Swal);
      setTiposPermitidos(tipos);
    })();
  }, []);

  // Cargar parentescos cuando se selecciona estudiante
  useEffect(() => {
    (async () => {
      if (estudianteSel) {
        const lista = await listarParentescosPorEstudiante(
          estudianteSel.id_estudiante || estudianteSel.id_estudiante,
          Swal
        );
        setParentescosEstudiante(lista);
      } else setParentescosEstudiante([]);
    })();
  }, [estudianteSel]);

  // Cargar parentescos cuando se selecciona representante
  useEffect(() => {
    (async () => {
      if (representanteSel) {
        const lista = await listarParentescosPorRepresentante(
          representanteSel.id_representante,
          Swal
        );
        setParentescosRepresentante(lista);
      } else setParentescosRepresentante([]);
    })();
  }, [representanteSel]);

  const tienePadre = (lista) =>
    lista.some((p) => p.tipo_parentesco === "padre");
  const tieneMadre = (lista) =>
    lista.some((p) => p.tipo_parentesco === "madre");
  // función duplicada no utilizada eliminada

  // Agregar parentesco (contexto estudiante)
  const agregarParentescoEstudiante = async () => {
    if (!estudianteSel || !representanteSel) {
      Swal.fire("Aviso", "Seleccione estudiante y representante", "warning");
      return;
    }
    const lista = parentescosEstudiante;
    // Tipo automático padre/madre con filtro por género del representante
    let tipo = tipoManual.trim();
    const opcionesValidas = tiposPorGenero(representanteSel?.genero);
    if (!tipo) tipo = inferirTipoPadreMadre(representanteSel?.genero);
    if (!opcionesValidas.includes(tipo)) {
      Swal.fire(
        "Tipo inválido",
        "El tipo no corresponde al género del representante",
        "warning"
      );
      return;
    }
    // Validaciones UI
    if (tipo === "padre" && tienePadre(lista)) {
      Swal.fire("Error", "El estudiante ya tiene padre", "error");
      return;
    }
    if (tipo === "madre" && tieneMadre(lista)) {
      Swal.fire("Error", "El estudiante ya tiene madre", "error");
      return;
    }
    if (
      lista.some(
        (p) => p.id_representante === representanteSel.id_representante
      )
    ) {
      Swal.fire("Error", "Ya existe parentesco con ese representante", "error");
      return;
    }
    const payload = {
      fk_estudiante: estudianteSel.id_estudiante,
      fk_representante: representanteSel.id_representante,
      tipo_parentesco: tipo,
    };
    const creado = await crearParentesco(payload, Swal);
    if (creado) {
      Swal.fire("Éxito", "Parentesco agregado", "success");
      const listaActual = await listarParentescosPorEstudiante(
        estudianteSel.id_estudiante,
        Swal
      );
      setParentescosEstudiante(listaActual);
      setTipoManual("");
    }
  };

  // Agregar parentesco (contexto representante)
  const agregarParentescoRepresentante = async () => {
    if (!representanteSel || !estudianteSel) {
      Swal.fire("Aviso", "Seleccione representante y estudiante", "warning");
      return;
    }
    const lista = parentescosRepresentante;
    let tipo = tipoManual.trim();
    const opcionesValidas = tiposPorGenero(representanteSel?.genero);
    if (!tipo) tipo = inferirTipoPadreMadre(representanteSel?.genero);
    if (!opcionesValidas.includes(tipo)) {
      Swal.fire(
        "Tipo inválido",
        "El tipo no corresponde al género del representante",
        "warning"
      );
      return;
    }
    // Validaciones: un representante puede ser padre/madre de muchos estudiantes, no hace falta revisar padre/madre globalmente; sólo duplicado exacto.
    if (lista.some((p) => p.id_estudiante === estudianteSel.id_estudiante)) {
      // Si ya existe relación con ese estudiante, impedir duplicado
      Swal.fire("Error", "Ya existe parentesco con ese estudiante", "error");
      return;
    }
    // Pero también revisar en estudiante la regla de único padre/madre
    const listaEst = await listarParentescosPorEstudiante(
      estudianteSel.id_estudiante,
      Swal
    );
    if (tipo === "padre" && tienePadre(listaEst)) {
      Swal.fire("Error", "El estudiante ya tiene padre", "error");
      return;
    }
    if (tipo === "madre" && tieneMadre(listaEst)) {
      Swal.fire("Error", "El estudiante ya tiene madre", "error");
      return;
    }
    const payload = {
      fk_estudiante: estudianteSel.id_estudiante,
      fk_representante: representanteSel.id_representante,
      tipo_parentesco: tipo,
    };
    const creado = await crearParentesco(payload, Swal);
    if (creado) {
      Swal.fire("Éxito", "Parentesco agregado", "success");
      const listaRep = await listarParentescosPorRepresentante(
        representanteSel.id_representante,
        Swal
      );
      setParentescosRepresentante(listaRep);
      setTipoManual("");
    }
  };

  const iniciarEdicion = (p, contexto) => {
    setEditando({ id: p.id_parentesco, contexto });
    setTipoEdicion(p.tipo_parentesco);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setTipoEdicion("");
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    const { id, contexto } = editando;
    // Identificar el id_estudiante del registro en edición
    let idEstudianteValidar = null;
    if (contexto === "estudiante") {
      const registro = parentescosEstudiante.find(
        (p) => p.id_parentesco === id
      );
      idEstudianteValidar =
        estudianteSel?.id_estudiante || registro?.id_estudiante || null;
    } else {
      const registro = parentescosRepresentante.find(
        (p) => p.id_parentesco === id
      );
      idEstudianteValidar =
        registro?.id_estudiante || estudianteSel?.id_estudiante || null;
    }
    if (!idEstudianteValidar) {
      Swal.fire(
        "Error",
        "No se pudo identificar el estudiante para validar",
        "error"
      );
      return;
    }
    // Validación por género antes de actualizar
    const opcionesValidasGenero = (() => {
      const genero =
        contexto === "estudiante"
          ? parentescosEstudiante.find((p) => p.id_parentesco === id)
              ?.rep_genero || representanteSel?.genero
          : representanteSel?.genero;
      if (genero === "F") return ["madre", "abuela", "hermana", "tia", "otro"];
      if (genero === "M") return ["padre", "abuelo", "hermano", "tio", "otro"];
      return tiposPermitidos;
    })();
    if (!opcionesValidasGenero.includes(tipoEdicion)) {
      Swal.fire(
        "Tipo inválido",
        "El tipo no corresponde al género del representante",
        "warning"
      );
      return;
    }
    // Validar unicidad padre/madre antes de actualizar
    if (tipoEdicion === "padre" || tipoEdicion === "madre") {
      const listaEst = await listarParentescosPorEstudiante(
        idEstudianteValidar,
        Swal
      );
      const listaFiltrada = listaEst.filter((p) => p.id_parentesco !== id);
      if (
        tipoEdicion === "padre" &&
        listaFiltrada.some((p) => p.tipo_parentesco === "padre")
      ) {
        Swal.fire("Error", "Ya existe padre para el estudiante", "error");
        return;
      }
      if (
        tipoEdicion === "madre" &&
        listaFiltrada.some((p) => p.tipo_parentesco === "madre")
      ) {
        Swal.fire("Error", "Ya existe madre para el estudiante", "error");
        return;
      }
    }
    const ok = await actualizarParentesco(
      id,
      { tipo_parentesco: tipoEdicion },
      Swal
    );
    if (ok) {
      Swal.fire("Éxito", "Parentesco actualizado", "success");
      // Refrescar listas según contexto y selección
      if (contexto === "estudiante" && estudianteSel) {
        const lista = await listarParentescosPorEstudiante(
          estudianteSel.id_estudiante,
          Swal
        );
        setParentescosEstudiante(lista);
      }
      if (contexto === "representante" && representanteSel) {
        const lista = await listarParentescosPorRepresentante(
          representanteSel.id_representante,
          Swal
        );
        setParentescosRepresentante(lista);
      }
      cancelarEdicion();
    }
  };

  const quitarParentesco = async (p, contexto) => {
    const conf = await Swal.fire({
      title: "Confirmar",
      text: "¿Eliminar parentesco?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!conf.isConfirmed) return;
    const ok = await eliminarParentesco(p.id_parentesco, Swal);
    if (ok) {
      Swal.fire("Eliminado", "Parentesco eliminado", "success");
      if (contexto === "estudiante" && estudianteSel) {
        const lista = await listarParentescosPorEstudiante(
          estudianteSel.id_estudiante,
          Swal
        );
        setParentescosEstudiante(lista);
      }
      if (contexto === "representante" && representanteSel) {
        const lista = await listarParentescosPorRepresentante(
          representanteSel.id_representante,
          Swal
        );
        setParentescosRepresentante(lista);
      }
    }
  };

  // Se sustituyen tablas tradicionales por componentes DataTable

  const tabButtonBase = `${primaryButtonBase} bg-blue-500 text-white focus:ring-blue-200/60`;
  const tabButtonInactive = "hover:bg-blue-600";
  const tabActiveVariants = {
    estudiante:
      "bg-blue-700 hover:bg-blue-700 focus:ring-blue-400/60 shadow-lg",
    representante:
      "bg-blue-700 hover:bg-blue-700 focus:ring-blue-400/60 shadow-lg",
  };

  return (
    <div className={contenidosLayout.container}>
      <div className={`${contenidosLayout.header} items-start`}>
        <div className="flex flex-col gap-1">
          <h2 className={contenidosLayout.title}>Gestión de Parentescos</h2>
          <p className="text-sm text-slate-500">
            Relaciona estudiantes con sus representantes y mantén control de los
            vínculos familiares registrados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTab("estudiante");
              setEditando(null);
              setTipoManual("");
            }}
            className={`${tabButtonBase} ${
              tab === "estudiante"
                ? tabActiveVariants.estudiante
                : tabButtonInactive
            }`}
          >
            <FaExchangeAlt className="h-4 w-4" />
            <span>Por Estudiante</span>
          </button>
          <button
            onClick={() => {
              setTab("representante");
              setEditando(null);
              setTipoManual("");
            }}
            className={`${tabButtonBase} ${
              tab === "representante"
                ? tabActiveVariants.representante
                : tabButtonInactive
            }`}
          >
            <FaExchangeAlt className="h-4 w-4" />
            <span>Por Representante</span>
          </button>
        </div>
      </div>

      <p className={contenidosLayout.description}>
        Un estudiante solo puede registrar un padre y una madre. Los demás tipos
        de parentesco no tienen restricciones adicionales.
      </p>

      {tab === "estudiante" && (
        <div className="space-y-6">
          <div className="space-y-6">
            <SeleccionEntidad
              tipo="estudiante"
              items={estudiantes}
              seleccionado={estudianteSel}
              onSelect={(i) => setEstudianteSel(i)}
            />
            <SeleccionEntidad
              tipo="representante"
              items={representantes}
              seleccionado={representanteSel}
              onSelect={(i) => setRepresentanteSel(i)}
            />
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/60 p-4 shadow-sm">
            <div className="space-y-3">
              <div className={contenidosFormClasses.fieldWrapper}>
                <label
                  className={contenidosFormClasses.label}
                  htmlFor="tipo-estudiante"
                >
                  Tipo de parentesco
                </label>
                <select
                  id="tipo-estudiante"
                  value={tipoManual}
                  onChange={(e) => setTipoManual(e.target.value)}
                  className={`${contenidosFormClasses.select} capitalize`}
                >
                  <option value="">Seleccionar tipo</option>
                  {(estudianteSel && representanteSel
                    ? tiposPorGenero(representanteSel?.genero)
                    : tiposPermitidos
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className={contenidosFormClasses.helper}>
                  Si no eliges un tipo, se inferirá automáticamente según el
                  género del representante.
                </p>
              </div>
              <button
                type="button"
                disabled={!representanteSel || !estudianteSel}
                onClick={agregarParentescoEstudiante}
                className={`${contenidosFormClasses.primaryButton} flex w-full items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-60`}
              >
                <FaPlus className="h-4 w-4" />
                <span>Agregar parentesco</span>
              </button>
            </div>
            <TablaParentescosEstudiante
              data={parentescosEstudiante}
              editando={editando}
              tipoEdicion={tipoEdicion}
              setTipoEdicion={setTipoEdicion}
              iniciarEdicion={iniciarEdicion}
              cancelarEdicion={cancelarEdicion}
              guardarEdicion={guardarEdicion}
              quitarParentesco={quitarParentesco}
              estudianteSeleccionado={estudianteSel}
              tiposPermitidos={tiposPermitidos}
            />
          </div>
        </div>
      )}

      {tab === "representante" && (
        <div className="space-y-6">
          <div className="space-y-6">
            <SeleccionEntidad
              tipo="representante"
              items={representantes}
              seleccionado={representanteSel}
              onSelect={(i) => setRepresentanteSel(i)}
            />
            <SeleccionEntidad
              tipo="estudiante"
              items={estudiantes}
              seleccionado={estudianteSel}
              onSelect={(i) => setEstudianteSel(i)}
            />
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/60 p-4 shadow-sm">
            <div className="space-y-3">
              <div className={contenidosFormClasses.fieldWrapper}>
                <label
                  className={contenidosFormClasses.label}
                  htmlFor="tipo-representante"
                >
                  Tipo de parentesco
                </label>
                <select
                  id="tipo-representante"
                  value={tipoManual}
                  onChange={(e) => setTipoManual(e.target.value)}
                  className={`${contenidosFormClasses.select} capitalize`}
                >
                  <option value="">Seleccionar tipo</option>
                  {(representanteSel && estudianteSel
                    ? tiposPorGenero(representanteSel?.genero)
                    : tiposPermitidos
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className={contenidosFormClasses.helper}>
                  La relación padre/madre sigue limitada a una única
                  coincidencia por estudiante.
                </p>
              </div>
              <button
                type="button"
                disabled={!representanteSel || !estudianteSel}
                onClick={agregarParentescoRepresentante}
                className={`${contenidosFormClasses.primaryButton} flex w-full items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-60`}
              >
                <FaPlus className="h-4 w-4" />
                <span>Agregar parentesco</span>
              </button>
            </div>
            <TablaParentescosRepresentante
              data={parentescosRepresentante}
              editando={editando}
              tipoEdicion={tipoEdicion}
              setTipoEdicion={setTipoEdicion}
              iniciarEdicion={iniciarEdicion}
              cancelarEdicion={cancelarEdicion}
              guardarEdicion={guardarEdicion}
              quitarParentesco={quitarParentesco}
              representanteSeleccionado={representanteSel}
              tiposPermitidos={tiposPermitidos}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Parentesco;
