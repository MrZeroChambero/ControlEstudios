import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = usuarios.filter(
    (item) =>
      item.nombre_usuario.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.nombre_completo &&
        item.nombre_completo
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.cedula &&
        item.cedula.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.rol && item.rol.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_usuario,
      sortable: true,
      width: "80px",
    },
    {
      name: "Nombre de Usuario",
      selector: (row) => row.nombre_usuario,
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
      name: "Rol",
      selector: (row) => row.rol,
      sortable: true,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            row.estado === "activo"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {row.estado}
        </span>
      ),
      sortable: true,
      width: "100px",
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
              row.estado === "activo"
                ? "text-green-500 hover:text-green-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <button
            onClick={() => onEdit(row)}
            className="text-yellow-500 hover:text-yellow-700 text-lg"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_usuario)}
            className="text-red-500 hover:text-red-700 text-lg"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por usuario, nombre, cédula o rol..."
      className="w-1/4 p-2 border border-gray-300 rounded-md"
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
          <p className="text-center text-gray-500">Cargando usuarios...</p>
        }
        noDataComponent={
          <p className="text-center text-gray-500">
            No hay usuarios para mostrar.
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
