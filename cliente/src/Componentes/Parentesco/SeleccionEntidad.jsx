import React, { useState, useMemo } from "react";
import { seleccionEntidadClasses } from "../EstilosCliente/EstilosClientes";

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
    <div className={seleccionEntidadClasses.container}>
      <h3 className={seleccionEntidadClasses.title}>
        Seleccionar {tipo === "estudiante" ? "Estudiante" : "Representante"}
      </h3>
      <div className={seleccionEntidadClasses.searchWrapper}>
        <input
          type="text"
          placeholder={`Buscar ${tipo} (nombre, cédula)`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={seleccionEntidadClasses.searchInput}
        />
      </div>
      <div className={seleccionEntidadClasses.list}>
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
              className={`${seleccionEntidadClasses.listItem} ${
                esSeleccionado ? seleccionEntidadClasses.listItemActive : ""
              }`}
            >
              <div>
                <p className={seleccionEntidadClasses.itemName}>
                  {item.primer_nombre} {item.primer_apellido}
                </p>
                <p className={seleccionEntidadClasses.itemMeta}>
                  Cédula: {item.cedula || "-"}
                </p>
              </div>
              {esSeleccionado && (
                <span className={seleccionEntidadClasses.activeTag}>
                  {etiquetaSeleccion}
                </span>
              )}
            </div>
          );
        })}
        {filtrados.length === 0 && (
          <p className={seleccionEntidadClasses.empty}>Sin resultados</p>
        )}
      </div>
    </div>
  );
};

export default SeleccionEntidad;
