import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { PersonaTable } from "./PersonaTable";
import { PersonaModal } from "./PersonaModal";

export const Personas = () => {
  return <MenuPrincipal Formulario={MenuPersonas} />;
};

const initialFormData = {
  primer_nombre: "",
  segundo_nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  fecha_nacimiento: "",
  genero: "M",
  cedula: "",
  nacionalidad: "Venezolana",
  direccion: "",
  telefono_principal: "",
  telefono_secundario: "",
  email: "",
  tipo_persona: "",
};

const MenuPersonas = () => {
  const [personas, setPersonas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const API_URL = "http://localhost:8080/controlestudios/servidor/personas";

  useEffect(() => {
    solicitudPersonas();
  }, []);

  const solicitudPersonas = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, { withCredentials: true });
      console.log("se cargaron los datos de personas");
      if (response.data.back === undefined) {
        Swal.fire("Error", "No se pudieron cargar las personas.", "error");
        setPersonas([]);
        return;
      }
      setPersonas(response.data.data);
    } catch (error) {
      console.error("Error al obtener personas:", error);
      Swal.fire("Error", "No se pudieron cargar las personas.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (data) => {
    const newErrors = {};
    if (!data.primer_nombre.trim())
      newErrors.primer_nombre = "El primer nombre es obligatorio.";
    if (!data.primer_apellido.trim())
      newErrors.primer_apellido = "El primer apellido es obligatorio.";
    if (!data.fecha_nacimiento)
      newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria.";
    if (!data.telefono_principal.trim()) {
      newErrors.telefono_principal = "El teléfono principal es obligatorio.";
    } else if (!/^[0-9]*$/.test(data.telefono_principal)) {
      newErrors.telefono_principal = "El teléfono solo debe contener números.";
    }
    if (
      data.telefono_secundario &&
      !/^[0-9]*$/.test(data.telefono_secundario)
    ) {
      newErrors.telefono_secundario =
        "El teléfono secundario solo debe contener números.";
    }
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      newErrors.email = "El formato del email no es válido.";
    if (data.cedula && !/^[0-9]*$/.test(data.cedula))
      newErrors.cedula = "La cédula solo debe contener números.";
    if (!data.nacionalidad.trim())
      newErrors.nacionalidad = "La nacionalidad es obligatoria.";
    if (!data.direccion.trim())
      newErrors.direccion = "La dirección es obligatoria.";

    return newErrors;
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Si el campo es un teléfono o la cédula, solo permitir números
    if (
      name === "telefono_principal" ||
      name === "telefono_secundario" ||
      name === "cedula"
    ) {
      value = value.replace(/[^0-9]/g, "");
    }

    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    // Validar en tiempo real y limpiar el error del campo actual si es válido
    setErrors(validate(newFormData));
  };

  const openModal = (persona = null) => {
    setCurrentPersona(persona);
    if (persona) {
      // Formatear la fecha para el input type="date"
      const fechaNacimiento = persona.fecha_nacimiento
        ? persona.fecha_nacimiento.split(" ")[0]
        : "";
      setFormData({
        ...initialFormData,
        ...persona,
        fecha_nacimiento: fechaNacimiento,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({}); // Limpiar errores al abrir el modal
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPersona(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Swal.fire(
        "Error de Validación",
        "Por favor, corrige los errores marcados en el formulario.",
        "error"
      );
      return;
    }

    try {
      let response;
      if (currentPersona) {
        response = await axios.put(
          `${API_URL}/${currentPersona.id_persona}`,
          formData,
          { withCredentials: true }
        );
        Swal.fire("¡Actualizado!", response.data.message, "success");
      } else {
        response = await axios.post(API_URL, formData, {
          withCredentials: true,
        });
        Swal.fire("¡Creado!", response.data.message, "success");
      }
      solicitudPersonas();
      closeModal();
    } catch (error) {
      console.error("Error al guardar persona:", error);
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
          Swal.fire("¡Borrado!", "La persona ha sido eliminada.", "success");
          solicitudPersonas();
        } catch (error) {
          console.error("Error al eliminar persona:", error);
          Swal.fire("Error", "No se pudo eliminar la persona.", "error");
        }
      }
    });
  };

  const cambioEstados = async (persona) => {
    const nuevoEstado = persona.estado === "activo" ? "inactivo" : "activo";
    try {
      const response = await axios.put(
        `${API_URL}/estado/${persona.id_persona}`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );
      Swal.fire("¡Estado cambiado!", response.data.message, "success");
      solicitudPersonas(); // Recargar la lista de personas
    } catch (error) {
      console.error("Error al cambiar el estado de la persona:", error);
      const errorMsg =
        error.response?.data?.message || "Ocurrió un error al cambiar el estado.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Personas</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Agregar Persona
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Administra los registros de todas las personas en el sistema.
        </p>

        <PersonaTable
          personas={personas}
          isLoading={isLoading}
          onEdit={openModal}
          onDelete={handleDelete}
          cambioEstados={cambioEstados}
        />
      </div>

      <PersonaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentPersona={currentPersona}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
      />
    </>
  );
};
