import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

const EstudianteTabla = ({
  estudiantes = [],
  isCargando = false,
  info = "no se muestra",
  onEditar,
  cambioEstados,
  onEliminar,
  onVer,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = estudiantes.filter(
    (item) =>
      `${item.primer_nombre} ${item.segundo_nombre} ${item.primer_apellido} ${item.segundo_apellido}`
        .toLowerCase()
        .includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "Nombre",
      selector: (row) => `${row.primer_nombre || ""} ${row.segundo_nombre || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Apellidos",
      selector: (row) => `${row.primer_apellido || ""} ${row.segundo_apellido || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Género",
      selector: (row) => row.genero || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Estado",
      selector: (row) => row.estado || "activo",
      sortable: true,
      width: "100px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="text-center">
           <button
            onClick={() => cambioEstados(row)}
            className={`text-2xl mr-2 ${
              row.estado === "activo"
                ? "text-green-500 hover:text-green-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <button
            onClick={() => onEditar && onEditar(row)}
            className="text-yellow-500 hover:text-yellow-700 mr-4"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onEliminar && onEliminar(row)}
            className="text-red-500 hover:text-red-700 mr-4"
            title="Eliminar"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => onVer && onVer(row)}
            className="text-blue-500 hover:text-blue-700"
            title="Ver"
          >
            Ver
          </button>
        </div>
      ),
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar..."
      className="w-1/4 p-2 border border-gray-300 rounded-md"
      onChange={(e) => setFilterText(e.target.value)}
      value={filterText}
    />
  );

  const customStyles = {
    table: {
      style: {
        width: '100%',
        tableLayout: 'auto',
      },
    },
    headCells: {
      style: {
        whiteSpace: 'normal',
      },
    },
    cells: {
      style: {
        whiteSpace: 'normal',
      },
    },
  };

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        progressPending={isCargando}
        progressComponent={<p className="text-center text-gray-500">Cargando estudiantes...</p>}
        noDataComponent={<p className="text-center text-gray-500">{info}</p>}
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        subHeader
        subHeaderComponent={subHeaderComponent}
        striped
        highlightOnHover
      />
    </div>
  );
};

export default EstudianteTabla;

