export const anioEscolarLayout = {
  container:
    "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow",
  header: "mb-4 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-bold text-slate-900",
  addButton:
    "inline-flex items-center rounded-2xl px-4 py-2 gap-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 shadow-sm bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60",
  description: "mb-6 text-sm text-slate-500",
};

export const anioEscolarFormClasses = {
  group: "mb-4 flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100",
  inputValid:
    "w-full rounded-2xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  inputInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  select:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100",
  selectInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  textArea:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100",
  textAreaInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  readOnly:
    "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700",
  helper: "text-xs text-slate-500",
  error: "text-xs font-semibold text-rose-600",
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton:
    "inline-flex items-center rounded-2xl px-4 py-2 justify-center text-sm font-semibold text-white transition focus:outline-none focus:ring-4 shadow-sm bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60",
  secondaryButton:
    "inline-flex items-center rounded-2xl px-4 py-2 justify-center bg-slate-600 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50",
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  fieldWrapper: "flex flex-col gap-1.5",
  textAreaAuto: "min-h-[88px]",
  ghostButton:
    "inline-flex items-center rounded-2xl px-4 py-2 gap-2 text-sm font-semibold transition focus:outline-none focus:ring-4 bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200/60",
  momentosGrid: "mt-4 grid grid-cols-1 gap-4 md:grid-cols-3",
  momentoCard:
    "flex flex-col gap-3 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm",
  momentoTitle: "text-sm font-semibold text-blue-700",
};

export const anioEscolarModalClasses = {
  overlay:
    "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto",
  content:
    "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
  header: "mb-6 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  errorBox: "mb-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-4",
  errorList: "space-y-2 text-sm text-rose-600",
  errorItem: "leading-snug",
  section: "mt-6",
  sectionHeader: "mb-4 flex flex-col gap-1",
  sectionTitle: "text-lg font-semibold text-slate-800",
  warning: "mt-3 text-sm font-semibold text-amber-600",
};

export const anioEscolarTableClasses = {
  wrapper: "overflow-x-auto",
  filterContainer: "w-full max-w-md",
  filterInput:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  helperText: "py-6 text-center text-sm text-slate-500",
  actionGroup: "flex items-center justify-center gap-2",
  actionButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const anioEscolarStatusClasses = {
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  activo: "bg-blue-100 text-blue-700",
  incompleto: "bg-amber-100 text-amber-700",
  inactivo: "bg-rose-100 text-rose-700",
  planificado: "bg-blue-100 text-blue-700",
  desconocido: "bg-slate-200 text-slate-600",
};

export const anioEscolarIconClasses = {
  base: "h-5 w-5",
};
