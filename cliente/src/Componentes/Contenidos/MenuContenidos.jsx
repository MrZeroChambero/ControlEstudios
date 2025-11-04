import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { ContenidosTable } from "./ContenidosTable";
import { ContenidosModal } from "./ContenidosModal";
import { TemasModal } from "./TemasModal";
import {
  solicitarContenidos,
  solicitarAreas,
  solicitarTemasPorContenido,
  eliminarContenido,
  enviarContenido,
  cambioEstadoContenido,
} from "./contenidosService";

export const MenuContenidos = () => {
  const [contenidos, setContenidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemasModalOpen, setIsTemasModalOpen] = useState(false);
  const [currentContenido, setCurrentContenido] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear");
  const [formData, setFormData] = useState({
    nombre: "",
    fk_area_aprendizaje: "",
    nivel: "",
    descripcion: "",
    orden_contenido: 1,
  });
  const [areas, setAreas] = useState([]);
  const [temasContenido, setTemasContenido] = useState([]);

  // Cargar contenidos y áreas al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await solicitarContenidos(setContenidos, setIsLoading, Swal);
    await solicitarAreas(setAreas, Swal);
  };

  const cambioEstados = async (contenido) => {
    const nuevoEstado = contenido.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este contenido?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cambioEstadoContenido(
            contenido.id_contenido,
            cargarDatos,
            Swal
          );
        } catch (error) {
          console.error(`Error al ${accion} el contenido:`, error);
          Swal.fire("Error", `No se pudo ${accion} el contenido.`, "error");
        }
      }
    });
  };

  const openModal = (contenido = null, modo = "crear") => {
    setCurrentContenido(contenido);
    setModoModal(modo);
    if (contenido) {
      setFormData({
        nombre: contenido.nombre,
        fk_area_aprendizaje: contenido.fk_area_aprendizaje,
        nivel: contenido.nivel,
        descripcion: contenido.descripcion || "",
        orden_contenido: contenido.orden_contenido || 1,
      });
    } else {
      setFormData({
        nombre: "",
        fk_area_aprendizaje: "",
        nivel: "",
        descripcion: "",
        orden_contenido: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContenido(null);
    setModoModal("crear");
  };

  const openTemasModal = async (contenido) => {
    try {
      setCurrentContenido(contenido);
      const temas = await solicitarTemasPorContenido(
        contenido.id_contenido,
        Swal
      );
      setTemasContenido(temas);
      setIsTemasModalOpen(true);
    } catch (error) {
      console.error("Error al cargar temas:", error);
      Swal.fire(
        "Error",
        error.message || "No se pudieron cargar los temas.",
        "error"
      );
    }
  };

  const closeTemasModal = () => {
    setIsTemasModalOpen(false);
    setCurrentContenido(null);
    setTemasContenido([]);
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleView = (contenido) => {
    openModal(contenido, "ver");
  };

  const handleEdit = (contenido) => {
    openModal(contenido, "editar");
  };

  const handleDelete = (id) => {
    eliminarContenido(id, cargarDatos, Swal);
  };

  const handleSubmit = (e) => {
    enviarContenido(
      e,
      formData,
      currentContenido,
      closeModal,
      cargarDatos,
      Swal
    );
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Contenidos</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Contenido
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Aquí puedes crear, ver, actualizar y eliminar los contenidos del
          sistema. Cada contenido puede tener múltiples temas asociados.
        </p>

        <ContenidosTable
          contenidos={contenidos}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cambioEstados={cambioEstados}
          onView={handleView}
          onViewTemas={openTemasModal}
        />
      </div>

      <ContenidosModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentContenido={currentContenido}
        formData={formData}
        areas={areas}
        datosFormulario={datosFormulario}
        modo={modoModal}
      />

      <TemasModal
        isOpen={isTemasModalOpen}
        onClose={closeTemasModal}
        contenido={currentContenido}
        temas={temasContenido}
      />
    </>
  );
};
