import React, { useState, useMemo } from "react";

const SeleccionEntidad = ({
  tipo, // 'estudiante' | 'representante'
  items = [],
  seleccionado,
  onSelect,
  etiquetaSeleccion = "Seleccionado",
}) => {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return items.filter((i) =>
      `${i.primer_nombre || ""} ${i.primer_apellido || ""} ${i.cedula || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [items, busqueda]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-blue-600">
        Seleccionar {tipo === "estudiante" ? "Estudiante" : "Representante"}
      </h3>
      <div className="relative mb-3">
        <input
          type="text"
          placeholder={`Buscar ${tipo} (nombre, cédula)`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y bg-white">
        {filtrados.map((item) => {
          const esSeleccionado =
            tipo === "estudiante"
              ? seleccionado?.id_estudiante === item.id_estudiante
              : seleccionado?.id_representante === item.id_representante;
          return (
            <div
              key={
                tipo === "estudiante"
                  ? item.id_estudiante
                  : item.id_representante
              }
              onClick={() => onSelect(item)}
              className={`p-3 cursor-pointer flex justify-between items-center ${
                esSeleccionado ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div>
                <p className="font-semibold text-sm">
                  {item.primer_nombre} {item.primer_apellido}
                </p>
                <p className="text-xs text-gray-600">
                  Cédula: {item.cedula || "-"}
                </p>
              </div>
              {esSeleccionado && (
                <span className="text-blue-600 text-xs font-bold">
                  {etiquetaSeleccion}
                </span>
              )}
            </div>
          );
        })}
        {filtrados.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">
            Sin resultados
          </p>
        )}
      </div>
    </div>
  );
};

export default SeleccionEntidad;
