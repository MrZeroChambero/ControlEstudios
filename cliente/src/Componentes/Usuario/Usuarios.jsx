import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { FaPlus } from "react-icons/fa";
import { UsuarioTable } from "./UsuarioTable";
import { UsuarioModal } from "./UsuarioModal";
import { solicitudUsuarios } from "./Solicitudes/solicitudUsuarios";
import { solicitudPersonas } from "./Solicitudes/solicitudPersonas";
import { Enviar } from "./Solicitudes/Enviar";
import { eliminar } from "./Solicitudes/eliminar";

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
    rol: "", // Valor por defecto
  });
  const [personas, setPersonas] = useState([]);
  const API_URL = "http://localhost:8080/controlestudios/servidor/usuarios";

  // Cargar usuarios al montar el componente
  useEffect(() => {
    solicitudUsuarios({ setIsLoading, setUsuarios });
    solicitudPersonas({ setPersonas });
  }, []);
  const cambioEstados = async (usuario) => {
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
      solicitudUsuarios({ setIsLoading, setUsuarios });
    } catch (error) {
      console.error(`Error al ${accion} el usuario:`, error);
      Swal.fire("Error", `No se pudo ${accion} el usuario.`, "error");
    }
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
        rol: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
          onDelete={(id) =>
            eliminar({
              id,
              Swal,
              axios,
              solicitudUsuarios,
              API_URL,
              setIsLoading,
              setUsuarios,
            })
          }
          cambioEstados={cambioEstados}
        />
      </div>

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={(e) =>
          Enviar({
            e,
            formData,
            currentUser,
            closeModal,
            API_URL,
            Swal,
            axios,
            solicitudUsuarios,
            setIsLoading,
            setUsuarios,
          })
        }
        currentUser={currentUser}
        formData={formData}
        personas={personas}
        datosFormulario={datosFormulario}
      />
    </>
  );
};
