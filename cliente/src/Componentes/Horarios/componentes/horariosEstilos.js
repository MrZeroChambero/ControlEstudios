export const barraBusquedaClases = {
  container:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  inputWrapper: "w-full md:max-w-xs",
  input:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  actualizarButton:
    "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60",
};

export const tablaHorarioSemanalClases = {
  wrapper: "overflow-x-auto",
  table:
    "min-w-full border-separate border-spacing-0 rounded-3xl border border-slate-200 bg-white text-sm shadow-sm",
  headRow:
    "text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
  headCell: "border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600",
  headCellCenter:
    "border-b border-slate-200 bg-slate-100 px-4 py-3 text-center text-slate-600",
  numeroCell:
    "border-t border-slate-100 px-4 py-3 text-center font-semibold text-slate-600",
  horarioCell: "border-t border-slate-100 px-4 py-3 font-medium text-slate-700",
  bloqueCell: "border-t border-slate-100 px-4 py-3 align-top",
  sinAsignacion: "text-xs text-slate-400",
  bloqueCard:
    "rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm",
  rutinaCard:
    "rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm",
  accionesWrapper: "mt-3 flex justify-center",
};

export const agendaDocenteClases = {
  infoCard:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600",
  infoItem: "flex items-center gap-2",
  infoLabel: "font-semibold text-slate-800",
};

export const calendarioResponsiveClases = {
  grid: "grid gap-4 md:grid-cols-2 xl:grid-cols-5",
  card: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  diaTitulo: "text-sm font-semibold text-slate-700",
  bloquesWrapper: "mt-3 space-y-3",
  bloqueCard:
    "rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm",
  mensajeVacio: "text-xs text-slate-500",
};
