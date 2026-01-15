import {
  primaryButtonBase,
  neutralButtonBase,
  fieldBase,
  typography,
  typographyScale,
  fontWeights,
  textColors,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";

const buttonAccentBlue = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300/60";
const cardBase =
  "w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl";

export const loginLayoutClasses = {
  page: "min-h-screen bg-slate-100 px-4 py-10",
  wrapper: "mx-auto flex h-full max-w-5xl items-center justify-center",
  card: cardBase,
  header: "mb-6 text-center",
  title: `${typographyScale["2xl"]} ${fontWeights.bold} ${textColors.primary}`,
  description: `${typography.bodyMutedSm}`,
};

export const loginFormClasses = {
  form: "space-y-5",
  group: "flex flex-col gap-1.5",
  label: `${typographyScale.sm} ${fontWeights.semibold} ${textColors.secondary}`,
  input: fieldBase,
  passwordWrapper: "relative flex flex-col gap-1.5",
  passwordToggle:
    "absolute inset-y-0 right-0 top-7 flex items-center px-3 text-xs font-semibold text-slate-500",
  helper: helperTextBase,
  actions: "flex items-center justify-between",
  submitButton: `${primaryButtonBase} ${buttonAccentBlue} w-full justify-center`,
};

export const loginAlertClasses = {
  attemptInfo:
    "mt-4 whitespace-pre-line rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
  error:
    "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
  title: "mb-1 font-semibold",
  body: "text-sm leading-relaxed",
};

export const loginSupportClasses = {
  forgotPassword: "mt-4 text-center text-sm text-blue-600 hover:underline",
  actions: "flex items-center justify-between",
  submitWrapper: "flex items-center justify-between",
  link: "text-sm font-semibold text-blue-600 hover:underline",
  toggleButton: `${neutralButtonBase} bg-transparent px-0 text-sm text-slate-500 hover:text-slate-700`,
};
