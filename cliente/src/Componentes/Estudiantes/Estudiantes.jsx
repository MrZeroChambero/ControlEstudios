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
import { contenidosIconClasses } from "../EstilosCliente/EstilosClientes";
import { estudiantesLayout } from "./estudiantesEstilos";

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

  const openCreateModal = () => {
    setCurrentEstudiante(null);
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
  const handleEdit = async (est) => {
    if (!est) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await obtenerEstudianteCompleto(
        est.id_estudiante ?? est.id,
        Swal
      );
      if (data) {
        setCurrentEstudiante(data);
        setIsModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    cargarDatos();
    closeModal();
  };

  return (
    <>
      <div className={estudiantesLayout.container}>
        <div className={estudiantesLayout.header}>
          <h2 className={estudiantesLayout.title}>Gestión de Estudiantes</h2>
          <button
            onClick={openCreateModal}
            className={estudiantesLayout.addButton}
          >
            <FaPlus className={contenidosIconClasses.base} />
            <span>Agregar Estudiante</span>
          </button>
        </div>
        <p className={estudiantesLayout.description}>
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
