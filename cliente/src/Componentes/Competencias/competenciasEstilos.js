const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = "text-2xl font-bold text-slate-900";
const baseDescription = "mb-6 text-sm text-slate-500";
const primaryButton =
  "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60";
const secondaryButton =
  "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60";
const ghostButton =
  "inline-flex items-center gap-2 rounded-2xl bg-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200/60";
const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperText = "text-xs text-slate-500";
const helperMessage = "py-6 text-center text-sm text-slate-500";
const filterInput =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
const modalOverlay =
  "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto";
const modalContentBase =
  "flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]";
const modalHeader =
  "sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-8 py-5 backdrop-blur";
const modalTitle = "text-2xl font-semibold text-slate-900";
const modalCloseButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const modalBody = "flex-1 overflow-y-auto px-8 py-6 space-y-6";
const modalFooter = "border-t border-slate-100 bg-white/95 px-8 py-5";
const modalFooterButton =
  "inline-flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-600/60";
const detailSectionWrapper = "space-y-3";
const detailSectionTitle =
  "text-lg font-semibold text-blue-600 border-b border-slate-200 pb-2";
const labelBase =
  "text-xs font-semibold uppercase tracking-wide text-slate-500";
const valueBase = "text-sm text-slate-900";
const pillBase =
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide";

export const competenciasLayout = {
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
  addButton: primaryButton,
};

export const competenciasFormClasses = {
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  fieldWrapper: "flex flex-col gap-1.5",
  label: "text-sm font-semibold text-slate-700",
  input: fieldBase,
  select: fieldBase,
  textArea: `${fieldBase} min-h-[120px]`,
  helper: helperText,
  actions: "flex flex-wrap items-center justify-end gap-3",
  primaryButton,
  secondaryButton,
  ghostButton,
};

export const competenciasTableClasses = {
  filterContainer: "w-full max-w-sm",
  filterInput,
  helperText: helperMessage,
  actionButton: actionButtonBase,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  indicatorsButton: "text-purple-600 hover:text-purple-700",
};

export const competenciasIndicadoresTableClasses = {
  filterContainer:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  filterInput: `${filterInput} md:max-w-xs`,
  stats: "text-sm text-slate-500",
  addButton: `${primaryButton} justify-center`,
  actionGroup: "flex items-center justify-center gap-2",
  actionButton: actionButtonBase,
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const competenciasIconClasses = {
  base: "h-5 w-5",
};

export const competenciasViewModalClasses = {
  overlay: modalOverlay,
  content: modalContentBase,
  header: modalHeader,
  title: modalTitle,
  closeButton: modalCloseButton,
  body: modalBody,
  footer: modalFooter,
  footerButton: modalFooterButton,
  bodyLayout: "space-y-6",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitle,
    body: "grid gap-4 md:grid-cols-2",
  },
  label: labelBase,
  value: valueBase,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  descriptionBox:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
  pill: `${pillBase} bg-blue-100 text-blue-700`,
  indicators: {
    wrapper: "space-y-2",
    item: "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200",
    title: "text-base font-semibold text-slate-800",
    meta: "text-sm text-slate-600",
  },
  empty: helperMessage,
};
