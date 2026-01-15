import React, { forwardRef } from "react";
import { StyleSheetManager } from "styled-components";
import DataTable from "react-data-table-component";
import { filtrarPropsTabla } from "./tablaProps";

const DataTableSeguro = forwardRef((props, ref) => (
  <StyleSheetManager shouldForwardProp={filtrarPropsTabla}>
    <DataTable ref={ref} {...props} />
  </StyleSheetManager>
));

DataTableSeguro.displayName = "DataTableSeguro";

export default DataTableSeguro;
