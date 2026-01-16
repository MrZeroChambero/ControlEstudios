import { useMemo, useState } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";

import { dataTableBaseStyles, TableClasses } from "./EstilosTablas.js";

const defaultNormalizeFilter = (value = "") => value.toLowerCase().trim();
const defaultMatcher = (item, normalizedValue) =>
  JSON.stringify(item ?? {})
    .toLowerCase()
    .includes(normalizedValue);

const sanitizeDataTableProps = (props = {}) => {
  const blockedProps = [
    "columns",
    "data",
    "customStyles",
    "progressPending",
    "progressComponent",
    "noDataComponent",
    "subHeader",
    "subHeaderComponent",
    "pagination",
    "paginationComponentOptions",
    "striped",
    "highlightOnHover",
  ];

  const sanitized = { ...props };
  blockedProps.forEach((key) => {
    if (key in sanitized) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

export const Tablas = ({
  columns,
  isLoading,
  filteredItems,
  data,
  subHeaderComponent,
  Cargar,
  progressComponent,
  noDataComponent,
  dataTableProps,
  filterConfig,
}) => {
  const sanitizedProps = sanitizeDataTableProps(dataTableProps);
  const dataset = data ?? filteredItems ?? [];
  const [internalFilter, setInternalFilter] = useState(
    filterConfig?.initialValue ?? ""
  );

  const filterValue = filterConfig
    ? filterConfig.value ?? internalFilter
    : undefined;

  const normalizedFilterValue = filterConfig
    ? (filterConfig.normalizeValue ?? defaultNormalizeFilter)(filterValue ?? "")
    : "";

  const handleFilterChange = (nextValue) => {
    if (filterConfig?.onChange) {
      filterConfig.onChange(nextValue);
    } else {
      setInternalFilter(nextValue);
    }
  };

  const resolvedData = useMemo(() => {
    if (!filterConfig || normalizedFilterValue === "") {
      return dataset;
    }

    const matcher = filterConfig.matcher ?? defaultMatcher;
    const preprocessed = filterConfig.preprocessData
      ? filterConfig.preprocessData(dataset)
      : dataset;

    return preprocessed.filter((item) => {
      try {
        return matcher(item, normalizedFilterValue, filterValue ?? "");
      } catch (error) {
        console.error("Error al aplicar el filtro de Tablas:", error);
        return true;
      }
    });
  }, [dataset, filterConfig, normalizedFilterValue, filterValue]);

  const filterInput = filterConfig ? (
    filterConfig.renderInput ? (
      filterConfig.renderInput({
        value: filterValue ?? "",
        onChange: handleFilterChange,
      })
    ) : (
      <div
        className={filterConfig.wrapperClassName ?? TableClasses.filterWrapper}
      >
        <input
          type="text"
          placeholder={filterConfig.placeholder ?? "Buscar..."}
          className={filterConfig.inputClassName ?? TableClasses.filterInput}
          value={filterValue ?? ""}
          onChange={(e) => handleFilterChange(e.target.value)}
        />
      </div>
    )
  ) : undefined;

  const resolvedSubHeader = subHeaderComponent ?? filterInput;

  return (
    <DataTableSeguro
      columns={columns}
      customStyles={dataTableBaseStyles}
      data={resolvedData}
      progressPending={isLoading}
      progressComponent={
        progressComponent ?? (
          <p className={TableClasses.helperText}>
            {typeof Cargar !== "undefined" && Cargar !== null
              ? Cargar
              : "No hay datos para mostrar."}
          </p>
        )
      }
      noDataComponent={
        noDataComponent ?? (
          <p className={TableClasses.helperText}>No hay datos para mostrar.</p>
        )
      }
      pagination
      paginationComponentOptions={{
        rowsPerPageText: "Filas por página:",
        rangeSeparatorText: "de",
      }}
      subHeader={Boolean(resolvedSubHeader)}
      subHeaderComponent={resolvedSubHeader}
      striped
      highlightOnHover
      {...sanitizedProps}
    />
  );
};

export const TablaEntradas = ({
  columns,
  isLoading,
  data,
  filteredItems,
  Cargar,
  filterConfig,
  subHeaderComponent,
  progressComponent,
  noDataComponent,
  dataTableProps,
}) => {
  const dataset = data ?? filteredItems ?? [];
  const mergedFilterConfig =
    filterConfig === null
      ? undefined
      : {
          placeholder: "Buscar por nombre...",
          wrapperClassName: TableClasses.filterWrapper,
          inputClassName: TableClasses.filterInput,
          ...filterConfig,
        };

  return (
    <Tablas
      columns={columns}
      isLoading={isLoading}
      data={dataset}
      subHeaderComponent={subHeaderComponent}
      Cargar={Cargar}
      progressComponent={progressComponent}
      noDataComponent={noDataComponent}
      dataTableProps={dataTableProps}
      filterConfig={mergedFilterConfig}
    />
  );
};
