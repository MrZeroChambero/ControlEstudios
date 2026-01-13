const NIVEL_SUPERUSUARIO = "director";

const normalizarTexto = (valor) => {
  if (valor === null || valor === undefined) {
    return "";
  }
  return valor.toString().trim().toLowerCase();
};

const aLista = (valor) => {
  if (Array.isArray(valor)) {
    return valor
      .map((item) => normalizarTexto(item))
      .filter((item) => Boolean(item));
  }

  if (typeof valor === "string" && valor.includes("[")) {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) {
        return aLista(parsed);
      }
    } catch (error) {
      // Ignorar errores de parseo y continuar con tratamiento estándar
    }
  }

  if (typeof valor === "string") {
    return valor
      .split(/[|,/;]+/)
      .map((item) => normalizarTexto(item))
      .filter((item) => Boolean(item));
  }

  return [];
};

export const obtenerNivelesUsuario = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  const almacenado = window.localStorage.getItem("nivel");
  if (!almacenado) {
    return [];
  }
  return aLista(almacenado);
};

export const interpretarNivelesEntrada = (valor) => aLista(valor);

export const tienePermisoPorNivel = (
  nivelesPermitidos = [],
  nivelesUsuario = obtenerNivelesUsuario()
) => {
  const permitidos = aLista(nivelesPermitidos);
  if (!permitidos.length) {
    return true;
  }
  const usuario = aLista(nivelesUsuario);
  if (!usuario.length) {
    return false;
  }
  if (usuario.includes(NIVEL_SUPERUSUARIO)) {
    return true;
  }
  return usuario.some((nivel) => permitidos.includes(nivel));
};

export const filtrarPorNivel = (items = [], nivelesUsuario) => {
  return items.filter((item) =>
    tienePermisoPorNivel(item.nivelesPermitidos, nivelesUsuario)
  );
};
