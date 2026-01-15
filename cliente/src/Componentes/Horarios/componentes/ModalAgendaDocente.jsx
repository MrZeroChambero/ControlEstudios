import React, { useMemo } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import TablaHorarioSemanal from "./TablaHorarioSemanal";
import {
  horariosIconClasses,
  horariosStatusClasses,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";
import { agendaDocenteClases } from "./horariosEstilos";

/**
 * @typedef {import("react").ReactNode} ReactNode
 */

const formatearEtiquetaSeccion = (grado, seccion) => {
  const gradoTexto =
    typeof grado === "number" || typeof grado === "string"
      ? String(grado).trim()
      : "";
  const seccionTexto =
    typeof seccion === "number" || typeof seccion === "string"
      ? String(seccion).trim().toUpperCase()
      : "";

  if (!gradoTexto && !seccionTexto) {
    return null;
  }

  if (!gradoTexto || !seccionTexto) {
    return `${gradoTexto || "?"}"${seccionTexto || "?"}`;
  }

  return `${gradoTexto}"${seccionTexto}"`;
};

/**
 * @param {Record<string, any>} bloque
 * @param {{ duracionMin: number | null, horaInicioTexto: string, horaFinTexto: string }} contexto
 * @returns {ReactNode}
 */
const renderContenidoDocente = (bloque, contexto) => {
  const etiquetaSeccion = formatearEtiquetaSeccion(
    bloque?.grado,
    bloque?.seccion
  );
  const momentoTexto = bloque?.nombre_momento || bloque?.momento || "-";
  const aulaTexto =
    bloque?.nombre_aula || bloque?.aula || bloque?.nombre_grado || null;

  return (
    <>
      <p className="text-sm font-semibold text-slate-800">
        {bloque?.nombre_componente ?? "Sin componente"}
      </p>
      {etiquetaSeccion ? (
        <p className="mt-1 text-xs font-semibold text-slate-600">
          {`Sección: ${etiquetaSeccion}`}
        </p>
      ) : null}
      <p className="mt-1 text-xs font-medium text-slate-500">
        {`Inicio: ${contexto.horaInicioTexto} - Fin: ${contexto.horaFinTexto}`}
      </p>
      {contexto.duracionMin !== null ? (
        <p className="text-xs font-semibold text-slate-500">
          {`Duración: ${contexto.duracionMin} min`}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-slate-500">
        {`Momento: ${momentoTexto}`}
      </p>
      {aulaTexto ? (
        <p className="text-xs text-slate-500">{`Aula: ${aulaTexto}`}</p>
      ) : null}
      <div className="mt-2 flex justify-center">
        <span
          className={`${horariosStatusClasses.base} ${
            bloque?.grupo === "completo"
              ? horariosStatusClasses.completo
              : horariosStatusClasses.subgrupo
          }`}
        >
          {bloque?.grupo ?? "N/D"}
        </span>
      </div>
    </>
  );
};

const crearRenderAcciones = (onVerDetalle, onEliminar) => {
  if (!onVerDetalle && !onEliminar) {
    return null;
  }

  return (bloque) => (
    <div className="flex gap-2">
      {onVerDetalle ? (
        <button
          type="button"
          className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
          onClick={() => onVerDetalle(bloque)}
          title="Ver detalle del horario"
        >
          <FaEye className={horariosIconClasses.base} />
        </button>
      ) : null}
      {onEliminar ? (
        <button
          type="button"
          className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
          onClick={() => onEliminar(bloque)}
          title="Eliminar horario"
        >
          <FaTrash className={horariosIconClasses.base} />
        </button>
      ) : null}
    </div>
  );
};

const ModalAgendaDocente = ({
  abierto,
  alCerrar,
  docente,
  onVerDetalle,
  onEliminar,
}) => {
  const renderAcciones = useMemo(
    () => crearRenderAcciones(onVerDetalle, onEliminar),
    [onVerDetalle, onEliminar]
  );

  return (
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Agenda semanal del docente"
      size="xl"
      bodyClassName="space-y-5"
    >
      {docente ? (
        <>
          <div className={agendaDocenteClases.infoCard}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className={agendaDocenteClases.infoItem}>
                <span className={agendaDocenteClases.infoLabel}>Docente:</span>
                <span>{docente.nombre}</span>
              </div>
              <div className={agendaDocenteClases.infoItem}>
                <span className={agendaDocenteClases.infoLabel}>Función:</span>
                <span>{docente.funcion}</span>
              </div>
              <div className={agendaDocenteClases.infoItem}>
                <span className={agendaDocenteClases.infoLabel}>
                  Componentes:
                </span>
                <span>{docente.componentesTexto}</span>
              </div>
              <div className={agendaDocenteClases.infoItem}>
                <span className={agendaDocenteClases.infoLabel}>Momentos:</span>
                <span>{docente.momentosTexto}</span>
              </div>
            </div>
          </div>
          <TablaHorarioSemanal
            bloques={docente.horarios}
            emptyMessage="Sin clases registradas para este docente."
            renderAcciones={renderAcciones || undefined}
            renderContenidoBloque={renderContenidoDocente}
          />
        </>
      ) : null}
    </VentanaModal>
  );
};

export default ModalAgendaDocente;
