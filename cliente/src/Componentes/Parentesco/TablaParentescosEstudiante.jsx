import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaSync } from "react-icons/fa";
import {
  parentescosTableClasses,
  contenidosIconClasses,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";
// Recibe tiposPermitidos desde el padre (Parentesco.jsx)

const TablaParentescosEstudiante = ({
  data = [],
  editando,
  tipoEdicion,
  setTipoEdicion,
  iniciarEdicion,
  cancelarEdicion,
  guardarEdicion,
  quitarParentesco,
  estudianteSeleccionado,
  tiposPermitidos = ["representante"],
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: "Representante",
        selector: (row) =>
          `${row.rep_primer_nombre} ${row.rep_primer_apellido}`,
        sortable: true,
        wrap: true,
      },
      {
        name: "Cédula",
        selector: (row) => row.rep_cedula || "-",
        sortable: true,
        width: "120px",
      },
      {
        name: "Tipo",
        cell: (row) => {
          const enEdicion =
            editando?.id === row.id_parentesco &&
            editando?.contexto === "estudiante";
          if (!enEdicion) return row.tipo_parentesco;
          const tiposBase = Array.isArray(tiposPermitidos)
            ? tiposPermitidos
            : ["representante"];
          // Filtrar por género del representante de la fila (rep_genero)
          const generoRep = row.rep_genero;
          const tiposPorGenero =
            generoRep === "F"
              ? ["madre", "abuela", "hermana", "tia", "otro"]
              : generoRep === "M"
              ? ["padre", "abuelo", "hermano", "tio", "otro"]
              : tiposBase;
          const tiposDisponibles = tiposPorGenero.filter((t) => {
            if (
              t === "padre" &&
              data.some(
                (p) =>
                  p.tipo_parentesco === "padre" &&
                  p.id_parentesco !== row.id_parentesco
              )
            )
              return false;
            if (
              t === "madre" &&
              data.some(
                (p) =>
                  p.tipo_parentesco === "madre" &&
                  p.id_parentesco !== row.id_parentesco
              )
            )
              return false;
            return true;
          });
          return (
            <select
              value={tipoEdicion}
              onChange={(e) => setTipoEdicion(e.target.value)}
              className={parentescosTableClasses.inlineEditSelect}
            >
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          );
        },
        sortable: false,
      },
      {
        name: "Acciones",
        cell: (row) => {
          const enEdicion =
            editando?.id === row.id_parentesco &&
            editando?.contexto === "estudiante";
          return enEdicion ? (
            <div className={parentescosTableClasses.actionBar}>
              <button
                onClick={guardarEdicion}
                className={parentescosTableClasses.saveButton}
              >
                <FaSync className={contenidosIconClasses.base} /> Guardar
              </button>
              <button
                onClick={cancelarEdicion}
                className={parentescosTableClasses.cancelButton}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className={parentescosTableClasses.actionGroup}>
              <button
                onClick={() => iniciarEdicion(row, "estudiante")}
                className={`${parentescosTableClasses.actionButton} ${parentescosTableClasses.editButton}`}
                title="Editar"
              >
                <FaEdit className={contenidosIconClasses.base} />
              </button>
              <button
                onClick={() => quitarParentesco(row, "estudiante")}
                className={`${parentescosTableClasses.actionButton} ${parentescosTableClasses.deleteButton}`}
                title="Eliminar"
              >
                <FaTrash className={contenidosIconClasses.base} />
              </button>
            </div>
          );
        },
        ignoreRowClick: true,
        width: "180px",
      },
    ];
  }, [
    editando,
    tipoEdicion,
    guardarEdicion,
    cancelarEdicion,
    iniciarEdicion,
    quitarParentesco,
    setTipoEdicion,
    data,
    tiposPermitidos,
  ]);

  return (
    <div className={parentescosTableClasses.card}>
      <h3 className={parentescosTableClasses.title}>
        Parentescos del Estudiante
      </h3>
      {estudianteSeleccionado ? (
        <DataTable
          data={data}
          columns={columns}
          dense
          customStyles={dataTableBaseStyles}
          noDataComponent={
            <span className={parentescosTableClasses.helperText}>
              Sin parentescos aún.
            </span>
          }
          pagination
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Filas",
            rangeSeparatorText: "de",
          }}
        />
      ) : (
        <p className={parentescosTableClasses.helperText}>
          Seleccione un estudiante para ver o agregar parentescos.
        </p>
      )}
    </div>
  );
};

export default TablaParentescosEstudiante;
