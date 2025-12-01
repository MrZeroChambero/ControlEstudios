const baseContainer =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition-shadow";
const baseHeader = "mb-4 flex flex-wrap items-center justify-between gap-4";
const baseTitle = "text-2xl font-bold text-slate-900";
const baseDescription = "mb-6 text-sm text-slate-500";
const buttonBase =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4";
const primaryButtonBase =
  "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4";
const neutralButtonBase =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4";
const secondaryButton =
  "inline-flex items-center justify-center rounded-2xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-400/50";
const fieldBase =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const readOnlyBase =
  "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
const helperTextBase = "text-xs text-slate-500";
const actionGroupBase = "flex items-center justify-center gap-2";
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
  title: "mb-6 text-center text-2xl font-semibold text-slate-900",
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
  title: "mb-6 text-center text-2xl font-semibold text-slate-900",
  ...createFormTokens("blue"),
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

// Estudiantes
export const estudiantesLayout = createLayoutTokens("indigo");

export const estudiantesFormClasses = {
  ...createFormTokens("indigo"),
  backButton: `${buttonBase} bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200/60`,
  cancelButton: `${buttonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300/60`,
};

export const estudiantesTableClasses = {
  ...tableBase,
  viewButton: "text-indigo-600 hover:text-indigo-700",
  badgeAlta: "bg-indigo-100 text-indigo-700",
  badgeMedia: "bg-amber-100 text-amber-700",
  badgeBaja: "bg-rose-100 text-rose-700",
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
  content: "w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl",
  header: "mb-6 flex items-center justify-between gap-3",
  title: "text-2xl font-semibold text-slate-900",
  closeButton: `${buttonBase} bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300/60`,
  subtitle: "mb-6 text-sm text-slate-500",
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
export const representantesLayout = createLayoutTokens("purple");

export const representantesFormClasses = createFormTokens("purple");

export const representantesTableClasses = {
  ...tableBase,
  viewButton: "text-purple-600 hover:text-purple-700",
  relationshipPill:
    "inline-flex items-center justify-center rounded-full bg-purple-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-700",
};

export const representantesModalClasses = {
  overlay: modalOverlayBase,
  content: "w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl",
  title: "mb-6 text-2xl font-semibold text-slate-900",
  sectionTitle:
    "mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400",
  sectionBody: "mt-2 grid gap-4 md:grid-cols-2",
};

// Utilitarios compartidos
export const estadoGenericoClases = baseStatusPills;
export const helperTextMuted = helperMessageBase;
