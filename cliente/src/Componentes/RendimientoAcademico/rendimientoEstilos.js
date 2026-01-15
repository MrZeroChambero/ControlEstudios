import {
  contenidosLayout,
  contenidosFormClasses,
  typography,
} from "../EstilosCliente/EstilosClientes";
import {
  controlDeshabilitado,
  tarjetaDatoClass,
  selectTablaClass,
  selectEncabezadoClass,
  alertaExitoClass,
  alertaErrorClass,
  badgePlanClass,
} from "./constantesRendimiento";

export const encabezadoGestionClasses = {
  container: contenidosLayout.container,
  header: contenidosLayout.header,
  content: "space-y-2",
  title: contenidosLayout.title,
  description: contenidosLayout.description,
  timestamp: "text-xs text-slate-500",
  actions: "flex flex-wrap items-center gap-3",
  refreshButton: contenidosFormClasses.ghostButton,
  saveButton: contenidosLayout.addButton,
};

export const panelContextoEvaluacionClasses = {
  container: `${contenidosLayout.container} space-y-4`,
  header: "space-y-1",
  title: typography.titleSm,
  description: typography.bodyMutedSm,
  grid: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
  card: tarjetaDatoClass,
  label: contenidosFormClasses.label,
  value: "text-sm font-semibold text-slate-800",
};

export const panelFiltrosEvaluacionClasses = {
  container: `${contenidosLayout.container} space-y-4`,
  header: "space-y-1",
  title: typography.titleSm,
  description: typography.bodyMutedSm,
  grid: contenidosFormClasses.grid,
  field: "flex flex-col gap-2",
  label: contenidosFormClasses.label,
  select: `${contenidosFormClasses.select} ${controlDeshabilitado}`,
  helper: contenidosFormClasses.helper,
};

export const tablaRendimientoClasses = {
  container: `${contenidosLayout.container} space-y-4`,
  header: "space-y-1",
  title: typography.titleSm,
  description: typography.bodyMutedSm,
  metaList: "flex flex-wrap gap-3 text-xs text-slate-500",
  emptyWrapper: contenidosLayout.container,
  emptyText: `${typography.bodyMutedSm} text-center`,
  tableWrapper: "overflow-x-auto",
  table: "w-full min-w-[720px] table-fixed border-collapse",
  headRow:
    "bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500",
  headCell: "border-b border-slate-200 px-4 py-3",
  indicatorCell: "border-b border-slate-200 px-4 py-3 align-top",
  indicatorControls: "flex flex-col gap-2",
  indicatorName: "text-xs font-semibold text-slate-600",
  studentRow: "border-b border-slate-100",
  studentCell: "px-4 py-3 align-top",
  studentInfo: "space-y-2",
  studentName: "text-sm font-semibold text-slate-800",
  disabledHint: "mt-2 text-xs text-slate-400",
  selectHeader: selectEncabezadoClass,
  selectBody: selectTablaClass,
  badgePlan: badgePlanClass,
};

export const mensajesRendimientoClasses = {
  exito: alertaExitoClass,
  error: alertaErrorClass,
};

export { controlDeshabilitado };
