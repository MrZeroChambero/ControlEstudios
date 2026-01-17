import { diasSemanaOrdenados, diasSemanaEtiquetas } from "./constantesHorarios";
import { diasSemanaOpciones } from "./constantesHorarios";
import {
  obtenerBloquePorCodigo,
  obtenerCodigoBloquePorRango,
} from "./config/bloquesHorario";
export { filtrarPropsTabla } from "../../utilidades/tablaProps";

export const SEGMENTO_CALENDARIO_MINUTOS = 5;
export const SEGMENTO_BLOQUE_MINUTOS = 20;
export const MIN_MINUTOS_COMPONENTE = 7 * 60 + 40;
export const MAX_MINUTOS_JORNADA = 12 * 60;
export const DURACIONES_AULA_MINUTOS = Object.freeze([40, 60, 80]);
export const DURACIONES_ESPECIALISTA_MINUTOS = Object.freeze([40, 80]);

export const obtenerDuracionesPermitidas = (esEspecialista = false) =>
  esEspecialista ? DURACIONES_ESPECIALISTA_MINUTOS : DURACIONES_AULA_MINUTOS;
const TABLA_MINUTO_INICIO = 7 * 60;
const TABLA_MINUTO_FIN = 12 * 60;

export const formatearMinutosA12Horas = (totalMin) => {
  if (!Number.isFinite(totalMin)) {
    return "";
  }

  let horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  const esPM = horas >= 12;

  if (horas === 0) {
    horas = 12;
  } else if (horas > 12) {
    horas -= 12;
  }

  const sufijo = esPM ? "p. m." : "a. m.";
  return `${horas}:${String(minutos).padStart(2, "0")} ${sufijo}`;
};

export const alinearMinutosASegmento = (
  totalMin,
  haciaArriba = false,
  segmentoMinutos = SEGMENTO_CALENDARIO_MINUTOS
) => {
  if (!Number.isFinite(totalMin)) {
    return totalMin;
  }

  if (!Number.isFinite(segmentoMinutos) || segmentoMinutos <= 0) {
    return totalMin;
  }

  const resto = totalMin % segmentoMinutos;
  if (resto === 0) {
    return totalMin;
  }

  return haciaArriba ? totalMin + (segmentoMinutos - resto) : totalMin - resto;
};

export const crearFormularioInicial = () => ({
  fk_aula: "",
  fk_momento: "",
  fk_componente: "",
  fk_personal: "",
  grupo: "completo",
  dia_semana: "",
  hora_inicio: "",
  hora_fin: "",
  estudiantes: [],
  duracion_sugerida: null,
});

export const crearCatalogosIniciales = () => ({
  aulas: [],
  momentos: [],
  componentes: [],
  personal: [],
  estudiantes: [],
});

export const formatearDocente = (registro) => {
  if (!registro) {
    return "";
  }

  const posibles = [
    registro.nombre_docente,
    registro.docente,
    registro.nombre_personal,
    registro.nombre_persona,
    registro.docente_nombre,
    registro.nombre_completo,
    registro.nombre,
  ];

  const coincidencia = posibles.find(
    (valor) => typeof valor === "string" && valor.trim() !== ""
  );

  if (coincidencia) {
    return coincidencia.trim();
  }

  const partes = [
    registro.primer_nombre,
    registro.segundo_nombre,
    registro.primer_apellido,
    registro.segundo_apellido,
  ].filter((parte) => typeof parte === "string" && parte.trim() !== "");

  return partes.join(" ");
};

export const parseHoraTexto = (valor) => {
  if (typeof valor !== "string") {
    return null;
  }

  const coincidencia = /^([0-9]{2}):([0-9]{2})$/.exec(valor.trim());
  if (!coincidencia) {
    return null;
  }

  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    horas < 0 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  const totalMinutos = (horas === 12 ? 12 * 60 : horas * 60) + minutos;

  return {
    horas,
    minutos,
    totalMinutos,
  };
};

export const obtenerOrdenHora = (bloque) => {
  if (!bloque) {
    return Number.MAX_SAFE_INTEGER;
  }

  const referencia = (() => {
    if (typeof bloque.hora_inicio_texto === "string") {
      return bloque.hora_inicio_texto;
    }
    if (typeof bloque.hora_inicio === "string") {
      return bloque.hora_inicio;
    }
    return "";
  })();

  const coincidencia = /([0-9]{2}:[0-9]{2})/.exec(referencia);
  if (!coincidencia) {
    return Number.MAX_SAFE_INTEGER;
  }

  const info = parseHoraTexto(coincidencia[1]);
  return info ? info.totalMinutos : Number.MAX_SAFE_INTEGER;
};

export const obtenerMensajeError = (fuente) => {
  if (!fuente) {
    return null;
  }

  if (Array.isArray(fuente)) {
    return fuente.join(" ");
  }

  if (typeof fuente === "object") {
    return Object.values(fuente)
      .flatMap((valor) => {
        if (Array.isArray(valor)) {
          return valor;
        }
        return [valor];
      })
      .join(" ");
  }

  return String(fuente);
};

export const construirCalendarioDesdeBloques = (bloques = []) => {
  const calendario = diasSemanaOrdenados.reduce((acumulado, dia) => {
    acumulado[dia] = [];
    return acumulado;
  }, {});

  bloques.forEach((bloque) => {
    const dia = (bloque?.dia_semana || "").toLowerCase();
    if (!calendario[dia]) {
      return;
    }
    calendario[dia].push(bloque);
  });

  diasSemanaOrdenados.forEach((dia) => {
    calendario[dia].sort((a, b) => obtenerOrdenHora(a) - obtenerOrdenHora(b));
  });

  return calendario;
};

export const obtenerMinutosDesdeTexto = (valor) => {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim().toLowerCase();
  if (texto.length === 0) {
    return null;
  }

  const normalizado = texto.replace(/\./g, "").replace(/\s+/g, " ");
  const coincidencia = /([0-9]{1,2}):([0-9]{2})/.exec(normalizado);
  if (!coincidencia) {
    return null;
  }

  let horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return null;
  }

  const contienePM = /\bpm\b/.test(normalizado) || /\bp m\b/.test(normalizado);
  const contieneAM = /\bam\b/.test(normalizado) || /\ba m\b/.test(normalizado);

  if (contienePM && horas < 12) {
    horas += 12;
  } else if (contieneAM && horas === 12) {
    horas = 0;
  }

  return horas * 60 + minutos;
};

export const formatearDuracionMinutos = (minutos) => {
  if (!Number.isFinite(minutos) || minutos <= 0) {
    return "—";
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${String(horas)}:${String(resto).padStart(2, "0")}`;
};

const generarPlantillaIntervalos = (
  inicioMin,
  finMin,
  segmentoMinutos = SEGMENTO_CALENDARIO_MINUTOS
) => {
  const segmentos = [];
  let indice = 1;

  const paso =
    Number.isFinite(segmentoMinutos) && segmentoMinutos > 0
      ? segmentoMinutos
      : SEGMENTO_CALENDARIO_MINUTOS;

  for (let actual = inicioMin; actual < finMin; actual += paso) {
    const hasta = Math.min(actual + paso, finMin);
    const duracion = hasta - actual;

    segmentos.push({
      numero: String(indice).padStart(2, "0"),
      desdeTexto: formatearMinutosA12Horas(actual),
      hastaTexto: formatearMinutosA12Horas(hasta),
      duracionMinutos: duracion,
      duracionTexto: formatearDuracionMinutos(duracion),
      desdeMin: actual,
      hastaMin: hasta,
    });

    indice += 1;
  }

  return segmentos;
};

export const plantillaBloquesSeccion = generarPlantillaIntervalos(
  TABLA_MINUTO_INICIO,
  TABLA_MINUTO_FIN,
  SEGMENTO_CALENDARIO_MINUTOS
);

export const normalizarDiaSemana = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim().toLowerCase();
};

export const construirIntervalosSeccion = (bloques = []) => {
  let minInicioBloques = Number.POSITIVE_INFINITY;
  let maxFinBloques = Number.NEGATIVE_INFINITY;

  bloques.forEach((bloque) => {
    const inicioTexto = bloque?.hora_inicio_texto || bloque?.hora_inicio || "";
    const finTexto = bloque?.hora_fin_texto || bloque?.hora_fin || "";
    const inicioMin = obtenerMinutosDesdeTexto(inicioTexto);
    const finMin = obtenerMinutosDesdeTexto(finTexto);

    if (Number.isFinite(inicioMin)) {
      minInicioBloques = Math.min(minInicioBloques, inicioMin);
    }
    if (Number.isFinite(finMin)) {
      maxFinBloques = Math.max(maxFinBloques, finMin);
    }
  });

  let inicioReferencia = TABLA_MINUTO_INICIO;
  let finReferencia = TABLA_MINUTO_FIN;

  if (Number.isFinite(minInicioBloques)) {
    inicioReferencia = Math.min(
      inicioReferencia,
      alinearMinutosASegmento(minInicioBloques)
    );
  }

  if (Number.isFinite(maxFinBloques)) {
    finReferencia = Math.max(
      finReferencia,
      alinearMinutosASegmento(maxFinBloques, true)
    );
  }

  const plantilla = generarPlantillaIntervalos(inicioReferencia, finReferencia);

  const crearFilaDesdeSegmento = (segmento) => ({
    ...segmento,
    numero: "",
    bloquesPorDia: diasSemanaOrdenados.reduce((acumulado, dia) => {
      acumulado[dia] = [];
      return acumulado;
    }, {}),
  });

  const filas = plantilla.map((segmento) => crearFilaDesdeSegmento(segmento));

  const filaPorInicio = new Map();
  filas.forEach((fila) => {
    filaPorInicio.set(fila.desdeMin, fila);
  });

  const obtenerFilaPorInicio = (inicioMin) => {
    if (!Number.isFinite(inicioMin)) {
      return null;
    }

    if (filaPorInicio.has(inicioMin)) {
      return filaPorInicio.get(inicioMin);
    }

    const nuevoSegmento = {
      numero: "",
      desdeTexto: formatearMinutosA12Horas(inicioMin),
      hastaTexto: formatearMinutosA12Horas(
        inicioMin + SEGMENTO_CALENDARIO_MINUTOS
      ),
      duracionMinutos: SEGMENTO_CALENDARIO_MINUTOS,
      duracionTexto: formatearDuracionMinutos(SEGMENTO_CALENDARIO_MINUTOS),
      desdeMin: inicioMin,
      hastaMin: inicioMin + SEGMENTO_CALENDARIO_MINUTOS,
    };

    const fila = crearFilaDesdeSegmento(nuevoSegmento);
    filas.push(fila);
    filaPorInicio.set(inicioMin, fila);
    return fila;
  };

  bloques.forEach((bloque) => {
    const dia = normalizarDiaSemana(bloque?.dia_semana);
    if (!diasSemanaOrdenados.includes(dia)) {
      return;
    }

    const inicioTexto = bloque?.hora_inicio_texto || bloque?.hora_inicio || "";
    const finTexto = bloque?.hora_fin_texto || bloque?.hora_fin || "";
    const inicioMin = obtenerMinutosDesdeTexto(inicioTexto);
    const finMin = obtenerMinutosDesdeTexto(finTexto);

    if (!Number.isFinite(inicioMin) || !Number.isFinite(finMin)) {
      return;
    }

    const duracionTotal = Math.max(finMin - inicioMin, 0);
    const segmentosTotales = Math.max(
      1,
      Math.ceil(duracionTotal / SEGMENTO_CALENDARIO_MINUTOS)
    );

    for (let offset = 0; offset < segmentosTotales; offset += 1) {
      const segmentoInicio = inicioMin + offset * SEGMENTO_CALENDARIO_MINUTOS;
      const fila = obtenerFilaPorInicio(segmentoInicio);
      if (!fila) {
        continue;
      }

      const segmentoFin = Math.min(
        segmentoInicio + SEGMENTO_CALENDARIO_MINUTOS,
        finMin
      );

      fila.bloquesPorDia[dia].push({
        ...bloque,
        segmentoIndice: offset,
        segmentoTotal: segmentosTotales,
        segmentoInicioMin: segmentoInicio,
        segmentoFinMin: segmentoFin,
        segmentoInicioTexto: formatearMinutosA12Horas(segmentoInicio),
        segmentoFinTexto: formatearMinutosA12Horas(segmentoFin),
        bloqueInicioMin: inicioMin,
        bloqueFinMin: finMin,
        bloqueInicioTexto: formatearMinutosA12Horas(inicioMin),
        bloqueFinTexto: formatearMinutosA12Horas(finMin),
        bloqueDuracionMin: duracionTotal,
      });
    }
  });

  const filasOrdenadas = filas
    .sort((a, b) => a.desdeMin - b.desdeMin)
    .map((fila, indice) => ({
      ...fila,
      numero: String(indice + 1).padStart(2, "0"),
    }));

  return filasOrdenadas;
};

export const construirDocentesSeccion = (bloques = []) => {
  const mapa = new Map();

  bloques.forEach((bloque) => {
    const nombre = formatearDocente(bloque) || "Docente sin asignar";
    const funcion =
      bloque?.nombre_funcion ||
      bloque?.funcion ||
      bloque?.tipo_funcion ||
      "Sin función";
    const clave =
      bloque?.fk_personal && Number.isFinite(Number(bloque.fk_personal))
        ? `id-${bloque.fk_personal}`
        : `nombre-${nombre.toLowerCase()}`;

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        id: clave,
        nombre,
        funcion,
        componentes: new Set(),
      });
    }

    const registro = mapa.get(clave);
    if (bloque?.nombre_componente) {
      registro.componentes.add(bloque.nombre_componente);
    }
  });

  return Array.from(mapa.values())
    .map((registro) => ({
      ...registro,
      componentes: Array.from(registro.componentes).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
    }))
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, undefined, {
        sensitivity: "base",
      })
    );
};

export const normalizarHoraInput = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  const limpio = valor.replace(/[^0-9:]/g, "");
  const indiceDosPuntos = limpio.indexOf(":");

  if (indiceDosPuntos === -1) {
    return limpio.slice(0, 4);
  }

  const horas = limpio
    .slice(0, indiceDosPuntos)
    .replace(/[^0-9]/g, "")
    .slice(0, 2);
  const minutos = limpio
    .slice(indiceDosPuntos + 1)
    .replace(/[^0-9]/g, "")
    .slice(0, 2);

  if (horas.length === 0 && minutos.length === 0) {
    return "";
  }

  if (horas.length === 0) {
    return minutos;
  }

  if (minutos.length === 0) {
    return `${horas}`.slice(0, 2) + ":";
  }

  const horasNormalizadas = horas.slice(0, 2);
  return `${horasNormalizadas}:${minutos}`;
};

export const completarHoraBlur = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length === 0) {
    return "";
  }

  if (digitos.length <= 2) {
    const horas = digitos.padStart(2, "0");
    return `${horas}:00`;
  }
  if (digitos.length === 3) {
    const horas = digitos.slice(0, 1).padStart(2, "0");
    const minutos = digitos.slice(1).padEnd(2, "0");
    return `${horas}:${minutos}`;
  }

  const horas = digitos.slice(0, 2).padStart(2, "0");
  const minutos = digitos.slice(2, 4).padEnd(2, "0");
  return `${horas}:${minutos}`;
};

export const validarHorasFormulario = (
  { hora_inicio, hora_fin },
  { esEspecialista = false, bloquesConfig } = {}
) => {
  const errores = {};

  const inicio = parseHoraTexto(hora_inicio);
  if (!inicio) {
    errores.hora_inicio =
      "Ingresa la hora de inicio con formato HH:MM (ej. 07:00).";
  } else {
    if (
      inicio.horas < 7 ||
      inicio.horas > 12 ||
      (inicio.horas === 12 && inicio.minutos > 0)
    ) {
      errores.hora_inicio =
        "La hora de inicio debe estar entre las 07:00 y las 12:00 m.";
    }
  }

  const fin = parseHoraTexto(hora_fin);
  if (!fin) {
    errores.hora_fin =
      "Ingresa la hora de finalización con formato HH:MM (ej. 08:20).";
  } else {
    if (
      fin.horas < 7 ||
      fin.horas > 12 ||
      (fin.horas === 12 && fin.minutos > 0)
    ) {
      errores.hora_fin =
        "La hora de finalización debe estar entre las 07:00 y las 12:00 m (máximo 12:00).";
    }
  }

  if (!errores.hora_inicio && !errores.hora_fin && inicio && fin) {
    if (fin.totalMinutos <= inicio.totalMinutos) {
      const mensaje =
        "La hora de finalización debe ser mayor que la hora de inicio.";
      errores.horario = mensaje;
      errores.hora_fin = errores.hora_fin || mensaje;
    } else {
      const codigo = obtenerCodigoBloquePorRango(
        hora_inicio,
        hora_fin,
        bloquesConfig
      );
      if (!codigo) {
        const mensaje =
          "Selecciona un bloque válido del cronograma preconfigurado.";
        errores.horario = mensaje;
        errores.hora_fin = errores.hora_fin || mensaje;
      } else {
        const bloque = obtenerBloquePorCodigo(codigo, bloquesConfig);
        if (bloque?.tipo && bloque.tipo !== "clase") {
          const mensaje =
            'Solo se permiten bloques de tipo "clase" para registrar Componentes de Aprendizaje.';
          errores.horario = mensaje;
          errores.hora_fin = errores.hora_fin || mensaje;
        } else if (bloque?.duracion) {
          const duracionesPermitidas =
            obtenerDuracionesPermitidas(esEspecialista);
          if (
            bloque.duracion >= 40 &&
            bloque.duracion <= 80 &&
            !duracionesPermitidas.includes(bloque.duracion)
          ) {
            const etiquetaDuraciones = duracionesPermitidas
              .slice()
              .sort((a, b) => a - b)
              .map((valor) => `${valor} minutos`)
              .join(", ");
            const mensaje = esEspecialista
              ? `Los especialistas solo pueden registrar bloques de ${etiquetaDuraciones}.`
              : `Los docentes de aula solo pueden registrar bloques de ${etiquetaDuraciones}.`;
            errores.duracion = mensaje;
            errores.hora_fin = errores.hora_fin || mensaje;
          }
        }
      }
    }
  }

  return errores;
};

export { diasSemanaOrdenados, diasSemanaEtiquetas, diasSemanaOpciones };
