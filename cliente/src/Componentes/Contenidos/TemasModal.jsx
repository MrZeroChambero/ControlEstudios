import React, { useState, useMemo } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import {
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
} from "./contenidosEstilos";
import { dataTableBaseStyles } from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

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

  const tituloContenido = contenido?.nombre_contenido ?? "Contenido sin nombre";
  const descripcionArea = contenido?.nombre_area
    ? `${contenido.nombre_area}`
    : null;
  const descripcionComponente = contenido?.nombre_componente
    ? contenido.nombre_componente
    : null;

  const detalleContenido = (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
      <span className="text-slate-600">
        <span className="font-semibold text-slate-700">Contenido:</span>{" "}
        <span className="text-slate-800">{tituloContenido}</span>
      </span>
      {descripcionComponente && (
        <span className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{descripcionComponente}</span>
        </span>
      )}
      {descripcionArea && (
        <span className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{descripcionArea}</span>
        </span>
      )}
      {contenido?.grado && (
        <span className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            {formatearGrado(contenido.grado)}
          </span>
        </span>
      )}
    </div>
  );

  const pieModal = (
    <div className={temasModalClasses.footer}>
      <button
        type="button"
        onClick={onClose}
        className={temasModalClasses.footerButton}
      >
        Cerrar
      </button>
    </div>
  );

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de temas"
      subtitle={detalleContenido}
      size="xl"
      contentClassName="max-w-6xl"
      bodyClassName="space-y-6"
      footer={pieModal}
    >
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
        <DataTableSeguro
          columns={columnas}
          data={temasFiltrados}
          customStyles={dataTableBaseStyles}
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
    </VentanaModal>
  );
};
