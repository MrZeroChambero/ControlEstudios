import React from "react";

import { estudiantesFormClasses } from "./estudiantesEstilos";

export const DynamicForm = ({
  schema,
  formData,
  onChange,
  errors = {},
  disabled = false,
  disabledFields = [],
}) => {
  if (!schema?.fields) return null;

  const handleChange = (e, type, name) => {
    let value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (type === "number") value = value === "" ? "" : Number(value);
    onChange?.(name, value);
  };

  const {
    grid,
    fieldWrapper,
    label,
    input,
    select,
    textArea,
    textAreaAuto,
    error,
  } = estudiantesFormClasses;

  return (
    <div className={grid}>
      {schema.fields.map((f) => (
        <div key={f.name} className={fieldWrapper}>
          <label className={label} htmlFor={f.name}>
            {f.label}
            {f.required ? " *" : ""}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              name={f.name}
              className={`${textArea} ${textAreaAuto}`}
              value={formData[f.name] ?? ""}
              onChange={(e) => handleChange(e, f.type, f.name)}
              disabled={disabled || disabledFields.includes(f.name)}
            />
          ) : f.type === "select" ? (
            <select
              id={f.name}
              name={f.name}
              className={select}
              value={formData[f.name] ?? ""}
              onChange={(e) => handleChange(e, f.type, f.name)}
              disabled={disabled || disabledFields.includes(f.name)}
            >
              <option value="">Seleccione...</option>
              {(f.options || []).map((opt) =>
                typeof opt === "string" ? (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ) : (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )}
            </select>
          ) : (
            <input
              id={f.name}
              name={f.name}
              type={f.type || "text"}
              className={input}
              value={f.type === "checkbox" ? undefined : formData[f.name] ?? ""}
              checked={
                f.type === "checkbox" ? Boolean(formData[f.name]) : undefined
              }
              onChange={(e) => handleChange(e, f.type, f.name)}
              disabled={disabled || disabledFields.includes(f.name)}
            />
          )}
          {errors[f.name] && <span className={error}>{errors[f.name]}</span>}
        </div>
      ))}
    </div>
  );
};
