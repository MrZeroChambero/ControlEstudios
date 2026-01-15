import {
  contenidosFormClasses,
  contenidosTableClasses,
  contenidosIconClasses,
  representantesLayout,
  primaryButtonBase,
  typography,
} from "../EstilosCliente/EstilosClientes";

export const representantesGestionClasses = {
  page: "p-6",
  container: representantesLayout.container,
  header: representantesLayout.header,
  title: representantesLayout.title,
  description: representantesLayout.description,
  addButton: representantesLayout.addButton,
  infoCard: "mb-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-4",
  infoText: "text-sm text-slate-600",
  infoHighlight: typography.bodyMutedSm,
};

const inlinePrimaryButton = `${primaryButtonBase} bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300/60`;

export const habilidadesFormClasses = {
  container: "rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm",
  header: "mb-4 flex flex-wrap items-center justify-between gap-3",
  title: "text-lg font-semibold text-slate-900",
  description: "text-xs text-slate-500",
  counter: "text-xs font-semibold text-slate-500",
  formRow: "mb-5 flex flex-col gap-3 md:flex-row",
  input: contenidosFormClasses.input,
  addButton: `${contenidosFormClasses.primaryButton} md:w-auto`,
  list: "space-y-3",
  item: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/50",
  editInput: `${contenidosFormClasses.input} md:flex-1`,
  itemName: "flex-1 text-sm font-medium text-slate-700",
  inlinePrimary: inlinePrimaryButton,
  inlineGhost: `${contenidosFormClasses.ghostButton} px-3 py-1 text-xs`,
  actionGroup: contenidosTableClasses.actionGroup,
  actionButton: contenidosTableClasses.actionButton,
  editButton: contenidosTableClasses.editButton,
  deleteButton: contenidosTableClasses.deleteButton,
  icon: contenidosIconClasses.base,
  helperText: contenidosTableClasses.helperText,
};
