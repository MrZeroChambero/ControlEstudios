import {
  personalFormClasses,
  personalModalClasses,
} from "../EstilosCliente/EstilosClientes";

export const personalWizardClasses = {
  gridTwoCols: "grid gap-4 md:grid-cols-2",
  stepForm: "flex flex-col gap-6",
  selectionLayout: "flex flex-col gap-6",
  stackMd: "flex flex-col gap-4",
  stackSm: "flex flex-col gap-3",
  actionLeft: "flex flex-wrap items-center gap-2",
  actionRight: "flex flex-wrap justify-end gap-2",
  listDivider: "divide-y divide-slate-100",
  summaryLabel: "text-sm font-semibold uppercase tracking-wide",
  summaryText: "text-sm ml-2",
  iconSmall: "h-4 w-4",
  buttonBlock: "w-full sm:w-auto",
  buttonDisabled: "disabled:cursor-not-allowed disabled:opacity-60",
  searchInput: `${personalModalClasses.searchInput} placeholder:text-slate-400`,
  listItemSelected: "bg-amber-50 ring-2 ring-amber-200",
};

export const personalWizardModalClasses = {
  body: "space-y-6",
  content: "max-w-5xl",
};

export { personalFormClasses, personalModalClasses };
