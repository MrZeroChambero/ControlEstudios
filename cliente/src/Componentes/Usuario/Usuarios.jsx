import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { UsuariosTable } from "./UsuariosTable";
import { UsuariosModal } from "./UsuariosModal";
import { UsuariosViewModal } from "./UsuariosViewModal";
import {
  solicitarUsuarios,
  eliminarUsuario,
  enviarUsuario,
  cambioEstadoUsuario,
  solicitarPersonalParaSelect,
  obtenerUsuarioCompleto,
} from "./usuariosService";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [usuarioCompleto, setUsuarioCompleto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modoModal, setModoModal] = useState("crear");
  const [formData, setFormData] = useState({
    fk_personal: "",
    nombre_usuario: "",
    contrasena: "",
    rol: "",
  });
  const [personal, setPersonal] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await solicitarUsuarios(setUsuarios, setIsLoading, Swal);
    await solicitarPersonalParaSelect(setPersonal, Swal);
  };

  const cambioEstados = async (usuario) => {
    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este usuario?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cambioEstadoUsuario(usuario.id_usuario, cargarDatos, Swal);
        } catch (error) {
          console.error(`Error al ${accion} el usuario:`, error);
          Swal.fire("Error", `No se pudo ${accion} el usuario.`, "error");
        }
      }
    });
  };

  const openModal = (usuario = null, modo = "crear") => {
    setCurrentUsuario(usuario);
    setModoModal(modo);
    if (usuario) {
      setFormData({
        fk_personal: usuario.fk_personal,
        nombre_usuario: usuario.nombre_usuario,
        contrasena: "",
        rol: usuario.rol,
      });
    } else {
      setFormData({
        fk_personal: "",
        nombre_usuario: "",
        contrasena: "",
        rol: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUsuario(null);
    setModoModal("crear");
  };

  const openViewModal = async (usuario) => {
    setIsLoading(true);
    try {
      const usuarioCompleto = await obtenerUsuarioCompleto(
        usuario.id_usuario,
        Swal
      );
      setUsuarioCompleto(usuarioCompleto);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error al cargar información del usuario:", error);
      Swal.fire(
        "Error",
        "No se pudo cargar la información del usuario.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setUsuarioCompleto(null);
  };

  const datosFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleView = (usuario) => {
    openViewModal(usuario);
  };

  const handleEdit = (usuario) => {
    openModal(usuario, "editar");
  };

  const handleDelete = (id) => {
    eliminarUsuario(id, cargarDatos, Swal);
  };

  const handleSubmit = (e) => {
    enviarUsuario(e, formData, currentUsuario, closeModal, cargarDatos, Swal);
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

        <UsuariosTable
          usuarios={usuarios}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          cambioEstados={cambioEstados}
          onView={handleView}
        />
      </div>

      <UsuariosModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentUsuario={currentUsuario}
        formData={formData}
        datosFormulario={datosFormulario}
        personal={personal}
        modo={modoModal}
      />

      <UsuariosViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        usuario={usuarioCompleto}
      />
    </>
  );
};
