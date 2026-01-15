import React, { useMemo, useState } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import {
  representantesTableClasses,
  contenidosIconClasses,
  dataTableBaseStyles,
  typePillBase,
} from "../EstilosCliente/EstilosClientes";

export const RepresentanteTable = ({
  representantes,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleEstado,
}) => {
  const [filterText, setFilterText] = useState("");

  const filtered = useMemo(() => {
    const criterio = filterText.toLowerCase();
    return representantes.filter((r) => {
      const nombre = `${r.primer_nombre || ""} ${r.segundo_nombre || ""} ${
        r.primer_apellido || ""
      } ${r.segundo_apellido || ""}`
        .trim()
        .toLowerCase();
      return (
        nombre.includes(criterio) ||
        (r.cedula || "").toLowerCase().includes(criterio) ||
        (r.profesion || "").toLowerCase().includes(criterio)
      );
    });
  }, [representantes, filterText]);

  const resolveEstadoBadge = (estado) => {
    const normalized = (estado || "").toString().toLowerCase();
    const { statusChip } = representantesTableClasses;
    if (!statusChip) {
      return `${typePillBase} bg-slate-200 text-slate-600`;
    }
    if (normalized === "activo") {
      return `${statusChip.base} ${statusChip.activo || statusChip.active}`;
    }
    if (normalized === "incompleto") {
      return `${statusChip.base} ${
        statusChip.incompleto || statusChip.warning
      }`;
    }
    return `${statusChip.base} ${statusChip.inactivo || statusChip.inactive}`;
  };

  const columns = useMemo(
    () => [
      {
        name: "Nombre Completo",
        selector: (row) =>
          `${row.primer_nombre || ""} ${row.segundo_nombre || ""} ${
            row.primer_apellido || ""
          } ${row.segundo_apellido || ""}`.trim(),
        sortable: true,
        wrap: true,
      },
      {
        name: "Cédula",
        selector: (row) => row.cedula,
        sortable: true,
        width: "140px",
      },
      {
        name: "Profesión",
        selector: (row) => row.profesion || "-",
        sortable: true,
        wrap: true,
      },
      {
        name: "Estado Persona",
        cell: (row) => (
          <span
            className={resolveEstadoBadge(row.estado || row.estado_persona)}
          >
            {row.estado_persona_nombre ||
              row.estado ||
              row.estado_persona ||
              "-"}
          </span>
        ),
        sortable: true,
        width: "170px",
      },
      {
        name: "Acciones",
        cell: (row) => {
          const estado =
            row.estado || row.estado_persona || row.estado_persona_nombre;
          const activo = estado === "activo";
          return (
            <div className={representantesTableClasses.actionGroup}>
              <button
                type="button"
                onClick={() => onView(row)}
                className={`${representantesTableClasses.actionButton} ${representantesTableClasses.viewButton}`}
                title="Ver representante"
              >
                <FaEye className={contenidosIconClasses.base} />
              </button>
              <button
                type="button"
                onClick={() => onToggleEstado?.(row)}
                className={`${representantesTableClasses.actionButton} ${
                  activo
                    ? representantesTableClasses.toggleOn
                    : representantesTableClasses.toggleOff
                }`}
                title={activo ? "Desactivar persona" : "Activar persona"}
              >
                {activo ? (
                  <FaToggleOn className={contenidosIconClasses.base} />
                ) : (
                  <FaToggleOff className={contenidosIconClasses.base} />
                )}
              </button>
              <button
                type="button"
                onClick={() => onEdit(row)}
                className={`${representantesTableClasses.actionButton} ${representantesTableClasses.editButton}`}
                title="Editar representante"
              >
                <FaEdit className={contenidosIconClasses.base} />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(row)}
                className={`${representantesTableClasses.actionButton} ${representantesTableClasses.deleteButton}`}
                title="Eliminar representante"
              >
                <FaTrash className={contenidosIconClasses.base} />
              </button>
            </div>
          );
        },
        width: "220px",
        allowOverflow: true,
        button: true,
      },
    ],
    [onView, onToggleEstado, onEdit, onDelete]
  );

  const subHeaderComponent = (
    <div className={representantesTableClasses.filterContainer}>
      <input
        type="search"
        placeholder="Buscar por nombre, cédula o profesión..."
        className={representantesTableClasses.filterInput}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
    </div>
  );

  return (
    <div className={representantesTableClasses.wrapper}>
      <DataTableSeguro
        columns={columns}
        data={filtered}
        progressPending={isLoading}
        progressComponent={
          <p className={representantesTableClasses.helperText}>
            Cargando representantes...
          </p>
        }
        noDataComponent={
          <p className={representantesTableClasses.helperText}>
            No hay representantes que coincidan con la búsqueda actual.
          </p>
        }
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        subHeader
        subHeaderComponent={subHeaderComponent}
        customStyles={dataTableBaseStyles}
        striped
        highlightOnHover
        responsive
        persistTableHead
      />
    </div>
  );
};

export default RepresentanteTable;
