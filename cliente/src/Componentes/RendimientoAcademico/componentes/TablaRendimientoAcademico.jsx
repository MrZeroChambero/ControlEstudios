import React from "react";
import {
  tablaRendimientoClasses,
  controlDeshabilitado,
} from "../rendimientoEstilos";
import { obtenerEtiquetaPlan } from "../helpersRendimiento";

export const TablaRendimientoAcademico = ({
  grid,
  literales,
  selecciones,
  permitidos,
  estaGuardando,
  onActualizar,
  onAplicarColumna,
}) => {
  if (!grid) {
    return (
      <section className={tablaRendimientoClasses.emptyWrapper}>
        <p className={tablaRendimientoClasses.emptyText}>
          Selecciona un componente y un aula para mostrar la matriz de
          evaluación.
        </p>
      </section>
    );
  }

  const indicadores = grid.indicadores ?? [];
  const estudiantes = grid.estudiantes ?? [];

  if (!indicadores.length || !estudiantes.length) {
    return (
      <section className={tablaRendimientoClasses.emptyWrapper}>
        <p className={tablaRendimientoClasses.emptyText}>
          No hay indicadores o estudiantes registrados para este contexto.
        </p>
      </section>
    );
  }

  const momento =
    grid.metadata?.momento?.nombre_momento ?? grid.metadata?.momento?.nombre;
  const componente = grid.metadata?.componente?.nombre_componente;
  const aula = grid.metadata?.aula?.descripcion ?? grid.metadata?.aula?.nombre;

  return (
    <section className={tablaRendimientoClasses.container}>
      <header className={tablaRendimientoClasses.header}>
        <h2 className={tablaRendimientoClasses.title}>
          Matriz de calificación
        </h2>
        <p className={tablaRendimientoClasses.description}>
          Aplica una literal a todos los estudiantes desde el encabezado del
          indicador o ajusta los valores individualmente.
        </p>
        <div className={tablaRendimientoClasses.metaList}>
          {componente ? <span>Componente: {componente}</span> : null}
          {aula ? <span>Aula: {aula}</span> : null}
          {momento ? <span>Momento: {momento}</span> : null}
        </div>
      </header>
      <div className={tablaRendimientoClasses.tableWrapper}>
        <table className={tablaRendimientoClasses.table}>
          <thead>
            <tr className={tablaRendimientoClasses.headRow}>
              <th className={tablaRendimientoClasses.headCell}>Estudiante</th>
              {indicadores.map((indicador) => {
                const id = indicador.id_indicador;
                return (
                  <th
                    key={id}
                    className={tablaRendimientoClasses.indicatorCell}
                  >
                    <div className={tablaRendimientoClasses.indicatorControls}>
                      <span className={tablaRendimientoClasses.indicatorName}>
                        {indicador.nombre_indicador ?? `Indicador ${id}`}
                      </span>
                      <select
                        className={`${tablaRendimientoClasses.selectHeader} ${controlDeshabilitado}`}
                        defaultValue=""
                        onChange={(event) => {
                          onAplicarColumna(id, event.target.value);
                          event.target.value = "";
                        }}
                        disabled={
                          estaGuardando || !literales || !literales.length
                        }
                      >
                        <option value="">Aplicar a todos</option>
                        {literales.map((letra) => (
                          <option key={letra} value={letra}>
                            {letra}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => {
              const estudianteKey = String(estudiante.id_estudiante ?? "");
              if (!estudianteKey) {
                return null;
              }
              const indicadoresSeleccionados = selecciones[estudianteKey] ?? {};
              const permitidosEstudiante = permitidos[estudianteKey];
              const planLabel = obtenerEtiquetaPlan(estudiante.planificacion);
              return (
                <tr
                  key={estudianteKey}
                  className={tablaRendimientoClasses.studentRow}
                >
                  <td className={tablaRendimientoClasses.studentCell}>
                    <div className={tablaRendimientoClasses.studentInfo}>
                      <p className={tablaRendimientoClasses.studentName}>
                        {estudiante.nombre}
                      </p>
                      <span className={tablaRendimientoClasses.badgePlan}>
                        {planLabel}
                      </span>
                    </div>
                  </td>
                  {indicadores.map((indicador) => {
                    const indicadorKey = String(indicador.id_indicador ?? "");
                    const valor = indicadoresSeleccionados[indicadorKey] ?? "";
                    const habilitado = permitidosEstudiante
                      ? permitidosEstudiante.has(indicadorKey)
                      : true;
                    return (
                      <td
                        key={`${estudianteKey}-${indicadorKey}`}
                        className={tablaRendimientoClasses.studentCell}
                      >
                        <select
                          value={valor}
                          className={`${tablaRendimientoClasses.selectBody} ${controlDeshabilitado}`}
                          onChange={(event) =>
                            onActualizar(
                              estudiante.id_estudiante,
                              indicador.id_indicador,
                              event.target.value
                            )
                          }
                          disabled={estaGuardando || !habilitado}
                        >
                          <option value="">Sin definir</option>
                          {literales.map((letra) => (
                            <option key={letra} value={letra}>
                              {letra}
                            </option>
                          ))}
                        </select>
                        {!habilitado ? (
                          <p className={tablaRendimientoClasses.disabledHint}>
                            Este indicador no está habilitado para el
                            estudiante.
                          </p>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
