import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioSeccionDetallado from "./CalendarioSeccionDetallado";

const ModalCalendarioAula = ({ abierto, alCerrar, seccion }) => (
  <VentanaModal
    isOpen={abierto}
    onClose={alCerrar}
    title="Calendario semanal del aula"
    size="xl"
    bodyClassName="space-y-5"
  >
    {seccion ? (
      <CalendarioSeccionDetallado
        seccion={seccion}
        emptyMessage="Sin bloques programados para esta sección."
      />
    ) : null}
  </VentanaModal>
);

export default ModalCalendarioAula;
