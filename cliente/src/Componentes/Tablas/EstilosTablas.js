export const dataTableBaseStyles = {
  table: {
    style: {
      width: "100%",
      tableLayout: "auto",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      fontSize: "13px",
      fontWeight: 600,
      textTransform: "uppercase",
    },
  },
  headCells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      whiteSpace: "normal",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      whiteSpace: "normal",
    },
  },
};

const tableWrapper = "overflow-x-auto";
const filterInput =
  "w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const helperMessage = "py-6 text-center text-sm text-slate-500";
const actionGroup = "flex items-center justify-center gap-2";
const actionButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2";

export const TableClasses = {
  wrapper: tableWrapper,
  filterWrapper: "w-full max-w-xs",
  filterInput,
  helperText: helperMessage,
  actionGroup,
  actionButton,
  viewButton: "text-blue-600 hover:text-blue-700",
  editButton:
    "text-[color:var(--color-amber-500)] hover:text-[color:var(--color-amber-500)]",
  deleteButton: "text-red-500 hover:text-red-600",
  toggleOn: "text-emerald-600 hover:text-emerald-700",
  toggleOff: "text-slate-400 hover:text-slate-500",
};

export const IconClasses = "h-5 w-5";

export const BadgeClasses = {
  base: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  pendiente: "bg-amber-100 text-amber-700",
};
