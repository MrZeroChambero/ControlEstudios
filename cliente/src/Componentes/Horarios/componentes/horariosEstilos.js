export const barraBusquedaClases = {
  contenedor:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  envoltorioEntrada: "w-full md:max-w-xs",
  entrada:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  envoltorioSelect: "w-full md:max-w-xs",
  select:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  botonActualizar:
    "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60",
};

export const tablaHorarioSemanalClases = {
  envoltorio: "overflow-x-auto",
  tabla:
    "min-w-full border-separate border-spacing-0 rounded-3xl border border-slate-200 bg-white text-sm shadow-sm",
  filaEncabezado:
    "text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
  celdaEncabezado:
    "border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600",
  celdaEncabezadoCentro:
    "border-b border-slate-200 bg-slate-100 px-4 py-3 text-center text-slate-600",
  celdaNumero:
    "border-t border-slate-100 px-4 py-3 text-center font-semibold text-slate-600",
  celdaHorario:
    "border-t border-slate-100 px-4 py-3 font-medium text-slate-700",
  celdaBloque: "border-t border-slate-100 px-4 py-3 align-top",
  sinAsignacion: "text-xs text-slate-400",
  tarjetaBloque:
    "rounded-2xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:shadow-md",
  tarjetaRutina:
    "rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm",
  envoltorioAcciones: "mt-3 flex justify-center",
  tarjetaBloqueVacio:
    "rounded-2xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-center text-xs font-semibold text-slate-400",
};

export const agendaDocenteClases = {
  tarjetaInformacion:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600",
  elementoInformacion: "flex items-center gap-2",
  etiquetaInformacion: "font-semibold text-slate-800",
};

export const calendarioResponsiveClases = {
  cuadricula: "grid gap-4 md:grid-cols-2 xl:grid-cols-5",
  tarjeta: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  tituloDia: "text-sm font-semibold text-slate-700",
  envoltorioBloques: "mt-3 space-y-3",
  tarjetaBloque:
    "rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm",
  mensajeVacio: "text-xs text-slate-500",
};

export const tablaDocentesSeccionClases = {
  envoltorio: "overflow-x-auto",
  tabla:
    "min-w-full border-separate border-spacing-0 rounded-3xl border border-slate-200 bg-white text-sm shadow-sm",
  filaEncabezado:
    "text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
  celdaEncabezado:
    "border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600",
  filaCuerpo: "text-sm text-slate-700",
  celdaFuerte:
    "border-t border-slate-100 px-4 py-3 font-semibold text-slate-800",
  celda: "border-t border-slate-100 px-4 py-3 text-slate-600",
};
