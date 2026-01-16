const RUTINA_CONTEXTO_GENERAL = "general";
export const RUTINA_CONTEXTO_AULA = "aula";

const crearRutinaPredefinida = ({
  clave,
  nombre,
  descripcion = "",
  inicio,
  fin,
  contextos = [RUTINA_CONTEXTO_AULA],
}) => ({
  clave,
  nombre,
  descripcion,
  inicio,
  fin,
  contextos,
});

export const RUTINAS_PREDEFINIDAS = Object.freeze([
  crearRutinaPredefinida({
    clave: "ingreso",
    nombre: "Entrada, Acto Cívico, Ingreso a los salones",
    inicio: "07:00",
    fin: "07:25",
    contextos: [RUTINA_CONTEXTO_AULA, RUTINA_CONTEXTO_GENERAL],
  }),
  crearRutinaPredefinida({
    clave: "desayuno",
    nombre: "Desayuno",
    inicio: "07:20",
    fin: "07:45",
    contextos: [RUTINA_CONTEXTO_AULA, RUTINA_CONTEXTO_GENERAL],
  }),
  crearRutinaPredefinida({
    clave: "recreo",
    nombre: "Recreo",
    inicio: "10:10",
    fin: "10:30",
    contextos: [RUTINA_CONTEXTO_AULA],
  }),
  crearRutinaPredefinida({
    clave: "Salida",
    nombre: "Salida",
    inicio: "11:55",
    fin: "12:00",
    contextos: [RUTINA_CONTEXTO_AULA, RUTINA_CONTEXTO_GENERAL],
  }),
]);

const rutinasPorContextoCache = new Map();

export const obtenerRutinasPorContexto = (contexto = RUTINA_CONTEXTO_AULA) => {
  const claveContexto = contexto || RUTINA_CONTEXTO_AULA;

  if (rutinasPorContextoCache.has(claveContexto)) {
    return rutinasPorContextoCache.get(claveContexto);
  }

  const rutinas = RUTINAS_PREDEFINIDAS.filter((rutina) =>
    Array.isArray(rutina.contextos)
      ? rutina.contextos.includes(claveContexto)
      : claveContexto === RUTINA_CONTEXTO_AULA
  );

  rutinasPorContextoCache.set(claveContexto, rutinas);
  return rutinas;
};
