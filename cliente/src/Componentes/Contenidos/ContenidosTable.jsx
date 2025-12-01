import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaList,
} from "react-icons/fa";
import {
  contenidosTableClasses,
  contenidosStatusClasses,
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";

export const ContenidosTable = ({
  contenidos,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
  onViewTemas,
  formatearGrado,
}) => {
  const [filtro, setFiltro] = useState("");

  const registrosFiltrados = useMemo(() => {
    const termino = filtro.trim().toLowerCase();
    if (termino === "") {
      return contenidos;
    }

    return contenidos.filter((item) => {
      const nombre = item.nombre_contenido?.toLowerCase() ?? "";
      const componente = item.nombre_componente?.toLowerCase() ?? "";
      const area = item.nombre_area?.toLowerCase() ?? "";
      const grado = item.grado?.toLowerCase() ?? "";

      return (
        nombre.includes(termino) ||
        componente.includes(termino) ||
        area.includes(termino) ||
        grado.includes(termino)
      );
    });
  }, [contenidos, filtro]);

  const columnas = [
    {
      name: "Contenido",
      selector: (row) => row.nombre_contenido,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: "Componente",
      selector: (row) => row.nombre_componente,
      sortable: true,
      wrap: true,
    },
    {
      name: "Área",
      selector: (row) => row.nombre_area ?? "—",
      sortable: true,
      wrap: true,
    },
    {
      name: "Grado",
      selector: (row) => formatearGrado(row.grado),
      sortable: true,
      width: "120px",
      center: true,
      cell: (row) => (
        <span className={contenidosStatusClasses.gradoTag}>
          {formatearGrado(row.grado)}
        </span>
      ),
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      width: "120px",
      center: true,
      cell: (row) => (
        <span
          className={`${contenidosStatusClasses.base} ${
            row.estado === "activo"
              ? contenidosStatusClasses.active
              : contenidosStatusClasses.inactive
          }`}
        >
          {row.estado}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "220px",
      cell: (row) => (
        <div className={contenidosTableClasses.actionGroup}>
          <button
            type="button"
            onClick={() => onViewTemas(row)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.temasButton}`}
            title="Gestionar temas"
          >
            <FaList className={contenidosIconClasses.base} />
          </button>
          <button
            type="button"
            onClick={() => onView(row)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.viewButton}`}
            title="Ver contenido"
          >
            <FaEye className={contenidosIconClasses.base} />
          </button>
          <button
            type="button"
            onClick={() => cambioEstados({ ...row })}
            className={`${contenidosTableClasses.actionButton} ${
              row.estado === "activo"
                ? contenidosTableClasses.toggleOn
                : contenidosTableClasses.toggleOff
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.editButton}`}
            title="Editar contenido"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row.id_contenido)}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.deleteButton}`}
            title="Eliminar contenido"
          >
            <FaTrash className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
    },
  ];

  const barraBusqueda = (
    <div className={contenidosTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por contenido, componente o área"
        className={contenidosTableClasses.filterInput}
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
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
          Cargando contenidos...
        </p>
      }
      noDataComponent={
        <p className={contenidosTableClasses.helperText}>
          No hay contenidos registrados.
        </p>
      }
      customStyles={estilosPersonalizados}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[5, 10, 15, 20]}
      subHeader
      subHeaderComponent={barraBusqueda}
      highlightOnHover
      striped
      responsive
      persistTableHead
    />
  );
};
