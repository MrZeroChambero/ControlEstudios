export const layoutClasses = {
  container: "p-6 bg-white rounded-lg shadow-md",
  header: "flex justify-between items-center mb-4",
  title: "text-2xl font-bold",
  addButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2",
  description: "text-gray-600 mb-6",
};

export const modalClasses = {
  overlay:
    "fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10 px-4",
  content: "bg-white p-8 rounded-lg shadow-2xl w-full max-w-md",
  contentWide: "bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl",
  title: "text-2xl font-bold mb-6",
  footer: "mt-4 flex justify-end",
  closeButton:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg",
};

export const formClasses = {
  group: "mb-4",
  label: "block text-gray-700 text-sm font-bold mb-2",
  input:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  readOnlyText: "text-gray-900",
  readOnlyStatus: "text-gray-900 capitalize",
  detailsGroup: "mb-6",
  buttonRow: "flex items-center justify-end gap-3",
  cancelButton:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg",
  submitButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

export const tableClasses = {
  container: "overflow-x-auto",
  filterWrapper: "w-full sm:w-1/3",
  filterInput:
    "w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200",
  statusBase: "px-2 py-1 text-xs font-bold rounded-full",
  statusActive: "bg-green-200 text-green-800",
  statusInactive: "bg-red-200 text-red-800",
  actionGroup: "flex items-center justify-center gap-2",
  actionButton:
    "inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-200",
  viewButton: "text-blue-500 hover:text-blue-700",
  toggleActive: "text-green-500 hover:text-green-600",
  toggleInactive: "text-gray-500 hover:text-gray-600",
  editButton: "text-yellow-500 hover:text-yellow-700",
  deleteButton: "text-red-500 hover:text-red-700",
  helperText: "text-center text-gray-500",
};

export const componentTableClasses = {
  wrapper: "mt-6",
  title: "text-lg font-semibold mb-3",
  emptyState: "text-gray-600 text-sm",
};

export const iconSizes = {
  add: 18,
  action: 18,
  toggle: 24,
};
