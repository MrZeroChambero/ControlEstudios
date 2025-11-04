import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { FaPlus } from "react-icons/fa";
import { AreasAprendizajeTable } from "./AreasAprendizajeTable";
import { AreasAprendizajeModal } from "./AreasAprendizajeModal";
import { solicitudAreasAprendizaje } from "./Solicitudes/solicitudAreasAprendizaje";
import { eliminarAreasAprendizaje } from "./Solicitudes/eliminarAreasAprendizaje";
import { EnviarAreasAprendizaje } from "./Solicitudes/EnviarAreasAprendizaje";

export const AreasAprendizajes = () => {
  return <MenuPrincipal Formulario={MenuAreasAprendizajes} />;
};

const MenuAreasAprendizajes = () => {
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear"); // 'crear', 'editar', 'ver'
  const [formData, setFormData] = useState({
    nombre_area: "",
    fk_componente: "",
    fk_funcion: "",
  });
  const [componentes, setComponentes] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const API_URL =
    "http://localhost:8080/controlestudios/servidor/areas_aprendizaje";

  // Cargar áreas, componentes y funciones al montar el componente
  useEffect(() => {
    solicitudAreasAprendizaje({ setIsLoading, setAreas });
    solicitudComponentes();
    solicitudFunciones();
  }, []);

  const solicitudComponentes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje/listar-select",
        { withCredentials: true }
      );

      if (response.data && response.data.back === true) {
        setComponentes(response.data.data);
      } else {
        console.error("Backend no respondió para componentes:", response.data);
        Swal.fire("Error", "No se pudieron cargar los componentes.", "error");
      }
    } catch (error) {
      console.error("Error al obtener componentes:", error);
      const errorData = error.response?.data;
      if (errorData && errorData.back === false) {
        console.error(
          "Error del backend:",
          errorData.message,
          errorData.error_details
        );
        Swal.fire(
          "Error",
          errorData.message || "No se pudieron cargar los componentes.",
          "error"
        );
      } else {
        Swal.fire("Error", "No se pudieron cargar los componentes.", "error");
      }
    }
  };

  const solicitudFunciones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/controlestudios/servidor/funcion_personal/listar-select",
        { withCredentials: true }
      );

      if (response.data && response.data.back === true) {
        setFunciones(response.data.data);
      } else {
        console.error("Backend no respondió para funciones:", response.data);
        Swal.fire("Error", "No se pudieron cargar las funciones.", "error");
      }
    } catch (error) {
      console.error("Error al obtener funciones:", error);
      const errorData = error.response?.data;
      if (errorData && errorData.back === false) {
        console.error(
          "Error del backend:",
          errorData.message,
          errorData.error_details
        );
        Swal.fire(
          "Error",
          errorData.message || "No se pudieron cargar las funciones.",
          "error"
        );
      } else {
        Swal.fire("Error", "No se pudieron cargar las funciones.", "error");
      }
    }
  };

  const cambioEstados = async (area) => {
    const nuevoEstado = area.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    try {
      const response = await axios.patch(
        `${API_URL}/${area.id_area_aprendizaje}/estado`,
        {},
        { withCredentials: true }
      );

      if (response.data && response.data.back === true) {
        Swal.fire("¡Éxito!", `Área ${accion}da correctamente.`, "success");
        solicitudAreasAprendizaje({ setIsLoading, setAreas });
      } else {
        throw new Error("El backend no respondió correctamente");
      }
    } catch (error) {
      console.error(`Error al ${accion} el área:`, error);
      const errorData = error.response?.data;

      if (errorData && errorData.back === false) {
        console.error(
          "Error del backend:",
          errorData.message,
          errorData.error_details
        );
        Swal.fire(
          "Error",
          errorData.message || `No se pudo ${accion} el área.`,
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
        fk_componente: area.fk_componente,
        fk_funcion: area.fk_funcion,
      });
    } else {
      setFormData({
        nombre_area: "",
        fk_componente: "",
        fk_funcion: "",
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Gestión de Áreas de Aprendizaje
          </h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Área
          </button>
        </div>
        <p className="text-gray-600 mb-6">
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
        componentes={componentes}
        funciones={funciones}
        datosFormulario={datosFormulario}
        modo={modoModal}
      />
    </>
  );
};
