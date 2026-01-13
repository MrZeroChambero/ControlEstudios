const normalizarId = (valor) => {
  if (valor === null || valor === undefined) {
    return "";
  }
  return String(valor);
};

export const construirSeleccionesIniciales = (estudiantes = []) => {
  const resultado = {};
  estudiantes.forEach((estudiante) => {
    const estudianteKey = normalizarId(estudiante?.id_estudiante);
    if (!estudianteKey) {
      return;
    }
    const indicadoresActuales = estudiante?.indicadores ?? [];
    const mapaIndicadores = {};
    indicadoresActuales.forEach((registro) => {
      const indicadorKey = normalizarId(registro?.indicador?.id_indicador);
      const literal = registro?.evaluacion?.letra ?? "";
      if (indicadorKey && literal) {
        mapaIndicadores[indicadorKey] = literal;
      }
    });
    resultado[estudianteKey] = mapaIndicadores;
  });
  return resultado;
};

export const construirMapaPermitidos = (permitidos = {}) => {
  const mapa = {};
  Object.entries(permitidos).forEach(([estudianteId, lista]) => {
    const claveEstudiante = normalizarId(estudianteId);
    if (!claveEstudiante) {
      return;
    }
    if (!Array.isArray(lista)) {
      mapa[claveEstudiante] = new Set();
      return;
    }
    mapa[claveEstudiante] = new Set(
      lista.map((valor) => normalizarId(valor)).filter(Boolean)
    );
  });
  return mapa;
};

export const obtenerEtiquetaPlan = (plan) => {
  if (!plan) {
    return "Plan general";
  }
  const origen = plan.origen ?? plan.tipo ?? "general";
  if (origen === "individual") {
    return "Plan individual";
  }
  if (origen === "general") {
    return "Plan general";
  }
  return "Plan";
};

export const seleccionarLetraValida = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }
  const letra = valor.trim().toUpperCase();
  if (["A", "B", "C", "D", "E"].includes(letra)) {
    return letra;
  }
  return "";
};

export const hayCambiosEnSelecciones = (selecciones = {}, originales = {}) => {
  const estudiantes = new Set([
    ...Object.keys(selecciones),
    ...Object.keys(originales),
  ]);
  for (const estudiante of estudiantes) {
    const actuales = selecciones[estudiante] ?? {};
    const previos = originales[estudiante] ?? {};
    const indicadores = new Set([
      ...Object.keys(actuales),
      ...Object.keys(previos),
    ]);
    for (const indicador of indicadores) {
      if ((actuales[indicador] ?? "") !== (previos[indicador] ?? "")) {
        return true;
      }
    }
  }
  return false;
};
