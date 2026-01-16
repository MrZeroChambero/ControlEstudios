import React, { useMemo } from "react";
import { construirDocentesSeccion } from "../utilidadesHorarios";
import { tablaDocentesSeccionClases } from "./horariosEstilos";
import { filtrarBloquesClase } from "../config/bloquesHorario";

const TablaDocentesSeccion = ({ bloques = [] }) => {
  const bloquesClase = useMemo(() => filtrarBloquesClase(bloques), [bloques]);

  const docentes = useMemo(
    () => construirDocentesSeccion(bloquesClase),
    [bloquesClase]
  );

  if (docentes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aún no se han asignado docentes para estos bloques.
      </p>
    );
  }

  return (
    <div className={tablaDocentesSeccionClases.wrapper}>
      <table className={tablaDocentesSeccionClases.table}>
        <thead>
          <tr className={tablaDocentesSeccionClases.headRow}>
            <th className={tablaDocentesSeccionClases.headCell}>
              Docente / Especialista
            </th>
            <th className={tablaDocentesSeccionClases.headCell}>Función</th>
            <th className={tablaDocentesSeccionClases.headCell}>
              Componentes asignados
            </th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente.id} className={tablaDocentesSeccionClases.bodyRow}>
              <td className={tablaDocentesSeccionClases.cellStrong}>
                {docente.nombre}
              </td>
              <td className={tablaDocentesSeccionClases.cell}>
                {docente.funcion}
              </td>
              <td className={tablaDocentesSeccionClases.cell}>
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
