import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { dataTableBaseStyles } from "../EstilosCliente/EstilosClientes";
import {
  respaldoLayoutClasses,
  respaldoTablaClasses,
  respaldoModalClasses,
} from "./respaldoEstilos";
import {
  listarRespaldos,
  crearRespaldo,
  restaurarRespaldo,
  restaurarDesdeArchivo,
  construirUrlDescarga,
} from "./respaldoService";

const obtenerTimestamp = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const formatearFecha = (timestamp) => {
  const ts = obtenerTimestamp(timestamp);
  if (ts === null) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("es-VE", {
      dateStyle: "medium",
    }).format(new Date(ts * 1000));
  } catch (error) {
    return "—";
  }
};

const formatearHora = (timestamp) => {
  const ts = obtenerTimestamp(timestamp);
  if (ts === null) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("es-VE", {
      timeStyle: "medium",
    }).format(new Date(ts * 1000));
  } catch (error) {
    return "—";
  }
};

const obtenerCreador = (item) => {
  if (item?.creador) {
    return item.creador;
  }
  if (item?.creado_por) {
    return item.creado_por;
  }
  if (item?.origen === "archivo") {
    return "Archivo importado";
  }
  return "Sistema";
};

const formatearTamano = (bytes) => {
  const total = Number(bytes || 0);
  if (!Number.isFinite(total) || total <= 0) {
    return "0 B";
  }

  const unidades = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(
    Math.floor(Math.log(total) / Math.log(1024)),
    unidades.length - 1
  );
  const valor = total / 1024 ** exp;
  return `${valor.toFixed(2)} ${unidades[exp]}`;
};

export const Respaldo = () => {
  const [respaldos, setRespaldos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [restaurando, setRestaurando] = useState(null);

  const cargarRespaldos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await listarRespaldos();
      setRespaldos(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error al cargar respaldos", error);
      Swal.fire(
        "Error",
        error?.message || "No se pudo obtener el listado de respaldos.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarRespaldos();
  }, [cargarRespaldos]);

  const respaldosFiltrados = useMemo(() => {
    if (!busqueda) {
      return respaldos;
    }

    const termino = busqueda.toLowerCase();
    return respaldos.filter((item) =>
      [item.nombre, item.fecha]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termino))
    );
  }, [busqueda, respaldos]);

  const sinResultadosBusqueda =
    !cargando && respaldosFiltrados.length === 0 && respaldos.length > 0;

  const manejarCrearRespaldo = async () => {
    const confirmacion = await Swal.fire({
      title: "Crear respaldo",
      text: "Se generará un nuevo archivo con la estructura y los datos actuales. ¿Deseas continuar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear respaldo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setCreando(true);
    try {
      const nuevo = await crearRespaldo();
      await cargarRespaldos();
      Swal.fire(
        "Respaldado",
        nuevo?.nombre
          ? `Se creó el respaldo ${nuevo.nombre} correctamente.`
          : "Se creó el respaldo correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error al crear respaldo", error);
      Swal.fire(
        "Error",
        error?.message || "No se pudo completar la creación del respaldo.",
        "error"
      );
    } finally {
      setCreando(false);
    }
  };

  const manejarRestaurar = async (nombre) => {
    const confirmacion = await Swal.fire({
      title: "Restaurar respaldo",
      text: `Se sobrescribirá la base de datos con el respaldo ${nombre}. Esta acción no se puede deshacer. ¿Deseas continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setRestaurando(nombre);
    try {
      await restaurarRespaldo(nombre);
      Swal.fire(
        "Restauración completada",
        "La base de datos fue restaurada exitosamente.",
        "success"
      );
      await cargarRespaldos();
    } catch (error) {
      console.error("Error al restaurar respaldo", error);
      Swal.fire(
        "Error",
        error?.message || "No se pudo restaurar la base de datos.",
        "error"
      );
    } finally {
      setRestaurando(null);
    }
  };

  const manejarDescarga = (nombre) => {
    const url = construirUrlDescarga(nombre);
    window.open(url, "_blank", "noopener");
  };

  const abrirModalRestaurarArchivo = () => {
    setArchivoSeleccionado(null);
    setModalRestaurarAbierto(true);
  };

  const cerrarModalRestaurarArchivo = () => {
    if (procesando) {
      return;
    }
    setModalRestaurarAbierto(false);
    setArchivoSeleccionado(null);
  };

  const manejarSubmitArchivo = async (evento) => {
    evento.preventDefault();
    if (!archivoSeleccionado) {
      Swal.fire(
        "Archivo requerido",
        "Selecciona un archivo .sql para continuar.",
        "info"
      );
      return;
    }

    setProcesando(true);
    try {
      await restaurarDesdeArchivo(archivoSeleccionado);
      Swal.fire(
        "Restauración completada",
        "La base de datos fue restaurada usando el archivo seleccionado.",
        "success"
      );
      cerrarModalRestaurarArchivo();
      await cargarRespaldos();
    } catch (error) {
      console.error("Error al restaurar desde archivo", error);
      Swal.fire(
        "Error",
        error?.message ||
          "No se pudo restaurar la base de datos con el archivo proporcionado.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const columnas = useMemo(
    () => [
      {
        name: "Archivo",
        selector: (row) => row.nombre,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span className={respaldoTablaClasses.fileName}>{row.nombre}</span>
        ),
      },
      {
        name: "Fecha",
        selector: (row) => obtenerTimestamp(row.timestamp) ?? 0,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <span className={respaldoTablaClasses.metaText}>
            {formatearFecha(row.timestamp)}
          </span>
        ),
      },
      {
        name: "Hora",
        selector: (row) => obtenerTimestamp(row.timestamp) ?? 0,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span className={respaldoTablaClasses.metaText}>
            {formatearHora(row.timestamp)}
          </span>
        ),
      },
      {
        name: "Creado por",
        selector: (row) => obtenerCreador(row),
        sortable: true,
        width: "160px",
        cell: (row) => (
          <span className={respaldoTablaClasses.metaText}>
            {obtenerCreador(row)}
          </span>
        ),
      },
      {
        name: "Tamaño",
        selector: (row) => row.tamano_bytes,
        width: "130px",
        sortable: true,
        right: true,
        cell: (row) => (
          <span className={respaldoTablaClasses.metaText}>
            {row.tamano_legible || formatearTamano(row.tamano_bytes)}
          </span>
        ),
      },
      {
        name: "Acciones",
        width: "220px",
        right: true,
        cell: (row) => (
          <div className={respaldoTablaClasses.actionsWrapper}>
            <button
              type="button"
              className={respaldoTablaClasses.downloadButton}
              onClick={() => manejarDescarga(row.nombre)}
              title="Descargar respaldo"
            >
              Descargar
            </button>
            <button
              type="button"
              className={respaldoTablaClasses.restoreButton}
              onClick={() => manejarRestaurar(row.nombre)}
              disabled={restaurando === row.nombre}
              title="Restaurar base de datos"
            >
              {restaurando === row.nombre ? "Restaurando..." : "Restaurar"}
            </button>
          </div>
        ),
      },
    ],
    [restaurando]
  );

  return (
    <div className={respaldoLayoutClasses.page}>
      <section className={respaldoLayoutClasses.section}>
        <header className={respaldoLayoutClasses.header}>
          <div>
            <h1 className={respaldoLayoutClasses.title}>
              Respaldos de la base de datos
            </h1>
            <p className={respaldoLayoutClasses.description}>
              Genera copias de seguridad, sincroniza los archivos almacenados y
              restaura la información desde un respaldo existente.
            </p>
          </div>
          <div className={respaldoLayoutClasses.actions}>
            <button
              type="button"
              onClick={manejarCrearRespaldo}
              disabled={creando}
              className={respaldoLayoutClasses.createButton}
            >
              {creando ? "Creando respaldo..." : "Crear respaldo ahora"}
            </button>
            <button
              type="button"
              onClick={cargarRespaldos}
              disabled={cargando}
              className={respaldoLayoutClasses.syncButton}
            >
              {cargando ? "Sincronizando..." : "Sincronizar carpeta"}
            </button>
            <button
              type="button"
              onClick={abrirModalRestaurarArchivo}
              className={respaldoLayoutClasses.restoreButton}
            >
              Restaurar desde archivo
            </button>
          </div>
        </header>

        <div className={respaldoLayoutClasses.content}>
          <div className={respaldoLayoutClasses.summaryRow}>
            <div className={respaldoLayoutClasses.summaryText}>
              {respaldos.length === 0
                ? "No hay respaldos disponibles."
                : `Se encontraron ${respaldos.length} respaldos.`}
            </div>
            <div className={respaldoLayoutClasses.filterContainer}>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={respaldoLayoutClasses.filterInput}
                placeholder="Buscar por nombre o fecha"
              />
            </div>
          </div>

          <div className={respaldoLayoutClasses.tableWrapper}>
            <DataTable
              columns={columnas}
              data={respaldosFiltrados}
              progressPending={cargando}
              pagination
              highlightOnHover
              pointerOnHover
              dense
              noDataComponent={
                <p className={respaldoLayoutClasses.helperText}>
                  {cargando
                    ? "Cargando respaldos..."
                    : sinResultadosBusqueda
                    ? "No se encontraron respaldos que coincidan con la búsqueda."
                    : "No se han generado respaldos aún."}
                </p>
              }
              customStyles={dataTableBaseStyles}
            />
          </div>
        </div>
      </section>

      <VentanaModal
        isOpen={modalRestaurarAbierto}
        onClose={cerrarModalRestaurarArchivo}
        title="Restaurar desde archivo SQL"
        subtitle="Selecciona un archivo .sql válido para restaurar el estado de la base de datos."
        size="md"
        bodyClassName={respaldoModalClasses.body}
        footer={
          <div className={respaldoModalClasses.footer}>
            <button
              type="button"
              onClick={cerrarModalRestaurarArchivo}
              className={respaldoModalClasses.secondaryButton}
              disabled={procesando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={manejarSubmitArchivo}
              className={respaldoModalClasses.primaryButton}
              disabled={procesando || !archivoSeleccionado}
            >
              {procesando ? "Restaurando..." : "Restaurar"}
            </button>
          </div>
        }
      >
        <form
          className={respaldoModalClasses.body}
          onSubmit={manejarSubmitArchivo}
        >
          <div className={respaldoModalClasses.formGroup}>
            <label className={respaldoModalClasses.label} htmlFor="archivo_sql">
              Archivo SQL
            </label>
            <input
              id="archivo_sql"
              type="file"
              accept=".sql"
              onChange={(evento) => {
                const archivo = evento.target.files?.[0] ?? null;
                setArchivoSeleccionado(archivo);
              }}
              className={respaldoModalClasses.input}
              disabled={procesando}
            />
            <p className={respaldoModalClasses.helper}>
              El archivo seleccionado se almacenará en la carpeta de respaldos y
              se ejecutará automáticamente para restaurar la base de datos.
            </p>
          </div>

          {archivoSeleccionado ? (
            <div className={respaldoModalClasses.fileInfo}>
              <p>
                <span className={respaldoModalClasses.fileInfoHighlight}>
                  Archivo:
                </span>{" "}
                {archivoSeleccionado.name}
              </p>
              <p>
                <span className={respaldoModalClasses.fileInfoHighlight}>
                  Tamaño:
                </span>{" "}
                {formatearTamano(archivoSeleccionado.size)}
              </p>
            </div>
          ) : null}
        </form>
      </VentanaModal>
    </div>
  );
};

export default Respaldo;
