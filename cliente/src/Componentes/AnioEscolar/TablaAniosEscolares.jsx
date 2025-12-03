import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa";
import {
  anioEscolarIconClasses,
  anioEscolarStatusClasses,
  anioEscolarTableClasses,
} from "../EstilosCliente/EstilosClientes";
import {
  construirNombrePeriodo,
  formatearFecha,
} from "./utilidadesAnioEscolar";

const obtenerClaseEstado = (estado) => {
  const clave = (estado || "").toLowerCase();
  if (clave === "activo") {
    return anioEscolarStatusClasses.activo;
  }
  if (clave === "incompleto") {
    return anioEscolarStatusClasses.incompleto;
  }
  if (clave === "inactivo") {
    return anioEscolarStatusClasses.inactivo;
  }
  if (clave === "planificado") {
    return anioEscolarStatusClasses.planificado;
  }
  return anioEscolarStatusClasses.desconocido;
};

export const TablaAniosEscolares = ({
  registros,
  cargando,
  filtro,
  onFiltrar,
  onVer,
  onEditar,
  onEliminar,
  onCambiarEstado,
}) => {
  const registrosFiltrados = useMemo(() => {
    const termino = filtro.trim().toLowerCase();
    if (termino === "") {
      return registros || [];
    }

    return (registros || []).filter((item) => {
      const etiqueta = construirNombrePeriodo(
        item.fecha_inicio,
        item.fecha_fin
      ).toLowerCase();
      const estado = (item.estado || "").toLowerCase();
      const periodo = `${formatearFecha(item.fecha_inicio)} ${formatearFecha(
        item.fecha_fin
      )}`.toLowerCase();
      const limite = formatearFecha(
        item.fecha_limite_inscripcion
      ).toLowerCase();
      return (
        etiqueta.includes(termino) ||
        estado.includes(termino) ||
        periodo.includes(termino) ||
        limite.includes(termino)
      );
    });
  }, [registros, filtro]);

  const columnas = useMemo(
    () => [
      {
        name: "Nombre",
        selector: (row) =>
          construirNombrePeriodo(row.fecha_inicio, row.fecha_fin),
        sortable: true,
        grow: 2,
        wrap: true,
        cell: (row) => (
          <span className="font-semibold text-slate-700">
            {construirNombrePeriodo(row.fecha_inicio, row.fecha_fin)}
          </span>
        ),
      },
      {
        name: "Período",
        selector: (row) => row.fecha_inicio,
        sortable: true,
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">
              {formatearFecha(row.fecha_inicio)}
            </span>
            <span className="text-xs text-slate-500">
              al {formatearFecha(row.fecha_fin)}
            </span>
          </div>
        ),
        grow: 1.5,
        wrap: true,
      },
      {
        name: "Límite inscripción",
        selector: (row) => row.fecha_limite_inscripcion,
        sortable: true,
        width: "180px",
        center: true,
        cell: (row) => formatearFecha(row.fecha_limite_inscripcion),
      },
      {
        name: "Estado",
        selector: (row) => row.estado,
        sortable: true,
        width: "150px",
        center: true,
        cell: (row) => (
          <span
            className={`${anioEscolarStatusClasses.base} ${obtenerClaseEstado(
              row.estado
            )}`}
          >
            {(row.estado || "").toUpperCase() || "—"}
          </span>
        ),
      },
      {
        name: "Aulas",
        selector: (row) => row.aulas_asignadas ?? 0,
        sortable: true,
        width: "100px",
        center: true,
      },
      {
        name: "Acciones",
        width: "220px",
        cell: (row) => (
          <div className={anioEscolarTableClasses.actionGroup}>
            <button
              type="button"
              onClick={() => onVer(row)}
              className={`${anioEscolarTableClasses.actionButton} ${anioEscolarTableClasses.viewButton}`}
              title="Ver detalles"
            >
              <FaEye className={anioEscolarIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => onEditar(row)}
              className={`${anioEscolarTableClasses.actionButton} ${anioEscolarTableClasses.editButton}`}
              title="Editar"
            >
              <FaEdit className={anioEscolarIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => onEliminar(row)}
              className={`${anioEscolarTableClasses.actionButton} ${anioEscolarTableClasses.deleteButton}`}
              title="Eliminar"
            >
              <FaTrash className={anioEscolarIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => onCambiarEstado(row)}
              className={`${anioEscolarTableClasses.actionButton} ${
                row.estado === "activo"
                  ? anioEscolarTableClasses.toggleOn
                  : anioEscolarTableClasses.toggleOff
              }`}
              title={row.estado === "activo" ? "Desactivar" : "Activar"}
            >
              {row.estado === "activo" ? (
                <FaToggleOn className={anioEscolarIconClasses.base} />
              ) : (
                <FaToggleOff className={anioEscolarIconClasses.base} />
              )}
            </button>
          </div>
        ),
      },
    ],
    [onVer, onEditar, onEliminar, onCambiarEstado]
  );

  const barraBusqueda = (
    <div className={anioEscolarTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre, estado o período"
        className={anioEscolarTableClasses.filterInput}
        value={filtro}
        onChange={(evento) => onFiltrar(evento.target.value)}
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
      progressPending={cargando}
      progressComponent={
        <p className={anioEscolarTableClasses.helperText}>
          Cargando años escolares...
        </p>
      }
      noDataComponent={
        <p className={anioEscolarTableClasses.helperText}>
          No hay años escolares registrados.
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

export default TablaAniosEscolares;
