export const BLOQUES_HORARIO_BASE = Object.freeze([]);

const obtenerBloquesConfig = (bloquesConfig) =>
  Array.isArray(bloquesConfig) && bloquesConfig.length > 0
    ? bloquesConfig
    : BLOQUES_HORARIO_BASE;

export const obtenerBloquesClase = (bloquesConfig) =>
  obtenerBloquesConfig(bloquesConfig).filter(
    (bloque) => bloque.tipo === "clase"
  );

export const obtenerBloquesRepetitivos = (bloquesConfig) =>
  obtenerBloquesConfig(bloquesConfig).filter(
    (bloque) => bloque.tipo === "repetitivo"
  );

const construirMapaPorCodigo = (bloquesConfig) =>
  obtenerBloquesConfig(bloquesConfig).reduce((acc, item) => {
    acc[item.codigo] = item;
    return acc;
  }, {});

export const BLOQUES_CLASE = obtenerBloquesClase();

export const BLOQUES_REPETITIVOS = obtenerBloquesRepetitivos();

export const BLOQUES_CODIGO_MAP = construirMapaPorCodigo();

export const BLOQUES_DEPENDENCIAS = Object.freeze({
  "05": ["06"],
});

export const obtenerBloquePorCodigo = (codigo, bloquesConfig) => {
  const mapa = construirMapaPorCodigo(bloquesConfig);
  return mapa[String(codigo).padStart(2, "0")] ?? null;
};

export const esBloqueDisponibleParaClase = (codigo, bloquesConfig) => {
  const bloque = obtenerBloquePorCodigo(codigo, bloquesConfig);
  return Boolean(bloque && bloque.tipo === "clase");
};

export const formatearEtiquetaBloque = (codigo, bloquesConfig) => {
  const bloque = obtenerBloquePorCodigo(codigo, bloquesConfig);
  if (!bloque) {
    return codigo;
  }
  return `${bloque.codigo} · ${bloque.inicio} - ${bloque.fin}`;
};

const toHoraTexto = (valor) => {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    const horas = Math.floor(valor);
    const minutos = Math.round((valor - horas) * 60);
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
      2,
      "0"
    )}`;
  }

  if (typeof valor === "string") {
    const coincidencia = /([0-9]{1,2}):([0-9]{2})/.exec(valor.trim());
    if (coincidencia) {
      return `${coincidencia[1].padStart(2, "0")}:${coincidencia[2]}`;
    }
  }

  return null;
};

export const obtenerCodigoBloquePorRango = (inicio, fin, bloquesConfig) => {
  const inicioTexto = toHoraTexto(inicio);
  const finTexto = toHoraTexto(fin);

  if (!inicioTexto || !finTexto) {
    return null;
  }

  const coincidencia = obtenerBloquesConfig(bloquesConfig).find(
    (bloque) => bloque.inicio === inicioTexto && bloque.fin === finTexto
  );

  return coincidencia?.codigo ?? null;
};

export const obtenerHorasDesdeCodigo = (codigo, bloquesConfig) => {
  const bloque = obtenerBloquePorCodigo(codigo, bloquesConfig);
  if (!bloque) {
    return null;
  }

  return { inicio: bloque.inicio, fin: bloque.fin };
};

export const esBloqueRegistroClase = (registro, bloquesConfig) => {
  if (!registro) {
    return false;
  }

  const codigo =
    registro.codigo_bloque ??
    obtenerCodigoBloquePorRango(
      registro.hora_inicio_texto ?? registro.hora_inicio,
      registro.hora_fin_texto ?? registro.hora_fin,
      bloquesConfig
    );

  if (!codigo) {
    return false;
  }

  return esBloqueDisponibleParaClase(codigo, bloquesConfig);
};

export const construirOpcionesBloquesClase = (bloquesConfig) =>
  obtenerBloquesClase(bloquesConfig).map((bloque) => ({
    value: bloque.codigo,
    label: formatearEtiquetaBloque(bloque.codigo, bloquesConfig),
    duracion: bloque.duracion,
    esExtension: Boolean(bloque.extensionDe),
  }));

export const filtrarBloquesClase = (bloques = [], bloquesConfig) =>
  Array.isArray(bloques)
    ? bloques.filter((bloque) => esBloqueRegistroClase(bloque, bloquesConfig))
    : [];
