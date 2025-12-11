export const formatAttemptMessage = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { intentos = null, bloqueo = null } = payload;
  const mensajes = [];
  const restantes = [];

  recogerIntentosRestantes(intentos, restantes);

  if (restantes.length === 0) {
    recogerIntentosRestantes(payload, restantes);
  }

  if (restantes.length > 0) {
    const minimo = Math.min(...restantes);
    mensajes.push(`Intentos restantes: ${Math.max(minimo, 0)}`);
  }

  if (bloqueo && typeof bloqueo === "object") {
    const segundos = obtenerNumero(bloqueo.segundos_restantes);
    const minutos = obtenerNumero(bloqueo.duracion_minutos);
    const tiempo =
      segundos !== null
        ? formatearSegundos(segundos)
        : minutos !== null
        ? formatearSegundos(minutos * 60)
        : null;

    if (tiempo) {
      mensajes.push(`Tiempo restante de bloqueo: ${tiempo}`);
    }
  }

  return mensajes.length > 0 ? mensajes.join("\n") : null;
};

const obtenerNumero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const formatearSegundos = (totalSegundos) => {
  if (!Number.isFinite(totalSegundos) || totalSegundos <= 0) {
    return "menos de un minuto";
  }

  const minutos = Math.floor(totalSegundos / 60);
  const segundos = Math.max(0, Math.round(totalSegundos % 60));

  if (minutos === 0) {
    return `${segundos} segundo${segundos === 1 ? "" : "s"}`;
  }

  if (segundos === 0) {
    return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
  }

  return `${minutos} minuto${minutos === 1 ? "" : "s"} ${segundos} segundo${
    segundos === 1 ? "" : "s"
  }`;
};

function recogerIntentosRestantes(valor, acumulado) {
  if (!valor || typeof valor !== "object") {
    return;
  }

  if (Array.isArray(valor)) {
    valor.forEach((item) => recogerIntentosRestantes(item, acumulado));
    return;
  }

  if (Object.prototype.hasOwnProperty.call(valor, "intentos_restantes")) {
    const restantes = obtenerNumero(valor.intentos_restantes);
    if (restantes !== null) {
      acumulado.push(restantes);
    }
  }

  Object.values(valor).forEach((child) => {
    if (child && typeof child === "object") {
      recogerIntentosRestantes(child, acumulado);
    }
  });
}

const escaparHtml = (texto) =>
  String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const buildAttemptHtml = (principal, detalle) => {
  const partes = [];

  if (principal) {
    partes.push(`<p>${escaparHtml(principal)}</p>`);
  }

  if (detalle) {
    const lineas = detalle
      .split("\n")
      .map((linea) => `<div>${escaparHtml(linea)}</div>`)
      .join("");
    partes.push(
      `<div style="margin-top:0.5rem;font-size:0.9rem;color:#4c4c4c;">${lineas}</div>`
    );
  }

  if (partes.length === 0 && principal) {
    return escaparHtml(principal);
  }

  return partes.join("");
};
