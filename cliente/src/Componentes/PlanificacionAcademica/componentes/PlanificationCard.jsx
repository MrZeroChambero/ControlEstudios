import React from "react";

const PlanificationCard = ({
  planificacion,
  onClone,
  onView,
  isCurrentTeacher,
}) => {
  const planId = planificacion.id ?? planificacion.id_planificacion;
  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">
            {planificacion.docenteNombre || `Planificación #${planId}`}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isCurrentTeacher
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {isCurrentTeacher ? "Tu planificación" : "Otro docente"}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                planificacion.tipo === "individual"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {planificacion.tipo === "individual"
                ? "Individual"
                : "Aula completa"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView && onView(planificacion)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Ver detalles
          </button>
          <button
            onClick={() => onClone && onClone(planificacion)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clonar
          </button>
        </div>
      </div>
      {planificacion.competencias && planificacion.competencias.length > 0 ? (
        <div className="mt-3 border-t pt-3">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Competencias ({planificacion.competencias.length})
          </h5>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {planificacion.competencias.map((competencia) => (
              <div key={competencia.id} className="bg-gray-50 p-2 rounded">
                <p className="font-medium text-sm">{competencia.nombre}</p>
                {competencia.descripcion && (
                  <p className="text-xs text-gray-600 mt-1">
                    {competencia.descripcion}
                  </p>
                )}
                {competencia.indicadores &&
                  competencia.indicadores.length > 0 && (
                    <div className="mt-2 ml-3">
                      <p className="text-xs text-gray-500 mb-1">Indicadores:</p>
                      <ul className="text-xs text-gray-700 list-disc list-inside">
                        {competencia.indicadores
                          .slice(0, 3)
                          .map((indicador) => (
                            <li key={indicador.id}>{indicador.nombre}</li>
                          ))}
                        {competencia.indicadores.length > 3 && (
                          <li className="text-gray-500">
                            +{competencia.indicadores.length - 3} más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Sin competencias definidas
        </p>
      )}
    </div>
  );
};

export default PlanificationCard;
