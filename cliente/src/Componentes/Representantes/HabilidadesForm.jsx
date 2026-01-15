import React, { useEffect, useMemo, useState } from "react";
import SwalDefault from "sweetalert2";
import {
  listarHabilidades,
  crearHabilidad,
  eliminarHabilidad,
  actualizarHabilidad,
} from "./representanteService";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { habilidadesFormClasses } from "./representantesEstilos";

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
  const clases = habilidadesFormClasses;

  return (
    <div className={clases.container}>
      <header className={clases.header}>
        <div>
          <h3 className={clases.title}>Habilidades</h3>
          <p className={clases.description}>
            Registre y edite las habilidades asociadas al representante.
          </p>
        </div>
        <span className={clases.counter}>
          {total} {total === 1 ? "registrada" : "registradas"}
        </span>
      </header>

      <div className={clases.formRow}>
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          className={clases.input}
          placeholder="Nueva habilidad"
        />
        <button type="button" onClick={agregar} className={clases.addButton}>
          <FaPlus className="h-4 w-4" />
          <span>Agregar</span>
        </button>
      </div>

      <div className={clases.list}>
        {habilidades.map((h) => {
          const enEdicion = editandoId === h.id_habilidad;
          return (
            <div key={h.id_habilidad} className={clases.item}>
              {enEdicion ? (
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className={clases.editInput}
                  autoFocus
                />
              ) : (
                <span className={clases.itemName}>{h.nombre_habilidad}</span>
              )}

              {enEdicion ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={guardarEdicion}
                    className={clases.inlinePrimary}
                  >
                    <FaSave className="h-3.5 w-3.5" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className={clases.inlineGhost}
                  >
                    <FaTimes className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className={clases.actionGroup}>
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(h)}
                    className={`${clases.actionButton} ${clases.editButton}`}
                    title="Editar habilidad"
                  >
                    <FaEdit className={clases.icon} />
                  </button>
                  <button
                    type="button"
                    onClick={() => quitar(h.id_habilidad)}
                    className={`${clases.actionButton} ${clases.deleteButton}`}
                    title="Eliminar habilidad"
                  >
                    <FaTrash className={clases.icon} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {habilidades.length === 0 && (
          <p className={clases.helperText}>Sin habilidades registradas aún.</p>
        )}
      </div>
    </div>
  );
};
