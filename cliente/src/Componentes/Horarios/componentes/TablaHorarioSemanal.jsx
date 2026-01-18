import React, { useMemo } from "react";
import { FaUsers } from "react-icons/fa";
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

const BLOQUES_COLSPAN = new Set(["01", "02", "06", "11"]);

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
  esEspecialista,
}) => {
  const contenidoPersonalizado =
    typeof renderContenidoBloque === "function"
      ? renderContenidoBloque(bloque, {
          codigoBloque: codigo,
          dia,
          indice,
        })
      : null;

  const esRecesoEspecialista = esEspecialista && codigo === "06";
  const esSubgrupo = bloque?.grupo === "subgrupo";

  const clasesTarjeta = [
    tablaHorarioSemanalClases.tarjetaBloque,
    esSubgrupo ? tablaHorarioSemanalClases.tarjetaSubgrupo : "",
  ]
    .join(" ")
    .trim();

  return (
    <div
      key={`${bloque?.id_horario ?? indice}-${codigo}-${dia}`}
      className={clasesTarjeta}
    >
      {esRecesoEspecialista ? (
        <>
          <p className="text-sm font-semibold text-slate-800">
            {bloque?.nombre_componente ?? "Sin componente"}
          </p>
          <hr className="my-1 border-slate-300" />
          <p className="text-xs text-slate-500">Recreo</p>
        </>
      ) : (
        <div className="flex items-center gap-2">
          {esSubgrupo && <FaUsers className="text-slate-500" />}
          <span className="flex-grow">
            {contenidoPersonalizado ??
              bloque?.nombre_componente ??
              "Sin componente"}
          </span>
        </div>
      )}
      {typeof renderAcciones === "function" ? (
        <div className={tablaHorarioSemanalClases.envoltorioAcciones}>
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
  esEspecialista,
}) => {
  const codigo = bloqueConfig.codigo;
  const clases = clasesAgrupadas[dia]?.[codigo] ?? [];

  if (clases.length === 0) {
    return (
      <td
        key={`${dia}-${codigo}`}
        className={tablaHorarioSemanalClases.celdaBloque}
      >
        <div className={tablaHorarioSemanalClases.tarjetaBloqueVacio}>
          Vacio
        </div>
      </td>
    );
  }

  return (
    <td
      key={`${dia}-${codigo}`}
      className={tablaHorarioSemanalClases.celdaBloque}
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
            esEspecialista,
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
  esEspecialista,
}) => {
  const duracionTexto =
    bloque.duracion !== undefined ? `${bloque.duracion} min` : "-";
  const debeColspan =
    bloque.tipo === "repetitivo" && esBloqueColspan(bloque.codigo);

  return (
    <tr className="text-sm text-slate-700">
      <td className={tablaHorarioSemanalClases.celdaHorario}>
        {bloque.inicio}
      </td>
      <td className={tablaHorarioSemanalClases.celdaHorario}>{bloque.fin}</td>
      <td className={tablaHorarioSemanalClases.celdaHorario}>
        {duracionTexto}
      </td>
      {debeColspan ? (
        <td
          colSpan={diasSemanaOrdenados.length}
          className={tablaHorarioSemanalClases.celdaBloque}
        >
          <div className={tablaHorarioSemanalClases.tarjetaRutina}>
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
            esEspecialista,
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
  esEspecialista = false,
  emptyMessage = "Sin bloques registrados para esta seccion.",
  renderAcciones,
  renderContenidoBloque,
}) => {
  const bloquesBase = useMemo(
    () =>
      (bloquesConfig || BLOQUES_HORARIO_BASE).filter(
        (b) => !esEspecialista || b.codigo !== "06"
      ),
    [bloquesConfig, esEspecialista]
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
    <div className={tablaHorarioSemanalClases.envoltorio}>
      <table className={tablaHorarioSemanalClases.tabla}>
        <thead>
          <tr className={tablaHorarioSemanalClases.filaEncabezado}>
            <th className={tablaHorarioSemanalClases.celdaEncabezado}>
              Inicio
            </th>
            <th className={tablaHorarioSemanalClases.celdaEncabezado}>Fin</th>
            <th className={tablaHorarioSemanalClases.celdaEncabezado}>
              Duracion
            </th>
            {diasSemanaOrdenados.map((dia) => (
              <th
                key={dia}
                className={tablaHorarioSemanalClases.celdaEncabezado}
              >
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
              esEspecialista={esEspecialista}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaHorarioSemanal;
