export const diasSemanaOrdenados = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
];

export const diasSemanaEtiquetas = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
};

export const diasSemanaOpciones = diasSemanaOrdenados.map((valor) => ({
  valor,
  etiqueta: diasSemanaEtiquetas[valor],
}));
