import { contenidosIconClasses } from "../Contenidos/contenidosEstilos";

// Design tokens keep typography tweaks centralized across the app.
export const typographyScale = {
  xxs: "text-[10px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const fontWeights = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export const textColors = {
  primary: "text-slate-900",
  secondary: "text-slate-800",
  tertiary: "text-slate-700",
  muted: "text-slate-500",
};

export const typography = {
  titleLg: `${typographyScale["2xl"]} ${fontWeights.bold} ${textColors.primary}`,
  titleMd: `${typographyScale.xl} ${fontWeights.semibold} ${textColors.primary}`,
  titleSm: `${typographyScale.lg} ${fontWeights.semibold} ${textColors.primary}`,
  bodyBase: `${typographyScale.base} ${textColors.primary}`,
  bodyMutedSm: `${typographyScale.sm} ${textColors.muted}`,
  helper: `${typographyScale.xs} ${textColors.muted}`,
  label: `${typographyScale.sm} ${fontWeights.semibold} ${textColors.tertiary}`,
  button: `${typographyScale.sm} ${fontWeights.semibold}`,
  pill: `${typographyScale.xs} ${fontWeights.semibold} uppercase tracking-wide`,
  pillTight: `${typographyScale.xxs} ${fontWeights.semibold} uppercase tracking-wide`,
  tag: `${typographyScale.xs} ${fontWeights.semibold}`,
};

const buttonShape = "inline-flex items-center rounded-2xl px-4 py-2";
const buttonGapContent = "gap-2";
const buttonInteractive = "transition focus:outline-none focus:ring-4";
const buttonShadowInteractive = `${buttonInteractive} shadow-sm`;

export const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
export const baseHeader =
  "mb-4 flex flex-wrap items-center justify-between gap-4";
export const baseTitle = typography.titleLg;
export const baseDescription = `mb-6 ${typography.bodyMutedSm}`;
const buttonBase = `${buttonShape} ${buttonGapContent} ${typography.button} text-white ${buttonShadowInteractive}`;
export const primaryButtonBase = `${buttonShape} justify-center ${typography.button} text-white ${buttonShadowInteractive}`;
export const neutralButtonBase = `${buttonShape} ${buttonGapContent} ${typography.button} ${buttonInteractive}`;
export const secondaryButton = `${buttonShape} justify-center bg-slate-600 ${typography.button} text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50`;
export const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
export const helperTextBase = typography.helper;
export const actionGroupBase = "flex items-center justify-center gap-2";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const smallActionButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const filterInputBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessageBase = `py-6 text-center ${typography.bodyMutedSm}`;
export const typePillBase = `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`;

const accentTokens = {
  blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60",
  emerald: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300/60",
  indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300/60",
  amber: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300/60",
  purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300/60",
};

const createLayoutTokens = (accentKey) => ({
  container: baseContainer,
  header: baseHeader,
  title: baseTitle,
  addButton: `${buttonBase} ${accentTokens[accentKey]}`,
  description: baseDescription,
});

const createFormTokens = (accentKey) => ({
  group: "mb-4 flex flex-col gap-1.5",
  label: typography.label,
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
  readOnly: readOnlyBase,
  helper: helperTextBase,
  error: "text-xs font-semibold text-rose-600",
  actions: "mt-6 flex items-center justify-end gap-3",
  primaryButton: `${primaryButtonBase} ${accentTokens[accentKey]}`,
  secondaryButton,
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  fieldWrapper: "flex flex-col gap-1.5",
  textAreaAuto: "min-h-[88px]",
  ghostButton: `${neutralButtonBase} bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200/60`,
});

const baseStatusPills = {
  base: `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pillTight}`,
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
};

const gradoPill = `inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 ${typography.pillTight} text-blue-600`;

export const inscripcionLayout = createLayoutTokens("blue");

const tableBase = {
  wrapper: "overflow-x-auto",
  filterContainer: "w-full max-w-xs",
  filterInput: filterInputBase,
  helperText: helperMessageBase,
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

const temasTableBase = {
  filterContainer:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  filterInput: `${filterInputBase} md:max-w-xs`,
  addButton: `${buttonBase} ${accentTokens.blue}`,
  stats: typography.bodyMutedSm,
  actionGroup: actionGroupBase,
  actionButton: smallActionButtonBase,
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const dataTableBaseStyles = {
  table: {
    style: {
      width: "100%",
      tableLayout: "auto",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      fontSize: "13px",
      fontWeight: 600,
      textTransform: "uppercase",
    },
  },
  headCells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      whiteSpace: "normal",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      whiteSpace: "normal",
    },
  },
};

const modalOverlayBase =
  "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto";
const modalCloseDangerButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2";
const modalFooterDangerButton = `${buttonBase} bg-rose-600 hover:bg-rose-700 focus:ring-rose-300/60`;
const detailSectionTitleBase =
  "text-lg font-semibold text-blue-600 border-b border-slate-200 pb-2";
const detailSectionWrapper = "space-y-3";
const detailLabelClass = `${typography.pill} ${textColors.muted}`;
const detailValueClass = "text-sm text-slate-900";
const detailCardBase = {
  container: "rounded-2xl border border-slate-200 bg-slate-50 p-4",
  title: "text-sm font-semibold text-slate-800",
  text: "text-xs text-slate-600",
};

const detailModalBase = {
  overlay: modalOverlayBase,
  content:
    "flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]",
  header:
    "sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-8 py-5 backdrop-blur",
  title: "text-2xl font-semibold text-slate-900",
  closeButton: modalCloseDangerButton,
  body: "flex-1 overflow-y-auto px-8 py-6 space-y-6",
  footer: "border-t border-slate-100 bg-white/95 px-8 py-5",
  footerButton: modalFooterDangerButton,
};

// Contenidos
export {
  contenidosLayout,
  contenidosModalClasses,
  contenidosFormClasses,
  contenidosTableClasses,
  contenidosStatusClasses,
  contenidosIconClasses,
  temasModalClasses,
  temasTableClasses,
  temaFormClasses,
} from "../Contenidos/contenidosEstilos";

export const personasTableClasses = {
  ...tableBase,
  wrapper:
    "overflow-x-auto rounded-3xl border border-slate-100 bg-white/90 backdrop-blur p-4 shadow-sm",
  helperText: helperMessageBase,
  filterContainer: "w-full max-w-sm",
  filterInput: filterInputBase,
  statusChip: {
    base: baseStatusPills.base,
    activo: baseStatusPills.active,
    inactivo: baseStatusPills.inactive,
    incompleto: baseStatusPills.warning,
  },
};

export const usuariosTableClasses = {
  ...tableBase,
  wrapper:
    "overflow-x-auto rounded-3xl border border-slate-100 bg-white/90 backdrop-blur p-4 shadow-sm",
  helperText: helperMessageBase,
  filterContainer: "w-full max-w-sm",
  filterInput: filterInputBase,
  statusChip: {
    base: baseStatusPills.base,
    activo: baseStatusPills.active,
    inactivo: baseStatusPills.inactive,
  },
};

const smallActionPrimary = `${primaryButtonBase} ${accentTokens.blue} px-3 py-1 text-xs`;
const smallActionNeutral = `${neutralButtonBase} bg-slate-200 text-slate-600 hover:bg-slate-300 focus:ring-slate-200/60 px-3 py-1 text-xs`;

export const parentescosTableClasses = {
  ...tableBase,
  card: "rounded-3xl border border-slate-100 bg-white/90 backdrop-blur p-5 shadow-sm",
  title: "text-lg font-semibold text-slate-800",
  helperText: helperMessageBase,
  actionBar: "flex gap-2",
  saveButton: smallActionPrimary,
  cancelButton: smallActionNeutral,
  inlineEditSelect:
    "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
};

export const seleccionEntidadClasses = {
  container: "space-y-3",
  title: "text-lg font-semibold text-slate-800",
  searchWrapper: "relative",
  searchInput: `${filterInputBase} bg-white/95`,
  list: "max-h-64 overflow-y-auto rounded-3xl border border-slate-200 bg-white/90 backdrop-blur divide-y",
  listItem:
    "flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition hover:bg-blue-50",
  listItemActive: "bg-blue-50/70",
  bulletCompletado: "border-emerald-500 bg-emerald-500 text-white",
  bulletPendiente: "border-slate-300 bg-slate-100 text-slate-500",
  title: "text-sm font-semibold leading-tight text-slate-800",
  description: "text-xs leading-relaxed text-slate-600",
  icon: "text-lg text-slate-500",
};

export const inscripcionControlClasses = {
  nav: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  info: typography.bodyMutedSm,
  buttons: "flex flex-col gap-2 md:flex-row md:gap-3",
  primary: `${primaryButtonBase} ${accentTokens.blue}`,
  secondary: `${neutralButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200/60`,
  tertiary: `${neutralButtonBase} bg-transparent text-slate-500 hover:bg-slate-100 focus:ring-slate-200/60`,
};

export const inscripcionFormClasses = {
  ...createFormTokens("blue"),
  section:
    "space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors",
  sectionTitle: "text-base font-semibold text-slate-800",
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
  ...tableBase,
  wrapper: "overflow-x-auto rounded-3xl border border-slate-100",
  helperText: `py-4 text-center ${typography.bodyMutedSm}`,
};

export const inscripcionSummaryClasses = {
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2",
  card: "rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm",
  title: "mb-2 text-sm font-semibold text-slate-700",
  itemLabel: `${typography.pill} text-slate-400`,
  itemValue: "text-sm font-medium text-slate-700",
};

// Personal
export const personalLayout = createLayoutTokens("blue");

export const personalFormClasses = {
  ...createFormTokens("blue"),
  backButton: `${neutralButtonBase} bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-200/60`,
  cancelButton: `${neutralButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60`,
  infoCard:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
  highlightCard:
    "rounded-3xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800",
  sectionTitle: "text-lg font-semibold text-slate-800",
  sectionDivider: "mt-6 border-t border-slate-100",
};

export const personalTableClasses = {
  ...personasTableClasses,
  viewButton: "text-blue-600 hover:text-blue-700",
  rolePill: `${typePillBase} bg-blue-50 text-blue-700`,
  typePill: {
    base: typePillBase,
    administrativo: `${typePillBase} bg-blue-100 text-blue-700`,
    docente: `${typePillBase} bg-blue-100 text-blue-700`,
    obrero: `${typePillBase} bg-emerald-100 text-emerald-700`,
    especialista: `${typePillBase} bg-sky-100 text-sky-700`,
    default: `${typePillBase} bg-slate-100 text-slate-600`,
  },
};

export const personalBadgeClasses = {
  ...baseStatusPills,
  incompleto: baseStatusPills.warning,
  licencia: "bg-slate-200 text-slate-600",
};

export const personalModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  meta: `flex items-center gap-3 ${typography.bodyMutedSm}`,
  stepBadge: `${typePillBase} gap-2 bg-blue-100 text-blue-700`,
  stepDots: "flex items-center gap-2",
  stepDot: "h-2.5 w-2.5 rounded-full bg-slate-200",
  stepDotActive: "bg-blue-500",
  closeButton: modalCloseDangerButton,
  subtitle: `mb-6 ${typography.bodyMutedSm}`,
  actionBar: "mt-6 flex flex-wrap items-center justify-between gap-3",
  listWrapper: "max-h-96 overflow-y-auto rounded-3xl border border-slate-200",
  listHeader:
    "flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600",
  listEmpty: helperMessageBase,
  listItem:
    "w-full flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-blue-50 cursor-pointer",
  listPerson: "flex-1 flex flex-col gap-0.5",
  listName: "text-sm font-semibold text-slate-900",
  listMeta: typography.helper,
  listTag: `${typePillBase} bg-blue-100 text-blue-700`,
  searchWrapper: "relative",
  searchIcon:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
  searchInput: `${filterInputBase} pl-10`,
  bannerInfo:
    "rounded-3xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800",
  bannerWarning:
    "rounded-3xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-800",
};

export const personalViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-8",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitleBase,
    body: "grid gap-4 md:grid-cols-2",
  },
  sectionStack: "space-y-2",
  label: detailLabelClass,
  value: detailValueClass,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  statusChipBase: `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`,
  statusChipVariants: {
    activo: "bg-emerald-100 text-emerald-700",
    incompleto: "bg-amber-100 text-amber-700",
    inactivo: "bg-rose-100 text-rose-700",
    licencia: "bg-sky-100 text-sky-700",
    default: "bg-slate-200 text-slate-600",
  },
  typeChipVariants: {
    Administrativo: "bg-purple-100 text-purple-700",
    Docente: "bg-blue-100 text-blue-700",
    Obrero: "bg-emerald-100 text-emerald-700",
    Especialista: "bg-sky-100 text-sky-700",
    default: "bg-slate-200 text-slate-600",
  },
  typeChipBase: `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`,
  listGrid: "grid grid-cols-1 gap-2 md:grid-cols-2",
  listItem:
    "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700",
  card: detailCardBase,
  empty: helperMessageBase,
};

// Horarios
export const horariosLayout = createLayoutTokens("blue");

export const horariosFormClasses = createFormTokens("blue");

export const horariosTableClasses = {
  ...tableBase,
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  viewButton: tableBase.viewButton,
  editButton: tableBase.editButton,
  deleteButton: tableBase.deleteButton,
};

export const horariosStatusClasses = {
  ...baseStatusPills,
  completo: "bg-blue-100 text-blue-700",
  subgrupo: "bg-purple-100 text-purple-700",
  rutina: "bg-amber-100 text-amber-700",
};

export const horariosIconClasses = contenidosIconClasses;

// Representantes
export const representantesLayout = createLayoutTokens("blue");

export const representantesFormClasses = createFormTokens("blue");

export const representantesTableClasses = {
  ...personasTableClasses,
  relationshipPill: `${typePillBase} bg-blue-50 text-blue-700`,
};

export const representantesModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: typography.bodyMutedSm,
  meta: `flex items-center gap-3 ${typography.bodyMutedSm}`,
  stepBadge: `${typePillBase} gap-2 bg-blue-100 text-blue-700`,
  stepDots: "flex items-center gap-2",
  stepDot: "h-2.5 w-2.5 rounded-full bg-slate-200",
  stepDotActive: "bg-blue-500",
  closeButton: modalCloseDangerButton,
  body: "space-y-6",
  listWrapper: "rounded-3xl border border-slate-200",
  listHeader:
    "flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600",
  listItem:
    "flex cursor-pointer items-start justify-between gap-3 px-4 py-3 transition hover:bg-blue-50",
  listPerson: "flex flex-col gap-0.5",
  listName: "text-sm font-semibold text-slate-900",
  listMeta: typography.helper,
  listTag: `${typePillBase} bg-blue-100 text-blue-700`,
  listEmpty: helperMessageBase,
  searchWrapper: "relative",
  searchIcon:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
  searchInput: `${filterInputBase} pl-10`,
  actionBar: "mt-6 flex flex-wrap items-center justify-between gap-3",
  sectionTitle: "text-sm font-semibold uppercase tracking-wide text-slate-400",
  sectionBody: "mt-2 grid gap-4 md:grid-cols-2",
  footer: "mt-6 flex justify-end",
};

export const representantesViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-6",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitleBase,
    body: "grid gap-4 md:grid-cols-2",
  },
  label: detailLabelClass,
  value: detailValueClass,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  listGrid: "grid grid-cols-1 gap-2 md:grid-cols-2",
  listItem:
    "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700",
  chipBase: `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`,
  chipVariants: {
    activo: "bg-emerald-100 text-emerald-700",
    incompleto: "bg-amber-100 text-amber-700",
    inactivo: "bg-rose-100 text-rose-700",
    default: "bg-slate-200 text-slate-600",
  },
  pillBlue: `${typePillBase} bg-blue-100 text-blue-700`,
  pillGreen: `${typePillBase} bg-emerald-100 text-emerald-700`,
  card: detailCardBase,
  empty: helperMessageBase,
};

export const usuariosViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-8",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitleBase,
    body: "grid gap-4 md:grid-cols-2",
  },
  sectionFull: "space-y-3",
  label: detailLabelClass,
  value: detailValueClass,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  chipBase: `${typePillBase} px-3 py-1`,
  estadoVariants: {
    activo: "bg-emerald-100 text-emerald-700",
    inactivo: "bg-rose-100 text-rose-700",
    bloqueado: "bg-amber-100 text-amber-700",
    default: "bg-slate-200 text-slate-600",
  },
  tipoFuncionVariants: {
    Administrativo: "bg-purple-100 text-purple-700",
    Docente: "bg-blue-100 text-blue-700",
    Especialista: "bg-sky-100 text-sky-700",
    default: "bg-slate-200 text-slate-600",
  },
  statsChip: `${typePillBase} bg-blue-50 text-blue-700`,
  table: {
    wrapper: "overflow-hidden rounded-3xl border border-slate-200",
    table: "min-w-full divide-y divide-slate-200",
    head: "bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
    headCell: "px-4 py-2",
    row: "bg-white even:bg-slate-50/70",
    cell: "px-4 py-2 text-sm text-slate-700",
  },
  bannerWarning:
    "rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800",
  empty: helperMessageBase,
};

export const competenciasViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-6",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitleBase,
    body: "grid gap-4 md:grid-cols-2",
  },
  label: detailLabelClass,
  value: detailValueClass,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
  descriptionBox:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
  metaGrid: "grid gap-3 md:grid-cols-2",
  pill: `${typePillBase} bg-blue-100 text-blue-700`,
  indicators: {
    wrapper: "space-y-2",
    item: "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200",
    title: "text-base font-semibold text-slate-800",
    meta: "text-sm text-slate-600",
  },
  empty: helperMessageBase,
};

// Utilitarios compartidos
export const estadoGenericoClases = baseStatusPills;
export const helperTextMuted = helperMessageBase;
