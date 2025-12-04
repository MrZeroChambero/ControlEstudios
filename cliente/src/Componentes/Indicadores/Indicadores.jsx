import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import {
  baseContainer,
  baseHeader,
  baseTitle,
  baseDescription,
  primaryButtonBase,
  fieldBase,
  actionGroupBase,
  neutralButtonBase,
} from "../EstilosCliente/EstilosClientes";
import {
  obtenerAreasSelect,
  obtenerComponentesSelect,
  obtenerCompetencias,
  obtenerIndicadoresPorCompetencia,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
  actualizarVisibilidadIndicador,
} from "../Competencias/competenciasService";
import { IndicadorFormModal } from "../Competencias/IndicadorFormModal";

const construirColumnas = (onEditar, onEliminar, onToggle) => [
  {
    name: "Indicador",
    selector: (row) => row.nombre_indicador,
    grow: 2,
    wrap: true,
  },
  {
    name: "Aspecto",
    selector: (row) => row.aspecto,
    sortable: true,
    width: "140px",
  },
  {
    name: "Orden",
    selector: (row) => row.orden,
    sortable: true,
    width: "100px",
    right: true,
  },
  {
    name: "Visible",
    selector: (row) => (row.ocultar === "si" ? "No" : "Si"),
    width: "110px",
    sortable: true,
  },
  {
    name: "Acciones",
    cell: (row) => (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(row)}
          className={`${neutralButtonBase} border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50`}
        >
          {row.ocultar === "si" ? "Mostrar" : "Ocultar"}
        </button>
        <button
          type="button"
          onClick={() => onEditar(row)}
          className={`${primaryButtonBase} bg-slate-700 px-3 py-1 text-xs hover:bg-slate-800`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onEliminar(row)}
          className={`${neutralButtonBase} border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100`}
        >
          Eliminar
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

export const Indicadores = () => {
  const [areas, setAreas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [indicadores, setIndicadores] = useState([]);

  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [componenteSeleccionado, setComponenteSeleccionado] = useState("");
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState("");

  const [isLoadingCompetencias, setIsLoadingCompetencias] = useState(false);
  const [isLoadingIndicadores, setIsLoadingIndicadores] = useState(false);

  const [modalIndicador, setModalIndicador] = useState({
    abierto: false,
    modo: "crear",
    indicador: null,
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [areasData, componentesData] = await Promise.all([
          obtenerAreasSelect(),
          obtenerComponentesSelect(),
        ]);
        setAreas(areasData);
        setComponentes(componentesData);
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };

    cargarCatalogos();
  }, []);

  useEffect(() => {
    const cargarCompetenciasDisponibles = async () => {
      setIsLoadingCompetencias(true);
      try {
        const registros = await obtenerCompetencias({
          areaId: areaSeleccionada ? parseInt(areaSeleccionada, 10) : undefined,
          componenteId: componenteSeleccionado
            ? parseInt(componenteSeleccionado, 10)
            : undefined,
        });
        setCompetencias(registros);
        if (registros.length === 0) {
          setCompetenciaSeleccionada("");
          setIndicadores([]);
        }
      } catch (error) {
        Swal.fire("Aviso", error.message, "warning");
        setCompetencias([]);
        setCompetenciaSeleccionada("");
        setIndicadores([]);
      } finally {
        setIsLoadingCompetencias(false);
      }
    };

    cargarCompetenciasDisponibles();
  }, [areaSeleccionada, componenteSeleccionado]);

  useEffect(() => {
    const cargarIndicadores = async () => {
      if (!competenciaSeleccionada) {
        setIndicadores([]);
        return;
      }

      setIsLoadingIndicadores(true);
      try {
        const respuesta = await obtenerIndicadoresPorCompetencia(
          parseInt(competenciaSeleccionada, 10)
        );
        setIndicadores(respuesta.indicadores);
      } catch (error) {
        Swal.fire("Aviso", error.message, "warning");
        setIndicadores([]);
      } finally {
        setIsLoadingIndicadores(false);
      }
    };

    cargarIndicadores();
  }, [competenciaSeleccionada]);

  const componentesFiltrados = useMemo(() => {
    if (!areaSeleccionada) {
      return componentes;
    }
    return componentes.filter(
      (item) => item.fk_area?.toString() === areaSeleccionada.toString()
    );
  }, [componentes, areaSeleccionada]);

  const columnas = useMemo(
    () =>
      construirColumnas(
        abrirModalEditar,
        manejarEliminarIndicador,
        manejarToggleIndicador
      ),
    [indicadores]
  );

  function abrirModalCrear() {
    setModalIndicador({ abierto: true, modo: "crear", indicador: null });
  }

  function abrirModalEditar(indicador) {
    setModalIndicador({ abierto: true, modo: "editar", indicador });
  }

  function cerrarModalIndicador() {
    setModalIndicador({ abierto: false, modo: "crear", indicador: null });
  }

  const manejarCrearIndicador = async (datos) => {
    if (!competenciaSeleccionada) {
      Swal.fire("Aviso", "Seleccione una competencia primero.", "info");
      return;
    }

    const payload = {
      ...datos,
      fk_competencia: parseInt(competenciaSeleccionada, 10),
    };

    try {
      await crearIndicador(payload);
      Swal.fire("Hecho", "Indicador registrado correctamente.", "success");
      cerrarModalIndicador();
      await recargarIndicadores();
    } catch (error) {
      if (error?.validation) {
        throw error;
      }
      Swal.fire("Error", error.message, "error");
      throw error;
    }
  };

  const manejarActualizarIndicador = async (indicador, datos) => {
    try {
      await actualizarIndicador(indicador.id_indicador, datos);
      Swal.fire("Hecho", "Indicador actualizado correctamente.", "success");
      cerrarModalIndicador();
      await recargarIndicadores();
    } catch (error) {
      if (error?.validation) {
        throw error;
      }
      Swal.fire("Error", error.message, "error");
      throw error;
    }
  };

  async function manejarEliminarIndicador(indicador) {
    const confirmacion = await Swal.fire({
      title: "¿Desea eliminar el indicador?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await eliminarIndicador(indicador.id_indicador);
      Swal.fire("Hecho", "Indicador eliminado correctamente.", "success");
      await recargarIndicadores();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }

  async function manejarToggleIndicador(indicador) {
    try {
      const nuevoEstado = indicador.ocultar === "si" ? "no" : "si";
      await actualizarVisibilidadIndicador(indicador.id_indicador, nuevoEstado);
      Swal.fire("Hecho", "Visibilidad actualizada.", "success");
      await recargarIndicadores();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }

  const recargarIndicadores = async () => {
    if (!competenciaSeleccionada) {
      return;
    }

    try {
      const respuesta = await obtenerIndicadoresPorCompetencia(
        parseInt(competenciaSeleccionada, 10)
      );
      setIndicadores(respuesta.indicadores);
    } catch (error) {
      Swal.fire("Aviso", error.message, "warning");
      setIndicadores([]);
    }
  };

  return (
    <section className="p-6">
      <div className={baseContainer}>
        <header className={baseHeader}>
          <div>
            <h1 className={baseTitle}>Gestion de indicadores</h1>
            <p className={baseDescription}>
              Seleccione un area, componente y competencia para administrar los
              indicadores asociados. Los indicadores se crean visibles por
              defecto.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalCrear}
            className={`${primaryButtonBase} bg-blue-600 hover:bg-blue-700`}
            disabled={!competenciaSeleccionada}
          >
            Nuevo indicador
          </button>
        </header>

        <div className={`${actionGroupBase} mb-6 flex-col gap-4 md:flex-row`}>
          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Area de aprendizaje
            </label>
            <select
              className={fieldBase}
              value={areaSeleccionada}
              onChange={(evento) => {
                setAreaSeleccionada(evento.target.value);
                setComponenteSeleccionado("");
                setCompetenciaSeleccionada("");
              }}
            >
              <option value="">Seleccione un area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Componente
            </label>
            <select
              className={fieldBase}
              value={componenteSeleccionado}
              onChange={(evento) => {
                setComponenteSeleccionado(evento.target.value);
                setCompetenciaSeleccionada("");
              }}
              disabled={!areaSeleccionada}
            >
              <option value="">Seleccione un componente</option>
              {componentesFiltrados.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Competencia
            </label>
            <select
              className={fieldBase}
              value={competenciaSeleccionada}
              onChange={(evento) =>
                setCompetenciaSeleccionada(evento.target.value)
              }
              disabled={isLoadingCompetencias || competencias.length === 0}
            >
              <option value="">Seleccione una competencia</option>
              {competencias.map((competencia) => (
                <option
                  key={competencia.id_competencia}
                  value={competencia.id_competencia}
                >
                  {competencia.nombre_competencia}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columnas}
          data={indicadores}
          progressPending={isLoadingIndicadores}
          pagination
          highlightOnHover
          noDataComponent={
            competenciaSeleccionada
              ? "No hay indicadores registrados para la competencia seleccionada."
              : "Seleccione una competencia para ver sus indicadores."
          }
        />
      </div>

      <IndicadorFormModal
        isOpen={modalIndicador.abierto}
        onClose={cerrarModalIndicador}
        onSubmit={async (datos) => {
          if (modalIndicador.modo === "editar" && modalIndicador.indicador) {
            await manejarActualizarIndicador(modalIndicador.indicador, datos);
          } else {
            await manejarCrearIndicador(datos);
          }
        }}
        modo={modalIndicador.modo}
        indicador={modalIndicador.indicador}
        competencia={competencias.find(
          (item) =>
            item.id_competencia?.toString() ===
            competenciaSeleccionada?.toString()
        )}
      />
    </section>
  );
};
