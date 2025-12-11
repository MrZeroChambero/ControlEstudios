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
  obtenerPreguntasSeguridad,
} from "./usuariosService";
import { contenidosLayout } from "../EstilosCliente/EstilosClientes";

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
    confirmacion_contrasena: "",
    rol: "",
  });
  const [personal, setPersonal] = useState([]);
  const crearPreguntasIniciales = () => [
    { pregunta: "", respuesta: "", confirmacion: "" },
    { pregunta: "", respuesta: "", confirmacion: "" },
    { pregunta: "", respuesta: "", confirmacion: "" },
  ];
  const [preguntas, setPreguntas] = useState(crearPreguntasIniciales());

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

  const openModal = async (usuario = null, modo = "crear") => {
    setModoModal(modo);
    setCurrentUsuario(usuario);

    if (usuario) {
      setFormData({
        fk_personal: usuario.fk_personal,
        nombre_usuario: usuario.nombre_usuario,
        contrasena: "",
        confirmacion_contrasena: "",
        rol: usuario.rol,
      });

      setPersonal((prev) => {
        if (!Array.isArray(prev)) {
          return prev;
        }

        const existe = prev.some(
          (persona) =>
            String(persona.id_personal) === String(usuario.fk_personal)
        );

        if (existe) {
          return prev;
        }

        const nuevoRegistro = {
          id_personal: usuario.fk_personal,
          primer_nombre: usuario.primer_nombre ?? "",
          segundo_nombre: usuario.segundo_nombre ?? "",
          primer_apellido: usuario.primer_apellido ?? "",
          segundo_apellido: usuario.segundo_apellido ?? "",
          cedula: usuario.cedula ?? "",
          nombre_cargo: usuario.nombre_cargo ?? "",
          tipo_funcion: usuario.tipo_funcion ?? "",
        };

        return [...prev, nuevoRegistro];
      });

      try {
        const preguntasServidor = await obtenerPreguntasSeguridad(
          usuario.id_usuario,
          Swal
        );
        if (preguntasServidor.length > 0) {
          setPreguntas(
            preguntasServidor.map((item) => ({
              id: item.id,
              pregunta: item.pregunta ?? "",
              respuesta: "",
              confirmacion: "",
            }))
          );
        } else {
          setPreguntas(crearPreguntasIniciales());
        }
      } catch (error) {
        console.error("Error al cargar preguntas existentes:", error);
        setPreguntas(crearPreguntasIniciales());
      }
    } else {
      setFormData({
        fk_personal: "",
        nombre_usuario: "",
        contrasena: "",
        confirmacion_contrasena: "",
        rol: "",
      });
      setPreguntas(crearPreguntasIniciales());
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUsuario(null);
    setModoModal("crear");
    setFormData({
      fk_personal: "",
      nombre_usuario: "",
      contrasena: "",
      confirmacion_contrasena: "",
      rol: "",
    });
    setPreguntas(crearPreguntasIniciales());
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

  const actualizarPregunta = (indice, campo, valor) => {
    setPreguntas((prev) =>
      prev.map((item, idx) =>
        idx === indice ? { ...item, [campo]: valor } : item
      )
    );
  };

  const agregarPregunta = () => {
    setPreguntas((prev) => [
      ...prev,
      { pregunta: "", respuesta: "", confirmacion: "" },
    ]);
  };

  const eliminarPregunta = (indice) => {
    if (preguntas.length <= 3) {
      Swal.fire(
        "Aviso",
        "Cada usuario debe mantener al menos 3 preguntas de seguridad.",
        "warning"
      );
      return;
    }

    setPreguntas((prev) => prev.filter((_, idx) => idx !== indice));
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
    e.preventDefault();

    if (
      formData.contrasena &&
      formData.contrasena !== formData.confirmacion_contrasena
    ) {
      Swal.fire(
        "Contrasenas diferentes",
        "La confirmacion de la contrasena no coincide.",
        "warning"
      );
      return;
    }

    const preguntasPreparadas = preguntas.map((item) => ({
      id: item.id,
      pregunta: (item.pregunta || "").trim(),
      respuesta: (item.respuesta || "").trim(),
      confirmacion: (item.confirmacion || "").trim(),
    }));

    const preguntasCompletas = preguntasPreparadas.filter(
      (item) => item.pregunta !== "" && item.respuesta !== ""
    );

    if (preguntasCompletas.length < 3) {
      Swal.fire(
        "Faltan preguntas",
        "Debe registrar al menos 3 preguntas de seguridad completas (pregunta y respuesta).",
        "warning"
      );
      return;
    }

    const preguntasValidadas = [];
    for (const item of preguntasCompletas) {
      if (item.respuesta !== item.confirmacion) {
        Swal.fire(
          "Respuestas diferentes",
          "Cada respuesta debe coincidir con su confirmacion.",
          "warning"
        );
        return;
      }

      preguntasValidadas.push({
        id: item.id,
        pregunta: item.pregunta,
        respuesta: item.respuesta,
      });
    }

    enviarUsuario(
      e,
      formData,
      preguntasValidadas,
      currentUsuario,
      closeModal,
      cargarDatos,
      Swal
    );
  };

  return (
    <>
      <div className={contenidosLayout.container}>
        <div className={contenidosLayout.header}>
          <h2 className={contenidosLayout.title}>Gestión de Usuarios</h2>
          <button
            onClick={() => openModal()}
            className={contenidosLayout.addButton}
          >
            <FaPlus className="h-4 w-4" /> <span>Agregar Usuario</span>
          </button>
        </div>
        <p className={contenidosLayout.description}>
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
        preguntas={preguntas}
        onPreguntaChange={actualizarPregunta}
        onAgregarPregunta={agregarPregunta}
        onEliminarPregunta={eliminarPregunta}
      />

      <UsuariosViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        usuario={usuarioCompleto}
      />
    </>
  );
};
