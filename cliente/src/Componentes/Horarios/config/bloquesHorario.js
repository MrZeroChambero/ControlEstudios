export const BLOQUES_HORARIO_BASE = Object.freeze([
  {
    codigo: "01",
    inicio: "07:00",
    fin: "07:25",
    tipo: "repetitivo",
    duracion: 25,
    actividad: "Acto Cívico",
  },
  {
    codigo: "02",
    inicio: "07:25",
    fin: "07:45",
    tipo: "repetitivo",
    duracion: 20,
    actividad: "Desayuno",
  },
  {
    codigo: "03",
    inicio: "07:45",
    fin: "08:25",
    tipo: "clase",
    duracion: 40,
  },
  {
    codigo: "04",
    inicio: "08:25",
    fin: "09:05",
    tipo: "clase",
    duracion: 40,
  },
  {
    codigo: "05",
    inicio: "09:05",
    fin: "09:45",
    tipo: "clase",
    duracion: 40,
  },
  {
    codigo: "06",
    inicio: "09:45",
    fin: "10:05",
    tipo: "clase",
    duracion: 20,
    extensionDe: "05",
  },
  {
    codigo: "07",
    inicio: "10:05",
    fin: "10:35",
    tipo: "repetitivo",
    duracion: 30,
    actividad: "RECESO",
  },
  {
    codigo: "08",
    inicio: "10:35",
    fin: "11:15",
    tipo: "clase",
    duracion: 40,
  },
  {
    codigo: "09",
    inicio: "11:15",
    fin: "11:55",
    tipo: "clase",
    duracion: 40,
  },
  {
    codigo: "10",
    inicio: "11:55",
    fin: "12:00",
    tipo: "repetitivo",
    duracion: 5,
    actividad: "Salida",
  },
]);

export const BLOQUES_CLASE = BLOQUES_HORARIO_BASE.filter(
  (bloque) => bloque.tipo === "clase"
);

export const BLOQUES_REPETITIVOS = BLOQUES_HORARIO_BASE.filter(
  (bloque) => bloque.tipo === "repetitivo"
);

export const BLOQUES_CODIGO_MAP = BLOQUES_HORARIO_BASE.reduce((acc, item) => {
  acc[item.codigo] = item;
  return acc;
}, {});

export const BLOQUES_DEPENDENCIAS = Object.freeze({
  "05": ["06"],
});

export const obtenerBloquePorCodigo = (codigo) =>
  BLOQUES_CODIGO_MAP[String(codigo).padStart(2, "0")] ?? null;

export const esBloqueDisponibleParaClase = (codigo) => {
  const bloque = obtenerBloquePorCodigo(codigo);
  return Boolean(bloque && bloque.tipo === "clase");
};

export const formatearEtiquetaBloque = (codigo) => {
  const bloque = obtenerBloquePorCodigo(codigo);
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

export const obtenerCodigoBloquePorRango = (inicio, fin) => {
  const inicioTexto = toHoraTexto(inicio);
  const finTexto = toHoraTexto(fin);

  if (!inicioTexto || !finTexto) {
    return null;
  }

  const coincidencia = BLOQUES_HORARIO_BASE.find(
    (bloque) => bloque.inicio === inicioTexto && bloque.fin === finTexto
  );

  return coincidencia?.codigo ?? null;
};

export const obtenerHorasDesdeCodigo = (codigo) => {
  const bloque = obtenerBloquePorCodigo(codigo);
  if (!bloque) {
    return null;
  }

  return { inicio: bloque.inicio, fin: bloque.fin };
};

export const esBloqueRegistroClase = (registro) => {
  if (!registro) {
    return false;
  }

  const codigo =
    registro.codigo_bloque ??
    obtenerCodigoBloquePorRango(
      registro.hora_inicio_texto ?? registro.hora_inicio,
      registro.hora_fin_texto ?? registro.hora_fin
    );

  if (!codigo) {
    return false;
  }

  return esBloqueDisponibleParaClase(codigo);
};

export const construirOpcionesBloquesClase = () =>
  BLOQUES_CLASE.map((bloque) => ({
    value: bloque.codigo,
    label: formatearEtiquetaBloque(bloque.codigo),
    duracion: bloque.duracion,
    esExtension: Boolean(bloque.extensionDe),
  }));

export const filtrarBloquesClase = (bloques = []) =>
  Array.isArray(bloques)
    ? bloques.filter((bloque) => esBloqueRegistroClase(bloque))
    : [];
