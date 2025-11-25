import React, { useState, useEffect } from "react";
import SwalDefault from "sweetalert2";
import {
  listarHabilidades,
  crearHabilidad,
  eliminarHabilidad,
  actualizarHabilidad,
} from "./representanteService";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

export const HabilidadesForm = ({ fk_representante, Swal, onChange }) => {
  const SwalUsed = Swal ?? SwalDefault;
  const [habilidades, setHabilidades] = useState([]);
  const [nuevo, setNuevo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const cargar = async () => {
    if (!fk_representante) return setHabilidades([]);
    const h = await listarHabilidades(fk_representante, SwalUsed);
    setHabilidades(h || []);
    onChange?.(h || []);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fk_representante]);

  const agregar = async () => {
    if (!nuevo.trim())
      return SwalUsed.fire(
        "Error",
        "Ingrese un nombre para la habilidad",
        "error"
      );
    const res = await crearHabilidad(
      { fk_representante, nombre_habilidad: nuevo.trim() },
      SwalUsed
    );
    if (res) {
      setNuevo("");
      cargar();
      console.log("[Habilidades] Habilidad creada:", res);
    }
  };

  const quitar = async (id) => {
    const confirm = await SwalUsed.fire({
      title: "Confirmar",
      text: "¿Eliminar habilidad?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    const ok = await eliminarHabilidad(id, SwalUsed);
    if (ok) cargar();
    if (ok) console.log("[Habilidades] Habilidad eliminada id:", id);
  };

  const iniciarEdicion = (h) => {
    setEditandoId(h.id_habilidad);
    setEditNombre(h.nombre_habilidad);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre("");
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) {
      SwalUsed.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    const ok = await actualizarHabilidad(
      editandoId,
      editNombre.trim(),
      SwalUsed
    );
    if (ok) {
      cancelarEdicion();
      cargar();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-blue-600 flex items-center justify-between">
        <span>Habilidades</span>
        <span className="text-xs text-gray-500 font-normal">
          {habilidades.length} registradas
        </span>
      </h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nueva habilidad"
        />
        <button
          onClick={agregar}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <FaPlus /> Agregar
        </button>
      </div>
      <div className="space-y-2">
        {habilidades.map((h) => (
          <div
            key={h.id_habilidad}
            className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition border border-gray-200 rounded-md px-3 py-2"
          >
            {editandoId === h.id_habilidad ? (
              <input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="border border-blue-300 rounded px-2 py-1 flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm font-medium text-gray-700 flex-1">
                {h.nombre_habilidad}
              </span>
            )}
            {editandoId === h.id_habilidad ? (
              <div className="flex gap-2">
                <button
                  onClick={guardarEdicion}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaSave /> Guardar
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="text-xs bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => iniciarEdicion(h)}
                  className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => quitar(h.id_habilidad)}
                  className="text-red-600 text-xs hover:underline flex items-center gap-1"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
        {habilidades.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Sin habilidades registradas aún.
          </div>
        )}
      </div>
    </div>
  );
};
