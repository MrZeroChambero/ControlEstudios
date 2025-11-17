import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { EvaluacionesTable } from "./EvaluacionesTable";
import { EvaluacionesModal } from "./EvaluacionesModal";
import {
  solicitarEvaluaciones,
  eliminarEvaluacion,
  enviarEvaluacion,
  cambioEstadoEvaluacion,
} from "./evaluacionesService";

export const Evaluaciones = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvaluacion, setCurrentEvaluacion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear");
  const [formData, setFormData] = useState({
    nombre_evaluacion: "",
    descripcion: "",
  });

  // Cargar evaluaciones al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await solicitarEvaluaciones(setEvaluaciones, setIsLoading, Swal);
  };

  const cambioEstados = async (evaluacion) => {
    const nuevoEstado = evaluacion.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} esta evaluación?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cambioEstadoEvaluacion(
            evaluacion.id_evaluacion,
            cargarDatos,
            Swal
          );
        } catch (error) {
          console.error(`Error al ${accion} la evaluación:`, error);
          Swal.fire("Error", `No se pudo ${accion} la evaluación.`, "error");
        }
      }
    });
  };

  const openModal = (evaluacion = null, modo = "crear") => {
    setCurrentEvaluacion(evaluacion);
    setModoModal(modo);
    if (evaluacion) {
      setFormData({
        nombre_evaluacion: evaluacion.nombre_evaluacion,
        descripcion: evaluacion.descripcion || "",
      });
    } else {
      setFormData({
        nombre_evaluacion: "",
        descripcion: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEvaluacion(null);
    setModoModal("crear");
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleView = (evaluacion) => {
    openModal(evaluacion, "ver");
  };

  const handleEdit = (evaluacion) => {
    openModal(evaluacion, "editar");
  };

  const handleDelete = (id) => {
    eliminarEvaluacion(id, cargarDatos, Swal);
  };

  const handleSubmit = (e) => {
    enviarEvaluacion(
      e,
      formData,
      currentEvaluacion,
      closeModal,
      cargarDatos,
      Swal
    );
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Evaluaciones</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Evaluación
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Aquí puedes crear, ver, actualizar y eliminar las evaluaciones del
          sistema.
        </p>

        <EvaluacionesTable
          evaluaciones={evaluaciones}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cambioEstados={cambioEstados}
          onView={handleView}
        />
      </div>

      {/* Modal para crear/editar evaluación */}
      <EvaluacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentEvaluacion={currentEvaluacion}
        formData={formData}
        datosFormulario={datosFormulario}
        modo={modoModal}
      />
    </>
  );
};
