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
        grow: 1.6,
        wrap: true,
      },
      {
        name: "Función",
        selector: (row) => row.funcion,
        sortable: true,
        width: "180px",
        wrap: true,
      },
      {
        name: "Componentes",
        selector: (row) => row.componentesTexto,
        sortable: true,
        grow: 1.6,
        wrap: true,
      },
      {
        name: "Momentos",
        selector: (row) => row.momentosTexto,
        sortable: true,
        grow: 1.2,
        wrap: true,
      },
      {
        name: "Acciones",
        width: "100px",
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
