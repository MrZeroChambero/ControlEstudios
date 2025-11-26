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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Gestión de Parentescos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("estudiante");
              setEditando(null);
              setTipoManual("");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              tab === "estudiante"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaExchangeAlt /> Por Estudiante
          </button>
          <button
            onClick={() => {
              setTab("representante");
              setEditando(null);
              setTipoManual("");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              tab === "representante"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaExchangeAlt /> Por Representante
          </button>
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        Administra las relaciones de parentesco entre estudiantes y
        representantes. Un estudiante solo puede tener un padre y una madre; los
        demás tipos son opcionales.
      </p>

      {tab === "estudiante" && (
        <div className="grid md:grid-cols-2 gap-6">
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
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <select
                  value={tipoManual}
                  onChange={(e) => setTipoManual(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(estudianteSel && representanteSel
                    ? tiposPorGenero(representanteSel?.genero)
                    : tiposPermitidos
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <button
                  disabled={!representanteSel || !estudianteSel}
                  onClick={agregarParentescoEstudiante}
                  className="w-full bg-green-600 disabled:bg-gray-400 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaPlus /> Agregar Parentesco
                </button>
              </div>
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
        <div className="grid md:grid-cols-2 gap-6">
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
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <select
                  value={tipoManual}
                  onChange={(e) => setTipoManual(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {(representanteSel && estudianteSel
                    ? tiposPorGenero(representanteSel?.genero)
                    : tiposPermitidos
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <button
                  disabled={!representanteSel || !estudianteSel}
                  onClick={agregarParentescoRepresentante}
                  className="w-full bg-green-600 disabled:bg-gray-400 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaPlus /> Agregar Parentesco
                </button>
              </div>
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
