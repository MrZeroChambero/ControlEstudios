import React, { useMemo } from "react";
import { construirDocentesSeccion } from "../utilidadesHorarios";
import { tablaDocentesSeccionClases } from "./horariosEstilos";
import { filtrarBloquesClase } from "../config/bloquesHorario";

const TablaDocentesSeccion = ({ bloques = [], bloquesConfig }) => {
  const bloquesClase = useMemo(
    () => filtrarBloquesClase(bloques, bloquesConfig),
    [bloques, bloquesConfig]
  );

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
    <div className={tablaDocentesSeccionClases.envoltorio}>
      <table className={tablaDocentesSeccionClases.tabla}>
        <thead>
          <tr className={tablaDocentesSeccionClases.filaEncabezado}>
            <th className={tablaDocentesSeccionClases.celdaEncabezado}>
              Docente / Especialista
            </th>
            <th className={tablaDocentesSeccionClases.celdaEncabezado}>
              Función
            </th>
            <th className={tablaDocentesSeccionClases.celdaEncabezado}>
              Componentes asignados
            </th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr
              key={docente.id}
              className={tablaDocentesSeccionClases.filaCuerpo}
            >
              <td className={tablaDocentesSeccionClases.celdaFuerte}>
                {docente.nombre}
              </td>
              <td className={tablaDocentesSeccionClases.celda}>
                {docente.funcion}
              </td>
              <td className={tablaDocentesSeccionClases.celda}>
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
