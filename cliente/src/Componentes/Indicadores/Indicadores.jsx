import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import {
  indicadoresLayout,
  indicadoresFormClasses,
  indicadoresTableClasses,
  indicadoresIconClasses,
  indicadoresPrimaryButton,
} from "./indicadoresEstilos";
import {
  obtenerAreasSelect,
  obtenerComponentesSelect,
  obtenerCompetencias,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
  actualizarVisibilidadIndicador,
} from "../Competencias/competenciasService";
import { IndicadorFormModal } from "../Competencias/IndicadorFormModal";
import {
  FaPlus,
  FaSyncAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { IndicadorViewModal } from "./IndicadorViewModal";

const layout = indicadoresLayout;
const formClasses = indicadoresFormClasses;
const tableClasses = indicadoresTableClasses;

export const Indicadores = () => {
  const [areas, setAreas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [competencias, setCompetencias] = useState([]);

  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [componenteSeleccionado, setComponenteSeleccionado] = useState("");
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState("");

  const [isLoadingCompetencias, setIsLoadingCompetencias] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");

  const [modalIndicador, setModalIndicador] = useState({
    abierto: false,
    modo: "crear",
    indicador: null,
  });

  const [modalVerIndicador, setModalVerIndicador] = useState({
    abierto: false,
    indicador: null,
  });

  const cargarCatalogos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const cargarCompetenciasDisponibles = useCallback(
    async (areaId, componenteId) => {
      setIsLoadingCompetencias(true);
      try {
        const registros = await obtenerCompetencias({
          areaId: areaId ? parseInt(areaId, 10) : undefined,
          componenteId: componenteId ? parseInt(componenteId, 10) : undefined,
        });
        setCompetencias(registros);

        if (
          competenciaSeleccionada &&
          !registros.some(
            (comp) =>
              comp.id_competencia?.toString() ===
              competenciaSeleccionada?.toString()
          )
        ) {
          setCompetenciaSeleccionada("");
        }
      } catch (error) {
        Swal.fire("Aviso", error.message, "warning");
        setCompetencias([]);
        setCompetenciaSeleccionada("");
      } finally {
        setIsLoadingCompetencias(false);
      }
    },
    [competenciaSeleccionada]
  );

  useEffect(() => {
    cargarCompetenciasDisponibles(areaSeleccionada, componenteSeleccionado);
  }, [areaSeleccionada, componenteSeleccionado, cargarCompetenciasDisponibles]);

  const componentesFiltrados = useMemo(() => {
    if (!areaSeleccionada) {
      return componentes;
    }
    return componentes.filter(
      (item) => item.fk_area?.toString() === areaSeleccionada.toString()
    );
  }, [componentes, areaSeleccionada]);

  const indicadoresDisponibles = useMemo(() => {
    return competencias.flatMap((competencia) => {
      const lista = Array.isArray(competencia.indicadores)
        ? competencia.indicadores
        : [];
      return lista.map((indicador) => ({
        ...indicador,
        competencia: {
          id: competencia.id_competencia,
          nombre: competencia.nombre_competencia,
        },
        componente: competencia.componente,
        area: competencia.area,
      }));
    });
  }, [competencias]);

  const indicadoresFiltrados = useMemo(() => {
    let registros = indicadoresDisponibles;

    if (areaSeleccionada) {
      registros = registros.filter(
        (item) => item.area?.id?.toString() === areaSeleccionada.toString()
      );
    }

    if (componenteSeleccionado) {
      registros = registros.filter(
        (item) =>
          item.componente?.id?.toString() === componenteSeleccionado.toString()
      );
    }

    if (competenciaSeleccionada) {
      registros = registros.filter(
        (item) =>
          item.competencia?.id?.toString() ===
          competenciaSeleccionada.toString()
      );
    }

    if (filtroTexto.trim() !== "") {
      const criterio = filtroTexto.trim().toLowerCase();
      registros = registros.filter((item) => {
        const texto =
          `${item.nombre_indicador} ${item.aspecto} ${item.competencia?.nombre} ${item.componente?.nombre} ${item.area?.nombre}`.toLowerCase();
        return texto.includes(criterio);
      });
    }

    return registros;
  }, [
    indicadoresDisponibles,
    areaSeleccionada,
    componenteSeleccionado,
    competenciaSeleccionada,
    filtroTexto,
  ]);

  const abrirModalCrear = () => {
    setModalIndicador({ abierto: true, modo: "crear", indicador: null });
  };

  const abrirModalEditar = useCallback((indicador) => {
    setModalIndicador({ abierto: true, modo: "editar", indicador });
  }, []);

  const cerrarModalIndicador = useCallback(() => {
    setModalIndicador({ abierto: false, modo: "crear", indicador: null });
  }, []);

  const abrirModalVerIndicador = useCallback((indicador) => {
    setModalVerIndicador({ abierto: true, indicador });
  }, []);

  const cerrarModalVerIndicador = useCallback(() => {
    setModalVerIndicador({ abierto: false, indicador: null });
  }, []);

  const recargarIndicadores = useCallback(async () => {
    await cargarCompetenciasDisponibles(
      areaSeleccionada,
      componenteSeleccionado
    );
  }, [areaSeleccionada, componenteSeleccionado, cargarCompetenciasDisponibles]);

  const manejarCrearIndicador = async (datos) => {
    if (!competenciaSeleccionada) {
      Swal.fire(
        "Aviso",
        "Seleccione una competencia antes de registrar un indicador.",
        "info"
      );
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

  const manejarEliminarIndicador = useCallback(
    async (indicador) => {
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
    },
    [recargarIndicadores]
  );

  const manejarToggleIndicador = useCallback(
    async (indicador) => {
      try {
        const nuevoEstado = indicador.ocultar === "si" ? "no" : "si";
        await actualizarVisibilidadIndicador(
          indicador.id_indicador,
          nuevoEstado
        );
        Swal.fire("Hecho", "Visibilidad actualizada.", "success");
        await recargarIndicadores();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    },
    [recargarIndicadores]
  );

  const columnas = useMemo(
    () => [
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
        width: "110px",
        right: true,
      },
      {
        name: "Competencia",
        selector: (row) => row.competencia?.nombre,
        sortable: true,
        grow: 1,
        wrap: true,
      },
      {
        name: "Componente",
        selector: (row) => row.componente?.nombre,
        sortable: true,
        wrap: true,
      },
      {
        name: "Area",
        selector: (row) => row.area?.nombre,
        sortable: true,
        wrap: true,
      },
      {
        name: "Visible",
        selector: (row) => (row.ocultar === "si" ? "No" : "Si"),
        width: "110px",
        center: true,
        sortable: true,
      },
      {
        name: "Acciones",
        width: "190px",
        center: true,
        cell: (row) => (
          <div className={tableClasses.actionGroup}>
            <button
              type="button"
              onClick={() => abrirModalVerIndicador(row)}
              className={`${tableClasses.actionButton} ${tableClasses.viewButton}`}
              title="Ver detalle del indicador"
            >
              <FaEye className={indicadoresIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => manejarToggleIndicador(row)}
              className={`${tableClasses.actionButton} ${
                row.ocultar === "si"
                  ? tableClasses.toggleOff
                  : tableClasses.toggleOn
              }`}
              title={
                row.ocultar === "si" ? "Mostrar indicador" : "Ocultar indicador"
              }
            >
              {row.ocultar === "si" ? (
                <FaToggleOff className={indicadoresIconClasses.base} />
              ) : (
                <FaToggleOn className={indicadoresIconClasses.base} />
              )}
            </button>
            <button
              type="button"
              onClick={() => abrirModalEditar(row)}
              className={`${tableClasses.actionButton} ${tableClasses.editButton}`}
              title="Editar indicador"
            >
              <FaEdit className={indicadoresIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => manejarEliminarIndicador(row)}
              className={`${tableClasses.actionButton} ${tableClasses.deleteButton}`}
              title="Eliminar indicador"
            >
              <FaTrash className={indicadoresIconClasses.base} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [
      abrirModalEditar,
      abrirModalVerIndicador,
      manejarEliminarIndicador,
      manejarToggleIndicador,
    ]
  );

  const barraBusqueda = (
    <div className={tableClasses.filterContainer}>
      <input
        type="search"
        value={filtroTexto}
        onChange={(evento) => setFiltroTexto(evento.target.value)}
        placeholder="Buscar por indicador, competencia, componente o area"
        className={tableClasses.filterInput}
      />
    </div>
  );

  const competenciaActual = useMemo(() => {
    return competencias.find(
      (item) =>
        item.id_competencia?.toString() === competenciaSeleccionada?.toString()
    );
  }, [competencias, competenciaSeleccionada]);

  return (
    <section className="p-6">
      <div className={layout.container}>
        <header className={`${layout.header} items-start`}>
          <div>
            <h1 className={layout.title}>Gestion de indicadores</h1>
            <p className={layout.description}>
              Por defecto se muestran todos los indicadores registrados. Use los
              filtros para enfocarse en un area, componente o competencia
              especificos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => recargarIndicadores()}
              className={formClasses.ghostButton}
              disabled={isLoadingCompetencias}
            >
              <FaSyncAlt className="h-4 w-4" />
              Recargar
            </button>
            <button
              type="button"
              onClick={abrirModalCrear}
              className={indicadoresPrimaryButton}
              disabled={!competenciaSeleccionada}
            >
              <FaPlus className="h-4 w-4" />
              Nuevo indicador
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className={formClasses.fieldWrapper}>
            <label className={formClasses.label}>Area de aprendizaje</label>
            <select
              className={formClasses.select}
              value={areaSeleccionada}
              onChange={(evento) => {
                const valor = evento.target.value;
                setAreaSeleccionada(valor);
                setComponenteSeleccionado("");
                setCompetenciaSeleccionada("");
              }}
            >
              <option value="">Todas las areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
            <p className={formClasses.helper}>
              Filtra los componentes y competencias vinculados a esta area.
            </p>
          </div>

          <div className={formClasses.fieldWrapper}>
            <label className={formClasses.label}>Componente</label>
            <select
              className={formClasses.select}
              value={componenteSeleccionado}
              onChange={(evento) => {
                const valor = evento.target.value;
                setComponenteSeleccionado(valor);
                setCompetenciaSeleccionada("");
              }}
              disabled={componentesFiltrados.length === 0}
            >
              <option value="">Todos los componentes</option>
              {componentesFiltrados.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.nombre}
                </option>
              ))}
            </select>
            <p className={formClasses.helper}>
              Opcional: limite la vista a un componente especifico.
            </p>
          </div>

          <div className={formClasses.fieldWrapper}>
            <label className={formClasses.label}>Competencia</label>
            <select
              className={formClasses.select}
              value={competenciaSeleccionada}
              onChange={(evento) =>
                setCompetenciaSeleccionada(evento.target.value)
              }
              disabled={competencias.length === 0}
            >
              <option value="">Todas las competencias</option>
              {competencias.map((competencia) => (
                <option
                  key={competencia.id_competencia}
                  value={competencia.id_competencia}
                >
                  {competencia.nombre_competencia}
                </option>
              ))}
            </select>
            <p className={formClasses.helper}>
              Seleccione una competencia para habilitar la creacion de
              indicadores.
            </p>
          </div>
        </div>

        <DataTable
          columns={columnas}
          data={indicadoresFiltrados}
          progressPending={isLoadingCompetencias}
          progressComponent={
            <p className={tableClasses.helperText}>Cargando indicadores...</p>
          }
          noDataComponent={
            <p className={tableClasses.helperText}>
              {isLoadingCompetencias
                ? "Cargando indicadores..."
                : "No hay indicadores registrados para los filtros actuales."}
            </p>
          }
          customStyles={{
            headRow: {
              style: {
                backgroundColor: "#f8fafc",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
              },
            },
            headCells: {
              style: {
                paddingLeft: "16px",
                paddingRight: "16px",
              },
            },
            cells: {
              style: {
                paddingLeft: "16px",
                paddingRight: "16px",
              },
            },
          }}
          subHeader
          subHeaderComponent={barraBusqueda}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          highlightOnHover
          striped
          responsive
          persistTableHead
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
        competencia={competenciaActual}
      />

      <IndicadorViewModal
        isOpen={modalVerIndicador.abierto}
        onClose={cerrarModalVerIndicador}
        indicador={modalVerIndicador.indicador}
      />
    </section>
  );
};
