const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = "text-2xl font-bold text-slate-900";
const baseDescription = "mb-6 text-sm text-slate-500";
const primaryButton =
  "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60";
const secondaryButton =
  "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60";
const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
const helperText = "text-xs text-slate-500";
const actionGroupBase = "flex items-center justify-center gap-2";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const filterInputBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessage = "py-6 text-center text-sm text-slate-500";
const pillBase =
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide";

export const componentesLayout = {
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
  addButton: primaryButton,
};

export const componentesFormClasses = {
  group: "mb-4 flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input: fieldBase,
  select: fieldBase,
  textArea: fieldBase,
  readOnly: readOnlyBase,
  helper: helperText,
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton,
  secondaryButton,
};

export const componentesTableClasses = {
  filterContainer: "w-full max-w-xs",
  filterInput: filterInputBase,
  helperText: helperMessage,
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const componentesStatusClasses = {
  base: pillBase,
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  evalYes: "bg-blue-100 text-blue-700",
  evalNo: "bg-amber-100 text-amber-700",
};

export const componentesIconClasses = {
  base: "h-5 w-5",
};

export const componentesTypePillBase = pillBase;
