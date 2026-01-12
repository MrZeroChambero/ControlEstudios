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
    </StyleSheetManager>
  );
};

export default TablaHorariosAulas;
