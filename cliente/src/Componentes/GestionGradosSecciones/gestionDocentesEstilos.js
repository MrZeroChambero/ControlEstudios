import {
  contenidosFormClasses,
  neutralButtonBase,
  helperTextBase,
  typePillBase,
} from "../EstilosCliente/EstilosClientes";

const baseCardWrapper =
  "rounded-3xl border border-slate-100 bg-slate-50/60 p-4";
const baseInfoCard =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const warningHelper = `${helperTextBase} mt-2 text-amber-600`;
const errorBanner =
  "rounded-3xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700";
const actionsWrapper = `${contenidosFormClasses.actions} mt-6`;
const cancelButton = `${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;

export const docenteTitularModalClasses = {
  form: "space-y-6",
  docenteSelect: {
    wrapper: contenidosFormClasses.fieldWrapper,
    label: contenidosFormClasses.label,
    select: contenidosFormClasses.select,
    helper: helperTextBase,
  },
  componentesCard: {
    wrapper: baseCardWrapper,
    header: {
      container:
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
      title: "text-sm font-semibold text-slate-700",
      helper: "text-xs text-slate-500",
    },
    list: "mt-4 grid gap-3 sm:grid-cols-1 md:grid-cols-2",
    item: baseInfoCard,
    typePillBase: typePillBase,
    componentName: "block break-words text-sm font-semibold text-slate-800",
    areaLabel:
      "mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500",
    statusPillBase:
      "mt-3 inline-flex w-max items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
    statusVariants: {
      assigned: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
    },
    emptyHelper: `${helperTextBase} mt-3 text-amber-600`,
    errorHelper: `${helperTextBase} mt-3 text-rose-600`,
  },
  errorBanner,
  actions: {
    wrapper: actionsWrapper,
    cancelButton,
    submitButton: contenidosFormClasses.primaryButton,
  },
};

export const especialistaModalClasses = {
  form: "space-y-4",
  componenteSelect: {
    wrapper: contenidosFormClasses.fieldWrapper,
    label: contenidosFormClasses.label,
    select: contenidosFormClasses.select,
    helper: helperTextBase,
    warning: warningHelper,
  },
  componenteInfoCard: {
    wrapper: baseCardWrapper,
    content: "space-y-3",
    typePillBase: typePillBase,
    componentName: "text-sm font-semibold text-slate-700",
    areaLabel: "text-xs uppercase tracking-wide text-slate-500",
    helperText: "text-xs text-slate-500",
  },
  especialistaSelect: {
    wrapper: contenidosFormClasses.fieldWrapper,
    label: contenidosFormClasses.label,
    select: contenidosFormClasses.select,
    helper: helperTextBase,
    warning: warningHelper,
  },
  errorBanner,
  actions: {
    wrapper: actionsWrapper,
    cancelButton,
    submitButton: contenidosFormClasses.primaryButton,
  },
};
