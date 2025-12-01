export const layoutClasses = {
  container:
    "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow",
  header: "mb-4 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-bold text-slate-900",
  addButton:
    "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60",
  description: "mb-6 text-sm text-slate-500",
};

export const modalClasses = {
  overlay:
    "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto",
  content: "w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl",
  title: "mb-6 text-center text-2xl font-semibold text-slate-900",
};

export const formClasses = {
  group: "mb-4 flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100",
  select:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  readOnly:
    "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700",
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton:
    "inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60",
  secondaryButton:
    "inline-flex items-center justify-center rounded-2xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50",
};

export const tableClasses = {
  filterContainer: "w-full max-w-xs",
  filterInput:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  helperText: "py-6 text-center text-sm text-slate-500",
  actionGroup: "flex items-center justify-center gap-2",
  actionButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton: "text-amber-500 hover:text-amber-600",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const statusClasses = {
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-rose-100 text-rose-700",
  evalYes: "bg-blue-100 text-blue-700",
  evalNo: "bg-amber-100 text-amber-700",
};

export const iconClasses = {
  base: "h-5 w-5",
};
