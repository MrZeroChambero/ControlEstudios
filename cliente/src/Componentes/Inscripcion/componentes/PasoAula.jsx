import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  inscripcionTableClasses,
  inscripcionDataTableStyles,
  pasoAulaClasses,
} from "../inscripcionEstilos";

const columnasBase = (seleccionId) => [
  {
    name: "Sección",
    selector: (row) => `${row.grado}° ${row.seccion}`,
    sortable: true,
    cell: (row) => (
      <div name="celda-aula-datos">
        <p className={pasoAulaClasses.name}>
          {row.grado}° {row.seccion}
        </p>
        <p className={pasoAulaClasses.meta}>
          Docente: {row.docente?.nombre || "No asignado"}
        </p>
      </div>
    ),
  },
  {
    name: "Cupos",
    selector: (row) => row.cupos,
    width: "90px",
    center: true,
    cell: (row) => (
      <span className={pasoAulaClasses.cupos}>
        {row.disponibles} / {row.cupos}
      </span>
    ),
  },
  {
    name: "Seleccionar",
    width: "140px",
    cell: (row) => (
      <button
        type="button"
        className={pasoAulaClasses.selectButton}
        disabled={seleccionId === row.id_aula}
        data-id={row.id_aula}
      >
        {seleccionId === row.id_aula ? "Seleccionado" : "Elegir"}
      </button>
    ),
  },
];

export const PasoAula = ({
  aulas = [],
  cargando,
  seleccionado,
  onSeleccionar,
  estudiante,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const gradosPermitidos = useMemo(() => {
    if (!estudiante || !Array.isArray(estudiante.grados_permitidos)) {
      return [];
    }
    return estudiante.grados_permitidos;
  }, [estudiante]);

  const descripcionGradosPermitidos = useMemo(() => {
    if (gradosPermitidos.length === 0) return "";
    return gradosPermitidos
      .map((grado) => {
        if (typeof grado === "number") {
          if (grado === 0) return "Educ. Inicial";
          return `${grado}.º`;
        }
        return String(grado);
      })
      .join(", ");
  }, [gradosPermitidos]);

  const datosFiltrados = useMemo(() => {
    if (!busqueda) return aulas;
    const termino = busqueda.toLowerCase();
    return aulas.filter((item) =>
      [`${item.grado}`, item.seccion, item.docente?.nombre]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termino))
    );
  }, [busqueda, aulas]);

  const columnas = useMemo(
    () => columnasBase(seleccionado?.id_aula),
    [seleccionado]
  );

  const manejarClick = (evento) => {
    const id = evento.target?.dataset?.id;
    if (!id) return;
    const encontrado = aulas.find((item) => String(item.id_aula) === id);
    if (encontrado) {
      onSeleccionar(encontrado);
    }
  };

  const sinResultadosBusqueda =
    !cargando && datosFiltrados.length === 0 && aulas.length > 0;
  const sinAulasDisponibles = !cargando && aulas.length === 0;
  return (
    <div
      name="contenedor-paso-aula"
      className={pasoAulaClasses.container}
      onClick={manejarClick}
      role="presentation"
    >
      <header className={pasoAulaClasses.header}>
        <div name="paso-aula-descripcion">
          <h2 className={pasoAulaClasses.title}>
            Grados y secciones con disponibilidad ({datosFiltrados.length})
          </h2>
          <p className={pasoAulaClasses.description}>
            {estudiante
              ? `Se muestran únicamente las secciones compatibles con la edad del estudiante seleccionado.` +
                (descripcionGradosPermitidos
                  ? ` Grados habilitados: ${descripcionGradosPermitidos}.`
                  : "")
              : "Selecciona un estudiante para filtrar por edad las secciones con docente titular y cupos disponibles."}
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por grado, sección o docente"
          className={pasoAulaClasses.searchInput}
        />
      </header>

      <div name="tabla-paso-aula" className={inscripcionTableClasses.wrapper}>
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
                ? "Cargando secciones..."
                : sinResultadosBusqueda
                ? "No se encontraron secciones que coincidan con la búsqueda."
                : estudiante
                ? "No hay secciones compatibles con la edad del estudiante o no quedan cupos disponibles. Revisa la documentación del grado anterior y la disponibilidad de aulas."
                : "Selecciona un estudiante para ver las secciones disponibles."}
            </p>
          }
          customStyles={inscripcionDataTableStyles}
          conditionalRowStyles={[
            {
              when: (row) => seleccionado?.id_aula === row.id_aula,
              style: {
                backgroundColor: pasoAulaClasses.selectedRowColor,
              },
            },
          ]}
        />
      </div>

      {seleccionado ? (
        <div
          name="paso-aula-seleccion"
          className={pasoAulaClasses.selectionCard}
        >
          Sección seleccionada:{" "}
          <strong>
            {seleccionado.grado}° {seleccionado.seccion}
          </strong>
          . Docente: <strong>{seleccionado.docente?.nombre}</strong>.
        </div>
      ) : null}
      {sinAulasDisponibles && estudiante ? (
        <p className={pasoAulaClasses.warning}>
          No quedan aulas disponibles para los grados permitidos. Completa la
          documentación requerida o habilita nuevos cupos.
        </p>
      ) : null}
    </div>
  );
};
