import {
  contenidosLayout,
  contenidosFormClasses,
  contenidosTableClasses,
  secondaryButton,
} from "../EstilosCliente/EstilosClientes";

export const respaldoLayoutClasses = {
  page: "space-y-6",
  section: contenidosLayout.container,
  header: contenidosLayout.header,
  title: contenidosLayout.title,
  description: contenidosLayout.description,
  actions: "flex flex-wrap items-center gap-2",
  createButton: `${contenidosLayout.addButton} disabled:opacity-60 disabled:cursor-not-allowed`,
  syncButton: `${secondaryButton} disabled:opacity-60 disabled:cursor-not-allowed`,
  restoreButton: `${contenidosFormClasses.ghostButton} disabled:opacity-60 disabled:cursor-not-allowed`,
  content: "space-y-4",
  summaryRow:
    "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
  summaryText: "text-sm text-slate-500",
  filterContainer: contenidosTableClasses.filterContainer,
  filterInput: contenidosTableClasses.filterInput,
  tableWrapper: contenidosTableClasses.wrapper,
  helperText: contenidosTableClasses.helperText,
};

export const respaldoTablaClasses = {
  fileName: "text-sm font-semibold text-slate-800",
  metaText: "text-sm text-slate-600",
  actionsWrapper: "flex flex-wrap items-center justify-end gap-2",
  downloadButton: `${contenidosFormClasses.ghostButton} px-3 py-1 text-xs`,
  restoreButton: `${contenidosFormClasses.primaryButton} px-3 py-1 text-xs`,
};

export const respaldoModalClasses = {
  body: "space-y-4",
  footer: "flex flex-wrap items-center justify-end gap-3",
  secondaryButton: contenidosFormClasses.secondaryButton,
  primaryButton: `${contenidosFormClasses.primaryButton} disabled:opacity-60 disabled:cursor-not-allowed`,
  formGroup: contenidosFormClasses.group,
  label: contenidosFormClasses.label,
  input: contenidosFormClasses.input,
  helper: contenidosFormClasses.helper,
  fileInfo:
    "rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700",
  fileInfoHighlight: "font-semibold",
};
