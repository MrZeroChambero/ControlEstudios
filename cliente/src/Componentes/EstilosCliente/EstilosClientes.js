export const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
export const baseHeader =
  "mb-4 flex flex-wrap items-center justify-between gap-4";
export const baseTitle = "text-2xl font-bold text-slate-900";
export const baseDescription = "mb-6 text-sm text-slate-500";
const buttonBase =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4";
export const primaryButtonBase =
  "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4";
export const neutralButtonBase =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4";
export const secondaryButton =
  "inline-flex items-center justify-center rounded-2xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50";
export const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
export const helperTextBase = "text-xs text-slate-500";
export const actionGroupBase = "flex items-center justify-center gap-2";
const actionButtonBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const smallActionButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";
const filterInputBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessageBase = "py-6 text-center text-sm text-slate-500";
const typePillBase =
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide";

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
  label: "text-sm font-semibold text-slate-700",
  input: fieldBase,
  inputValid:
    "w-full rounded-2xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200",
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
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
};

const gradoPill =
  "inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600";

const tableBase = {
  wrapper: "overflow-x-auto",
  filterContainer: "w-full max-w-xs",
  filterInput: filterInputBase,
  helperText: helperMessageBase,
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton: "text-amber-500 hover:text-amber-600",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

const temasTableBase = {
  filterContainer:
    "flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between",
  filterInput: `${filterInputBase} md:max-w-xs`,
  addButton: `${buttonBase} ${accentTokens.blue}`,
  stats: "text-sm text-slate-500",
  actionGroup: actionGroupBase,
  actionButton: smallActionButtonBase,
  editButton: "text-amber-500 hover:text-amber-600",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

const modalOverlayBase =
  "fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-10 overflow-y-auto";

// Contenidos
export const contenidosLayout = createLayoutTokens("blue");

export const contenidosModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
};

export const contenidosFormClasses = createFormTokens("blue");

export const contenidosTableClasses = {
  ...tableBase,
  temasButton: "text-purple-600 hover:text-purple-700",
};

export const contenidosStatusClasses = {
  ...baseStatusPills,
  gradoTag: gradoPill,
};

export const contenidosIconClasses = {
  base: "h-5 w-5",
};

export const temasModalClasses = {
  overlay: modalOverlayBase,
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

export const temasTableClasses = temasTableBase;

export const temaFormClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl",
  header: "mb-6 flex items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
  ...createFormTokens("blue"),
};

// Años escolares
export const anioEscolarLayout = createLayoutTokens("indigo");

export const anioEscolarFormClasses = {
  ...createFormTokens("indigo"),
  momentosGrid: "mt-4 grid grid-cols-1 gap-4 md:grid-cols-3",
  momentoCard:
    "flex flex-col gap-3 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm",
  momentoTitle: "text-sm font-semibold text-indigo-700",
};

export const anioEscolarModalClasses = {
  overlay: modalOverlayBase,
  content:
    "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
  header: "mb-6 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2",
  errorBox: "mb-6 rounded-3xl border border-rose-200 bg-rose-50/70 p-4",
  errorList: "space-y-2 text-sm text-rose-600",
  errorItem: "leading-snug",
  section: "mt-6",
  sectionHeader: "mb-4 flex flex-col gap-1",
  sectionTitle: "text-lg font-semibold text-slate-800",
  warning: "mt-3 text-sm font-semibold text-amber-600",
};

export const anioEscolarTableClasses = {
  ...tableBase,
  filterContainer: "w-full max-w-md",
  filterInput: filterInputBase,
  actionGroup: actionGroupBase,
  actionButton: actionButtonBase,
  viewButton: "text-indigo-600 hover:text-indigo-700",
  editButton: "text-amber-500 hover:text-amber-600",
  deleteButton: "text-rose-500 hover:text-rose-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const anioEscolarStatusClasses = {
  base: baseStatusPills.base,
  activo: baseStatusPills.active,
  incompleto: baseStatusPills.warning,
  inactivo: baseStatusPills.inactive,
  planificado: "bg-indigo-100 text-indigo-700",
  desconocido: "bg-slate-200 text-slate-600",
};

export const anioEscolarIconClasses = {
  base: "h-5 w-5",
};

// Aulas
export const aulasLayout = createLayoutTokens("emerald");

export const aulasFormClasses = {
  ...createFormTokens("emerald"),
  grid: "grid grid-cols-1 gap-4 md:grid-cols-3",
  section: "mt-6",
  sectionTitle: "text-base font-semibold text-slate-800",
  note: "text-xs text-slate-500",
};

export const aulasTableClasses = {
  ...tableBase,
  helperText: helperMessageBase,
  editButton: "text-amber-500 hover:text-amber-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const aulasStatusClasses = {
  base: baseStatusPills.base,
  activo: baseStatusPills.active,
  inactivo: baseStatusPills.inactive,
};

export const aulasIconClasses = {
  base: "h-5 w-5",
};

// Áreas de aprendizaje
export const areasLayout = createLayoutTokens("emerald");

export const areasFormClasses = {
  ...createFormTokens("emerald"),
  infoGroup: "mt-4",
};

export const areasTableClasses = {
  ...tableBase,
  filterWrapper: tableBase.filterContainer,
  viewButton: "text-emerald-600 hover:text-emerald-700",
};

export const areasBadgeClasses = {
  ...baseStatusPills,
  pendiente: "bg-amber-100 text-amber-700",
};

export const areasModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl",
  contentWide: "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl",
  title: "mb-6 text-center text-2xl font-semibold text-slate-900",
  footer: "mt-6 flex justify-end",
  closeButton: secondaryButton,
};

export const areasComponentTableClasses = {
  wrapper: "mt-6",
  title: "text-base font-semibold text-slate-700",
  emptyState: "text-sm text-slate-500",
};

// Componentes de aprendizaje
export const componentesLayout = createLayoutTokens("blue");

export const componentesFormClasses = {
  ...createFormTokens("blue"),
};

export const componentesModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2",
};

export const componentesTableClasses = {
  ...tableBase,
};

export const componentesStatusClasses = {
  ...baseStatusPills,
  evalYes: "bg-blue-100 text-blue-700",
  evalNo: "bg-amber-100 text-amber-700",
};

export const componentesIconClasses = {
  base: "h-5 w-5",
};

// Estudiantes
export const estudiantesLayout = createLayoutTokens("indigo");

export const estudiantesFormClasses = {
  ...createFormTokens("indigo"),
  backButton: `${buttonBase} bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200/60`,
  cancelButton: `${buttonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60`,
};

export const estudiantesTableClasses = {
  ...tableBase,
  filterInputWide: `${filterInputBase} md:max-w-sm`,
  viewButton: "text-indigo-600 hover:text-indigo-700",
  editButton: "text-indigo-500 hover:text-indigo-600",
  deleteButton: "text-rose-500 hover:text-rose-600",
  status: {
    base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
    activo: "bg-indigo-100 text-indigo-700",
    incompleto: "bg-amber-100 text-amber-700",
    inactivo: "bg-rose-100 text-rose-700",
    desconocido: "bg-slate-200 text-slate-600",
  },
  toggleOn: "text-indigo-600 hover:text-indigo-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const estudiantesFichaClasses = {
  card: "rounded-3xl border border-slate-100 bg-white p-4 shadow-md",
  header: "mb-4 flex items-center gap-3",
  avatar:
    "flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold",
  fieldLabel: "text-xs font-semibold uppercase tracking-wide text-slate-400",
  fieldValue: "text-sm font-medium text-slate-700",
  chip: "inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600",
};

export const estudiantesModalClasses = {
  overlay: modalOverlayBase,
  content:
    "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
  header: "mb-6 flex items-center justify-between gap-3",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: "text-sm text-slate-500",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2",
  body: "space-y-6",
  footer: "mt-6 flex justify-end",
  footerButton: secondaryButton,
  stepper: {
    container: "flex flex-wrap items-center gap-3",
    item: "flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500",
    active: "border-indigo-300 bg-indigo-50 text-indigo-600",
    bullet:
      "flex h-8 w-8 items-center justify-center rounded-full border border-current text-base font-bold",
    label: "flex-1 text-left",
    helper: "text-xs font-normal text-slate-400",
  },
  candidates: {
    title: "text-lg font-semibold text-slate-800",
    controls: "flex flex-col gap-3 md:flex-row md:items-center",
    input: filterInputBase,
    button: `${primaryButtonBase} ${accentTokens.indigo}`,
    list: "max-h-64 overflow-y-auto rounded-3xl border border-slate-200",
    item: "flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50",
    name: "text-sm font-semibold text-slate-800",
    meta: "text-xs text-slate-500",
    selectButton: `${primaryButtonBase} ${accentTokens.indigo} px-3 py-1 text-xs`,
    empty: helperMessageBase,
  },
  form: {
    wrapper: "space-y-4",
    actions: "flex justify-end gap-3",
    title: "text-lg font-semibold text-slate-800",
    secondaryButton: secondaryButton,
    primaryButton: `${primaryButtonBase} ${accentTokens.indigo}`,
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
      "rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
    checkbox:
      "inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200",
    input:
      "rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200",
    addButton: `${primaryButtonBase} ${accentTokens.indigo} px-3 py-1 text-xs`,
    list: "mt-3 space-y-2 max-h-56 overflow-y-auto",
    item: "flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2",
    name: "text-sm font-semibold text-slate-800",
    meta: "text-xs text-slate-500",
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
    meta: "text-xs text-slate-500",
    deleteButton: "text-xs font-semibold text-rose-600 hover:text-rose-700",
    addButton: `${primaryButtonBase} ${accentTokens.indigo} px-3 py-1 text-xs`,
    empty: helperMessageBase,
  },
};

export const estudiantesViewModalClasses = {
  overlay: modalOverlayBase,
  content:
    "w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
  header: "mb-6 flex items-center justify-between gap-3",
  title: "text-2xl font-semibold text-slate-900",
  closeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2",
  section: {
    wrapper: "mb-6",
    title:
      "mb-2 border-b border-slate-200 pb-2 text-xl font-semibold text-indigo-600",
    body: "space-y-2",
  },
  row: {
    container: "mb-2 grid grid-cols-3 gap-2",
    label: "text-sm font-semibold text-slate-600",
    value: "col-span-2 text-sm text-slate-900",
  },
  card: {
    container: "mb-2 rounded-2xl border border-slate-200 bg-white p-3",
    title: "text-sm font-semibold text-slate-800",
    text: "text-xs text-slate-600",
  },
  empty: helperMessageBase,
  footer: "mt-4 flex justify-end",
  footerButton: secondaryButton,
};

// Personal
export const personalLayout = createLayoutTokens("amber");

export const personalFormClasses = {
  ...createFormTokens("amber"),
  backButton: `${neutralButtonBase} bg-transparent text-amber-600 hover:bg-amber-50 focus:ring-amber-200/60`,
  cancelButton: `${neutralButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60`,
  infoCard:
    "rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
  highlightCard:
    "rounded-3xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-800",
  sectionTitle: "text-lg font-semibold text-slate-800",
  sectionDivider: "mt-6 border-t border-slate-100",
};

export const personalTableClasses = {
  ...tableBase,
  viewButton: "text-amber-600 hover:text-amber-700",
  rolePill:
    "inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700",
  typePill: {
    base: typePillBase,
    administrativo: `${typePillBase} bg-amber-100 text-amber-700`,
    docente: `${typePillBase} bg-indigo-100 text-indigo-700`,
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
  meta: "flex items-center gap-3 text-sm text-slate-500",
  stepBadge:
    "inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700",
  stepDots: "flex items-center gap-2",
  stepDot: "h-2.5 w-2.5 rounded-full bg-slate-200",
  stepDotActive: "bg-amber-500",
  closeButton: `${buttonBase} bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300/60`,
  subtitle: "mb-6 text-sm text-slate-500",
  actionBar: "mt-6 flex flex-wrap items-center justify-between gap-3",
  listWrapper: "max-h-96 overflow-y-auto rounded-3xl border border-slate-200",
  listHeader:
    "flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600",
  listEmpty: helperMessageBase,
  listItem:
    "flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-amber-50 cursor-pointer",
  listPerson: "flex flex-col gap-0.5",
  listName: "text-sm font-semibold text-slate-900",
  listMeta: "text-xs text-slate-500",
  listTag:
    "inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700",
  searchWrapper: "relative",
  searchIcon:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
  searchInput: `${filterInputBase} pl-10`,
  bannerInfo:
    "rounded-3xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-800",
  bannerWarning:
    "rounded-3xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-800",
};

// Representantes
export const representantesLayout = createLayoutTokens("blue");

export const representantesFormClasses = createFormTokens("blue");

export const representantesTableClasses = {
  ...tableBase,
  viewButton: "text-blue-600 hover:text-blue-700",
  relationshipPill:
    "inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700",
};

export const representantesModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-5xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex flex-wrap items-center justify-between gap-4",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: "text-sm text-slate-500",
  meta: "flex items-center gap-3 text-sm text-slate-500",
  stepBadge:
    "inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700",
  stepDots: "flex items-center gap-2",
  stepDot: "h-2.5 w-2.5 rounded-full bg-slate-200",
  stepDotActive: "bg-blue-500",
  closeButton:
    "inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200",
  body: "space-y-6",
  listWrapper: "rounded-3xl border border-slate-200",
  listHeader:
    "flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600",
  listItem:
    "flex cursor-pointer items-start justify-between gap-3 px-4 py-3 transition hover:bg-blue-50",
  listPerson: "flex flex-col gap-0.5",
  listName: "text-sm font-semibold text-slate-900",
  listMeta: "text-xs text-slate-500",
  listTag:
    "inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700",
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

// Utilitarios compartidos
export const estadoGenericoClases = baseStatusPills;
export const helperTextMuted = helperMessageBase;
