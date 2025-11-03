export const personalFormConfig = [
  { name: "id_persona", label: "Persona", type: "select", required: true },
  {
    name: "funcion",
    label: "Función",
    type: "select",
    required: true,
    options: ["Docente", "Administrativo", "Obrero", "CBIT", "CNAE", "UPE"],
  },
  {
    name: "fecha_contratacion",
    label: "Fecha contratación",
    type: "date",
    required: true,
  },
  { name: "nivel_academico", label: "Nivel académico", type: "text" },
  {
    name: "horas_trabajo",
    label: "Horas trabajo (HH:MM o HH:MM:SS)",
    type: "time",
  },
  { name: "rif", label: "RIF", type: "text" },
  { name: "etnia_religion", label: "Etnia / Religión", type: "text" },
  { name: "cantidad_hijas", label: "Cantidad hijas", type: "number" },
  {
    name: "cantidad_hijos_varones",
    label: "Cantidad hijos varones",
    type: "number",
  },
  { name: "fk_plantel", label: "Plantel", type: "select", required: true },
  {
    name: "plantel_personal_estado",
    label: "Estado en Plantel",
    type: "select",
    required: true,
    options: ["solo_cobra", "solo_trabaja", "cobra_y_trabaja"],
  },
];
