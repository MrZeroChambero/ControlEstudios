import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import CrearEstudiante from "./CrearEstudiante";
import EstudianteTabla from "./EstudianteTabla";
import { estudiantesLayout } from "../EstilosCliente/EstilosClientes";

/**
 * Menú principal para estudiantes — sigue la estructura de Personas.jsx
 */

const API_URL = "http://localhost:8080/controlestudios/servidor/estudiantes";

export const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [isCargando, setIsCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estudianteActual, setEstudianteActual] = useState(null);

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setIsCargando(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      console.log(res.data);
      if (res.data?.back === undefined) {
        Swal.fire("Error", "No fue posible cargar los estudiantes.", "error");
        setEstudiantes([]);
        return;
      }
      setEstudiantes(res.data.estudiantes || []);
    } catch (err) {
      console.error("Error al obtener estudiantes:", err);
      console.error(err.response);
      Swal.fire("Error", "No fue posible cargar los estudiantes.", "error");
      setEstudiantes([]);
    } finally {
      setIsCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setEstudianteActual(null);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
  };

  const handleEliminar = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ¡bórralo!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
        Swal.fire("¡Borrado!", "El estudiante ha sido eliminado.", "success");
        cargarEstudiantes();
      } catch (err) {
        console.error("Error al eliminar estudiante:", err);
        Swal.fire("Error", "No se pudo eliminar el estudiante.", "error");
      }
    });
  };

  const handleEditar = (estudiante) => {
    setEstudianteActual(estudiante);
    setIsModalOpen(true);
  };

  const cambioEstados = async (estudiante) => {
    const nuevoEstado = estudiante.estado === "activo" ? "inactivo" : "activo";
    try {
      const response = await axios.put(
        `${API_URL}/estado/${estudiante.id_estudiante}`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );
      Swal.fire("¡Estado cambiado!", response.data.message, "success");
      cargarEstudiantes(); // Recargar la lista de estudiantes
    } catch (error) {
      console.error("Error al cambiar el estado del estudiante:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Ocurrió un error al cambiar el estado.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  return (
    <>
      <div className={estudiantesLayout.container}>
        <div className={estudiantesLayout.header}>
          <h2 className={estudiantesLayout.title}>Gestión de Estudiantes</h2>
          <button
            onClick={abrirModalCrear}
            className={estudiantesLayout.addButton}
          >
            <FaPlus className="h-4 w-4" />
            <span>Agregar Estudiante</span>
          </button>
        </div>
        <p className={estudiantesLayout.description}>
          Administra los registros de estudiantes en el sistema.
        </p>

        <EstudianteTabla
          estudiantes={estudiantes}
          isCargando={isCargando}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          cambioEstados={cambioEstados}
        />
      </div>

      {/* Usar CrearEstudiante como modal reutilizable */}
      <CrearEstudiante
        isOpen={isModalOpen}
        onClose={() => {
          cerrarModal();
          cargarEstudiantes();
        }}
        onCreated={() => {
          cargarEstudiantes();
        }}
        estudianteActual={estudianteActual}
      />
    </>
  );
};
