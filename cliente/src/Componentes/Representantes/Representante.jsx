import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import {
  solicitarRepresentantes,
  obtenerRepresentante,
  eliminarRepresentante,
  cambiarEstadoPersona,
} from "./representanteService";
import RepresentanteTable from "./RepresentanteTable";
import { RepresentanteModal } from "./RepresentanteModal";
import RepresentanteViewModal from "./RepresentanteViewModal";

export const Representante = () => {
  const [representantes, setRepresentantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const cargar = async () => {
    await solicitarRepresentantes(setRepresentantes, setLoading, Swal);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCreate = () => {
    setCurrent(null);
    setModalOpen(true);
    console.log("[Representantes] Abrir creación de representante");
  };

  const handleEdit = async (r) => {
    console.log(
      "[Representantes] Preparando edición completa id:",
      r.id_representante
    );
    const full = await obtenerRepresentante(r.id_representante, Swal);
    if (full) {
      setCurrent(full);
      setModalOpen(true);
      console.log(
        "[Representantes] Modal edición abierto con datos completos id:",
        r.id_representante
      );
    }
  };

  const handleView = async (r) => {
    console.log(
      "[Representantes] Cargando vista representante id:",
      r.id_representante
    );
    const full = await obtenerRepresentante(r.id_representante, Swal);
    if (full) {
      setCurrent(full);
      setViewOpen(true);
      console.log(
        "[Representantes] Abriendo modal de vista id:",
        r.id_representante
      );
    }
  };

  const handleDelete = (r) => {
    console.log(
      "[Representantes] Solicitar confirmación eliminación id:",
      r.id_representante
    );
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el representante.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const ok = await eliminarRepresentante(r.id_representante, Swal);
        if (ok) {
          Swal.fire("Eliminado", "Representante eliminado", "success");
          console.log("[Representantes] Eliminado id:", r.id_representante);
          cargar();
        }
      }
    });
  };

  const handleToggleEstado = async (r) => {
    const idPersona = r.fk_persona || r.id_persona;
    if (!idPersona) return;
    const estadoActual =
      r.estado || r.estado_persona || r.estado_persona_nombre;
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    const ok = await cambiarEstadoPersona(idPersona, nuevoEstado, Swal);
    if (ok) {
      Swal.fire("Estado actualizado", `Ahora está ${nuevoEstado}`, "success");
      cargar();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Representantes</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Nuevo Representante
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Crea, visualiza, actualiza y elimina representantes. Puedes asociar
        habilidades después de crear.
      </p>

      <RepresentanteTable
        representantes={representantes}
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEstado={handleToggleEstado}
      />

      <RepresentanteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrent(null);
        }}
        onSaved={() => {
          cargar();
          setModalOpen(false);
          setCurrent(null);
        }}
        current={modalOpen ? current : null}
      />
      <RepresentanteViewModal
        isOpen={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setCurrent(null);
        }}
        representante={viewOpen ? current : null}
      />
    </div>
  );
};

export default Representante;
