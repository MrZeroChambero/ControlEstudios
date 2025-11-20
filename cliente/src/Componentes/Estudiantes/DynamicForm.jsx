import React from "react";

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

  const fieldBaseClass = "w-full p-2 border border-gray-300 rounded-md";
  const labelClass = "block text-gray-700 text-sm font-bold mb-1";
  const errorClass = "text-red-600 text-xs mt-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schema.fields.map((f) => (
        <div key={f.name} className="flex flex-col">
          <label className={labelClass} htmlFor={f.name}>
            {f.label}
            {f.required ? " *" : ""}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              name={f.name}
              className={`${fieldBaseClass} min-h-[88px]`}
              value={formData[f.name] ?? ""}
              onChange={(e) => handleChange(e, f.type, f.name)}
              disabled={disabled || disabledFields.includes(f.name)}
            />
          ) : f.type === "select" ? (
            <select
              id={f.name}
              name={f.name}
              className={fieldBaseClass}
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
              className={fieldBaseClass}
              value={f.type === "checkbox" ? undefined : formData[f.name] ?? ""}
              checked={
                f.type === "checkbox" ? Boolean(formData[f.name]) : undefined
              }
              onChange={(e) => handleChange(e, f.type, f.name)}
              disabled={disabled || disabledFields.includes(f.name)}
            />
          )}
          {errors[f.name] && (
            <span className={errorClass}>{errors[f.name]}</span>
          )}
        </div>
      ))}
    </div>
  );
};
