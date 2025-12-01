import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import {
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import {
  temasModalClasses,
  temasTableClasses,
  contenidosStatusClasses,
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";

export const TemasModal = ({
  isOpen,
  onClose,
  contenido,
  temas,
  onAgregarTema,
  onEditarTema,
  onEliminarTema,
  onCambiarEstadoTema,
  formatearGrado,
}) => {
  const [filtro, setFiltro] = useState("");

  const temasFiltrados = useMemo(() => {
    const termino = filtro.trim().toLowerCase();
    if (termino === "") {
      return temas;
    }

    return temas.filter((tema) =>
      tema.nombre_tema?.toLowerCase().includes(termino)
    );
  }, [filtro, temas]);

  if (!isOpen) {
    return null;
  }

  const columnas = [
    {
      name: "Tema",
      selector: (row) => row.nombre_tema,
      sortable: true,
      grow: 2,
      wrap: true,
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
      width: "160px",
      center: true,
      cell: (row) => (
        <div className={temasTableClasses.actionGroup}>
          <button
            type="button"
            onClick={() => onEditarTema(row)}
            className={`${temasTableClasses.actionButton} ${temasTableClasses.editButton}`}
            title="Editar tema"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            type="button"
            onClick={() => onCambiarEstadoTema(row)}
            className={`${temasTableClasses.actionButton} ${
              row.estado === "activo"
                ? temasTableClasses.toggleOn
                : temasTableClasses.toggleOff
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
            onClick={() => onEliminarTema(row)}
            className={`${temasTableClasses.actionButton} ${temasTableClasses.deleteButton}`}
            title="Eliminar tema"
          >
            <FaTrash className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
    },
  ];

  const cabeceraTabla = (
    <div className={temasTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar temas por nombre"
        className={temasTableClasses.filterInput}
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
      />
      <span className={temasTableClasses.stats}>
        {temasFiltrados.length} tema
        {temasFiltrados.length === 1 ? "" : "s"} encontrado
        {temasFiltrados.length === 1 ? "" : "s"}
      </span>
      <button
        type="button"
        onClick={onAgregarTema}
        className={temasTableClasses.addButton}
      >
        <FaPlus className={contenidosIconClasses.base} />
        <span>Agregar tema</span>
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

  const tituloContenido = contenido?.nombre_contenido ?? "Contenido sin nombre";
  const descripcionArea = contenido?.nombre_area
    ? `${contenido.nombre_area}`
    : null;
  const descripcionComponente = contenido?.nombre_componente
    ? contenido.nombre_componente
    : null;

  return (
    <div className={temasModalClasses.overlay}>
      <div className={temasModalClasses.content}>
        <div className={temasModalClasses.header}>
          <div>
            <h2 className={temasModalClasses.title}>Gestión de temas</h2>
            <p className={temasModalClasses.subtitle}>
              <span className="font-semibold text-slate-700">Contenido:</span>{" "}
              {tituloContenido}
              {descripcionComponente && (
                <>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-600">
                    {descripcionComponente}
                  </span>
                </>
              )}
              {descripcionArea && (
                <>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-600">{descripcionArea}</span>
                </>
              )}
              {contenido?.grado && (
                <>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-600">
                    {formatearGrado(contenido.grado)}
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={temasModalClasses.closeButton}
            title="Cerrar"
          >
            <FaTimes className={contenidosIconClasses.base} />
          </button>
        </div>

        {temas.length === 0 ? (
          <div className="py-12 text-center">
            <div className={temasModalClasses.emptyIcon}>📚</div>
            <p className="mb-2 text-lg text-slate-600">
              No hay temas registrados
            </p>
            <p className="mb-6 text-sm text-slate-400">
              Añade tu primer tema para comenzar la planificación.
            </p>
            <button
              type="button"
              onClick={onAgregarTema}
              className={temasTableClasses.addButton}
            >
              <FaPlus className={contenidosIconClasses.base} />
              <span>Agregar primer tema</span>
            </button>
          </div>
        ) : (
          <DataTable
            columns={columnas}
            data={temasFiltrados}
            customStyles={estilosPersonalizados}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Temas por página:",
              rangeSeparatorText: "de",
              noRowsPerPage: false,
            }}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            noDataComponent={
              <p className={temasModalClasses.subtitle}>
                No se encontraron temas que coincidan con la búsqueda.
              </p>
            }
            subHeader
            subHeaderComponent={cabeceraTabla}
            highlightOnHover
            striped
            responsive
            dense
          />
        )}

        <div className={temasModalClasses.footer}>
          <button
            type="button"
            onClick={onClose}
            className={temasModalClasses.footerButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
