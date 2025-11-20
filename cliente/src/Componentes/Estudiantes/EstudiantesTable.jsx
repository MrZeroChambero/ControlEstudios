import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";

export const EstudiantesTable = ({
  estudiantes,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = (estudiantes || []).filter((item) => {
    const nombreCompleto = `${item.primer_nombre || ""} ${
      item.segundo_nombre || ""
    } ${item.primer_apellido || ""} ${
      item.segundo_apellido || ""
    }`.toLowerCase();
    const grado = (item.grado || "").toString().toLowerCase();
    const seccion = (item.seccion || "").toString().toLowerCase();
    return (
      nombreCompleto.includes(filterText.toLowerCase()) ||
      (item.cedula || "").toLowerCase().includes(filterText.toLowerCase()) ||
      grado.includes(filterText.toLowerCase()) ||
      seccion.includes(filterText.toLowerCase())
    );
  });

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_estudiante ?? row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Nombre Completo",
      selector: (row) =>
        `${row.primer_nombre} ${row.segundo_nombre || ""} ${
          row.primer_apellido
        } ${row.segundo_apellido || ""}`,
      sortable: true,
      wrap: true,
    },
    {
      name: "Cédula",
      selector: (row) => row.cedula,
      sortable: true,
      wrap: true,
    },
    {
      name: "Grado/Sección",
      selector: (row) =>
        `${row.grado || "sin asignar"}-${row.seccion || "sin asignar"}`,
      sortable: true,
      wrap: true,
      width: "160px",
    },
    {
      name: "Estado Persona",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            row.estado_persona === "activo"
              ? "bg-green-200 text-green-800"
              : row.estado_persona === "incompleto"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {row.estado_persona || "-"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => onView(row)}
            className="text-blue-500 hover:text-blue-700 text-lg"
            title="Ver"
          >
            <FaEye />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`text-2xl ${
              row.estado_persona === "activo"
                ? "text-green-500 hover:text-green-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={
              row.estado_persona === "activo"
                ? "Desactivar (persona)"
                : "Activar (persona)"
            }
          >
            {row.estado_persona === "activo" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <button
            onClick={() => onEdit(row)}
            className="text-yellow-500 hover:text-yellow-700 text-lg"
            title="Editar"
          >
            <FaEdit />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(row.id_estudiante ?? row.id)}
              className="text-red-500 hover:text-red-700 text-lg"
              title="Eliminar"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ),
      width: "220px",
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por nombre, cédula o grado/sección..."
      className="w-1/3 p-2 border border-gray-300 rounded-md"
      onChange={(e) => setFilterText(e.target.value)}
      value={filterText}
    />
  );

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={isLoading}
        progressComponent={
          <p className="text-center text-gray-500">Cargando estudiantes...</p>
        }
        noDataComponent={
          <p className="text-center text-gray-500">
            No hay estudiantes para mostrar.
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
