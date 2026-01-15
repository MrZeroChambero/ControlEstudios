export const areasLayout = {
  container:
    "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow",
  header: "mb-4 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-bold text-slate-900",
  addButton:
    "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60",
  description: "mb-6 text-sm text-slate-500",
};

const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const fieldInvalid =
  "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
const helperText = "text-xs text-slate-500";
const actionWrapper = "mt-6 flex items-center justify-end gap-3";
const buttonPrimary =
  "inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60";
const buttonSecondary =
  "inline-flex items-center justify-center rounded-2xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50";

export const areasFormClasses = {
  group: "mb-4 flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input: fieldBase,
  inputValid:
    "w-full rounded-2xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  inputInvalid: fieldInvalid,
  select: fieldBase,
  selectInvalid: fieldInvalid,
  textArea: fieldBase,
  textAreaInvalid: fieldInvalid,
  readOnly: readOnlyBase,
  helper: helperText,
  error: "text-xs font-semibold text-rose-600",
  actions: actionWrapper,
  primaryButton: buttonPrimary,
  secondaryButton: buttonSecondary,
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  fieldWrapper: "flex flex-col gap-1.5",
  textAreaAuto: "min-h-[88px]",
  ghostButton:
    "inline-flex items-center gap-2 rounded-2xl bg-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200/60",
  infoGroup: "mt-4",
};

const tableWrapper = "overflow-x-auto";
const filterInput =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessage = "py-6 text-center text-sm text-slate-500";
const actionGroup = "flex items-center justify-center gap-2";
const actionButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";

export const areasTableClasses = {
  wrapper: tableWrapper,
  filterWrapper: "w-full max-w-xs",
  filterInput,
  helperText: helperMessage,
  actionGroup,
  actionButton,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const areasBadgeClasses = {
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  pendiente: "bg-amber-100 text-amber-700",
};

export const areasComponentTableClasses = {
  wrapper: "mt-6",
  title: "text-base font-semibold text-slate-700",
  emptyState: "text-sm text-slate-500",
};

export const areasIconClasses = {
  base: "h-5 w-5",
};
