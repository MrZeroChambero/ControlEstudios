import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import {
  componentesTableClasses,
  componentesStatusClasses,
  componentesIconClasses,
  componentesTypePillBase,
} from "./componentesAprendizajeEstilos";
import { TablaEntradas } from "../Tablas/Tablas.jsx";

export const ComponentesAprendizajeTable = ({
  componentes = [],
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}) => {
  const tipoDocentePills = {
    aula: "bg-blue-100 text-blue-700",
    especialista: "bg-purple-100 text-purple-700",
    cultura: "bg-amber-100 text-amber-700",
  };

  const obtenerTipoDocentePill = (row) => {
    const codigo = row.tipo_docente || "aula";
    const clases = tipoDocentePills[codigo] || tipoDocentePills.aula;
    const etiqueta = row.especialista || "Docente de aula";
    return (
      <span className={`${componentesTypePillBase} ${clases}`}>{etiqueta}</span>
    );
  };

  const columns = [
    {
      name: "Área",
      selector: (row) => row.nombre_area || "Sin área",
      sortable: true,
      grow: 1.5,
      wrap: true,
    },
    {
      name: "Nombre del Componente",
      selector: (row) => row.nombre_componente,
      sortable: true,
      grow: 2,
    },
    {
      name: "Tipo de docente",
      selector: (row) => row.especialista || "Docente de aula",
      sortable: true,
      grow: 1.4,
      wrap: true,
      cell: obtenerTipoDocentePill,
    },
    {
      name: "Evalúa",
      cell: (row) => (
        <span
          className={`${componentesStatusClasses.base} ${
            row.evalua === "si"
              ? componentesStatusClasses.evalYes
              : componentesStatusClasses.evalNo
          }`}
        >
          {row.evalua === "si" ? "Sí evalúa" : "No evalúa"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.evalua,
      width: "150px",
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`${componentesStatusClasses.base} ${
            row.estado_componente === "activo"
              ? componentesStatusClasses.active
              : componentesStatusClasses.inactive
          }`}
        >
          {row.estado_componente === "activo" ? "Activo" : "Inactivo"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado_componente,
      width: "120px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={componentesTableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${componentesTableClasses.actionButton} ${componentesTableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={componentesIconClasses.base} />
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${componentesTableClasses.actionButton} ${componentesTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={componentesIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_componente)}
            className={`${componentesTableClasses.actionButton} ${componentesTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={componentesIconClasses.base} />
          </button>
          <button
            onClick={() => onStatusChange(row.id_componente)}
            className={`${componentesTableClasses.actionButton} ${
              row.estado_componente === "activo"
                ? componentesTableClasses.toggleOn
                : componentesTableClasses.toggleOff
            }`}
            title={
              row.estado_componente === "activo" ? "Desactivar" : "Activar"
            }
          >
            {row.estado_componente === "activo" ? (
              <FaToggleOn className={componentesIconClasses.base} />
            ) : (
              <FaToggleOff className={componentesIconClasses.base} />
            )}
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const filterConfig = {
    placeholder: "Buscar por nombre, área o tipo",
    wrapperClassName: componentesTableClasses.filterContainer,
    inputClassName: componentesTableClasses.filterInput,
    matcher: (item, term) => {
      const campos = [
        item.nombre_componente,
        item.nombre_area,
        item.especialista,
        item.tipo_docente,
      ];
      return campos.some(
        (campo) => campo && campo.toLowerCase().includes(term)
      );
    },
  };

  return (
    <TablaEntradas
      columns={columns}
      isLoading={isLoading}
      data={componentes}
      filterConfig={filterConfig}
      progressComponent={
        <p className={componentesTableClasses.helperText}>
          Cargando componentes...
        </p>
      }
      noDataComponent={
        <p className={componentesTableClasses.helperText}>
          No hay componentes para mostrar.
        </p>
      }
      dataTableProps={{
        responsive: true,
      }}
    />
  );
};
