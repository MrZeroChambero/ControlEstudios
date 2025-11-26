import React, { useState } from "react";
import Swal from "sweetalert2";

export default function AnioEscolarForm({ onCrear }) {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("incompleto");

  const validarFechas = () => {
    if (!fechaInicio || !fechaFin) {
      Swal.fire("Error", "Fechas requeridas", "error");
      return false;
    }
    const a = new Date(fechaInicio);
    const b = new Date(fechaFin);
    if (a > b) {
      Swal.fire("Error", "Fecha inicio debe ser anterior a fecha fin", "error");
      return false;
    }
    const dias = Math.floor((b - a) / (1000 * 60 * 60 * 24)) + 1;
    if (dias > 365) {
      Swal.fire("Error", "La duración no puede superar 365 días", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFechas()) return;
    const payload = {
      nombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado,
    };
    const res = await onCrear(payload);
    if (res && res.momentos) {
      Swal.fire(
        "OK",
        "Se crearon los momentos: " + res.momentos.join(", "),
        "success"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          className="w-full border p-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha inicio</label>
        <input
          type="date"
          className="w-full border p-2"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha fin</label>
        <input
          type="date"
          className="w-full border p-2"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border p-2"
        >
          <option value="incompleto">Incompleto (generar momentos)</option>
          <option value="activo">Activo</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear / Seleccionar
        </button>
      </div>
    </form>
  );
}
