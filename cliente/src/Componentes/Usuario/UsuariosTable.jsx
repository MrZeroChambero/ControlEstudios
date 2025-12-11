import React, { useState } from "react";
import DataTable from "react-data-table-component";
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
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";

export const UsuariosTable = ({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = usuarios.filter(
    (item) =>
      item.nombre_usuario.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.nombre_completo &&
        item.nombre_completo
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.cedula &&
        item.cedula.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.rol && item.rol.toLowerCase().includes(filterText.toLowerCase()))
  );

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

  const subHeaderComponent = (
    <div className={usuariosTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por usuario, nombre, cédula o rol..."
        className={usuariosTableClasses.filterInput}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  return (
    <div className={usuariosTableClasses.wrapper}>
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={dataTableBaseStyles}
        progressPending={isLoading}
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
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        subHeader
        subHeaderComponent={subHeaderComponent}
        striped
        highlightOnHover
        responsive
      />
    </div>
  );
};
