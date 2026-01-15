import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import { FaList, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  competenciasTableClasses,
  competenciasIconClasses,
} from "./competenciasEstilos";

const columnasBase = (onView, onEdit, onDelete, onViewIndicators) => [
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
          onClick={() => onView(row)}
          className={`${competenciasTableClasses.actionButton} ${competenciasTableClasses.viewButton}`}
          title="Ver detalle de la competencia"
        >
          <FaEye className={competenciasIconClasses.base} />
        </button>
        <button
          type="button"
          onClick={() => onViewIndicators(row)}
          className={`${competenciasTableClasses.actionButton} ${competenciasTableClasses.indicatorsButton}`}
          title="Gestionar indicadores"
        >
          <FaList className={competenciasIconClasses.base} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(row)}
          className={`${competenciasTableClasses.actionButton} ${competenciasTableClasses.editButton}`}
          title="Editar competencia"
        >
          <FaEdit className={competenciasIconClasses.base} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(row)}
          className={`${competenciasTableClasses.actionButton} ${competenciasTableClasses.deleteButton}`}
          title="Eliminar competencia"
        >
          <FaTrash className={competenciasIconClasses.base} />
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
  onView,
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
    () => columnasBase(onView, onEdit, onDelete, onViewIndicators),
    [onView, onEdit, onDelete, onViewIndicators]
  );

  const barraBusqueda = (
    <div className={competenciasTableClasses.filterContainer}>
      <input
        type="search"
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
        placeholder="Buscar por nombre, descripcion o componente"
        className={competenciasTableClasses.filterInput}
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
    <DataTableSeguro
      columns={columnas}
      data={registrosFiltrados}
      progressPending={isLoading}
      progressComponent={
        <p className={competenciasTableClasses.helperText}>
          Cargando competencias...
        </p>
      }
      noDataComponent={
        <p className={competenciasTableClasses.helperText}>
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
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewIndicators: PropTypes.func.isRequired,
};
