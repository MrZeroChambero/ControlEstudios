import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import {
  neutralButtonBase,
  secondaryButton,
  contenidosTableClasses,
} from "../EstilosCliente/EstilosClientes";

const columnasBase = (onEdit, onDelete, onViewIndicators) => [
  {
    name: "Competencia",
    selector: (row) => row.nombre_competencia,
    sortable: true,
    wrap: true,
  },
  {
    name: "Descripcion",
    selector: (row) => row.descripcion_competencia,
    grow: 2,
    wrap: true,
  },
  {
    name: "Componente",
    selector: (row) => row.componente?.nombre,
    sortable: true,
  },
  {
    name: "Area",
    selector: (row) => row.area?.nombre,
    sortable: true,
  },
  {
    name: "Indicadores",
    selector: (row) => row.total_indicadores ?? 0,
    sortable: true,
    width: "130px",
    right: true,
  },
  {
    name: "Acciones",
    cell: (row) => (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onViewIndicators(row)}
          className={`${secondaryButton} px-3 py-1 text-xs`}
        >
          Indicadores
        </button>
        <button
          type="button"
          onClick={() => onEdit(row)}
          className={`${neutralButtonBase} border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(row)}
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

export const CompetenciasTable = ({
  competencias = [],
  isLoading = false,
  onEdit,
  onDelete,
  onViewIndicators,
}) => {
  const [filtro, setFiltro] = useState("");

  const registrosFiltrados = useMemo(() => {
    if (!filtro) {
      return competencias;
    }

    const criterio = filtro.toLowerCase();
    return competencias.filter((item) => {
      const texto =
        `${item.nombre_competencia} ${item.descripcion_competencia} ${item?.componente?.nombre} ${item?.area?.nombre}`.toLowerCase();
      return texto.includes(criterio);
    });
  }, [competencias, filtro]);

  const columnas = useMemo(
    () => columnasBase(onEdit, onDelete, onViewIndicators),
    [onEdit, onDelete, onViewIndicators]
  );

  const barraBusqueda = (
    <div className={contenidosTableClasses.filterContainer}>
      <input
        type="search"
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
        placeholder="Buscar por nombre, descripcion o componente"
        className={contenidosTableClasses.filterInput}
      />
    </div>
  );

  const estilosPersonalizados = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        fontSize: "13px",
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

  return (
    <DataTable
      columns={columnas}
      data={registrosFiltrados}
      progressPending={isLoading}
      progressComponent={
        <p className={contenidosTableClasses.helperText}>
          Cargando competencias...
        </p>
      }
      noDataComponent={
        <p className={contenidosTableClasses.helperText}>
          No hay competencias registradas para los filtros seleccionados.
        </p>
      }
      customStyles={estilosPersonalizados}
      pagination
      highlightOnHover
      subHeader
      subHeaderComponent={barraBusqueda}
      striped
      responsive
      persistTableHead
    />
  );
};

CompetenciasTable.propTypes = {
  competencias: PropTypes.array,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewIndicators: PropTypes.func.isRequired,
};
