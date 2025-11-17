import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { ContenidosTable } from "./ContenidosTable";
import { ContenidosModal } from "./ContenidosModal";
import { TemasModal } from "./TemasModal";
import { TemaFormModal } from "./TemaFormModal";
import {
  solicitarContenidos,
  solicitarAreas,
  solicitarTemasPorContenido,
  eliminarContenido,
  enviarContenido,
  cambioEstadoContenido,
} from "./contenidosService";

// Importar servicios de temas
import {
  crearTema,
  actualizarTema,
  eliminarTema,
  cambioEstadoTema,
} from "./temasService";

export const Contenidos = () => {
  const [contenidos, setContenidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemasModalOpen, setIsTemasModalOpen] = useState(false);
  const [isTemaFormModalOpen, setIsTemaFormModalOpen] = useState(false);
  const [currentContenido, setCurrentContenido] = useState(null);
  const [currentTema, setCurrentTema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear");
  const [modoTemaModal, setModoTemaModal] = useState("crear");
  const [formData, setFormData] = useState({
    nombre: "",
    fk_area_aprendizaje: "",
    grado: "",
    descripcion: "",
  });
  const [temaFormData, setTemaFormData] = useState({
    nombre_tema: "",
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

  const cargarTemas = async (idContenido) => {
    try {
      const temas = await solicitarTemasPorContenido(idContenido, Swal);
      setTemasContenido(temas);
    } catch (error) {
      console.error("Error al cargar temas:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los temas del contenido.",
        "error"
      );
    }
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
        grado: contenido.grado,
        descripcion: contenido.descripcion || "",
      });
      // Si es modo "ver", cargar los temas del contenido
      if (modo === "ver") {
        cargarTemas(contenido.id_contenido);
      }
    } else {
      setFormData({
        nombre: "",
        fk_area_aprendizaje: "",
        grado: "",
        descripcion: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContenido(null);
    setModoModal("crear");
    setTemasContenido([]);
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

  const openTemaFormModal = (tema = null, modo = "crear") => {
    setCurrentTema(tema);
    setModoTemaModal(modo);
    if (tema) {
      setTemaFormData({
        nombre_tema: tema.nombre_tema,
      });
    } else {
      setTemaFormData({
        nombre_tema: "",
      });
    }
    setIsTemaFormModalOpen(true);
  };
  const closeTemaFormModal = () => {
    setIsTemaFormModalOpen(false);
    setCurrentTema(null);
    setModoTemaModal("crear");
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTemaFormChange = (e) => {
    const { name, value } = e.target;
    setTemaFormData({ ...temaFormData, [name]: value });
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

  // Funciones para gestión de temas
  const handleAgregarTema = () => {
    if (!currentContenido) return;
    openTemaFormModal(null, "crear");
  };

  const handleEditarTema = (tema) => {
    openTemaFormModal(tema, "editar");
  };

  const handleEliminarTema = async (tema) => {
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
      if (result.isConfirmed) {
        try {
          await eliminarTema(tema.id_tema, Swal);
          // Recargar la lista de temas
          await cargarTemas(currentContenido.id_contenido);
          Swal.fire("¡Borrado!", "El tema ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error al eliminar tema:", error);
          Swal.fire("Error", "No se pudo eliminar el tema.", "error");
        }
      }
    });
  };

  const handleCambiarEstadoTema = async (tema) => {
    const nuevoEstado = tema.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este tema?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cambioEstadoTema(tema.id_tema, Swal);
          // Recargar la lista de temas
          await cargarTemas(currentContenido.id_contenido);
          Swal.fire("¡Éxito!", `Tema ${accion}do correctamente.`, "success");
        } catch (error) {
          console.error(`Error al ${accion} el tema:`, error);
          Swal.fire("Error", `No se pudo ${accion} el tema.`, "error");
        }
      }
    });
  };

  const handleSubmitTema = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...temaFormData,
        fk_contenido: currentContenido.id_contenido,
      };

      if (modoTemaModal === "editar") {
        await actualizarTema(currentTema.id_tema, dataToSend, Swal);
      } else {
        await crearTema(dataToSend, Swal);
      }

      // Recargar la lista de temas
      await cargarTemas(currentContenido.id_contenido);
      closeTemaFormModal();
    } catch (error) {
      console.error("Error al guardar tema:", error);
      // El manejo de errores se hace en el servicio
    }
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

      {/* Modal para crear/editar contenido */}
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

      {/* Modal para ver todos los temas (vista general) */}
      <TemasModal
        isOpen={isTemasModalOpen}
        onClose={closeTemasModal}
        contenido={currentContenido}
        temas={temasContenido}
        onAgregarTema={handleAgregarTema}
        onEditarTema={handleEditarTema}
        onEliminarTema={handleEliminarTema}
        onCambiarEstadoTema={handleCambiarEstadoTema}
      />

      {/* Modal para crear/editar temas */}
      <TemaFormModal
        isOpen={isTemaFormModalOpen}
        onClose={closeTemaFormModal}
        onSubmit={handleSubmitTema}
        currentTema={currentTema}
        formData={temaFormData}
        onChange={handleTemaFormChange}
        modo={modoTemaModal}
      />
    </>
  );
};
