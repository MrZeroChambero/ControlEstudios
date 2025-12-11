const FORMATO_SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const normalizarCadena = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim();
};

const formatearConComponentes = (anio, mes, dia) => {
  if (
    Number.isNaN(anio) ||
    Number.isNaN(mes) ||
    Number.isNaN(dia) ||
    anio < 1000 ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31
  ) {
    return "";
  }

  const diaCadena = String(dia).padStart(2, "0");
  const mesCadena = String(mes).padStart(2, "0");
  return `${diaCadena}/${mesCadena}/${anio}`;
};

const formatearCadenaSimple = (texto) => {
  if (!FORMATO_SOLO_FECHA.test(texto)) {
    return null;
  }
  const [anio, mes, dia] = texto.split("-").map(Number);
  return formatearConComponentes(anio, mes, dia);
};

const crearFecha = (valor) => {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      return null;
    }
    return new Date(valor.getTime());
  }

  if (typeof valor === "number") {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return null;
    }
    return fecha;
  }

  if (typeof valor === "string") {
    const limpio = normalizarCadena(valor);
    if (!limpio) {
      return null;
    }

    const simple = formatearCadenaSimple(limpio);
    if (simple) {
      const [dia, mes, anio] = simple.split("/");
      return new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
    }

    const normalizada = limpio.includes("T")
      ? limpio
      : limpio.replace(" ", "T");
    const fecha = new Date(normalizada);
    if (Number.isNaN(fecha.getTime())) {
      return null;
    }
    return fecha;
  }

  return null;
};

const obtenerComponentesFecha = (valor) => {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      return null;
    }
    return {
      anio: valor.getUTCFullYear(),
      mes: valor.getUTCMonth() + 1,
      dia: valor.getUTCDate(),
    };
  }

  if (typeof valor === "string") {
    const simple = formatearCadenaSimple(normalizarCadena(valor));
    if (simple) {
      const [diaCadena, mesCadena, anioCadena] = simple.split("/");
      return {
        anio: Number(anioCadena),
        mes: Number(mesCadena),
        dia: Number(diaCadena),
      };
    }
  }

  const fecha = crearFecha(valor);
  if (!fecha) {
    return null;
  }

  return {
    anio: fecha.getUTCFullYear(),
    mes: fecha.getUTCMonth() + 1,
    dia: fecha.getUTCDate(),
  };
};

const incluyeHora = (valor) => {
  if (valor instanceof Date) {
    return true;
  }

  if (typeof valor === "number") {
    return true;
  }

  if (typeof valor === "string") {
    const texto = normalizarCadena(valor);
    return /\d{2}:\d{2}/.test(texto);
  }

  return false;
};

export const formatearFechaCorta = (valor) => {
  if (!valor && valor !== 0) {
    return "";
  }

  const simpleCadena =
    typeof valor === "string"
      ? formatearCadenaSimple(normalizarCadena(valor))
      : null;
  if (simpleCadena) {
    return simpleCadena;
  }

  const componentes = obtenerComponentesFecha(valor);
  if (!componentes) {
    return "";
  }

  return formatearConComponentes(
    componentes.anio,
    componentes.mes,
    componentes.dia
  );
};

export const formatearFechaHoraCorta = (valor) => {
  if (!valor && valor !== 0) {
    return "";
  }

  if (!incluyeHora(valor)) {
    return formatearFechaCorta(valor);
  }

  const fecha = crearFecha(valor);
  if (!fecha) {
    return "";
  }

  return fecha.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
