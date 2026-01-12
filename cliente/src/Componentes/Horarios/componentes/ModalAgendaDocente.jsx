import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioResponsive from "./CalendarioResponsive";

const ModalAgendaDocente = ({ abierto, alCerrar, docente, renderBloque }) => (
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
          <p>
            <span className="font-semibold text-slate-800">Docente:</span>{" "}
            {docente.nombre}
          </p>
          <p>
            <span className="font-semibold text-slate-800">Función:</span>{" "}
            {docente.funcion}
          </p>
          <p>
            <span className="font-semibold text-slate-800">Componentes:</span>{" "}
            {docente.componentesTexto}
          </p>
          <p>
            <span className="font-semibold text-slate-800">Momentos:</span>{" "}
            {docente.momentosTexto}
          </p>
        </div>
        <CalendarioResponsive
          bloques={docente.horarios}
          emptyMessage="Sin clases registradas para este día."
          renderBloque={renderBloque}
        />
      </>
    ) : null}
  </VentanaModal>
);

export default ModalAgendaDocente;
