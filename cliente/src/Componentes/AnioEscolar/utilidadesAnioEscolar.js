const MILISEGUNDOS_DIA = 86400000;

export const parsearISO = (iso) => {
  if (!iso) {
    return null;
  }
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (
    Number.isNaN(anio) ||
    Number.isNaN(mes) ||
    Number.isNaN(dia) ||
    anio < 1900 ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31
  ) {
    return null;
  }
  return new Date(Date.UTC(anio, mes - 1, dia));
};

export const convertirAISO = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return "";
  }
  const anio = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

export const diferenciaDias = (a, b) => {
  if (!(a instanceof Date) || Number.isNaN(a.getTime())) {
    return Infinity;
  }
  if (!(b instanceof Date) || Number.isNaN(b.getTime())) {
    return Infinity;
  }
  const diferenciaMs = Math.abs(a.getTime() - b.getTime());
  return Math.round(diferenciaMs / MILISEGUNDOS_DIA);
};

export const sumarDias = (fecha, dias) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return fecha;
  }
  const copia = new Date(fecha.getTime());
  copia.setUTCDate(copia.getUTCDate() + dias);
  return copia;
};

export const formatearFecha = (iso) => {
  if (!iso) {
    return "-";
  }
  const fecha = parsearISO(iso);
  if (!fecha) {
    return "-";
  }
  return fecha.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const calcularPascua = (anio) => {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anio, mes - 1, dia));
};

export const obtenerPredeterminados = (anioBase) => {
  const inicio = new Date(Date.UTC(anioBase, 8, 1));
  const fin = new Date(Date.UTC(anioBase + 1, 6, 20));
  const limite = new Date(inicio.getTime());

  const pascua = calcularPascua(anioBase + 1);
  const momento1Inicio = new Date(inicio.getTime());
  const momento1Fin = new Date(Date.UTC(anioBase, 11, 20));
  const momento2Inicio = new Date(Date.UTC(anioBase + 1, 0, 10));
  const momento2Fin = sumarDias(pascua, -7);
  const momento3Inicio = sumarDias(pascua, 7);
  const momento3Fin = new Date(Date.UTC(anioBase + 1, 6, 20));

  return {
    inicio,
    fin,
    limite,
    momentos: {
      1: { inicio: momento1Inicio, fin: momento1Fin },
      2: { inicio: momento2Inicio, fin: momento2Fin },
      3: { inicio: momento3Inicio, fin: momento3Fin },
    },
  };
};

export const inferirAnioBase = (fechaInicioIso) => {
  const inicio = parsearISO(fechaInicioIso);
  if (!inicio) {
    const hoy = new Date();
    return hoy.getUTCMonth() >= 6
      ? hoy.getUTCFullYear()
      : hoy.getUTCFullYear() - 1;
  }
  return inicio.getUTCFullYear();
};

export const generarMomentosAutomaticos = (datosAnio) => {
  if (!datosAnio?.fecha_inicio || !datosAnio?.fecha_final) {
    return [];
  }

  const anioBase = inferirAnioBase(datosAnio.fecha_inicio);
  const predeterminados = obtenerPredeterminados(anioBase);
  const inicioAnio = parsearISO(datosAnio.fecha_inicio);
  const finAnio = parsearISO(datosAnio.fecha_final);

  return [1, 2, 3].map((orden) => {
    const pred = predeterminados.momentos[orden];
    let inicio = new Date(pred.inicio.getTime());
    let fin = new Date(pred.fin.getTime());

    if (inicio < inicioAnio) {
      inicio = new Date(inicioAnio.getTime());
    }

    if (fin > finAnio) {
      fin = new Date(finAnio.getTime());
    }

    if (fin < inicio) {
      fin = new Date(inicio.getTime());
    }

    return {
      orden,
      nombre: `Momento ${orden}`,
      fecha_inicio: convertirAISO(inicio),
      fecha_final: convertirAISO(fin),
      estado: "activo",
    };
  });
};

export const validarRangos = (datos) => {
  const errores = {};
  const anioBase = inferirAnioBase(datos.fecha_inicio);
  const pred = obtenerPredeterminados(anioBase);

  const inicio = parsearISO(datos.fecha_inicio);
  const fin = parsearISO(datos.fecha_final);
  const limite = parsearISO(datos.fecha_limite_inscripcion);

  if (!inicio || !fin || !limite) {
    errores.general = "Todas las fechas son obligatorias.";
    return errores;
  }

  if (inicio > fin) {
    errores.fecha_final =
      "La fecha final debe ser posterior a la fecha de inicio.";
  }

  if (diferenciaDias(inicio, pred.inicio) > 7) {
    errores.fecha_inicio = "Solo se permite ajustar ±7 días respecto al 01/09.";
  }

  if (diferenciaDias(fin, pred.fin) > 7) {
    errores.fecha_final = "Solo se permite ajustar ±7 días respecto al 20/07.";
  }

  const limiteMinimo = sumarDias(pred.inicio, -7);
  if (limite > inicio) {
    errores.fecha_limite_inscripcion =
      "La fecha límite debe ser menor o igual a la fecha de inicio.";
  } else if (limite < limiteMinimo) {
    errores.fecha_limite_inscripcion =
      "La fecha límite no puede alejarse más de 7 días del inicio.";
  }

  return errores;
};

export const validarMomentos = (momentos, datosAnio) => {
  const errores = {};
  const anioBase = inferirAnioBase(datosAnio.fecha_inicio);
  const pred = obtenerPredeterminados(anioBase);
  const inicioAnio = parsearISO(datosAnio.fecha_inicio);
  const finAnio = parsearISO(datosAnio.fecha_final);

  const ordenados = [...(momentos || [])].sort((a, b) => a.orden - b.orden);

  ordenados.forEach((momento) => {
    const inicio = parsearISO(momento.fecha_inicio);
    const fin = parsearISO(momento.fecha_final);
    const clave = `momento_${momento.orden}`;

    if (!inicio || !fin) {
      errores[clave] = "Debe indicar ambas fechas.";
      return;
    }

    if (inicio > fin) {
      errores[clave] = "La fecha de inicio debe ser anterior a la fecha final.";
      return;
    }

    if (inicio < inicioAnio || fin > finAnio) {
      errores[clave] =
        "Las fechas deben estar dentro del rango del año escolar.";
      return;
    }

    const predeterminado = pred.momentos[momento.orden];
    if (
      diferenciaDias(inicio, predeterminado.inicio) > 7 ||
      diferenciaDias(fin, predeterminado.fin) > 7
    ) {
      errores[clave] =
        "Los momentos solo pueden ajustarse ±7 días de las fechas sugeridas.";
    }
  });

  for (let indice = 1; indice < ordenados.length; indice += 1) {
    const anterior = parsearISO(ordenados[indice - 1].fecha_final);
    const actual = parsearISO(ordenados[indice].fecha_inicio);
    if (anterior && actual && anterior >= actual) {
      errores.superposicion = "Los momentos no deben superponerse.";
      break;
    }
  }

  return errores;
};

export const validarFormulario = (formulario) => {
  if (!formulario) {
    return {};
  }
  const erroresAnios = validarRangos(formulario);
  const erroresMomentos = validarMomentos(
    formulario.momentos || [],
    formulario
  );
  return { ...erroresAnios, ...erroresMomentos };
};

export const combinarMomentos = (anteriores = [], recalculados = []) => {
  const mapa = new Map(anteriores.map((momento) => [momento.orden, momento]));
  return recalculados.map((momento) => {
    const existente = mapa.get(momento.orden);
    if (!existente) {
      return momento;
    }
    return {
      ...momento,
      id: existente.id ?? existente.id_momento ?? null,
      nombre: existente.nombre ?? existente.momento_nombre ?? momento.nombre,
      estado: existente.estado ?? existente.momento_estado ?? momento.estado,
    };
  });
};

export const normalizarMomento = (momento) => ({
  id: momento.id ?? momento.id_momento ?? null,
  orden: momento.orden,
  nombre:
    momento.nombre ?? momento.momento_nombre ?? `Momento ${momento.orden}`,
  fecha_inicio: momento.fecha_inicio ?? momento.momento_inicio ?? "",
  fecha_final: momento.fecha_final ?? momento.momento_fin ?? "",
  estado: momento.estado ?? momento.momento_estado ?? "activo",
});

export const construirFormularioBase = () => {
  const hoy = new Date();
  const anioBase =
    hoy.getUTCMonth() >= 6 ? hoy.getUTCFullYear() : hoy.getUTCFullYear() - 1;
  const predeterminados = obtenerPredeterminados(anioBase);
  const datosBase = {
    nombre: "",
    fecha_inicio: convertirAISO(predeterminados.inicio),
    fecha_final: convertirAISO(predeterminados.fin),
    fecha_limite_inscripcion: convertirAISO(predeterminados.limite),
    estado: "incompleto",
  };

  return {
    ...datosBase,
    momentos: generarMomentosAutomaticos(datosBase),
  };
};

export const transformarErrores = (errores) =>
  Object.entries(errores || {}).map(([clave, mensaje]) => ({
    clave,
    mensaje: Array.isArray(mensaje) ? mensaje.join(" ") : mensaje,
  }));
