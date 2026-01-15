import React, { useState } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";
import {
  contenidosIconClasses,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";
import { estudiantesTableClasses } from "./estudiantesEstilos";
import { calcularEdad } from "../../utilidades/formatoFechas";

export const EstudiantesTable = ({
  estudiantes,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = (estudiantes || []).filter((item) => {
    const nombreCompleto = `${item.primer_nombre || ""} ${
      item.segundo_nombre || ""
    } ${item.primer_apellido || ""} ${
      item.segundo_apellido || ""
    }`.toLowerCase();
    const grado = (item.grado || "").toString().toLowerCase();
    const seccion = (item.seccion || "").toString().toLowerCase();
    return (
      nombreCompleto.includes(filterText.toLowerCase()) ||
      (item.cedula || "").toLowerCase().includes(filterText.toLowerCase()) ||
      grado.includes(filterText.toLowerCase()) ||
      seccion.includes(filterText.toLowerCase())
    );
  });

  const obtenerEdad = (row) => {
    const fecha = row.fecha_nacimiento || row.persona?.fecha_nacimiento || null;
    const edad = calcularEdad(fecha);
    return edad;
  };

  const obtenerEtiquetaGradoSeccion = (row) => {
    const limpiarCampo = (valor) => {
      const texto = (valor ?? "").toString().trim();
      if (texto === "") return "";
      return texto.toLowerCase() === "sin asignar" ? "" : texto;
    };

    const grado = limpiarCampo(row.grado);
    const seccion = limpiarCampo(row.seccion);
    const tieneGrado = grado !== "";
    const tieneSeccion = seccion !== "";

    if (!tieneGrado && !tieneSeccion) {
      return "Sin asignar";
    }

    if (tieneGrado && tieneSeccion) {
      return `${grado} - ${seccion}`;
    }

    return tieneGrado ? grado : seccion;
  };

  const columns = [
    {
      name: "Nombre Completo",
      selector: (row) =>
        `${row.primer_nombre} ${row.segundo_nombre || ""} ${
          row.primer_apellido
        } ${row.segundo_apellido || ""}`,
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
      name: "Edad",
      selector: (row) => {
        const edad = obtenerEdad(row);
        return edad === null ? -1 : edad;
      },
      sortable: true,
      width: "80px",
      center: true,
      cell: (row) => {
        const edad = obtenerEdad(row);
        return edad === null ? "-" : `${edad}`;
      },
    },
    {
      name: "Grado/Sección",
      selector: (row) => obtenerEtiquetaGradoSeccion(row).toLowerCase(),
      sortable: true,
      wrap: true,
      width: "160px",
      cell: (row) => (
        <span className="whitespace-pre-line">
          {obtenerEtiquetaGradoSeccion(row)}
        </span>
      ),
    },
    {
      name: "Estado Persona",
      cell: (row) => {
        const estado = (row.estado_persona || "").toLowerCase();
        const estadoClase =
          estado === "activo"
            ? estudiantesTableClasses.status.activo
            : estado === "incompleto"
            ? estudiantesTableClasses.status.incompleto
            : estado === "inactivo"
            ? estudiantesTableClasses.status.inactivo
            : estudiantesTableClasses.status.desconocido;

        return (
          <span
            className={`${estudiantesTableClasses.status.base} ${estadoClase}`}
          >
            {row.estado_persona || "-"}
          </span>
        );
      },
      sortable: true,
      width: "140px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={estudiantesTableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`${estudiantesTableClasses.actionButton} ${
              row.estado_persona === "activo"
                ? estudiantesTableClasses.toggleOn
                : estudiantesTableClasses.toggleOff
            }`}
            title={
              row.estado_persona === "activo"
                ? "Desactivar (persona)"
                : "Activar (persona)"
            }
          >
            {row.estado_persona === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(row.id_estudiante ?? row.id)}
              className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.deleteButton}`}
              title="Eliminar"
            >
              <FaTrash className={contenidosIconClasses.base} />
            </button>
          )}
        </div>
      ),
      width: "220px",
    },
  ];

  const subHeaderComponent = (
    <div className={estudiantesTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre, cédula o grado/sección..."
        className={estudiantesTableClasses.filterInputWide}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  return (
    <div className={estudiantesTableClasses.wrapper}>
      <DataTableSeguro
        columns={columns}
        data={filteredItems}
        progressPending={isLoading}
        progressComponent={
          <p className={estudiantesTableClasses.helperText}>
            Cargando estudiantes...
          </p>
        }
        noDataComponent={
          <p className={estudiantesTableClasses.helperText}>
            No hay estudiantes para mostrar.
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
        customStyles={dataTableBaseStyles}
      />
    </div>
  );
};
