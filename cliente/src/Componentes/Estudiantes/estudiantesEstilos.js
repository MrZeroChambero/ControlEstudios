const typographyScale = {
  xxs: "text-[10px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const fontWeights = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const textColors = {
  primary: "text-slate-900",
  secondary: "text-slate-800",
  tertiary: "text-slate-700",
  muted: "text-slate-500",
};

const typography = {
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

const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = typography.titleLg;
const baseDescription = `mb-6 ${typography.bodyMutedSm}`;
const buttonBase = `${buttonShape} ${buttonGapContent} ${typography.button} text-white ${buttonShadowInteractive}`;
const primaryButtonBase = `${buttonShape} justify-center ${typography.button} text-white ${buttonShadowInteractive}`;
const neutralButtonBase = `${buttonShape} ${buttonGapContent} ${typography.button} ${buttonInteractive}`;
const secondaryButton = `${buttonShape} justify-center bg-slate-600 ${typography.button} text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50`;
const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
const helperTextBase = typography.helper;
const actionGroupBase = "flex items-center justify-center gap-2";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const filterInputBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessageBase = `py-6 text-center ${typography.bodyMutedSm}`;
const typePillBase = `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`;

const estudiantesFieldBase =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const estudiantesFieldValid =
  "w-full rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const estudiantesFieldInvalid =
  "w-full rounded-2xl border border-rose-400 bg-rose-50 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200";

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

export const estudiantesLayout = createLayoutTokens("blue");

export const estudiantesFormClasses = {
  ...createFormTokens("blue"),
  input: estudiantesFieldBase,
  inputValid: estudiantesFieldValid,
  inputInvalid: estudiantesFieldInvalid,
  select: estudiantesFieldBase,
  selectInvalid: estudiantesFieldInvalid,
  textArea: estudiantesFieldBase,
  textAreaInvalid: estudiantesFieldInvalid,
  textAreaAuto: "min-h-[112px]",
  backButton: `${buttonBase} bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-200/60`,
  cancelButton: `${buttonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60`,
};

export const estudiantesTableClasses = {
  ...tableBase,
  filterInputWide: `${filterInputBase} md:max-w-sm`,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-rose-500 hover:text-rose-600",
  status: {
    base: `inline-flex items-center justify-center rounded-full px-3 py-1 ${typography.pill}`,
    activo: "bg-blue-100 text-blue-700",
    incompleto: "bg-amber-100 text-amber-700",
    inactivo: "bg-rose-100 text-rose-700",
    desconocido: "bg-slate-200 text-slate-600",
  },
  toggleOn: tableBase.toggleOn,
  toggleOff: tableBase.toggleOff,
};

export const estudiantesFichaClasses = {
  card: "rounded-3xl border border-slate-100 bg-white p-4 shadow-md",
  header: "mb-4 flex items-center gap-3",
  avatar:
    "flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold",
  fieldLabel: `${typography.pill} text-slate-400`,
  fieldValue: "text-sm font-medium text-slate-700",
  chip: `inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ${typography.tag} text-slate-600`,
};

export const estudiantesModalClasses = {
  overlay: modalOverlayBase,
  content:
    "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
  header: "mb-6 flex items-center justify-between gap-3",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: typography.bodyMutedSm,
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  body: "space-y-6",
  footer: "mt-6 flex justify-end",
  footerButton: secondaryButton,
  stepper: {
    container: "flex flex-wrap items-center gap-3",
    item: "flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500",
    active: "border-blue-300 bg-blue-50 text-blue-600",
    bullet:
      "flex h-8 w-8 items-center justify-center rounded-full border border-current text-base font-bold",
    label: "flex-1 text-left",
    helper: "text-xs font-normal text-slate-400",
  },
  candidates: {
    title: "text-lg font-semibold text-slate-800",
    controls: "flex flex-col gap-3 md:flex-row md:items-center",
    input: filterInputBase,
    button: `${primaryButtonBase} ${accentTokens.blue}`,
    list: "max-h-64 overflow-y-auto rounded-3xl border border-slate-200",
    item: "flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50",
    name: "text-sm font-semibold text-slate-800",
    meta: typography.helper,
    selectButton: `${primaryButtonBase} ${accentTokens.blue} px-3 py-1 text-xs`,
    empty: helperMessageBase,
  },
  form: {
    wrapper: "space-y-4",
    actions: "flex justify-end gap-3",
    title: "text-lg font-semibold text-slate-800",
    secondaryButton: secondaryButton,
    primaryButton: `${primaryButtonBase} ${accentTokens.blue}`,
  },
  sections: {
    grid: "grid grid-cols-1 gap-6 md:grid-cols-2",
    card: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
    title: "text-lg font-semibold text-slate-800",
    body: "mt-4 space-y-4",
  },
  documents: {
    container:
      "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2",
    title: "text-lg font-semibold text-slate-800",
    formGrid: "mb-3 grid grid-cols-1 gap-2 md:grid-cols-3",
    select:
      "rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
    checkbox:
      "inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
    input:
      "rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
    addButton: `${primaryButtonBase} ${accentTokens.blue} px-3 py-1 text-xs`,
    list: "mt-3 space-y-2 max-h-56 overflow-y-auto",
    item: "flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2",
    name: "text-sm font-semibold text-slate-800",
    meta: typography.helper,
    delivered:
      "inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700",
    pending:
      "inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700",
    deleteButton: "text-xs font-semibold text-rose-600 hover:text-rose-700",
    empty: helperMessageBase,
  },
  salud: {
    grid: "grid grid-cols-1 gap-6 md:grid-cols-2",
    card: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
    title: "text-lg font-semibold text-slate-800",
    formGrid: "mb-3 grid gap-2",
    input: estudiantesFormClasses.input,
    select: estudiantesFormClasses.select,
    textarea: `${estudiantesFormClasses.textArea} min-h-[60px]`,
    list: "space-y-2 max-h-56 overflow-y-auto",
    item: "flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2",
    details: "flex flex-col gap-1 text-xs text-slate-600",
    headline: "text-sm font-semibold text-slate-800",
    meta: typography.helper,
    deleteButton: "text-xs font-semibold text-rose-600 hover:text-rose-700",
    addButton: `${primaryButtonBase} ${accentTokens.blue} px-3 py-1 text-xs`,
    empty: helperMessageBase,
  },
};

export const estudiantesViewModalClasses = {
  ...detailModalBase,
  bodyLayout: "space-y-8",
  field: "flex flex-col gap-1.5",
  section: {
    wrapper: detailSectionWrapper,
    title: detailSectionTitleBase,
    body: "space-y-3",
  },
  label: detailLabelClass,
  value: detailValueClass,
  row: {
    container: "grid gap-1 md:grid-cols-[200px_1fr] md:items-start",
    label: detailLabelClass,
    value: detailValueClass,
  },
  card: detailCardBase,
  empty: helperMessageBase,
  valueBox: `${readOnlyBase} flex items-center gap-2`,
};
