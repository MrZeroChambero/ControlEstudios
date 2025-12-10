import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  inscripcionFormClasses,
  inscripcionTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const columnasBase = (seleccionadoId) => [
  {
    name: "Estudiante",
    selector: (row) => row.nombre_completo,
    sortable: true,
    cell: (row) => (
      <div name="celda-estudiante-datos">
        <p className="text-sm font-semibold text-slate-800">
          {row.nombre_completo}
        </p>
        <p className="text-xs text-slate-500">
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
      <span className="text-sm text-slate-600">{row.edad} años</span>
    ),
  },
  {
    name: "Grados permitidos",
    selector: (row) => row.grados_permitidos,
    cell: (row) => (
      <div name="celda-estudiante-grados" className="flex flex-wrap gap-1">
        {row.grados_permitidos.map((grado) => (
          <span
            key={`${row.id}-${grado}`}
            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600"
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
        className={`${inscripcionFormClasses.primaryButton} px-3 py-1 text-xs`}
        disabled={seleccionadoId === row.id}
        data-id={row.id}
      >
        {seleccionadoId === row.id ? "Seleccionado" : "Elegir"}
      </button>
    ),
  },
];

const estilosTabla = {
  headCells: {
    style: {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      color: "#475569",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      color: "#1f2937",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fafc",
    },
  },
};

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
      className="space-y-4"
      onClick={manejarClick}
      role="presentation"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div name="paso-estudiante-descripcion">
          <h2 className="text-base font-semibold text-slate-800">
            Estudiantes elegibles ({datosFiltrados.length})
          </h2>
          <p className="text-sm text-slate-500">
            Selecciona un estudiante que cumpla con la edad correspondiente al
            grado.
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o cédula"
          className="w-full max-w-xs rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
          customStyles={estilosTabla}
          conditionalRowStyles={[
            {
              when: (row) => seleccionado?.id === row.id,
              style: {
                backgroundColor: "#dbeafe",
              },
            },
          ]}
        />
      </div>

      {seleccionado ? (
        <div
          name="paso-estudiante-seleccion"
          className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700"
        >
          Estudiante seleccionado:{" "}
          <strong>{seleccionado.nombre_completo}</strong> (C.I.{" "}
          {seleccionado.cedula || "N/A"}).
        </div>
      ) : null}
    </div>
  );
};
