import React, { useMemo } from "react";
import { construirDocentesSeccion } from "../utilidadesHorarios";

const TablaDocentesSeccion = ({ bloques = [] }) => {
  const docentes = useMemo(() => construirDocentesSeccion(bloques), [bloques]);

  if (docentes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aún no se han asignado docentes para estos bloques.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 rounded-3xl border border-slate-200 bg-white text-sm shadow-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Docente / Especialista
            </th>
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Función
            </th>
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Componentes asignados
            </th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente.id} className="text-sm text-slate-700">
              <td className="border-t border-slate-100 px-4 py-3 font-semibold text-slate-800">
                {docente.nombre}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {docente.funcion}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {docente.componentes.length > 0
                  ? docente.componentes.join(", ")
                  : "Sin componentes registrados"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaDocentesSeccion;
