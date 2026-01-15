import React, { useMemo } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import { FaEdit, FaTrash, FaSync } from "react-icons/fa";
import {
  parentescosTableClasses,
  contenidosIconClasses,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";
// Recibe tiposPermitidos desde el padre (Parentesco.jsx)

const TablaParentescosRepresentante = ({
  data = [],
  editando,
  tipoEdicion,
  setTipoEdicion,
  iniciarEdicion,
  cancelarEdicion,
  guardarEdicion,
  quitarParentesco,
  representanteSeleccionado,
  tiposPermitidos = ["representante"],
}) => {
  const columns = useMemo(() => {
    return [
      {
        name: "Estudiante",
        selector: (row) =>
          `${row.est_primer_nombre} ${row.est_primer_apellido}`,
        sortable: true,
        wrap: true,
      },
      {
        name: "Cédula",
        selector: (row) => row.est_cedula || "-",
        sortable: true,
        width: "120px",
      },
      {
        name: "Tipo",
        cell: (row) => {
          const enEdicion =
            editando?.id === row.id_parentesco &&
            editando?.contexto === "representante";
          if (!enEdicion) return row.tipo_parentesco;
          const tiposBase = Array.isArray(tiposPermitidos)
            ? tiposPermitidos
            : ["representante"];
          // Filtrar por género del representante seleccionado (padre)
          const generoRepSel = representanteSeleccionado?.genero;
          const tiposPorGenero =
            generoRepSel === "F"
              ? ["madre", "abuela", "hermana", "tia", "otro"]
              : generoRepSel === "M"
              ? ["padre", "abuelo", "hermano", "tio", "otro"]
              : tiposBase;
          const tiposDisponibles = tiposPorGenero.filter((t) => {
            if (!row.id_estudiante) return true; // fallback
            const relacionadosMismoEst = data.filter(
              (p) =>
                p.id_estudiante === row.id_estudiante &&
                p.id_parentesco !== row.id_parentesco
            );
            if (
              t === "padre" &&
              relacionadosMismoEst.some((p) => p.tipo_parentesco === "padre")
            )
              return false;
            if (
              t === "madre" &&
              relacionadosMismoEst.some((p) => p.tipo_parentesco === "madre")
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
            editando?.contexto === "representante";
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
                onClick={() => iniciarEdicion(row, "representante")}
                className={`${parentescosTableClasses.actionButton} ${parentescosTableClasses.editButton}`}
                title="Editar"
              >
                <FaEdit className={contenidosIconClasses.base} />
              </button>
              <button
                onClick={() => quitarParentesco(row, "representante")}
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
    representanteSeleccionado?.genero,
  ]);

  return (
    <div className={parentescosTableClasses.card}>
      <h3 className={parentescosTableClasses.title}>
        Parentescos del Representante
      </h3>
      {representanteSeleccionado ? (
        <DataTableSeguro
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
          Seleccione un representante para ver o agregar parentescos.
        </p>
      )}
    </div>
  );
};

export default TablaParentescosRepresentante;
