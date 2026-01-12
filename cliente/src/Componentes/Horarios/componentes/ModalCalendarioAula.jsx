import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioSeccionDetallado from "./CalendarioSeccionDetallado";
import TablaDocentesSeccion from "./TablaDocentesSeccion";

const ModalCalendarioAula = ({ abierto, alCerrar, seccion }) => (
  <VentanaModal
    isOpen={abierto}
    onClose={alCerrar}
    title="Calendario semanal del aula"
    size="xl"
    bodyClassName="space-y-5"
  >
    {seccion ? (
      <>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Grado:</span>
              <span>{seccion.grado ?? "N/D"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Sección:</span>
              <span>{seccion.seccion ?? "N/D"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Momento:</span>
              <span>{seccion.momento ?? "Sin momento"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Año escolar:</span>
              <span>{seccion.anioEscolar ?? "N/D"}</span>
            </div>
          </div>
        </div>
        <CalendarioSeccionDetallado
          bloques={seccion.horarios}
          emptyMessage="Sin bloques programados para esta sección."
        />
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">
            Docentes y especialistas asignados
          </h4>
          <TablaDocentesSeccion bloques={seccion.horarios} />
        </div>
      </>
    ) : null}
  </VentanaModal>
);

export default ModalCalendarioAula;
