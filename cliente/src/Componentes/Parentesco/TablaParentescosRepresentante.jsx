import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaSync } from "react-icons/fa";
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
              className="border border-gray-300 rounded px-2 py-1 text-sm"
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
            <div className="flex gap-2">
              <button
                onClick={guardarEdicion}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded flex items-center gap-1"
              >
                <FaSync /> Guardar
              </button>
              <button
                onClick={cancelarEdicion}
                className="text-xs bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => iniciarEdicion(row, "representante")}
                className="text-purple-600 hover:text-purple-800"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => quitarParentesco(row, "representante")}
                className="text-red-600 hover:text-red-800"
                title="Eliminar"
              >
                <FaTrash />
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
    <div className="bg-white/80 backdrop-blur rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-purple-600">
        Parentescos del Representante
      </h3>
      {representanteSeleccionado ? (
        <DataTable
          data={data}
          columns={columns}
          dense
          noDataComponent={
            <span className="text-gray-400 text-sm">Sin parentescos aún.</span>
          }
          pagination
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Filas",
            rangeSeparatorText: "de",
          }}
        />
      ) : (
        <p className="text-gray-500 text-sm">
          Seleccione un representante para ver / agregar parentescos.
        </p>
      )}
    </div>
  );
};

export default TablaParentescosRepresentante;
