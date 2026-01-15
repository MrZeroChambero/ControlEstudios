import {
  contenidosLayout,
  contenidosFormClasses,
  primaryButtonBase,
  typographyScale,
  textColors,
} from "../EstilosCliente/EstilosClientes";

const tabButtonBase = `${primaryButtonBase} bg-blue-500 text-white focus:ring-blue-200/60 flex items-center gap-2`;
const tabButtonInactive = "hover:bg-blue-600";
const tabButtonActive =
  "bg-blue-700 hover:bg-blue-700 focus:ring-blue-400/60 shadow-lg";

export const parentescoLayout = {
  container: contenidosLayout.container,
  header: `${contenidosLayout.header} items-start`,
  headingWrapper: "flex flex-col gap-1",
  title: contenidosLayout.title,
  helperText: `${typographyScale.sm} ${textColors.muted}`,
  description: contenidosLayout.description,
};

export const parentescoTabClasses = {
  group: "flex flex-wrap gap-2",
  button: tabButtonBase,
  active: tabButtonActive,
  inactive: tabButtonInactive,
  icon: "h-4 w-4",
};

export const parentescoSectionClasses = {
  stack: "space-y-6",
  card: "space-y-4 rounded-3xl border border-slate-100 bg-white/60 p-4 shadow-sm",
  form: "space-y-3",
  addButton: `${contenidosFormClasses.primaryButton} flex w-full items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-60`,
};
