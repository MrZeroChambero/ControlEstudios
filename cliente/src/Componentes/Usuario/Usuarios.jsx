import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { UsuarioTable } from "./UsuarioTable";
import { UsuarioModal } from "./UsuarioModal";

export const Usuarios = () => {
  return <MenuPrincipal Formulario={MenuUsuarios} />;
};

const MenuUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_persona: "",
    nombre_usuario: "",
    contrasena: "",
    rol: "Docente", // Valor por defecto
  });
  const API_URL = "http://localhost:8080/controlestudios/servidor/usuarios";

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, { withCredentials: true });
      setUsuarios(response.data.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModal = (usuario = null) => {
    setCurrentUser(usuario);
    if (usuario) {
      setFormData({
        id_persona: usuario.id_persona,
        nombre_usuario: usuario.nombre_usuario,
        contrasena: "", // La contraseña no se carga por seguridad
        rol: usuario.rol,
      });
    } else {
      setFormData({
        id_persona: "",
        nombre_usuario: "",
        contrasena: "",
        rol: "Docente",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    // No enviar la contraseña si está vacía en modo edición
    if (currentUser && !dataToSend.contrasena) {
      delete dataToSend.contrasena;
    }

    try {
      let response;
      if (currentUser) {
        // Actualizar usuario
        response = await axios.put(
          `${API_URL}/${currentUser.id_usuario}`,
          dataToSend,
          { withCredentials: true }
        );
        Swal.fire("¡Actualizado!", response.data.message, "success");
      } else {
        // Crear usuario
        response = await axios.post(API_URL, dataToSend, {
          withCredentials: true,
        });
        Swal.fire("¡Creado!", response.data.message, "success");
      }
      fetchUsuarios();
      closeModal();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleDelete = (id) => {
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
          await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
          Swal.fire("¡Borrado!", "El usuario ha sido eliminado.", "success");
          fetchUsuarios();
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
          Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
        }
      }
    });
  };

  const toggleStatus = async (usuario) => {
    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    try {
      const dataToSend = { ...usuario, estado: nuevoEstado };
      // La API de PUT requiere todos los campos, así que los enviamos.
      // No enviamos la contraseña para no cambiarla.
      delete dataToSend.contrasena;

      await axios.put(`${API_URL}/${usuario.id_usuario}`, dataToSend, {
        withCredentials: true,
      });
      Swal.fire("¡Éxito!", `Usuario ${accion}do correctamente.`, "success");
      fetchUsuarios();
    } catch (error) {
      console.error(`Error al ${accion} el usuario:`, error);
      Swal.fire("Error", `No se pudo ${accion} el usuario.`, "error");
    }
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Usuario
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Aquí puedes crear, ver, actualizar y eliminar los usuarios del
          sistema.
        </p>

        <UsuarioTable
          usuarios={usuarios}
          isLoading={isLoading}
          onEdit={openModal}
          onDelete={handleDelete}
          onToggleStatus={toggleStatus}
        />
      </div>

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentUser={currentUser}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </>
  );
};
