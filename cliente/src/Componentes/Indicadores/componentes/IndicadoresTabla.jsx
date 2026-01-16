import React, { useMemo } from "react";
import {
  indicadoresTableClasses,
  indicadoresIconClasses,
} from "../indicadoresEstilos";
import { TablaEntradas } from "../../Tablas/Tablas.jsx";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const tableClasses = indicadoresTableClasses;

export const IndicadoresTabla = ({
  indicadores = [],
  estaCargando,
  onVerIndicador,
  onEditarIndicador,
  onEliminarIndicador,
  onToggleIndicador,
}) => {
  const columnas = useMemo(
    () => [
      {
        name: "Indicador",
        selector: (row) => row.nombre_indicador,
        grow: 2,
        wrap: true,
      },
      {
        name: "Aspecto",
        selector: (row) => row.aspecto,
        sortable: true,
        width: "140px",
      },
      {
        name: "Orden",
        selector: (row) => row.orden,
        sortable: true,
        width: "110px",
        center: true,
      },
      {
        name: "Competencia",
        selector: (row) => row.competencia?.nombre,
        sortable: true,
        grow: 1,
        center: true,
        wrap: true,
      },
      {
        name: "Componente",
        selector: (row) => row.componente?.nombre,
        sortable: true,
        wrap: true,
      },
      {
        name: "Área",
        selector: (row) => row.area?.nombre,
        sortable: true,
        wrap: true,
      },
      {
        name: "Visible",
        selector: (row) => (row.ocultar === "si" ? "No" : "Sí"),
        width: "110px",
        center: true,
        sortable: true,
      },
      {
        name: "Acciones",
        width: "190px",
        center: true,
        cell: (row) => (
          <div className={tableClasses.actionGroup}>
            <button
              type="button"
              onClick={() => onVerIndicador(row)}
              className={`${tableClasses.actionButton} ${tableClasses.viewButton}`}
              title="Ver detalle del indicador"
            >
              <FaEye className={indicadoresIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => onToggleIndicador(row)}
              className={`${tableClasses.actionButton} ${
                row.ocultar === "si"
                  ? tableClasses.toggleOff
                  : tableClasses.toggleOn
              }`}
              title={
                row.ocultar === "si" ? "Mostrar indicador" : "Ocultar indicador"
              }
            >
              {row.ocultar === "si" ? (
                <FaToggleOff className={indicadoresIconClasses.base} />
              ) : (
                <FaToggleOn className={indicadoresIconClasses.base} />
              )}
            </button>
            <button
              type="button"
              onClick={() => onEditarIndicador(row)}
              className={`${tableClasses.actionButton} ${tableClasses.editButton}`}
              title="Editar indicador"
            >
              <FaEdit className={indicadoresIconClasses.base} />
            </button>
            <button
              type="button"
              onClick={() => onEliminarIndicador(row)}
              className={`${tableClasses.actionButton} ${tableClasses.deleteButton}`}
              title="Eliminar indicador"
            >
              <FaTrash className={indicadoresIconClasses.base} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [onEditarIndicador, onEliminarIndicador, onToggleIndicador, onVerIndicador]
  );

  const filterConfig = useMemo(
    () => ({
      placeholder: "Buscar por indicador, competencia, componente o área...",
      wrapperClassName: tableClasses.filterContainer,
      inputClassName: tableClasses.filterInput,
      matcher: (item, normalizedValue) => {
        const indicador = item.nombre_indicador?.toLowerCase() ?? "";
        const aspecto = item.aspecto?.toLowerCase() ?? "";
        const competencia = item.competencia?.nombre?.toLowerCase() ?? "";
        const componente = item.componente?.nombre?.toLowerCase() ?? "";
        const area = item.area?.nombre?.toLowerCase() ?? "";

        return (
          indicador.includes(normalizedValue) ||
          aspecto.includes(normalizedValue) ||
          competencia.includes(normalizedValue) ||
          componente.includes(normalizedValue) ||
          area.includes(normalizedValue)
        );
      },
    }),
    []
  );

  return (
    <TablaEntradas
      columns={columnas}
      isLoading={estaCargando}
      data={indicadores}
      filterConfig={filterConfig}
      progressComponent={
        <p className={tableClasses.helperText}>Cargando indicadores...</p>
      }
      noDataComponent={
        <p className={tableClasses.helperText}>
          No hay indicadores registrados para los filtros actuales.
        </p>
      }
      dataTableProps={{
        responsive: true,
        persistTableHead: true,
      }}
    />
  );
};
