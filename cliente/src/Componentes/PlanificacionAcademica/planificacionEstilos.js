import {
  typography,
  typographyScale,
  textColors,
  primaryButtonBase,
  neutralButtonBase,
  fontWeights,
  typePillBase,
} from "../EstilosCliente/EstilosClientes";

export const encabezadoPlanificacionClasses = {
  container: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
  headerLayout: "flex flex-wrap items-center justify-between gap-4",
  eyebrow: `${typography.pill} text-indigo-500`,
  heading: `${typography.titleLg} text-slate-800`,
  description: typography.bodyMutedSm,
  contextInfo: `${typographyScale.xs} ${textColors.muted}`,
  contextWarning: `${typographyScale.xs} ${fontWeights.semibold} text-amber-600`,
  actions: "flex flex-wrap items-center gap-3",
  actionIcon: "text-base",
  refreshButton: `${neutralButtonBase} border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 focus:ring-slate-200/60`,
  createButton: `${primaryButtonBase} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300/60 disabled:cursor-not-allowed disabled:bg-slate-300`,
  statsGrid: "mt-6 grid gap-4 text-center sm:grid-cols-3",
  statCardTotal: "rounded-lg border border-slate-100 bg-slate-50 p-4",
  statCardActive: "rounded-lg border border-green-100 bg-green-50 p-4",
  statCardIndividual: "rounded-lg border border-indigo-100 bg-indigo-50 p-4",
  statsEyebrow: `${typography.pill} text-slate-500`,
  statsHeading: `${typographyScale["2xl"]} ${fontWeights.bold}`,
  statsHeadingTotal: "text-slate-800",
  statsHeadingActive: "text-green-700",
  statsHeadingIndividual: "text-indigo-700",
  statsEyebrowActive: "text-green-600",
  statsEyebrowIndividual: "text-indigo-600",
};

export const filtrosPlanificacionClasses = {
  container: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
  headingRow: "mb-4 flex items-center gap-2 text-slate-600",
  headingLabel: "text-sm font-semibold",
  fieldsGrid: "grid gap-4 md:grid-cols-3",
  fieldLabel: "flex flex-col text-sm text-slate-600",
  select:
    "mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none",
  docenteInfoPanel:
    "md:col-span-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600",
  docenteInfoLoading: "text-xs text-slate-500",
  docenteInfoError: "text-red-600",
  docenteInfoWrapper: "space-y-3",
  docenteMetaLabel: "text-xs uppercase tracking-wide text-slate-500",
  docenteMetaValue: "font-semibold text-slate-700",
  docenteComponentesWrapper: "mt-1 flex flex-wrap gap-2",
  docenteChip:
    "rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700",
  docenteChipEmpty: "text-xs text-slate-500",
  docenteEmptyText: "text-xs text-slate-500",
  catalogNotice: "mt-3 text-xs text-slate-500",
  actionsRow: "mt-6 flex flex-wrap gap-3",
  applyButton:
    "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60",
  resetButton:
    "rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60",
};

export const panelContextoActualClasses = {
  container:
    "rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600",
  eyebrow: `${typography.pill} text-indigo-500`,
  titleHighlight: `${typographyScale.sm} ${fontWeights.semibold} ${textColors.tertiary}`,
  helperText: typography.helper,
  warningText: `${typography.helper} ${fontWeights.semibold} text-amber-600`,
  spacingSm: "mt-1",
  spacingMd: "mt-2",
  spacingLg: "mt-3",
  assignmentCard:
    "mt-3 rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-slate-600",
  assignmentBadge: `${typography.pill} text-emerald-600`,
  assignmentInfoWrapper: "mt-2 text-sm text-slate-600",
  chipListTitle: `${typography.pill} ${textColors.muted}`,
  chipListWrapper: "mt-1 space-y-1",
  chipListItem: "text-sm text-slate-600",
  assignmentSubtitle: `${typographyScale.xs} ${textColors.muted}`,
};

export const modalPlanificacionesDocenteClasses = {
  body: "space-y-4",
  contextCard:
    "rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600",
  contextDocente: "font-semibold text-slate-700",
  contextMomento: "text-xs text-slate-500",
  contextActions: "mt-3 flex flex-wrap gap-2",
  refreshButton:
    "inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap",
  errorText: "text-xs font-semibold text-rose-600",
  loadingText: "text-sm text-slate-500",
  listEmptyText: "text-sm text-slate-500",
  grupoCard:
    "space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm",
  grupoHeader:
    "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3",
  grupoHeadingLabel: "text-xs uppercase tracking-wide text-slate-500",
  grupoHeadingValue: "text-base font-semibold text-slate-700",
  grupoBadge:
    "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600",
  planCard:
    "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3",
  planTitle: "font-semibold text-slate-700",
  planMeta: "text-xs text-slate-500",
  planActions: "flex flex-wrap gap-2",
  planList: "space-y-2",
  planModifyButton:
    "inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200",
  planDeleteButton:
    "inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200",
  agregarWrapper: "flex flex-wrap gap-2 border-t border-slate-100 pt-3",
  agregarButton:
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:border-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60",
};

export const selectorDocenteClasses = {
  container: "space-y-2",
  triggerWrapper: "relative",
  triggerButtonBase:
    "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200",
  triggerButtonEnabled: "hover:border-slate-300 hover:shadow-md",
  triggerButtonDisabled: "cursor-not-allowed opacity-60",
  triggerContent: "flex min-w-0 flex-1 items-center gap-3 overflow-hidden",
  triggerNamesWrapper: "flex min-w-0 items-center gap-2 overflow-hidden",
  avatarInitial: `flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 ${typographyScale.xs} ${fontWeights.semibold} uppercase tracking-wide text-slate-600`,
  selectedName: `truncate ${typographyScale.sm} ${fontWeights.semibold} ${textColors.tertiary}`,
  fallbackRolePill: "bg-slate-100 text-slate-500",
  chevron:
    "ml-3 flex shrink-0 items-center text-slate-400 transition-transform duration-300",
  chevronOpen: "rotate-180",
  chevronIcon: "h-4 w-4",
  dropdown:
    "absolute left-0 right-0 z-40 mt-2 origin-top rounded-2xl border border-slate-100 bg-white shadow-xl",
  dropdownSearchWrapper: "border-b border-slate-100 px-4 py-3",
  dropdownSearchInput:
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200",
  dropdownList: "max-h-64 overflow-y-auto py-2",
  dropdownEmptyWrapper: "px-4 py-3",
  dropdownEmptyText: `${typography.bodyMutedSm}`,
  dropdownOption:
    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50",
  dropdownOptionSelected: "bg-slate-100",
  dropdownOptionLabel: "truncate font-medium",
  dropdownRolePill: "shrink-0",
  loadingHelper: `${typographyScale.xs} ${fontWeights.semibold} ${textColors.muted}`,
  emptyHelper: `${typographyScale.xs} ${fontWeights.semibold} text-rose-500`,
};

export const planificacionDetallePanelClasses = {
  overlay: "fixed inset-0 z-40 flex",
  backdrop: "absolute inset-0 bg-slate-900/40",
  panel:
    "relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl",
  header:
    "flex items-center justify-between border-b border-slate-100 px-6 py-4",
  headerEyebrow: `${typography.pill} text-indigo-500`,
  headerTitle: `${typography.titleSm} ${fontWeights.bold}`,
  closeButton:
    "rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-700",
  body: "flex-1 overflow-y-auto px-6 py-6",
  loadingText: typography.bodyMutedSm,
  contentWrapper: "space-y-6",
  infoGrid: "grid gap-3",
  infoRow: "flex flex-col rounded-lg border border-slate-100 p-3",
  infoRowLabel: `${typography.pill} ${textColors.muted}`,
  infoRowValue: `${typographyScale.sm} ${fontWeights.medium} ${textColors.tertiary}`,
  chipListTitle: `${typography.pill} ${textColors.muted}`,
  chipListWrapper: "mt-2 flex flex-wrap gap-2",
  chipBadge: `${typePillBase} border border-slate-200 bg-white text-slate-600`,
  chipEmptyText: `mt-2 ${typography.bodyMutedSm}`,
};

export const planificacionTablaClasses = {
  tableHeaderText: `${typography.pill} ${textColors.muted}`,
  tipoPill: `${typePillBase} bg-slate-100 text-slate-700`,
  estadoActivoPill: `${typePillBase} bg-emerald-100 text-emerald-700`,
  estadoInactivoPill: `${typePillBase} bg-amber-100 text-amber-700`,
  resumenChip: `rounded bg-slate-100 px-2 py-1 ${typographyScale.xs} ${textColors.tertiary}`,
  inlineActionButton: `flex items-center justify-center rounded border border-slate-200 p-2 ${typography.button} ${textColors.tertiary} transition hover:border-slate-400 hover:text-slate-800`,
  inlineActionButtonDisabled: "disabled:cursor-not-allowed disabled:opacity-50",
  tableEmptyText: `py-6 text-center ${typography.bodyMutedSm}`,
  tableRowText: `${typographyScale.sm}`,
  cellBase: "px-4 py-3",
  cellId: `px-4 py-3 ${typography.label}`,
  summaryCell: `px-4 py-3 text-right ${typographyScale.sm} ${textColors.primary}`,
  summaryActions: "flex flex-wrap items-center justify-end gap-2",
};

export const planificacionFormBaseClasses = {
  rolePillBase:
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
  competenciaMetaPill:
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  competenciaItemBase:
    "flex cursor-pointer items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm transition hover:border-slate-300",
  competenciaItemActive: "border-indigo-300 bg-indigo-50/40",
  competenciaCard: "rounded-2xl border border-slate-100 bg-white shadow-sm",
  indicadorRow:
    "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2",
};
