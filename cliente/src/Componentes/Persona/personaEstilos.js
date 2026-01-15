import {
  fieldBase,
  helperTextBase,
  primaryButtonBase,
  neutralButtonBase,
  typographyScale,
  textColors,
  fontWeights,
} from "../EstilosCliente/EstilosClientes";

const accentPrimary = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60";
const neutralButtonAccent =
  "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-200/60";

export const personaFormClasses = {
  form: "space-y-6",
  grid: "grid grid-cols-1 gap-6 md:grid-cols-2",
  column: "space-y-4",
  field: "space-y-1.5",
  label: `${typographyScale.sm} ${fontWeights.semibold} ${textColors.secondary}`,
  input: fieldBase,
  select: fieldBase,
  textArea: `${fieldBase} min-h-[96px] resize-none`,
  helper: helperTextBase,
  inputError: "border-rose-500 focus:border-rose-500 focus:ring-rose-200",
  inputSuccess: "border-emerald-400",
  errorMessage: "text-xs font-semibold text-rose-600",
  actions: "flex items-center justify-end gap-3",
  cancelButton: `${neutralButtonBase} ${neutralButtonAccent}`,
  submitButton: `${primaryButtonBase} ${accentPrimary} justify-center`,
};

export const personaModalClasses = {
  body: "pt-2",
};
