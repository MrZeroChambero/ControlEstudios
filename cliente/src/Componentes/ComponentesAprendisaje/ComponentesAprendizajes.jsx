import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { ComponentesAprendizajeTable } from "./ComponentesAprendizajeTable";
import { ComponentesAprendizajeModal } from "./ComponentesAprendizajeModal";
import { solicitudComponentesAprendizaje } from "./solicitudComponentesAprendizaje";
import { solicitudAreasComponentes } from "./solicitudAreasComponentes";
import { enviarComponenteAprendizaje } from "./EnviarComponentesAprendizaje";
import { eliminarComponenteAprendizaje } from "./eliminarComponentesAprendizaje";
import { layoutClasses, iconClasses } from "./componentesAprendizajeStyles";

const defaultFormulario = {
  fk_area: "",
  nombre_componente: "",
  especialista: "",
  evalua: "no",
  estado_componente: "activo",
};

const formatearErrores = (errores) => {
  if (!errores) {
    return "No se pudo completar la operación.";
  }

  return Object.values(errores)
    .flat()
    .map((mensaje) => `• ${mensaje}`)
    .join("\n");
};

export const ComponentesAprendizajes = () => {
  const [componentes, setComponentes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComponente, setCurrentComponente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState(() => ({ ...defaultFormulario }));

  const API_URL =
    "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje";

  const refetchData = useCallback(() => {
    solicitudComponentesAprendizaje({ setIsLoading, setComponentes, Swal });
  }, []);

  useEffect(() => {
    refetchData();
    solicitudAreasComponentes({ setAreas, Swal });
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

          if (response.data?.exito) {
            Swal.fire(
              "¡Actualizado!",
              response.data.mensaje || "El estado ha sido modificado.",
              "success"
            );
            refetchData();
          } else {
            const detalle =
              formatearErrores(response.data?.errores) ||
              response.data?.mensaje ||
              "No se pudo cambiar el estado del componente.";
            Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
          }
        } catch (error) {
          console.error("Error al cambiar estado:", error);
          const respuesta = error.response?.data;
          const detalle =
            formatearErrores(respuesta?.errores) ||
            respuesta?.mensaje ||
            "No se pudo cambiar el estado del componente.";
          Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
        }
      }
    });
  };

  const openModal = (componente = null, viewMode = false) => {
    setCurrentComponente(componente);
    setIsViewMode(viewMode);
    setFormData(
      componente
        ? {
            fk_area: componente.fk_area ? String(componente.fk_area) : "",
            nombre_componente: componente.nombre_componente ?? "",
            especialista: componente.especialista ?? "",
            evalua: componente.evalua ?? "no",
            estado_componente: componente.estado_componente ?? "activo",
          }
        : { ...defaultFormulario }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentComponente(null);
    setIsViewMode(false);
    setFormData({ ...defaultFormulario });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;
    enviarComponenteAprendizaje({
      formData,
      currentComponente,
      API_URL,
      refetchData,
      closeModal,
      Swal,
    });
  };

  const handleDelete = (id) => {
    eliminarComponenteAprendizaje({ id, API_URL, refetchData, Swal });
  };

  return (
    <>
      <div className={layoutClasses.container}>
        <div className={layoutClasses.header}>
          <h2 className={layoutClasses.title}>
            Gestión de Componentes de Aprendizaje
          </h2>
          <button
            onClick={() => openModal()}
            className={layoutClasses.addButton}
          >
            <FaPlus className={iconClasses.base} />
            <span>Crear componente</span>
          </button>
        </div>
        <p className={layoutClasses.description}>
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
        areas={areas}
      />
    </>
  );
};
