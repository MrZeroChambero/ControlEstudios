import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { AreasAprendizajeTable } from "./AreasAprendizajeTable";
import { AreasAprendizajeModal } from "./AreasAprendizajeModal";
import { solicitudAreasAprendizaje } from "./Solicitudes/solicitudAreasAprendizaje";
import { eliminarAreasAprendizaje } from "./Solicitudes/eliminarAreasAprendizaje";
import { EnviarAreasAprendizaje } from "./Solicitudes/EnviarAreasAprendizaje";
import { areasLayout } from "../EstilosCliente/EstilosClientes";

export const AreasAprendizajes = () => {
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear"); // 'crear', 'editar', 'ver'
  const [formData, setFormData] = useState({
    nombre_area: "",
  });
  const API_URL =
    "http://localhost:8080/controlestudios/servidor/areas_aprendizaje";

  // Cargar áreas al montar el componente
  useEffect(() => {
    solicitudAreasAprendizaje({ setIsLoading, setAreas });
  }, []);

  const cambioEstados = async (area) => {
    const estadoActual = area.estado_area === "activo" ? "activo" : "inactivo";
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    try {
      const response = await axios.patch(
        `${API_URL}/${area.id_area_aprendizaje}/estado`,
        {},
        { withCredentials: true }
      );

      if (response.data && response.data.exito === true) {
        Swal.fire("¡Éxito!", response.data.mensaje, "success");
        solicitudAreasAprendizaje({ setIsLoading, setAreas });
      } else {
        throw new Error(
          response.data?.mensaje || "El backend no respondió correctamente"
        );
      }
    } catch (error) {
      console.error(`Error al ${accion} el área:`, error);
      const errorData = error.response?.data;

      if (errorData && errorData.exito === false) {
        console.error(
          "Error del backend:",
          errorData.mensaje,
          errorData.errores
        );
        Swal.fire(
          "Error",
          errorData.mensaje || `No se pudo ${accion} el área.`,
          "error"
        );
      } else {
        Swal.fire("Error", `No se pudo ${accion} el área.`, "error");
      }
    }
  };

  const openModal = (area = null, modo = "crear") => {
    setCurrentArea(area);
    setModoModal(modo);
    if (area) {
      setFormData({
        nombre_area: area.nombre_area,
      });
    } else {
      setFormData({
        nombre_area: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentArea(null);
    setModoModal("crear");
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleView = (area) => {
    openModal(area, "ver");
  };

  const handleEdit = (area) => {
    openModal(area, "editar");
  };

  return (
    <>
      <div className={areasLayout.container}>
        <div className={areasLayout.header}>
          <h2 className={areasLayout.title}>Gestión de Áreas de Aprendizaje</h2>
          <button onClick={() => openModal()} className={areasLayout.addButton}>
            <FaPlus className="h-4 w-4" />
            <span>Agregar Área</span>
          </button>
        </div>
        <p className={areasLayout.description}>
          Aquí puedes crear, ver, actualizar y eliminar las áreas de aprendizaje
          del sistema.
        </p>

        <AreasAprendizajeTable
          areas={areas}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={(id) =>
            eliminarAreasAprendizaje({
              id,
              Swal,
              axios,
              solicitudAreasAprendizaje,
              API_URL,
              setIsLoading,
              setAreas,
            })
          }
          cambioEstados={cambioEstados}
          onView={handleView}
        />
      </div>

      <AreasAprendizajeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={(e) =>
          EnviarAreasAprendizaje({
            e,
            formData,
            currentArea,
            closeModal,
            API_URL,
            Swal,
            axios,
            solicitudAreasAprendizaje,
            setIsLoading,
            setAreas,
          })
        }
        currentArea={currentArea}
        formData={formData}
        datosFormulario={datosFormulario}
        modo={modoModal}
      />
    </>
  );
};
