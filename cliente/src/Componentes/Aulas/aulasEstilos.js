const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = "text-2xl font-bold text-slate-900";
const baseDescription = "mb-6 text-sm text-slate-500";
const formFieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const helperTextBase = "text-xs text-slate-500";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const filterInputBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessageBase = "py-6 text-center text-sm text-slate-500";

export const aulasLayout = {
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
};

export const aulasInfoClasses = {
  card: "rounded-2xl bg-emerald-50/60 p-4 text-sm text-emerald-700",
  title: "font-semibold",
};

export const aulasFormClasses = {
  section: "mt-6",
  sectionTitle: "text-base font-semibold text-slate-800",
  note: helperTextBase,
  grid: "grid grid-cols-1 gap-4 md:grid-cols-3",
  group: "flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  select: formFieldBase,
  actions: "mt-6 flex justify-end",
  submitButton:
    "inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-60",
};

const tableActionGroup = "flex items-center justify-center gap-2";

export const aulasTableClasses = {
  wrapper: "overflow-x-auto",
  filterContainer: "w-full max-w-xs",
  filterInput: filterInputBase,
  helperText: helperMessageBase,
  actionGroup: tableActionGroup,
  actionButton: actionButtonBase,
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const aulasStatusClasses = {
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  activo: "bg-blue-100 text-blue-700",
  inactivo: "bg-rose-100 text-rose-700",
};

export const aulasIconClasses = {
  base: "h-5 w-5",
};
