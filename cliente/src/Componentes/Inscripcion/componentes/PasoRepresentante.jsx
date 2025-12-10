import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  inscripcionFormClasses,
  inscripcionTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const columnasBase = (seleccionId) => [
  {
    name: "Representante",
    selector: (row) => row.nombre_completo,
    sortable: true,
    cell: (row) => (
      <div name="celda-representante-datos">
        <p className="text-sm font-semibold text-slate-800">
          {row.nombre_completo}
        </p>
        <p className="text-xs text-slate-500">
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
      <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
        {row.tipo_parentesco}
      </span>
    ),
  },
  {
    name: "Profesión",
    selector: (row) => row.profesion,
    grow: 1,
    cell: (row) => (
      <p className="text-xs text-slate-500">
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
        className={`${inscripcionFormClasses.primaryButton} px-3 py-1 text-xs`}
        disabled={seleccionId === row.id_representante}
        data-id={row.id_representante}
      >
        {seleccionId === row.id_representante ? "Seleccionado" : "Elegir"}
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
      className="space-y-4"
      onClick={manejarClick}
      role="presentation"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div name="paso-representante-descripcion">
          <h2 className="text-base font-semibold text-slate-800">
            Representantes vinculados ({datosFiltrados.length})
          </h2>
          <p className="text-sm text-slate-500">
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
          className="w-full max-w-xs rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
          customStyles={estilosTabla}
          conditionalRowStyles={[
            {
              when: (row) => seleccionado?.id === row.id_representante,
              style: {
                backgroundColor: "#e0e7ff",
              },
            },
          ]}
        />
      </div>

      {seleccionado ? (
        <div
          name="paso-representante-seleccion"
          className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700"
        >
          Representante seleccionado:{" "}
          <strong>{seleccionado.nombre_completo}</strong> ({" "}
          {seleccionado.tipo_parentesco}).
        </div>
      ) : null}
    </div>
  );
};
