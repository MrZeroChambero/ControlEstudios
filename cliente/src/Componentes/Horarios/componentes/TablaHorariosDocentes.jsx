import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { StyleSheetManager } from "styled-components";
import { FaEye } from "react-icons/fa";
import {
  dataTableBaseStyles,
  horariosIconClasses,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";
import { filtrarPropsTabla } from "../utilidadesHorarios";

const TablaHorariosDocentes = ({ datos, cargando, onVerCalendario }) => {
  const columnas = useMemo(
    () => [
      {
        name: "Docente",
        selector: (row) => row.nombre,
        sortable: true,
        grow: 2,
        wrap: true,
        cell: (row) => (
          <div className="flex flex-col gap-2 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {row.nombre}
              </p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {row.funcion}
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>
                <span className="font-semibold text-slate-600">
                  Componentes:
                </span>{" "}
                {row.componentesTexto}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Momentos:</span>{" "}
                {row.momentosTexto}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(row.secciones) && row.secciones.length > 0 ? (
                row.secciones.map((seccion) => (
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
        ),
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
    <StyleSheetManager shouldForwardProp={filtrarPropsTabla}>
      <DataTable
        columns={columnas}
        data={datos}
        progressPending={cargando}
        progressComponent={
          <p className={horariosTableClasses.helperText}>
            Cargando horarios...
          </p>
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
    </StyleSheetManager>
  );
};

export default TablaHorariosDocentes;
