const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = "text-2xl font-bold text-slate-900";
const baseDescription = "mb-6 text-sm text-slate-500";
const primaryButton =
  "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60";
const ghostButton =
  "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200/60";
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

export const indicadoresPrimaryButton = primaryButton;

export const indicadoresLayout = {
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
  addButton: primaryButton,
};

export const indicadoresFormClasses = {
  fieldWrapper: "flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  select: fieldBase,
  input: fieldBase,
  helper: helperText,
  ghostButton,
};

export const indicadoresTableClasses = {
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
};

export const indicadoresIconClasses = {
  base: "h-5 w-5",
};

export const indicadoresViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-6",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: "space-y-3",
    title: "text-lg font-semibold text-blue-600 border-b border-slate-200 pb-2",
    body: "grid gap-4 md:grid-cols-2",
  },
  label: `${pillBase} text-slate-400`,
  value: "text-sm text-slate-900",
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  descriptionBox:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
  highlightTag: `${pillBase} bg-emerald-100 text-emerald-700`,
  warnTag: `${pillBase} bg-amber-100 text-amber-700`,
  tag: `${pillBase} bg-slate-100 text-slate-600`,
  body: modalBodyBase,
  empty: helperMessage,
};
```},