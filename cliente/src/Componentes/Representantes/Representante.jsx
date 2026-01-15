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
import { representantesLayout } from "../EstilosCliente/EstilosClientes";
import { representantesGestionClasses } from "./representantesEstilos";

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

  const layout = representantesLayout;
  const gestionClasses = representantesGestionClasses;

  return (
    <section className={gestionClasses.page}>
      <div className={layout.container}>
        <header className={layout.header}>
          <div>
            <h2 className={layout.title}>Gestión de Representantes</h2>
            <p className={layout.description}>
              Administra los representantes registrados, visualiza su
              información y gestiona habilidades asociadas.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className={layout.addButton}
            type="button"
          >
            <FaPlus className="h-4 w-4" />
            <span>Nuevo representante</span>
          </button>
        </header>

        <div className={gestionClasses.infoCard}>
          <p className={gestionClasses.infoText}>
            Puedes agregar habilidades una vez creado el representante. Usa los
            controles de la tabla para ver, editar o ajustar el estado.
          </p>
        </div>

        <RepresentanteTable
          representantes={representantes}
          isLoading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleEstado={handleToggleEstado}
        />
      </div>

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
    </section>
  );
};

export default Representante;
