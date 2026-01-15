import React, { useMemo } from "react";
import DataTableSeguro from "../../../utilidades/DataTableSeguro";
import { FaEye } from "react-icons/fa";
import {
  dataTableBaseStyles,
  horariosIconClasses,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const ResumenAula = ({ registro }) => (
  <div className="flex flex-col text-left text-sm text-slate-700">
    <p className="font-semibold text-slate-900">
      {`Grado ${registro.grado ?? "?"} - Sección ${registro.seccion ?? "?"}`}
    </p>
    <p className="text-xs text-slate-500">
      {registro.momento || "Momento sin definir"}
    </p>
  </div>
);

const TablaHorariosAulas = ({ datos, cargando, onVerCalendario }) => {
  const columnas = useMemo(
    () => [
      {
        name: "Grado/Sección",
        selector: (row) =>
          `Grado ${row.grado ?? "?"} - Sección ${row.seccion ?? "?"}`,
        sortable: true,
        grow: 1.4,
        wrap: true,
        cell: (row) => <ResumenAula registro={row} />,
      },
      {
        name: "Momento",
        selector: (row) => row.momento,
        sortable: true,
        width: "180px",
        wrap: true,
      },
      {
        name: "Año escolar",
        selector: (row) => row.anioEscolar ?? "N/D",
        sortable: true,
        width: "140px",
      },
      {
        name: "Bloques",
        selector: (row) => row.horarios.length,
        sortable: true,
        width: "120px",
        center: true,
      },
      {
        name: "Acciones",
        width: "100px",
        cell: (row) => (
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
            onClick={() => onVerCalendario(row)}
            title="Ver horario del aula"
            aria-label="Ver horario del aula"
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
          No se encontraron horarios para las aulas consultadas.
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

export default TablaHorariosAulas;
