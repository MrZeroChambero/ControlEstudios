import React from "react";
import { personalFormConfig } from "./formConfig";

export const PersonalForm = ({ formData, setFormData, personas, planteles }) => {
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (f) => {
    const value = formData[f.name] ?? "";
    if (f.type === "select") {
      if (f.name === "id_persona") {
        return (
          <select
            name="id_persona"
            value={value}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required={f.required}
          >
            <option value="">Seleccione una persona</option>
            {personas.map((p) => (
              <option key={p.id_persona} value={p.id_persona}>
                {`${p.primer_nombre || ""} ${p.primer_apellido || ""} - ${
                  p.cedula || "N/A"
                }`}
              </option>
            ))}
          </select>
        );
      }
      if (f.name === "fk_plantel") {
        return (
          <select
            name="fk_plantel"
            value={value}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required={f.required}
          >
            <option value="">Seleccione un plantel</option>
            {planteles.map((p) => (
              <option key={p.id_plantel} value={p.id_plantel}>
                {p.nombre}
              </option>
            ))}
          </select>
        );
      }
      return (
        <select
          name={f.name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded"
          required={f.required}
        >
          <option value="">Seleccione</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "textarea") {
      return (
        <textarea
          name={f.name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      );
    }
    if (f.type === "time") {
      return (
        <input
          type="time"
          name={f.name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      );
    }
    return (
      <input
        type={f.type}
        name={f.name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded"
        required={f.required}
      />
    );
  };

  return (
    // contenedor con scroll vertical y altura máxima para que el formulario haga scroll si es muy largo
    <div className="overflow-y-auto p-4" style={{ maxHeight: "70vh" }}>
      <div className="grid grid-cols-1 gap-4">
        {personalFormConfig.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-bold mb-1">{f.label}</label>
            {renderField(f)}
          </div>
        ))}
      </div>
    </div>
  );
};
