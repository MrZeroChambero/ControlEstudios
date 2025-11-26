import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { solicitarMomentos, solicitarMomentosPorAnio, actualizarMomento } from '../../api/anioEscolarService';

export default function MomentsEditor({ idAnio = null, initialMomentosIds = [], onSaved }) {
} from "../../api/anioEscolarService";

export default function MomentsEditor({ initialMomentosIds = [], onSaved }) {
  const [momentos, setMomentos] = useState([]);

  useEffect(() => {
    cargar();
    if (idAnio) await solicitarMomentosPorAnio(idAnio, setMomentos, Swal);
    else await solicitarMomentos(setMomentos, Swal);

  const cargar = async () => {
    await solicitarMomentos(setMomentos, Swal);
  };

  const seleccionados = () => {
    if (idAnio) return momentos;
    if (!initialMomentosIds || initialMomentosIds.length === 0) return [];
    return momentos.filter((m) => initialMomentosIds.includes(m.id_momento));
  };

  const handleChange = (id, field, value) => {
    setMomentos((prev) =>
      prev.map((m) => (m.id_momento === id ? { ...m, [field]: value } : m))
    );
  };

  const validarLocal = (items) => {
    // validar duración entre 65 y 70 días y sin solapamientos entre seleccionados
    const arr = items.map((m) => ({
      id: m.id_momento,
      inicio: new Date(m.fecha_inicio),
      fin: new Date(m.fecha_fin),
    }));
    // duración
    for (const it of arr) {
      const dias = Math.floor((it.fin - it.inicio) / (1000 * 60 * 60 * 24)) + 1;
      if (dias < 65 || dias > 70)
        return `El momento ${it.id} debe tener entre 65 y 70 días (actual: ${dias})`;
      if (it.inicio > it.fin) return `Fechas inválidas en momento ${it.id}`;
    }
    // solapamiento
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (!(arr[i].fin < arr[j].inicio || arr[i].inicio > arr[j].fin)) {
          return `Momentos ${arr[i].id} y ${arr[j].id} se solapan`;
        }
      }
    }
    return null;
  };

  const handleGuardar = async () => {
    const sel = seleccionados();
    const err = validarLocal(sel);
    if (err) return Swal.fire("Error", err, "error");

    // guardar uno por uno
    for (const m of sel) {
      const payload = {
        nombre: m.nombre,
        orden: m.orden,
        fecha_inicio: m.fecha_inicio,
        fecha_fin: m.fecha_fin,
        estado: m.estado,
      };
      await actualizarMomento(m.id_momento, payload, Swal);
    }
    Swal.fire("OK", "Momentos actualizados", "success");
    if (onSaved) onSaved();
  };

  const sel = seleccionados();

  if (sel.length === 0)
    return <div>No hay momentos seleccionados para editar.</div>;

  return (
    <div className="p-3 border rounded">
      <h4 className="font-bold mb-2">Editar Momentos</h4>
      {sel.map((m) => (
        <div key={m.id_momento} className="mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm">Nombre</label>
              <input
                value={m.nombre}
                onChange={(e) =>
                  handleChange(m.id_momento, "nombre", e.target.value)
                }
                className="w-full border p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Orden</label>
              <input
                value={m.orden}
                onChange={(e) =>
                  handleChange(m.id_momento, "orden", e.target.value)
                }
                className="w-full border p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Fecha inicio</label>
              <input
                type="date"
                value={m.fecha_inicio}
                onChange={(e) =>
                  handleChange(m.id_momento, "fecha_inicio", e.target.value)
                }
                className="w-full border p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Fecha fin</label>
              <input
                type="date"
                value={m.fecha_fin}
                onChange={(e) =>
                  handleChange(m.id_momento, "fecha_fin", e.target.value)
                }
                className="w-full border p-1"
              />
            </div>
          </div>
        </div>
      ))}
      <div className="text-right">
        <button
          onClick={handleGuardar}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
