import React from "react";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";
import {
  usuariosTableClasses,
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";
import { TablaEntradas } from "../Tablas/Tablas.jsx";

export const UsuariosTable = ({
  usuarios = [],
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const columns = [
    {
      name: "Nombre de Usuario",
      selector: (row) => row.nombre_usuario,
      sortable: true,
      wrap: true,
    },

    {
      name: "Cédula",
      selector: (row) => row.cedula,
      sortable: true,
      wrap: true,
    },

    {
      name: "Rol",
      selector: (row) => row.rol,
      sortable: true,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`${usuariosTableClasses.statusChip.base} ${
            row.estado === "activo"
              ? usuariosTableClasses.statusChip.activo
              : usuariosTableClasses.statusChip.inactivo
          }`}
        >
          {row.estado}
        </span>
      ),
      sortable: true,
      width: "100px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={usuariosTableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${usuariosTableClasses.actionButton} ${usuariosTableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`${usuariosTableClasses.actionButton} ${
              row.estado === "activo"
                ? usuariosTableClasses.toggleOn
                : usuariosTableClasses.toggleOff
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${usuariosTableClasses.actionButton} ${usuariosTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_usuario)}
            className={`${usuariosTableClasses.actionButton} ${usuariosTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const filterConfig = {
    placeholder: "Buscar por usuario, nombre, cédula o rol...",
    wrapperClassName: usuariosTableClasses.filterContainer,
    inputClassName: usuariosTableClasses.filterInput,
    matcher: (item, term) => {
      const campos = [
        item.nombre_usuario,
        item.nombre_completo,
        item.cedula,
        item.rol,
      ];
      return campos.some(
        (campo) => campo && campo.toLowerCase().includes(term)
      );
    },
  };

  return (
    <div className={usuariosTableClasses.wrapper}>
      <TablaEntradas
        columns={columns}
        isLoading={isLoading}
        data={usuarios}
        filterConfig={filterConfig}
        progressComponent={
          <p className={usuariosTableClasses.helperText}>
            Cargando usuarios...
          </p>
        }
        noDataComponent={
          <p className={usuariosTableClasses.helperText}>
            No hay usuarios para mostrar.
          </p>
        }
        dataTableProps={{
          responsive: true,
        }}
      />
    </div>
  );
};
