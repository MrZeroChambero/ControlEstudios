import React, { useEffect, useMemo, useState } from "react";
import SwalDefault from "sweetalert2";
import {
  listarHabilidades,
  crearHabilidad,
  eliminarHabilidad,
  actualizarHabilidad,
} from "./representanteService";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import {
  contenidosFormClasses,
  contenidosTableClasses,
  contenidosIconClasses,
  primaryButtonBase,
} from "../EstilosCliente/EstilosClientes";

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

  const total = useMemo(() => habilidades.length, [habilidades]);
  const formClasses = contenidosFormClasses;
  const tableClasses = contenidosTableClasses;
  const inlinePrimary = `${primaryButtonBase} bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300/60`;
  const inlineGhost = `${formClasses.ghostButton} px-3 py-1 text-xs`;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Habilidades</h3>
          <p className="text-xs text-slate-500">
            Registre y edite las habilidades asociadas al representante.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {total} {total === 1 ? "registrada" : "registradas"}
        </span>
      </header>

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          className={formClasses.input}
          placeholder="Nueva habilidad"
        />
        <button
          type="button"
          onClick={agregar}
          className={`${formClasses.primaryButton} md:w-auto`}
        >
          <FaPlus className="h-4 w-4" />
          <span>Agregar</span>
        </button>
      </div>

      <div className="space-y-3">
        {habilidades.map((h) => {
          const enEdicion = editandoId === h.id_habilidad;
          return (
            <div
              key={h.id_habilidad}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              {enEdicion ? (
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className={`${formClasses.input} md:flex-1`}
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {h.nombre_habilidad}
                </span>
              )}

              {enEdicion ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={guardarEdicion}
                    className={inlinePrimary}
                  >
                    <FaSave className="h-3.5 w-3.5" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className={inlineGhost}
                  >
                    <FaTimes className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className={tableClasses.actionGroup}>
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(h)}
                    className={`${tableClasses.actionButton} ${tableClasses.editButton}`}
                    title="Editar habilidad"
                  >
                    <FaEdit className={contenidosIconClasses.base} />
                  </button>
                  <button
                    type="button"
                    onClick={() => quitar(h.id_habilidad)}
                    className={`${tableClasses.actionButton} ${tableClasses.deleteButton}`}
                    title="Eliminar habilidad"
                  >
                    <FaTrash className={contenidosIconClasses.base} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {habilidades.length === 0 && (
          <p className={tableClasses.helperText}>
            Sin habilidades registradas aún.
          </p>
        )}
      </div>
    </div>
  );
};
