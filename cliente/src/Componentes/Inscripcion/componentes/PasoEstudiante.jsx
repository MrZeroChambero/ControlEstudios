import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  inscripcionFormClasses,
  inscripcionTableClasses,
  inscripcionDataTableStyles,
  pasoEstudianteClasses,
} from "../inscripcionEstilos";

const columnasBase = (seleccionadoId) => [
  {
    name: "Estudiante",
    selector: (row) => row.nombre_completo,
    sortable: true,
    cell: (row) => (
      <div name="celda-estudiante-datos">
        <p className={pasoEstudianteClasses.name}>{row.nombre_completo}</p>
        <p className={pasoEstudianteClasses.meta}>
          C.I. escolar: {row.cedula_escolar}
        </p>
      </div>
    ),
  },
  {
    name: "Edad",
    width: "90px",
    selector: (row) => row.edad,
    center: true,
    sortable: true,
    cell: (row) => (
      <span className={pasoEstudianteClasses.meta}>{row.edad} años</span>
    ),
  },
  {
    name: "Grados permitidos",
    selector: (row) => row.grados_permitidos,
    cell: (row) => (
      <div
        name="celda-estudiante-grados"
        className={pasoEstudianteClasses.chipList}
      >
        {row.grados_permitidos.map((grado) => (
          <span
            key={`${row.id}-${grado}`}
            className={pasoEstudianteClasses.chip}
          >
            {grado}°
          </span>
        ))}
      </div>
    ),
  },
  {
    name: "Seleccionar",
    width: "150px",
    cell: (row) => (
      <button
        type="button"
        className={pasoEstudianteClasses.selectButton}
        disabled={seleccionadoId === row.id}
        data-id={row.id}
      >
        {seleccionadoId === row.id ? "Seleccionado" : "Elegir"}
      </button>
    ),
  },
];

export const PasoEstudiante = ({
  estudiantes,
  cargando,
  seleccionado,
  onSeleccionar,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const datosFiltrados = useMemo(() => {
    if (!busqueda) {
      return estudiantes;
    }
    const termino = busqueda.toLowerCase();
    return estudiantes.filter((item) =>
      [item.nombre_completo, item.cedula, item.cedula_escolar]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termino))
    );
  }, [busqueda, estudiantes]);

  const columnas = useMemo(
    () => columnasBase(seleccionado?.id),
    [seleccionado]
  );

  const manejarClick = (evento) => {
    const id = evento.target?.dataset?.id;
    if (!id) return;
    const encontrado = estudiantes.find((item) => String(item.id) === id);
    if (encontrado) {
      onSeleccionar(encontrado);
    }
  };

  return (
    <div
      name="contenedor-paso-estudiante"
      className={pasoEstudianteClasses.container}
      onClick={manejarClick}
      role="presentation"
    >
      <header className={pasoEstudianteClasses.header}>
        <div name="paso-estudiante-descripcion">
          <h2 className={pasoEstudianteClasses.title}>
            Estudiantes elegibles ({datosFiltrados.length})
          </h2>
          <p className={pasoEstudianteClasses.description}>
            Selecciona un estudiante que cumpla con la edad correspondiente al
            grado.
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o cédula"
          className={pasoEstudianteClasses.searchInput}
        />
      </header>

      <div
        name="tabla-paso-estudiante"
        className={inscripcionTableClasses.wrapper}
      >
        <DataTable
          columns={columnas}
          data={datosFiltrados}
          progressPending={cargando}
          highlightOnHover
          pointerOnHover
          dense
          pagination
          noDataComponent={
            <p className={inscripcionTableClasses.helperText}>
              {cargando
                ? "Cargando estudiantes..."
                : "No hay estudiantes disponibles para inscribir."}
            </p>
          }
          customStyles={inscripcionDataTableStyles}
          conditionalRowStyles={[
            {
              when: (row) => seleccionado?.id === row.id,
              style: {
                backgroundColor: pasoEstudianteClasses.selectedRowColor,
              },
            },
          ]}
        />
      </div>

      {seleccionado ? (
        <div
          name="paso-estudiante-seleccion"
          className={pasoEstudianteClasses.selectionCard}
        >
          Estudiante seleccionado:{" "}
          <strong>{seleccionado.nombre_completo}</strong> (C.I.{" "}
          {seleccionado.cedula || "N/A"}).
        </div>
      ) : null}
    </div>
  );
};
