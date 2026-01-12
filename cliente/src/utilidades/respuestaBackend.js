const esObjeto = (valor) => valor !== null && typeof valor === "object";

export const normalizarRespuesta = (
  payload,
  mensajePredeterminado = "Operación realizada."
) => {
  if (!esObjeto(payload)) {
    return {
      success: false,
      message: mensajePredeterminado,
      data: null,
      errors: null,
      errorDetails: null,
      raw: payload ?? null,
    };
  }

  const success =
    payload.back === true ||
    payload.success === true ||
    payload.exito === true ||
    payload.estado === "exito" ||
    payload.status === "success" ||
    payload.result === "ok";

  const message =
    payload.message ??
    payload.mensaje ??
    payload.msg ??
    (success ? mensajePredeterminado : mensajePredeterminado);

  const data =
    payload.data ??
    payload.datos ??
    payload.payload ??
    payload.resultado ??
    null;

  const errors = payload.errors ?? payload.errores ?? null;
  const errorDetails =
    payload.error_details ??
    payload.detalle ??
    payload.details ??
    payload.error ??
    null;

  return {
    success,
    message,
    data,
    errors,
    errorDetails,
    raw: payload,
  };
};

export const asegurarCompatibilidad = (payload) => {
  if (!esObjeto(payload)) {
    return payload;
  }

  const compat = {
    back:
      payload.back ??
      payload.success ??
      payload.exito ??
      payload.estado === "exito",
    data: payload.data ?? payload.datos ?? null,
    message: payload.message ?? payload.mensaje ?? "",
    errors: payload.errors ?? payload.errores ?? null,
    error_details:
      payload.error_details ??
      payload.detalle ??
      payload.details ??
      payload.error ??
      null,
  };

  return {
    ...payload,
    ...compat,
    exito:
      payload.exito ??
      (typeof compat.back === "boolean" ? compat.back : undefined),
    mensaje: payload.mensaje ?? compat.message,
    datos: payload.datos ?? compat.data,
    errores: payload.errores ?? compat.errors,
  };
};
