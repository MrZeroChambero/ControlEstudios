import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FaToggleOn, FaToggleOff, FaEdit } from "react-icons/fa";
import {
  aulasTableClasses,
  aulasStatusClasses,
  aulasIconClasses,
} from "../EstilosCliente/EstilosClientes";

const formatearGrado = (valor) => `Grado ${valor}`;

export const AulasTable = ({
  aulas,
  isLoading,
  onToggleEstado,
  onEditarCupos,
}) => {
  const [filtro, setFiltro] = useState("");

  const registros = useMemo(() => {
    const termino = filtro.trim().toLowerCase();
    if (termino === "") {
      return aulas;
    }

    return aulas.filter((item) => {
      const grado = (item.grado ?? "").toString().toLowerCase();
      const seccion = (item.seccion ?? "").toString().toLowerCase();
      return grado.includes(termino) || seccion.includes(termino);
    });
  }, [aulas, filtro]);

  const columnas = [
    {
      name: "Grado",
      selector: (row) => row.grado,
      sortable: true,
      width: "110px",
      center: true,
      cell: (row) => formatearGrado(row.grado),
    },
    {
      name: "Seccion",
      selector: (row) => row.seccion,
      sortable: true,
      width: "110px",
      center: true,
      cell: (row) => row.seccion,
    },
    {
      name: "Cupos",
      selector: (row) => row.cupos ?? "--",
      sortable: true,
      width: "120px",
      center: true,
      cell: (row) => (
        <button
          type="button"
          className={`${aulasTableClasses.actionButton} ${
            aulasTableClasses.editButton
          } ${row.puedeEditarCupos ? "" : "opacity-40 cursor-not-allowed"}`}
          onClick={() => row.puedeEditarCupos && onEditarCupos(row)}
          title={
            row.puedeEditarCupos
              ? "Editar cupos"
              : "No puede modificar cupos cuando existen inscripciones"
          }
          disabled={!row.puedeEditarCupos}
        >
          <span className="text-sm font-semibold">{row.cupos ?? "--"}</span>
        </button>
      ),
    },
    {
      name: "Inscripciones",
      selector: (row) => row.inscripciones,
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      width: "140px",
      center: true,
      cell: (row) => (
        <span
          className={`${aulasStatusClasses.base} ${
            row.estado === "activo"
              ? aulasStatusClasses.activo
              : aulasStatusClasses.inactivo
          }`}
        >
          {row.estado}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "140px",
      center: true,
      cell: (row) => {
        const esActivo = row.estado === "activo";
        const puedeCambiar = esActivo ? row.puedeDesactivar : row.puedeActivar;
        const titulo = esActivo ? "Desactivar aula" : "Activar aula";

        return (
          <div className={aulasTableClasses.actionGroup}>
            <button
              type="button"
              onClick={() => puedeCambiar && onToggleEstado(row)}
              className={`${aulasTableClasses.actionButton} ${
                esActivo
                  ? aulasTableClasses.toggleOff
                  : aulasTableClasses.toggleOn
              } ${puedeCambiar ? "" : "opacity-40 cursor-not-allowed"}`}
              title={
                puedeCambiar
                  ? titulo
                  : esActivo
                  ? "Solo puede desactivar la ultima seccion activa"
                  : "Debe activar la seccion inmediatamente anterior"
              }
              disabled={!puedeCambiar}
            >
              {esActivo ? (
                <FaToggleOn className={aulasIconClasses.base} />
              ) : (
                <FaToggleOff className={aulasIconClasses.base} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  const barraBusqueda = (
    <div className={aulasTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por grado o seccion"
        className={aulasTableClasses.filterInput}
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
      />
    </div>
  );

  const estilosPersonalizados = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "uppercase",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
  };

  return (
    <DataTable
      columns={columnas}
      data={registros}
      progressPending={isLoading}
      progressComponent={
        <p className={aulasTableClasses.helperText}>
          Cargando informacion de aulas...
        </p>
      }
      noDataComponent={
        <p className={aulasTableClasses.helperText}>
          No hay aulas registradas. Configure las secciones y vuelva a
          intentarlo.
        </p>
      }
      subHeader
      subHeaderComponent={barraBusqueda}
      pagination
      striped
      highlightOnHover
      pointerOnHover
      customStyles={estilosPersonalizados}
    />
  );
};
