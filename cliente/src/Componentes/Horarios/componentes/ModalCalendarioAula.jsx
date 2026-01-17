import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioSeccionDetallado from "./CalendarioSeccionDetallado";

const ModalCalendarioAula = ({ abierto, alCerrar, seccion, bloquesConfig }) => (
  <VentanaModal
    isOpen={abierto}
    onClose={alCerrar}
    title="Calendario semanal del aula"
    size="full"
    maxWidthClass="max-w-[95vw]"
    bodyClassName="space-y-5"
  >
    {seccion ? (
      <CalendarioSeccionDetallado
        seccion={seccion}
        bloquesConfig={bloquesConfig}
        emptyMessage="Sin bloques programados para esta sección."
      />
    ) : null}
  </VentanaModal>
);

export default ModalCalendarioAula;
