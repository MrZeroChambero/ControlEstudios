import React from "react";
import { FaClone } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import {
  contenidosTableClasses,
  contenidosIconClasses,
} from "../../Contenidos/contenidosEstilos";

export const DetalleClonacionModal = ({
  isOpen,
  onClose,
  planificacion,
  onClonar,
}) => {
  if (!isOpen || !planificacion) return null;

  const competencias = planificacion.competencias || [];

  const handleClonar = () => {
    onClonar(planificacion);
    onClose();
  };

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Competencias e indicadores de ${
        planificacion.docente || "la planificación"
      }`}
      size="lg"
    >
      <div className="space-y-4">
        {competencias.length === 0 ? (
          <p>No hay competencias asociadas.</p>
        ) : (
          competencias.map((competencia) => (
            <div key={competencia.id} className="border rounded p-4">
              <h3 className="font-semibold">{competencia.nombre}</h3>
              <p className="text-sm text-gray-600">{competencia.descripcion}</p>
              <div className="mt-2">
                <h4 className="font-medium">Indicadores:</h4>
                <ul className="list-disc list-inside">
                  {competencia.indicadores?.map((indicador) => (
                    <li key={indicador.id} className="text-sm">
                      {indicador.nombre}
                    </li>
                  )) || <li>No hay indicadores</li>}
                </ul>
              </div>
            </div>
          ))
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClonar}
            className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.editButton}`}
            title="Clonar competencias e indicadores"
          >
            <FaClone className={contenidosIconClasses.base} />
            Clonar a mi planificación
          </button>
        </div>
      </div>
    </VentanaModal>
  );
};
