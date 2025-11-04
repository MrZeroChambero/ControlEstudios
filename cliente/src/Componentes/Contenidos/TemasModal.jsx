import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { FaTimes } from "react-icons/fa";

export const TemasModal = ({ isOpen, onClose, contenido, temas }) => {
  const [filterText, setFilterText] = useState("");

  if (!isOpen) return null;

  const filteredTemas = temas.filter(
    (tema) =>
      tema.nombre_tema.toLowerCase().includes(filterText.toLowerCase()) ||
      (tema.codigo &&
        tema.codigo.toLowerCase().includes(filterText.toLowerCase())) ||
      (tema.descripcion &&
        tema.descripcion.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "Código",
      selector: (row) => row.codigo || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Nombre del Tema",
      selector: (row) => row.nombre_tema,
      sortable: true,
      wrap: true,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion || "N/A",
      sortable: true,
      wrap: true,
      cell: (row) => (
        <div className="max-w-xs truncate" title={row.descripcion}>
          {row.descripcion || "N/A"}
        </div>
      ),
    },
    {
      name: "Orden",
      selector: (row) => row.orden_tema,
      sortable: true,
      width: "100px",
      center: true,
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
      selector: (row) => row.estado,
      width: "120px",
      center: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        width: "100%",
        tableLayout: "auto",
      },
    },
    headCells: {
      style: {
        whiteSpace: "normal",
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f8fafc",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
    },
  };

  const subHeaderComponent = (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder="Buscar temas por nombre, código o descripción..."
        className="w-1/2 p-2 border border-gray-300 rounded-md"
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
      <span className="text-sm text-gray-600">
        {filteredTemas.length} tema{filteredTemas.length !== 1 ? "s" : ""}{" "}
        encontrado{filteredTemas.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Temas del Contenido
            </h2>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Contenido:</span>{" "}
              {contenido?.nombre}
              {contenido?.nombre_area && (
                <span className="ml-4">
                  <span className="font-semibold">Área:</span>{" "}
                  {contenido.nombre_area}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {temas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg mb-2">
              No hay temas registrados
            </p>
            <p className="text-gray-400 text-sm">
              Este contenido no tiene temas asociados aún.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <DataTable
              columns={columns}
              data={filteredTemas}
              customStyles={customStyles}
              pagination
              paginationComponentOptions={{
                rowsPerPageText: "Temas por página:",
                rangeSeparatorText: "de",
                noRowsPerPage: false,
              }}
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 15, 20]}
              noDataComponent={
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No se encontraron temas que coincidan con la búsqueda.
                  </p>
                </div>
              }
              subHeader
              subHeaderComponent={subHeaderComponent}
              striped
              highlightOnHover
              responsive
              dense
            />
          </div>
        )}

        <div className="mt-6 flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
