const PROPS_INVALIDAS_DATATABLE = new Set([
  "align",
  "allowOverflow",
  "button",
  "center",
  "grow",
  "right",
]);

/**
 * Evita que props internas de react-data-table-component lleguen al DOM.
 */
export const filtrarPropsTabla = (prop) => !PROPS_INVALIDAS_DATATABLE.has(prop);
