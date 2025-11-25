import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

export const RepresentanteTable = ({
  representantes,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleEstado,
}) => {
  const [filterText, setFilterText] = useState("");

  const filtered = representantes.filter((r) => {
    const nombre = `${r.primer_nombre || ""} ${r.segundo_nombre || ""} ${
      r.primer_apellido || ""
    } ${r.segundo_apellido || ""}`.toLowerCase();
    return (
      nombre.includes(filterText.toLowerCase()) ||
      (r.cedula || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (r.profesion || "").toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_representante,
      sortable: true,
      width: "80px",
    },
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
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            (row.estado || row.estado_persona) === "activo"
              ? "bg-green-200 text-green-800"
              : (row.estado || row.estado_persona) === "incompleto"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {row.estado_persona_nombre || row.estado || row.estado_persona || "-"}
        </span>
      ),
      sortable: true,
      width: "160px",
    },
    {
      name: "Acciones",
      cell: (row) => {
        const estado =
          row.estado || row.estado_persona || row.estado_persona_nombre;
        const activo = estado === "activo";
        return (
          <div className="flex space-x-2 justify-center items-center">
            <button
              onClick={() => onView(row)}
              className="text-blue-500 hover:text-blue-700 text-lg"
              title="Ver"
            >
              <FaEye />
            </button>
            <button
              onClick={() => onToggleEstado?.(row)}
              className={`text-2xl ${
                activo
                  ? "text-green-500 hover:text-green-600"
                  : "text-gray-400 hover:text-gray-500"
              }`}
              title={activo ? "Desactivar (persona)" : "Activar (persona)"}
            >
              {activo ? <FaToggleOn /> : <FaToggleOff />}
            </button>
            <button
              onClick={() => onEdit(row)}
              className="text-yellow-500 hover:text-yellow-700 text-lg"
              title="Editar"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete?.(row)}
              className="text-red-500 hover:text-red-700 text-lg"
              title="Eliminar"
            >
              <FaTrash />
            </button>
          </div>
        );
      },
      width: "230px",
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por nombre, cédula o profesión..."
      className="w-1/4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
    />
  );

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={filtered}
        progressPending={isLoading}
        progressComponent={
          <p className="text-center text-gray-500">
            Cargando representantes...
          </p>
        }
        noDataComponent={
          <p className="text-center text-gray-500">
            No hay representantes para mostrar.
          </p>
        }
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        subHeader
        subHeaderComponent={subHeaderComponent}
        striped
        highlightOnHover
        responsive
      />
    </div>
  );
};

export default RepresentanteTable;
