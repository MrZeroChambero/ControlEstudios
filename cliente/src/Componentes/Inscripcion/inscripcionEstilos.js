import {
  baseContainer,
  baseHeader,
  baseTitle,
  baseDescription,
  primaryButtonBase,
  neutralButtonBase,
  helperTextBase,
  fieldBase,
  typePillBase,
  typography,
  typographyScale,
  textColors,
  fontWeights,
  actionGroupBase,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";

const buttonAccentBlue = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60";
const buttonAccentIndigo =
  "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300/60";
const buttonAccentAmber =
  "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300/60";
const buttonAccentEmerald =
  "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300/60";

const filterInputBase =
  "w-full max-w-xs rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessageBase = `py-4 text-center ${typography.bodyMutedSm}`;
const cardWrapperClass =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-md";
const subtleCardClass = "rounded-3xl border border-slate-100 bg-slate-50 p-4";

export const inscripcionPrimaryButton = `${primaryButtonBase} ${buttonAccentBlue}`;
export const inscripcionSecondaryButton = `${neutralButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200/60`;
export const inscripcionGhostButton = `${neutralButtonBase} bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200/60`;

export const inscripcionLayout = {
  container: cardWrapperClass,
  header: baseHeader,
  title: baseTitle,
  description: baseDescription,
  addButton: inscripcionPrimaryButton,
};

export const inscripcionCard = cardWrapperClass;

export const inscripcionStepClasses = {
  container: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
  card: "flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition",
  cardActivo: "border-blue-300 bg-blue-50/40 shadow-md",
  cardCompletado: "border-emerald-200 bg-emerald-50/60",
  cardPendiente: "border-slate-100",
  bullet:
    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
  bulletActivo: "bg-blue-600 text-white",
  bulletCompletado: "bg-emerald-500 text-white",
  bulletPendiente: "bg-slate-200 text-slate-600",
  icon: "text-xl text-blue-500",
  title: `${typographyScale.base} ${fontWeights.semibold} ${textColors.primary}`,
  description: `${typographyScale.sm} ${textColors.muted}`,
};

export const inscripcionControlClasses = {
  nav: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  info: typography.bodyMutedSm,
  buttons: "flex flex-col gap-2 md:flex-row md:gap-3",
  primary: inscripcionPrimaryButton,
  secondary: inscripcionSecondaryButton,
  tertiary: inscripcionGhostButton,
};

export const inscripcionFormClasses = {
  group: "mb-4 flex flex-col gap-1.5",
  label: `${typographyScale.sm} ${fontWeights.semibold} text-slate-700`,
  input: fieldBase,
  inputValid:
    "w-full rounded-2xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
  inputInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  select: fieldBase,
  selectInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  textArea: fieldBase,
  textAreaInvalid:
    "w-full rounded-2xl border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200",
  readOnly:
    "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700",
  helper: helperTextBase,
  error: "text-xs font-semibold text-rose-600",
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton: inscripcionPrimaryButton,
  secondaryButton: `${neutralButtonBase} bg-white text-slate-600 hover:bg-slate-100 focus:ring-slate-200/60`,
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  fieldWrapper: "flex flex-col gap-1.5",
  textAreaAuto: "min-h-[88px]",
  ghostButton: inscripcionGhostButton,
  section:
    "space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors",
  sectionTitle: `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`,
  inline: "grid grid-cols-1 gap-4 md:grid-cols-2",
  sectionState: {
    neutral: "",
    success: "border-emerald-400 bg-emerald-50/80 shadow-md",
    error: "border-rose-400 bg-rose-50/80 shadow-md",
  },
  sectionStatusPill: {
    neutral: `${typePillBase} bg-slate-100 text-slate-600`,
    success: `${typePillBase} bg-emerald-100 text-emerald-700`,
    error: `${typePillBase} bg-rose-100 text-rose-700`,
  },
};

export const inscripcionTableClasses = {
  wrapper: "overflow-x-auto rounded-3xl border border-slate-100",
  helperText: helperMessageBase,
  filterInput: filterInputBase,
  actionGroup: actionGroupBase,
};

export const inscripcionSummaryClasses = {
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  card: subtleCardClass,
  title: "mb-2 text-sm font-semibold text-slate-700",
  itemLabel: `${typography.pill} text-slate-400`,
  itemValue: "text-sm font-medium text-slate-700",
};

const baseDataTableStyles = {
  headCells: {
    style: {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      color: "#475569",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      color: "#1f2937",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fafc",
    },
  },
};

export const inscripcionDataTableStyles = baseDataTableStyles;

export const pasoEstudianteClasses = {
  container: "space-y-4",
  header: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
  title: `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`,
  description: `${typographyScale.sm} ${textColors.muted}`,
  searchInput: filterInputBase,
  name: "text-sm font-semibold text-slate-800",
  meta: "text-xs text-slate-500",
  chipList: "flex flex-wrap gap-1",
  chip: "inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600",
  selectButton: `${inscripcionPrimaryButton} px-3 py-1 text-xs`,
  selectionCard:
    "rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700",
  selectedRowColor: "#dbeafe",
};

export const pasoAulaClasses = {
  container: "space-y-4",
  header: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
  title: `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`,
  description: `${typographyScale.sm} ${textColors.muted}`,
  searchInput: filterInputBase,
  name: "text-sm font-semibold text-slate-800",
  meta: "text-xs text-slate-500",
  cupos: "text-sm text-slate-600",
  selectButton: `${inscripcionPrimaryButton} px-3 py-1 text-xs`,
  selectionCard:
    "rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700",
  warning: "text-xs text-amber-600",
  selectedRowColor: "#d1fae5",
};

export const pasoRepresentanteClasses = {
  container: "space-y-4",
  header: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
  title: `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`,
  description: `${typographyScale.sm} ${textColors.muted}`,
  searchInput:
    "w-full max-w-xs rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
  name: "text-sm font-semibold text-slate-800",
  meta: "text-xs text-slate-500",
  badge:
    "inline-flex items-center justify-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600",
  profession: "text-xs text-slate-500",
  selectButton: `${inscripcionPrimaryButton} px-3 py-1 text-xs`,
  selectionCard:
    "rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700",
  selectedRowColor: "#e0e7ff",
};

export const pasoPrecondicionesClasses = {
  container: "space-y-4",
  statusPill: {
    base: "rounded-full px-4 py-2 text-sm font-semibold",
    ready: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
  },
  summaryCard:
    "rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600",
  readyText: "space-y-3 text-sm text-slate-600",
  warningCard:
    "rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700",
  pendingTitle: "text-sm font-semibold text-slate-700",
  pendingList: "grid gap-2 md:grid-cols-2",
  pendingItem:
    "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600",
  fallbackText: "text-sm text-slate-500",
  helperText: `${typographyScale.sm} ${textColors.muted}`,
};

export const pasoCompromisosClasses = {
  description: `${typographyScale.sm} ${textColors.muted} mb-4`,
  list: "space-y-4",
  item: "flex items-start gap-3",
  checkbox:
    "mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500",
  label: `${typographyScale.sm} leading-5 ${textColors.secondary}`,
};

export const pasoFamiliaClasses = {
  form: "space-y-6",
  sectionHeader: "flex flex-wrap items-center justify-between gap-3",
  indicatorGrid: "grid grid-cols-1 gap-4 md:grid-cols-3",
};

export const pasoResumenClasses = {
  summaryContainer: cardWrapperClass,
  summaryHeader: "mb-5 flex flex-wrap items-start justify-between gap-3",
  summaryTitle: typography.titleSm,
  summaryDescription: typography.bodyMutedSm,
  statusChipSuccess: `${typePillBase} bg-emerald-100 text-emerald-700`,
  statusChipPending: `${typePillBase} bg-amber-100 text-amber-700`,
  actionGroup: "flex flex-wrap items-center gap-2",
  infoAlert:
    "mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800",
  warningAlert:
    "mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700",
  emptyContainer:
    "rounded-3xl border border-dashed border-slate-200 bg-white p-6",
  emptyTitle: `${typography.titleSm} mb-2`,
  emptyBody: typography.bodyMutedSm,
};

export const pasoResumenDetailClasses = {
  container: "space-y-6",
  successBanner:
    "rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700",
  successTitle: "font-semibold",
  sectionTitle: `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`,
  gridTwoCols: "grid grid-cols-1 gap-4 md:grid-cols-2",
  gridThreeCols: "grid grid-cols-1 gap-4 md:grid-cols-3",
  card: subtleCardClass,
  label: `${typography.pill} text-slate-400`,
  value: `${typographyScale.sm} ${fontWeights.medium} ${textColors.tertiary}`,
  participacionCard: "space-y-3 " + subtleCardClass,
  documentsCard: "space-y-3 " + subtleCardClass,
  documentRow: "flex items-center justify-between",
  documentDelivered: `${typePillBase} bg-emerald-100 text-emerald-700`,
  documentPending: `${typePillBase} bg-slate-200 text-slate-600`,
  warningTitle: `${typographyScale.base} ${fontWeights.semibold} text-amber-700`,
  warningBody: `${typographyScale.sm} text-amber-700`,
  warningCard:
    "rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700",
  warningList: "mt-2 list-disc space-y-1 pl-5",
  adjustmentsCard:
    "rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800",
  adjustmentsList: "list-disc space-y-1 pl-5",
  adjustmentsItem: `${typographyScale.sm} text-blue-800`,
  modalBody: "space-y-6",
};

export const resumenInscripcionesModalClasses = {
  summaryGrid:
    "grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-base text-slate-600 md:grid-cols-3",
  summaryLabel: "text-sm font-semibold uppercase tracking-wide text-slate-500",
  summaryValue: "text-lg font-semibold text-slate-800",
  summaryHint: "text-sm text-slate-500",
  searchBar:
    "flex w-full flex-col gap-4 text-base sm:flex-row sm:items-center sm:justify-between",
  searchInput:
    "w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:max-w-xs",
  searchMeta: "text-base text-slate-500",
  progressText: "text-base text-slate-500",
  gradeTag:
    "inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600",
  docenteText: "text-base text-slate-700",
  disponiblesPositive: "text-base font-semibold text-emerald-600",
  disponiblesNegative: "text-base font-semibold text-rose-600",
  expandibleEmpty: "px-4 pb-4 text-base text-slate-500",
  expandibleWrapper: "space-y-3 px-4 pb-6 text-base text-slate-600",
  expandibleCard: "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm",
  expandibleItem: "rounded-2xl border border-slate-100 bg-slate-50 p-4",
  expandibleHeader: "flex flex-wrap items-center justify-between gap-2",
  expandibleName: "text-base font-semibold text-slate-800",
  expandibleMeta: "text-sm font-medium text-slate-500",
  expandibleGrid: "mt-3 grid gap-3 text-base text-slate-600 md:grid-cols-2",
  expandibleActions: "mt-4 flex flex-wrap items-center justify-end gap-2",
  retiroButton: `${neutralButtonBase} border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100`,
};

export const resumenInscripcionesTableStyles = (() => {
  const headRowStyle = {
    ...(dataTableBaseStyles.headRow?.style ?? {}),
    fontSize: "15px",
  };
  const headCellsStyle = {
    ...(dataTableBaseStyles.headCells?.style ?? {}),
    fontSize: "15px",
    fontWeight: 600,
  };
  const cellsStyle = {
    ...(dataTableBaseStyles.cells?.style ?? {}),
    fontSize: "16px",
  };

  return {
    ...dataTableBaseStyles,
    headRow: {
      ...dataTableBaseStyles.headRow,
      style: headRowStyle,
    },
    headCells: {
      ...dataTableBaseStyles.headCells,
      style: headCellsStyle,
    },
    cells: {
      ...dataTableBaseStyles.cells,
      style: cellsStyle,
    },
  };
})();
