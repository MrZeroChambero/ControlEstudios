import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import {
  contenidosFormClasses,
  contenidosTableClasses,
  temasTableClasses,
  contenidosIconClasses,
  neutralButtonBase,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { IndicadorFormModal } from "./IndicadorFormModal";

const construirColumnas = (onEditar, onEliminar, onToggle) => [
  {
    name: "Nombre",
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
    name: "Visible",
    selector: (row) => (row.ocultar === "si" ? "No" : "Si"),
    width: "120px",
    sortable: true,
    center: true,
  },
  {
    name: "Acciones",
    width: "160px",
    center: true,
    cell: (row) => (
      <div className={temasTableClasses.actionGroup}>
        <button
          type="button"
          onClick={() => onToggle(row)}
          className={`${temasTableClasses.actionButton} ${
            row.ocultar === "si"
              ? temasTableClasses.toggleOff
              : temasTableClasses.toggleOn
          }`}
          title={
            row.ocultar === "si" ? "Mostrar indicador" : "Ocultar indicador"
          }
        >
          {row.ocultar === "si" ? (
            <FaToggleOff className={contenidosIconClasses.base} />
          ) : (
            <FaToggleOn className={contenidosIconClasses.base} />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEditar(row)}
          className={`${temasTableClasses.actionButton} ${temasTableClasses.editButton}`}
          title="Editar indicador"
        >
          <FaEdit className={contenidosIconClasses.base} />
        </button>
        <button
          type="button"
          onClick={() => onEliminar(row)}
          className={`${temasTableClasses.actionButton} ${temasTableClasses.deleteButton}`}
          title="Eliminar indicador"
        >
          <FaTrash className={contenidosIconClasses.base} />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

export const IndicadoresModal = ({
  isOpen,
  onClose,
  competencia,
  indicadores = [],
  isLoading = false,
  onCrearIndicador,
  onActualizarIndicador,
  onEliminarIndicador,
  onToggleOcultar,
}) => {
  const [filtro, setFiltro] = useState("");
  const [modalIndicador, setModalIndicador] = useState({
    abierto: false,
    modo: "crear",
    indicador: null,
  });

  const registrosFiltrados = useMemo(() => {
    if (!filtro) {
      return indicadores;
    }

    const criterio = filtro.toLowerCase();
    return indicadores.filter((item) =>
      `${item.nombre_indicador} ${item.aspecto}`
        .toLowerCase()
        .includes(criterio)
    );
  }, [indicadores, filtro]);

  const handleCrear = useCallback(() => {
    setModalIndicador({ abierto: true, modo: "crear", indicador: null });
  }, []);

  const handleEditar = useCallback((indicador) => {
    setModalIndicador({ abierto: true, modo: "editar", indicador });
  }, []);

  const handleEliminar = useCallback(
    (indicador) => {
      onEliminarIndicador?.(indicador);
    },
    [onEliminarIndicador]
  );

  const handleToggle = useCallback(
    (indicador) => {
      onToggleOcultar?.(indicador);
    },
    [onToggleOcultar]
  );

  const cerrarModalIndicador = useCallback(() => {
    setModalIndicador({ abierto: false, modo: "crear", indicador: null });
  }, []);

  const columnas = useMemo(
    () => construirColumnas(handleEditar, handleEliminar, handleToggle),
    [handleEditar, handleEliminar, handleToggle]
  );

  const manejarEnvioIndicador = async (datos) => {
    if (modalIndicador.modo === "editar" && modalIndicador.indicador) {
      await onActualizarIndicador?.(modalIndicador.indicador, datos);
    } else {
      await onCrearIndicador?.(datos);
    }
  };

  if (!isOpen) {
    return null;
  }

  const barraHerramientas = (
    <div className={temasTableClasses.filterContainer}>
      <input
        type="search"
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
        placeholder="Filtrar indicadores por nombre o aspecto"
        className={temasTableClasses.filterInput}
      />
      <span className={temasTableClasses.stats}>
        {registrosFiltrados.length} indicador
        {registrosFiltrados.length === 1 ? "" : "es"} encontrados
      </span>
      <button
        type="button"
        onClick={handleCrear}
        className={temasTableClasses.addButton}
      >
        <FaPlus className={contenidosIconClasses.base} />
        <span>Agregar indicador</span>
      </button>
    </div>
  );

  const estilosPersonalizados = {
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
  };

  const componenteNombre =
    competencia?.componente?.nombre || competencia?.componente || "";
  const modalSubtitle = competencia
    ? componenteNombre
      ? `${competencia.nombre_competencia} - ${componenteNombre}`
      : competencia.nombre_competencia
    : null;

  return (
    <>
      <VentanaModal
        isOpen={isOpen}
        onClose={onClose}
        title="Indicadores de la competencia"
        subtitle={modalSubtitle}
        size="xl"
        contentClassName="max-w-5xl"
        bodyClassName="space-y-6"
      >
        <DataTable
          columns={columnas}
          data={registrosFiltrados}
          progressPending={isLoading}
          progressComponent={
            <p className={contenidosTableClasses.helperText}>
              Cargando indicadores...
            </p>
          }
          noDataComponent={
            <p className={contenidosTableClasses.helperText}>
              No hay indicadores registrados para esta competencia.
            </p>
          }
          customStyles={estilosPersonalizados}
          subHeader
          subHeaderComponent={barraHerramientas}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          highlightOnHover
          striped
          responsive
          persistTableHead
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Cerrar
          </button>
        </div>
      </VentanaModal>

      <IndicadorFormModal
        isOpen={modalIndicador.abierto}
        onClose={cerrarModalIndicador}
        onSubmit={manejarEnvioIndicador}
        modo={modalIndicador.modo}
        indicador={modalIndicador.indicador}
        competencia={competencia}
      />
    </>
  );
};

IndicadoresModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  competencia: PropTypes.object,
  indicadores: PropTypes.array,
  isLoading: PropTypes.bool,
  onCrearIndicador: PropTypes.func,
  onActualizarIndicador: PropTypes.func,
  onEliminarIndicador: PropTypes.func,
  onToggleOcultar: PropTypes.func,
};
