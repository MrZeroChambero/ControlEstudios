import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { EstudiantesTable } from "./EstudiantesTable";
import { EstudianteModal } from "./EstudianteModal";
import { EstudianteViewModal } from "./EstudianteViewModal";
import {
  solicitarEstudiantes,
  obtenerEstudianteCompleto,
  cambioEstadoEstudiante,
} from "./estudianteService";

export const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentEstudiante, setCurrentEstudiante] = useState(null);
  const [estudianteCompleto, setEstudianteCompleto] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await solicitarEstudiantes(setEstudiantes, setIsLoading, Swal);
  };

  const cambioEstados = async (est) => {
    const estadoActual = est.estado_persona;
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este estudiante?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await cambioEstadoEstudiante(
          est.id_estudiante ?? est.id,
          cargarDatos,
          Swal
        );
      }
    });
  };

  const openModal = (est = null) => {
    setCurrentEstudiante(est);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEstudiante(null);
  };

  const openViewModal = async (est) => {
    setIsLoading(true);
    try {
      const data = await obtenerEstudianteCompleto(
        est.id_estudiante ?? est.id,
        Swal
      );
      setEstudianteCompleto(data);
      setIsViewModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setEstudianteCompleto(null);
  };

  const handleView = (est) => openViewModal(est);
  const handleEdit = (est) => openModal(est);

  const handleSuccess = () => {
    cargarDatos();
    closeModal();
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Estudiantes</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Estudiante
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Crea, visualiza, actualiza y gestiona documentos y salud del
          estudiante.
        </p>

        <EstudiantesTable
          estudiantes={estudiantes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={null}
          cambioEstados={cambioEstados}
          onView={handleView}
        />
      </div>

      <EstudianteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        currentEstudiante={currentEstudiante}
      />

      <EstudianteViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        estudiante={estudianteCompleto}
      />
    </>
  );
};
