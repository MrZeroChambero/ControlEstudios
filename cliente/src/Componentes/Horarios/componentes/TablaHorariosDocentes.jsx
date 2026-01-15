import React, { useMemo } from "react";
import DataTableSeguro from "../../../utilidades/DataTableSeguro";
import { FaEye } from "react-icons/fa";
import {
  dataTableBaseStyles,
  horariosIconClasses,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const DocenteResumen = ({ docente }) => (
  <div className="flex flex-col gap-2 text-left">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-slate-800">{docente.nombre}</p>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {docente.funcion}
      </span>
    </div>
    <div className="space-y-1 text-xs text-slate-500">
      <p>
        <span className="font-semibold text-slate-600">Componentes:</span>{" "}
        {docente.componentesTexto}
      </p>
      <p>
        <span className="font-semibold text-slate-600">Momentos:</span>{" "}
        {docente.momentosTexto}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.isArray(docente.secciones) && docente.secciones.length > 0 ? (
        docente.secciones.map((seccion) => (
          <span
            key={seccion}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            {seccion}
          </span>
        ))
      ) : (
        <span className="text-xs text-slate-400">
          Sin secciones registradas
        </span>
      )}
    </div>
  </div>
);

const TablaHorariosDocentes = ({ datos, cargando, onVerCalendario }) => {
  const columnas = useMemo(
    () => [
      {
        name: "Docente",
        selector: (row) => row.nombre,
        sortable: true,
        grow: 2,
        wrap: true,
        cell: (row) => <DocenteResumen docente={row} />,
      },
      {
        name: "Acciones",
        width: "100px",
        center: true,
        cell: (row) => (
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
            onClick={() => onVerCalendario(row)}
            title="Ver agenda docente"
            aria-label="Ver agenda docente"
          >
            <FaEye className={horariosIconClasses.base} />
          </button>
        ),
      },
    ],
    [onVerCalendario]
  );

  return (
    <DataTableSeguro
      columns={columnas}
      data={datos}
      progressPending={cargando}
      progressComponent={
        <p className={horariosTableClasses.helperText}>Cargando horarios...</p>
      }
      noDataComponent={
        <p className={horariosTableClasses.helperText}>
          No se encontraron docentes con horarios asignados.
        </p>
      }
      customStyles={dataTableBaseStyles}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[5, 10, 15, 20]}
      highlightOnHover
      striped
      responsive
      persistTableHead
    />
  );
};

export default TablaHorariosDocentes;
