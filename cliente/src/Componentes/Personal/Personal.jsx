import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MenuPrincipal } from "../Dashboard/MenuPrincipal";
import { FaPlus } from "react-icons/fa";
import { PersonalTable } from "./PersonalTable";
import { PersonalModal } from "./PersonalModal";
import { solicitudPersonas } from "../Usuario/Solicitudes/solicitudPersonas"; // reutilizar

export const Personal = () => {
  return <MenuPrincipal Formulario={MenuPersonal} />;
};

const API_URL = "http://localhost:8080/controlestudios/servidor/personal";

const MenuPersonal = () => {
  const [items, setItems] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [planteles, setPlanteles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_persona: "",
    funcion: "",
    fecha_contratacion: "",
    nivel_academico: "",
    horas_trabajo: "",
    rif: "",
    etnia_religion: "",
    cantidad_hijas: "",
    cantidad_hijos_varones: "",
    fk_plantel: "",
    plantel_personal_estado: "",
  });

  const cargar = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL, { withCredentials: true });
      if (res.data.back === undefined) {
        Swal.fire("Error", "No se pudieron cargar los registros.", "error");
        console.log(res);
        setItems([]);
        return;
      }
      console.log("se cargaron los datos de personal");
      console.log(res);
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    solicitudPersonas({ setPersonas, tipo: "personal" }); // carga personas para el select; reutiliza [cliente/src/Componentes/Usuario/Solicitudes/solicitudPersonas.jsx](cliente/src/Componentes/Usuario/Solicitudes/solicitudPersonas.jsx)
    cargarPlanteles();
  }, []);

  const cargarPlanteles = async () => {
    try {
      const res = await axios.get("http://localhost:8080/controlestudios/servidor/planteles", { withCredentials: true });
      if (res.data.back === undefined) {
        Swal.fire("Error", "No se pudieron cargar los planteles.", "error");
        setPlanteles([]);
        return;
      }
      setPlanteles(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const openModal = async (item = null) => {
    setCurrentItem(item);
    let plantelData = { fk_plantel: "", plantel_personal_estado: "" };

    if (item) {
      // Si estamos editando, intentar cargar la asignación de plantel
      try {
        const res = await axios.get(
          `http://localhost:8080/controlestudios/servidor/plantel_personal/personal/${item.id_personal}`,
          { withCredentials: true }
        );
        if (res.data.data.length > 0) {
          plantelData = {
            fk_plantel: res.data.data[0].fk_plantel,
            plantel_personal_estado: res.data.data[0].estado,
          };
        }
      } catch (error) {
        console.error("Error al cargar asignación de plantel:", error);
      }

      setFormData({
        id_persona: item.id_persona,
        funcion: item.funcion,
        fecha_contratacion: item.fecha_contratacion
          ? item.fecha_contratacion.split(" ")[0]
          : "",
        nivel_academico: item.nivel_academico || "",
        horas_trabajo: item.horas_trabajo || "",
        rif: item.rif || "",
        etnia_religion: item.etnia_religion || "",
        cantidad_hijas: item.cantidad_hijas || "",
        cantidad_hijos_varones: item.cantidad_hijos_varones || "",
        ...plantelData,
      });
    } else {
      setFormData({
        id_persona: "",
        funcion: "",
        fecha_contratacion: "",
        nivel_academico: "",
        horas_trabajo: "",
        rif: "",
        etnia_religion: "",
        cantidad_hijas: "",
        cantidad_hijos_varones: "",
        fk_plantel: "",
        plantel_personal_estado: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const cambioEstados = async (personal) => {
    const nuevoEstado = personal.estado === "activo" ? "inactivo" : "activo";
    try {
      const response = await axios.put(
        `${API_URL}/estado/${personal.id_personal}`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );
      Swal.fire("¡Estado cambiado!", response.data.message, "success");
      cargar(); // Recargar la lista de personal
    } catch (error) {
      console.error("Error al cambiar el estado del personal:", error);
      const errorMsg =
        error.response?.data?.message || "Ocurrió un error al cambiar el estado.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Separar datos de personal y de plantel_personal
    const { fk_plantel, plantel_personal_estado, ...personalData } = formData;

    try {
      let personalResponse;
      if (currentItem) {
        // Actualizar personal existente
        personalResponse = await axios.put(
          `${API_URL}/${currentItem.id_personal}`,
          personalData,
          { withCredentials: true }
        );
        Swal.fire("¡Actualizado!", "Personal actualizado.", "success");
      } else {
        // Crear nuevo personal
        personalResponse = await axios.post(API_URL, personalData, {
          withCredentials: true,
        });
        Swal.fire("¡Creado!", "Personal creado.", "success");
      }

      const personalId = currentItem?.id_personal || personalResponse.data.data.id_personal;

      // Manejar asignación a plantel si se proporcionaron datos
      if (fk_plantel && plantel_personal_estado) {
        // Primero, intentar obtener la asignación existente
        const existingPlantelPersonal = await axios.get(
          `http://localhost:8080/controlestudios/servidor/plantel_personal/personal/${personalId}`,
          { withCredentials: true }
        );

        if (existingPlantelPersonal.data.data.length > 0) {
          // Si ya existe, actualizar
          const assignmentId = existingPlantelPersonal.data.data[0].id_plantel_personal;
          await axios.put(
            `http://localhost:8080/controlestudios/servidor/plantel_personal/${assignmentId}`,
            {
              fk_plantel: fk_plantel,
              fk_personal: personalId,
              estado: plantel_personal_estado,
            },
            { withCredentials: true }
          );
          Swal.fire("¡Actualizado!", "Asignación a plantel actualizada.", "success");
        } else {
          // Si no existe, crear
          await axios.post(
            "http://localhost:8080/controlestudios/servidor/plantel_personal",
            {
              fk_plantel: fk_plantel,
              fk_personal: personalId,
              estado: plantel_personal_estado,
            },
            { withCredentials: true }
          );
          Swal.fire("¡Creado!", "Asignación a plantel creada.", "success");
        }
      }

      cargar();
      closeModal();
    } catch (error) {
      console.error("Error al guardar personal o asignación a plantel:", error);
      const errorMsg = error.response?.data?.message || "Ocurrió un error.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Personal</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            <FaPlus className="mr-2" /> Agregar Personal
          </button>
        </div>

        <PersonalTable
          items={items}
          isLoading={isLoading}
          onEdit={openModal}
          cambioEstados={cambioEstados}
          onDelete={async (id) => {
            try {
              const respuesta = await axios.delete(`${API_URL}/${id}`, {
                withCredentials: true,
              });
              Swal.fire("¡Borrado!", "Registro eliminado.", "success");
              console.log(respuesta);
              cargar();
            } catch (error) {
              Swal.fire("Error", `No se pudo eliminar. ${error}`, "error");
            }
          }}
        />

        <PersonalModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          personas={personas}
          planteles={planteles}
          formData={formData}
          setFormData={setFormData}
          currentItem={currentItem}
        />
      </div>
    </>
  );
};
