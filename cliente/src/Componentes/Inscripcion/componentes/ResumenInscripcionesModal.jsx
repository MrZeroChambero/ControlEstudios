import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import {
  contenidosTableClasses,
  contenidosStatusClasses,
  dataTableBaseStyles,
} from "../../EstilosCliente/EstilosClientes";
import Swal from "sweetalert2";
import { retirarInscripcion } from "../inscripcionService";

const formatearGrado = (valor) => {
  if (valor === null || valor === undefined) {
    return "-";
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return String(valor);
  }
  return `${numero}°`;
};

const formatearFechaCorta = (fecha) => {
  if (!fecha) {
    return "—";
  }
  const instancia = new Date(fecha);
  if (Number.isNaN(instancia.getTime())) {
    return fecha;
  }
  return new Intl.DateTimeFormat("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instancia);
};

const columnasResumen = [
  {
    name: "Grado",
    selector: (row) => row.grado,
    sortable: true,
    width: "110px",
    center: true,
    cell: (row) => (
      <span className={contenidosStatusClasses.gradoTag}>
        {formatearGrado(row.grado)}
      </span>
    ),
  },
  {
    name: "Sección",
    selector: (row) => row.seccion,
    sortable: true,
    width: "110px",
    center: true,
    cell: (row) => (
      <span className="text-base font-semibold text-slate-700">
        {row.seccion}
      </span>
    ),
  },
  {
    name: "Docente",
    selector: (row) => row.docente?.nombre ?? "Sin docente",
    sortable: true,
    grow: 2,
    wrap: true,
    cell: (row) => (
      <span className="text-base text-slate-700">
        {row.docente?.nombre ?? "Sin docente asignado"}
      </span>
    ),
  },
  {
    name: "Cupos",
    selector: (row) => row.cupos,
    sortable: true,
    width: "100px",
    center: true,
  },
  {
    name: "Inscritos",
    selector: (row) => row.estudiantes.length,
    sortable: true,
    width: "120px",
    center: true,
    cell: (row) => (
      <span className="text-base font-semibold text-slate-700">
        {row.estudiantes.length}
      </span>
    ),
  },
  {
    name: "Disponibles",
    selector: (row) => row.disponibles,
    sortable: true,
    width: "130px",
    center: true,
    cell: (row) => (
      <span
        className={
          row.disponibles > 0
            ? "text-base font-semibold text-emerald-600"
            : "text-base font-semibold text-rose-600"
        }
      >
        {row.disponibles}
      </span>
    ),
  },
];

const ExpandibleSeccion = ({ data, onRetirar }) => {
  const estudiantes = data.estudiantes ?? [];

  if (estudiantes.length === 0) {
    return (
      <div
        name="expandible-seccion-sin-estudiantes"
        className="px-4 pb-4 text-base text-slate-500"
      >
        No hay estudiantes inscritos en esta sección.
      </div>
    );
  }

  return (
    <div
      name="expandible-seccion-listado"
      className="space-y-3 px-4 pb-6 text-base text-slate-600"
    >
      <div
        name="expandible-seccion-contenedor"
        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <ul className="space-y-3">
          {estudiantes.map((item) => (
            <li
              key={item.id_inscripcion}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div
                name="expandible-seccion-cabecera-estudiante"
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-base font-semibold text-slate-800">
                  {item.estudiante?.nombre_completo ?? "Estudiante sin nombre"}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {formatearFechaCorta(item.fecha_inscripcion)}
                </span>
              </div>
              <div
                name="expandible-seccion-detalles-estudiante"
                className="mt-3 grid gap-3 text-base text-slate-600 md:grid-cols-2"
              >
                <span>
                  C.I.: {item.estudiante?.cedula ? item.estudiante.cedula : "—"}
                </span>
                <span>
                  C.E.:{" "}
                  {item.estudiante?.cedula_escolar
                    ? item.estudiante.cedula_escolar
                    : "—"}
                </span>
                <span>
                  Representante:{" "}
                  {item.representante?.nombre_completo ?? "Sin representante"}
                </span>
                <span>
                  C.I. representante:{" "}
                  {item.representante?.cedula ? item.representante.cedula : "—"}
                </span>
              </div>
              <div
                name="expandible-seccion-acciones"
                className="mt-4 flex flex-wrap items-center justify-end gap-2"
              >
                <button
                  type="button"
                  className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                  onClick={() => onRetirar?.(item)}
                >
                  Retirar estudiante
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

ExpandibleSeccion.propTypes = {
  data: PropTypes.shape({
    estudiantes: PropTypes.arrayOf(
      PropTypes.shape({
        id_inscripcion: PropTypes.number.isRequired,
        fecha_inscripcion: PropTypes.string,
        estudiante: PropTypes.shape({
          nombre_completo: PropTypes.string,
          cedula: PropTypes.string,
          cedula_escolar: PropTypes.string,
        }),
        representante: PropTypes.shape({
          nombre_completo: PropTypes.string,
          cedula: PropTypes.string,
        }),
      })
    ),
  }).isRequired,
  onRetirar: PropTypes.func,
};

export const ResumenInscripcionesModal = ({
  isOpen,
  onClose,
  datos,
  cargando,
  onRetiroExitoso,
}) => {
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFiltro("");
    }
  }, [isOpen]);

  const secciones = useMemo(
    () => (Array.isArray(datos?.secciones) ? datos.secciones : []),
    [datos]
  );
  const totalInscritos = datos?.total ?? 0;
  const infoAnio = datos?.anio ?? null;

  const seccionesConInscritos = useMemo(
    () =>
      secciones.filter((seccion) => (seccion.estudiantes ?? []).length > 0)
        .length,
    [secciones]
  );

  const seccionesFiltradas = useMemo(() => {
    const termino = filtro.trim().toLowerCase();
    if (termino === "") {
      return secciones;
    }

    return secciones.filter((seccion) => {
      const gradoTexto = formatearGrado(seccion.grado).toLowerCase();
      const seccionTexto = String(seccion.seccion ?? "").toLowerCase();
      const docenteTexto = (seccion.docente?.nombre ?? "").toLowerCase();
      const coincideEstudiante = (seccion.estudiantes ?? []).some((item) =>
        (item.estudiante?.nombre_completo ?? "").toLowerCase().includes(termino)
      );

      return (
        gradoTexto.includes(termino) ||
        seccionTexto.includes(termino) ||
        docenteTexto.includes(termino) ||
        coincideEstudiante
      );
    });
  }, [filtro, secciones]);

  const resumenSuperior = (
    <div
      name="resumen-inscripciones-resumen-superior"
      className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-base text-slate-600 md:grid-cols-3"
    >
      <div name="resumen-inscripciones-superior-anio" className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Año escolar activo
        </p>
        <p className="text-lg font-semibold text-slate-800">
          {infoAnio
            ? `${formatearFechaCorta(
                infoAnio.fecha_inicio
              )} - ${formatearFechaCorta(infoAnio.fecha_fin)}`
            : "Sin información"}
        </p>
        {infoAnio?.fecha_limite_inscripcion ? (
          <p className="text-sm text-slate-500">
            Límite de inscripción:{" "}
            {formatearFechaCorta(infoAnio.fecha_limite_inscripcion)}
          </p>
        ) : null}
      </div>
      <div
        name="resumen-inscripciones-superior-secciones"
        className="space-y-2"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Secciones activas
        </p>
        <p className="text-lg font-semibold text-slate-800">
          {secciones.length}
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({seccionesConInscritos} con inscripciones)
          </span>
        </p>
      </div>
      <div
        name="resumen-inscripciones-superior-inscripciones"
        className="space-y-2"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Inscripciones registradas
        </p>
        <p className="text-lg font-semibold text-slate-800">{totalInscritos}</p>
      </div>
    </div>
  );

  const barraBusqueda = (
    <div className="flex w-full flex-col gap-4 text-base sm:flex-row sm:items-center sm:justify-between">
      <input
        type="text"
        value={filtro}
        onChange={(evento) => setFiltro(evento.target.value)}
        placeholder="Filtra por grado, sección, docente o estudiante"
        className={`${contenidosTableClasses.filterInput} text-base sm:max-w-xs`}
      />
      <span className="text-base text-slate-500">
        Se muestran {seccionesFiltradas.length} de {secciones.length} secciones
        disponibles
      </span>
    </div>
  );
  const tablaEstilos = useMemo(() => {
    const headRowStyle = {
      ...(dataTableBaseStyles.headRow?.style ?? {}),
      fontSize: "15px",
    };
    const headCellsStyle = {
      ...(dataTableBaseStyles.headCells?.style ?? {}),
      fontSize: "15px",
      fontWeight: 600,
    };
    const cellsStyle = {
      ...(dataTableBaseStyles.cells?.style ?? {}),
      fontSize: "16px",
    };

    return {
      ...dataTableBaseStyles,
      headRow: {
        ...dataTableBaseStyles.headRow,
        style: headRowStyle,
      },
      headCells: {
        ...dataTableBaseStyles.headCells,
        style: headCellsStyle,
      },
      cells: {
        ...dataTableBaseStyles.cells,
        style: cellsStyle,
      },
    };
  }, []);

  const opcionesPaginacion = useMemo(
    () => ({
      rowsPerPageText: "Filas por página",
      rangeSeparatorText: "de",
      noRowsPerPage: false,
      selectAllRowsItem: false,
    }),
    []
  );

  const manejarRetiroInscripcion = useCallback(
    async (inscripcion) => {
      if (!inscripcion?.id_inscripcion) {
        return;
      }

      const { isConfirmed, value } = await Swal.fire({
        title: "Retirar inscripción",
        html: `
          <div class="space-y-4 text-left">
            <div>
              <label for="retiro-clave" class="block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="retiro-clave" type="password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" autocomplete="current-password" placeholder="Ingresa tu contraseña" />
            </div>
            <div>
              <label for="retiro-motivo" class="block text-sm font-medium text-slate-700">Motivo (opcional)</label>
              <input id="retiro-motivo" type="text" maxlength="255" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Motivo del retiro" />
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Retirar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const claveInput = document.getElementById("retiro-clave");
          const motivoInput = document.getElementById("retiro-motivo");
          const claveValor = claveInput?.value.trim();
          const motivoValor = motivoInput?.value.trim() ?? "";
          if (!claveValor) {
            Swal.showValidationMessage("Debes ingresar tu contraseña.");
            return null;
          }
          return {
            clave: claveValor,
            motivo: motivoValor,
          };
        },
      });

      if (!isConfirmed || !value) {
        return;
      }

      const payload = value.motivo
        ? { clave: value.clave, motivo: value.motivo }
        : { clave: value.clave };

      Swal.fire({
        title: "Procesando retiro...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let resultado = null;
      try {
        resultado = await retirarInscripcion(
          inscripcion.id_inscripcion,
          payload,
          Swal
        );
      } finally {
        Swal.close();
      }

      if (resultado && typeof onRetiroExitoso === "function") {
        await onRetiroExitoso();
      }
    },
    [onRetiroExitoso]
  );

  const ExpandibleFila = useCallback(
    (props) => (
      <ExpandibleSeccion {...props} onRetirar={manejarRetiroInscripcion} />
    ),
    [manejarRetiroInscripcion]
  );

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de inscripciones"
      size="xl"
      bodyClassName="space-y-6"
    >
      <div className="space-y-6">
        {resumenSuperior}
        {barraBusqueda}
        <DataTable
          columns={columnasResumen}
          data={seccionesFiltradas}
          progressPending={cargando}
          progressComponent={
            <p className="text-base text-slate-500">
              Cargando resumen de inscripciones...
            </p>
          }
          noDataComponent={
            <p className="text-base text-slate-500">
              {cargando
                ? ""
                : "No se registran inscripciones activas para el año escolar seleccionado."}
            </p>
          }
          customStyles={tablaEstilos}
          pagination
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          paginationComponentOptions={opcionesPaginacion}
          dense
          responsive
          highlightOnHover
          pointerOnHover
          striped
          persistTableHead
          expandableRows
          expandableRowsComponent={ExpandibleFila}
        />
      </div>
    </VentanaModal>
  );
};

ResumenInscripcionesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  datos: PropTypes.shape({
    total: PropTypes.number,
    anio: PropTypes.shape({
      fecha_inicio: PropTypes.string,
      fecha_fin: PropTypes.string,
      fecha_limite_inscripcion: PropTypes.string,
    }),
    secciones: PropTypes.arrayOf(
      PropTypes.shape({
        aula_id: PropTypes.number,
        grado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        seccion: PropTypes.string,
        cupos: PropTypes.number,
        ocupados: PropTypes.number,
        disponibles: PropTypes.number,
        estudiantes: PropTypes.array,
      })
    ),
  }),
  cargando: PropTypes.bool,
  onRetiroExitoso: PropTypes.func,
};

ResumenInscripcionesModal.defaultProps = {
  datos: null,
  cargando: false,
  onRetiroExitoso: null,
};

export default ResumenInscripcionesModal;
