import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaSync } from "react-icons/fa";
import { TIPOS_OPCIONALES } from "./parentescoService";

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
          const tiposDisponibles = [
            "padre",
            "madre",
            ...TIPOS_OPCIONALES,
          ].filter((t) => {
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
            editando?.contexto === "estudiante";
          return enEdicion ? (
            <div className="flex gap-2">
              <button
                onClick={guardarEdicion}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1"
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
                onClick={() => iniciarEdicion(row, "estudiante")}
                className="text-blue-600 hover:text-blue-800"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => quitarParentesco(row, "estudiante")}
                className="text-red-600 hover:text-red-800"
                title="Eliminar"
              >
                <FaTrash />
              </button>
            </div>
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
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
  ]);
  return (
    <div className="bg-white/80 backdrop-blur rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-blue-600">
        Parentescos del Estudiante
      </h3>
      {estudianteSeleccionado ? (
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
          Seleccione un estudiante para ver / agregar parentescos.
        </p>
      )}
    </div>
  );
};

export default TablaParentescosEstudiante;
