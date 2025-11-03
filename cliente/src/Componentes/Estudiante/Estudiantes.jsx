import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import CrearEstudiante from "./CrearEstudiante";
import EstudianteTabla from "./EstudianteTabla";

/**
 * Menú principal para estudiantes — sigue la estructura de Personas.jsx
 */
export const Estudiantes = () => {
  return <MenuPrincipal Formulario={MenuPersonas} />;
};

const API_URL = "http://localhost:8080/controlestudios/servidor/estudiantes";

const MenuPersonas = () => {
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

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Estudiantes</h2>
          <button
            onClick={abrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Estudiante
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Administra los registros de estudiantes en el sistema.
        </p>

        <EstudianteTabla
          estudiantes={estudiantes}
          info={estudiantes.length}
          isCargando={isCargando}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
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

export default MenuPersonas;
