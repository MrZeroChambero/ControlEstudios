import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { FaPlus } from "react-icons/fa";
import { ComponentesAprendizajeTable } from "./ComponentesAprendizajeTable";
import { ComponentesAprendizajeModal } from "./ComponentesAprendizajeModal";
import { solicitudComponentesAprendizaje } from "./solicitudComponentesAprendizaje";
import { enviarComponenteAprendizaje } from "./EnviarComponentesAprendizaje";
import { eliminarComponenteAprendizaje } from "./eliminarComponentesAprendizaje";

export const ComponentesAprendizajes = () => {
  const [componentes, setComponentes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComponente, setCurrentComponente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({ nombre_componente: "" });

  const API_URL =
    "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje";

  const refetchData = useCallback(() => {
    solicitudComponentesAprendizaje({ setIsLoading, setComponentes });
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  const handleStatusChange = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cambiar el estado de este componente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch(
            `${API_URL}/${id}/estado`,
            {},
            { withCredentials: true }
          );
          if (response.data.back) {
            Swal.fire("¡Cambiado!", "El estado ha sido modificado.", "success");
            refetchData();
          } else {
            Swal.fire("Error", response.data.message, "error");
          }
        } catch (error) {
          console.error("Error al cambiar estado:", error);
          Swal.fire(
            "Error",
            "No se pudo cambiar el estado del componente.",
            "error"
          );
        }
      }
    });
  };

  const openModal = (componente = null, viewMode = false) => {
    setCurrentComponente(componente);
    setIsViewMode(viewMode);
    setFormData(
      componente
        ? { nombre_componente: componente.nombre_componente }
        : { nombre_componente: "" }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentComponente(null);
    setIsViewMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    enviarComponenteAprendizaje(
      formData,
      currentComponente,
      API_URL,
      refetchData,
      closeModal
    );
  };

  const handleDelete = (id) => {
    eliminarComponenteAprendizaje(id, API_URL, refetchData);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Gestión de Componentes de Aprendizaje
          </h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Crear Componente
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Aquí puedes gestionar los componentes de aprendizaje del sistema.
        </p>

        <ComponentesAprendizajeTable
          componentes={componentes}
          isLoading={isLoading}
          onEdit={(row) => openModal(row, false)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onView={(row) => openModal(row, true)}
        />
      </div>

      <ComponentesAprendizajeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentComponente={currentComponente}
        formData={formData}
        handleInputChange={handleInputChange}
        isViewMode={isViewMode}
      />
    </>
  );
};
