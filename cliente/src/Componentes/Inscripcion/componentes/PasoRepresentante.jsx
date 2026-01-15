import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  inscripcionFormClasses,
  inscripcionTableClasses,
  inscripcionDataTableStyles,
  pasoRepresentanteClasses,
} from "../inscripcionEstilos";

const columnasBase = (seleccionId) => [
  {
    name: "Representante",
    selector: (row) => row.nombre_completo,
    sortable: true,
    cell: (row) => (
      <div name="celda-representante-datos">
        <p className={pasoRepresentanteClasses.name}>{row.nombre_completo}</p>
        <p className={pasoRepresentanteClasses.meta}>
          C.I.: {row.cedula || "Sin cédula"}
        </p>
      </div>
    ),
  },
  {
    name: "Parentesco",
    selector: (row) => row.tipo_parentesco,
    width: "140px",
    cell: (row) => (
      <span className={pasoRepresentanteClasses.badge}>
        {row.tipo_parentesco}
      </span>
    ),
  },
  {
    name: "Profesión",
    selector: (row) => row.profesion,
    grow: 1,
    cell: (row) => (
      <p className={pasoRepresentanteClasses.profession}>
        {row.profesion || "Sin registrar"}
      </p>
    ),
  },
  {
    name: "Seleccionar",
    width: "150px",
    cell: (row) => (
      <button
        type="button"
        className={pasoRepresentanteClasses.selectButton}
        disabled={seleccionId === row.id_representante}
        data-id={row.id_representante}
      >
        {seleccionId === row.id_representante ? "Seleccionado" : "Elegir"}
      </button>
    ),
  },
];

export const PasoRepresentante = ({
  representantes,
  cargando,
  seleccionado,
  onSeleccionar,
  estudiante,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const datosFiltrados = useMemo(() => {
    if (!busqueda) return representantes;
    const termino = busqueda.toLowerCase();
    return representantes.filter((item) =>
      [item.nombre_completo, item.cedula, item.tipo_parentesco]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termino))
    );
  }, [busqueda, representantes]);

  const columnas = useMemo(
    () => columnasBase(seleccionado?.id),
    [seleccionado]
  );

  const manejarClick = (evento) => {
    const id = evento.target?.dataset?.id;
    if (!id) return;
    const encontrado = representantes.find(
      (item) => String(item.id_representante) === id
    );
    if (encontrado) {
      onSeleccionar({
        id: encontrado.id_representante,
        nombre_completo: encontrado.nombre_completo,
        cedula: encontrado.cedula,
        tipo_parentesco: encontrado.tipo_parentesco,
      });
    }
  };

  return (
    <div
      name="contenedor-paso-representante"
      className={pasoRepresentanteClasses.container}
      onClick={manejarClick}
      role="presentation"
    >
      <header className={pasoRepresentanteClasses.header}>
        <div name="paso-representante-descripcion">
          <h2 className={pasoRepresentanteClasses.title}>
            Representantes vinculados ({datosFiltrados.length})
          </h2>
          <p className={pasoRepresentanteClasses.description}>
            Selecciona al representante autorizado que firmará la inscripción
            del estudiante
            <strong> {estudiante?.nombre_completo || ""}</strong>.
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar representante"
          className={pasoRepresentanteClasses.searchInput}
        />
      </header>

      <div
        name="tabla-paso-representante"
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
                ? "Cargando representantes..."
                : "No hay representantes registrados para este estudiante."}
            </p>
          }
          customStyles={inscripcionDataTableStyles}
          conditionalRowStyles={[
            {
              when: (row) => seleccionado?.id === row.id_representante,
              style: {
                backgroundColor: pasoRepresentanteClasses.selectedRowColor,
              },
            },
          ]}
        />
      </div>

      {seleccionado ? (
        <div
          name="paso-representante-seleccion"
          className={pasoRepresentanteClasses.selectionCard}
        >
          Representante seleccionado:{" "}
          <strong>{seleccionado.nombre_completo}</strong> ({" "}
          {seleccionado.tipo_parentesco}).
        </div>
      ) : null}
    </div>
  );
};
