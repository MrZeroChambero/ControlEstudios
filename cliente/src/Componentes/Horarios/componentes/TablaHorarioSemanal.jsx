import React, { useMemo } from "react";
import {
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
} from "../utilidadesHorarios";
import {
  BLOQUES_HORARIO_BASE,
  obtenerCodigoBloquePorRango,
  esBloqueRegistroClase,
} from "../config/bloquesHorario";
import { tablaHorarioSemanalClases } from "./horariosEstilos";

const BLOQUES_COLSPAN = new Set(["01", "02", "07", "11"]);

const obtenerCodigoDesdeRegistro = (registro, bloquesConfig) =>
  registro?.codigo_bloque ??
  obtenerCodigoBloquePorRango(
    registro?.hora_inicio_texto ?? registro?.hora_inicio,
    registro?.hora_fin_texto ?? registro?.hora_fin,
    bloquesConfig
  );

const agruparPorDiaYCodigo = (registros = [], filtro, bloquesConfig) => {
  const base = diasSemanaOrdenados.reduce((acc, dia) => {
    acc[dia] = {};
    return acc;
  }, {});

  registros.forEach((registro) => {
    const dia = (registro?.dia_semana || "").toLowerCase();
    if (!base[dia]) {
      return;
    }

    const codigo = obtenerCodigoDesdeRegistro(registro, bloquesConfig);
    if (!codigo) {
      return;
    }

    if (typeof filtro === "function" && !filtro(registro, codigo)) {
      return;
    }

    if (!base[dia][codigo]) {
      base[dia][codigo] = [];
    }

    base[dia][codigo].push(registro);
  });

  return base;
};

const esBloqueColspan = (codigo) =>
  BLOQUES_COLSPAN.has(String(codigo || "").padStart(2, "0"));

const renderBloqueAcademico = ({
  bloque,
  codigo,
  dia,
  indice,
  renderContenidoBloque,
  renderAcciones,
}) => {
  const contenidoPersonalizado =
    typeof renderContenidoBloque === "function"
      ? renderContenidoBloque(bloque, {
          codigoBloque: codigo,
          dia,
          indice,
        })
      : null;

  return (
    <div
      key={`${bloque?.id_horario ?? indice}-${codigo}-${dia}`}
      className={tablaHorarioSemanalClases.bloqueCard}
    >
      {contenidoPersonalizado ?? bloque?.nombre_componente ?? "Sin componente"}
      {typeof renderAcciones === "function" ? (
        <div className={tablaHorarioSemanalClases.accionesWrapper}>
          {renderAcciones(bloque)}
        </div>
      ) : null}
    </div>
  );
};

const renderCeldaDia = ({
  bloqueConfig,
  dia,
  clasesAgrupadas,
  renderContenidoBloque,
  renderAcciones,
}) => {
  const codigo = bloqueConfig.codigo;
  const clases = clasesAgrupadas[dia]?.[codigo] ?? [];

  if (clases.length === 0) {
    return (
      <td
        key={`${dia}-${codigo}`}
        className={tablaHorarioSemanalClases.bloqueCell}
      >
        <div className={tablaHorarioSemanalClases.bloqueVacioCard}>Vacio</div>
      </td>
    );
  }

  return (
    <td
      key={`${dia}-${codigo}`}
      className={tablaHorarioSemanalClases.bloqueCell}
    >
      <div className="space-y-2">
        {clases.map((bloque, indice) =>
          renderBloqueAcademico({
            bloque,
            codigo,
            dia,
            indice,
            renderContenidoBloque,
            renderAcciones,
          })
        )}
      </div>
    </td>
  );
};

const obtenerContenidoRutina = (bloque, rutinasAgrupadas) => {
  const codigo = bloque.codigo;
  const etiquetas = diasSemanaOrdenados.flatMap((dia) => {
    const registros = rutinasAgrupadas[dia]?.[codigo] ?? [];
    if (registros.length === 0) {
      return [];
    }
    return registros.map(
      (registro) =>
        registro?.nombre_componente ??
        registro?.descripcion_rutina ??
        bloque.etiqueta ??
        "Actividad fija"
    );
  });

  if (etiquetas.length === 0) {
    return bloque.etiqueta ?? "Actividad fija";
  }

  const resumen = Array.from(new Set(etiquetas));
  return resumen.join(" | ");
};

const FilaBloqueHorario = ({
  bloque,
  clasesAgrupadas,
  rutinasAgrupadas,
  renderContenidoBloque,
  renderAcciones,
}) => {
  const duracionTexto =
    bloque.duracion !== undefined ? `${bloque.duracion} min` : "-";
  const debeColspan =
    bloque.tipo === "repetitivo" && esBloqueColspan(bloque.codigo);

  return (
    <tr className="text-sm text-slate-700">
      <td className={tablaHorarioSemanalClases.horarioCell}>{bloque.inicio}</td>
      <td className={tablaHorarioSemanalClases.horarioCell}>{bloque.fin}</td>
      <td className={tablaHorarioSemanalClases.horarioCell}>{duracionTexto}</td>
      {debeColspan ? (
        <td
          colSpan={diasSemanaOrdenados.length}
          className={tablaHorarioSemanalClases.bloqueCell}
        >
          <div className={tablaHorarioSemanalClases.rutinaCard}>
            {obtenerContenidoRutina(bloque, rutinasAgrupadas)}
          </div>
        </td>
      ) : (
        diasSemanaOrdenados.map((dia) =>
          renderCeldaDia({
            bloqueConfig: bloque,
            dia,
            clasesAgrupadas,
            renderContenidoBloque,
            renderAcciones,
          })
        )
      )}
    </tr>
  );
};

const TablaHorarioSemanal = ({
  bloques = [],
  bloquesFijos = [],
  bloquesConfig,
  emptyMessage = "Sin bloques registrados para esta seccion.",
  renderAcciones,
  renderContenidoBloque,
}) => {
  const bloquesBase = useMemo(
    () => bloquesConfig || BLOQUES_HORARIO_BASE,
    [bloquesConfig]
  );

  const clasesAgrupadas = useMemo(
    () =>
      agruparPorDiaYCodigo(
        bloques,
        (registro) => esBloqueRegistroClase(registro, bloquesBase),
        bloquesBase
      ),
    [bloques, bloquesBase]
  );

  const rutinasAgrupadas = useMemo(
    () => agruparPorDiaYCodigo(bloquesFijos, undefined, bloquesBase),
    [bloquesFijos, bloquesBase]
  );

  const hayContenido = bloquesBase.some((bloque) =>
    diasSemanaOrdenados.some((dia) => {
      const codigo = bloque.codigo;
      const hayRutina = (rutinasAgrupadas[dia]?.[codigo] || []).length > 0;
      const hayClase = (clasesAgrupadas[dia]?.[codigo] || []).length > 0;
      return hayRutina || hayClase || bloque.tipo === "repetitivo";
    })
  );

  if (!hayContenido) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className={tablaHorarioSemanalClases.wrapper}>
      <table className={tablaHorarioSemanalClases.table}>
        <thead>
          <tr className={tablaHorarioSemanalClases.headRow}>
            <th className={tablaHorarioSemanalClases.headCell}>Inicio</th>
            <th className={tablaHorarioSemanalClases.headCell}>Fin</th>
            <th className={tablaHorarioSemanalClases.headCell}>Duracion</th>
            {diasSemanaOrdenados.map((dia) => (
              <th key={dia} className={tablaHorarioSemanalClases.headCell}>
                {diasSemanaEtiquetas[dia]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloquesBase.map((bloque) => (
            <FilaBloqueHorario
              key={bloque.codigo}
              bloque={bloque}
              clasesAgrupadas={clasesAgrupadas}
              rutinasAgrupadas={rutinasAgrupadas}
              renderContenidoBloque={renderContenidoBloque}
              renderAcciones={renderAcciones}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaHorarioSemanal;
