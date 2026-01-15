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
const gradoPill =
  "inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600";
const modalOverlay =
  "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto";
const modalCloseButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2";
const modalFooterButton =
  "inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-300/60";
const modalContentBase =
  "flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]";
const modalHeaderBase =
  "sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-8 py-5 backdrop-blur";
const modalBodyBase = "flex-1 overflow-y-auto px-8 py-6 space-y-6";
const modalFooterBase = "border-t border-slate-100 bg-white/95 px-8 py-5";
const buttonBase =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4";

const detailModalBase = {
  overlay: modalOverlay,
  content: modalContentBase,
  header: modalHeaderBase,
  title: "text-2xl font-semibold text-slate-900",
  closeButton: modalCloseButton,
  body: modalBodyBase,
  footer: modalFooterBase,
  footerButton: modalFooterButton,
};

export const contenidosLayout = {
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
  addButton: primaryButton,
};

export const contenidosModalClasses = {
  ...detailModalBase,
  content:
    "flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[92vh]",
  body: "flex-1 overflow-y-auto px-10 py-8",
  footer: "border-t border-slate-100 px-10 py-6",
};

export const contenidosFormClasses = {
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

export const contenidosTableClasses = {
  wrapper: "overflow-x-auto",
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
  temasButton: "text-purple-600 hover:text-purple-700",
};

export const contenidosStatusClasses = {
  base: pillBase,
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  gradoTag: gradoPill,
};

export const contenidosIconClasses = {
  base: "h-5 w-5",
};

export const temasModalClasses = {
  overlay: modalOverlay,
  content: "w-full max-w-6xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex flex-wrap items-start justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: "text-sm text-slate-500",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  emptyIcon: "mb-4 text-6xl",
  footer: "mt-6 flex justify-end border-t border-slate-100 pt-4",
  footerButton: `${buttonBase} bg-slate-600 hover:bg-slate-700 focus:ring-slate-400/60`,
};

export const temasTableClasses = {
  filterContainer:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  filterInput: `${filterInputBase} md:max-w-xs`,
  addButton: `${primaryButton} justify-center`,
  stats: "text-sm text-slate-500",
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const temaFormClasses = {
  overlay: modalOverlay,
  content: "w-full max-w-lg rounded-3xl bg-white px-8 py-6 shadow-2xl",
  header: "mb-6 flex items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  group: "mb-4 flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input: fieldBase,
  helper: helperText,
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton,
  secondaryButton,
};
