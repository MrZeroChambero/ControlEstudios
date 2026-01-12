import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioDocenteDetallado from "./CalendarioDocenteDetallado";

const ModalAgendaDocente = ({
  abierto,
  alCerrar,
  docente,
  onVerDetalle,
  onEliminar,
}) => (
  <VentanaModal
    isOpen={abierto}
    onClose={alCerrar}
    title="Agenda semanal del docente"
    size="xl"
    bodyClassName="space-y-5"
  >
    {docente ? (
      <>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Docente:</span>
              <span>{docente.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Función:</span>
              <span>{docente.funcion}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Componentes:</span>
              <span>{docente.componentesTexto}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Momentos:</span>
              <span>{docente.momentosTexto}</span>
            </div>
          </div>
        </div>
        <CalendarioDocenteDetallado
          bloques={docente.horarios}
          emptyMessage="Sin clases registradas para este docente."
          onVerDetalle={onVerDetalle}
          onEliminar={onEliminar}
        />
      </>
    ) : null}
  </VentanaModal>
);

export default ModalAgendaDocente;
