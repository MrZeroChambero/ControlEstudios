import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { PersonalTable } from "./PersonalTable";
import { PersonalModal } from "./PersonalModal";
import { PersonalViewModal } from "./PersonalViewModal";
import {
  solicitarPersonal,
  eliminarPersonal,
  cambioEstadoPersonal,
  obtenerPersonalCompleto,
} from "./personalService";

export const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPersonal, setCurrentPersonal] = useState(null);
  const [personalCompleto, setPersonalCompleto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await solicitarPersonal(setPersonal, setIsLoading, Swal);
  };

  const cambioEstados = async (personal) => {
    const nuevoEstado = personal.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este personal?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cambioEstadoPersonal(personal.id_personal, cargarDatos, Swal);
        } catch (error) {
          console.error(`Error al ${accion} el personal:`, error);
          Swal.fire("Error", `No se pudo ${accion} el personal.`, "error");
        }
      }
    });
  };

  const openModal = (personal = null) => {
    setCurrentPersonal(personal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPersonal(null);
  };

  const openViewModal = async (personal) => {
    setIsLoading(true);
    try {
      const personalCompleto = await obtenerPersonalCompleto(
        personal.id_personal,
        Swal
      );
      setPersonalCompleto(personalCompleto);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error al cargar información del personal:", error);
      Swal.fire(
        "Error",
        "No se pudo cargar la información del personal.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setPersonalCompleto(null);
  };

  const handleView = (personal) => {
    openViewModal(personal);
  };

  const handleEdit = (personal) => {
    openModal(personal);
  };

  const handleDelete = (id) => {
    eliminarPersonal(id, cargarDatos, Swal);
  };

  const handleSuccess = () => {
    cargarDatos();
    closeModal();
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Personal</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Personal
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Aquí puedes crear, ver, actualizar y eliminar el personal del sistema.
        </p>

        <PersonalTable
          personal={personal}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cambioEstados={cambioEstados}
          onView={handleView}
        />
      </div>

      <PersonalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        currentPersonal={currentPersonal}
      />

      <PersonalViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        personal={personalCompleto}
      />
    </>
  );
};
