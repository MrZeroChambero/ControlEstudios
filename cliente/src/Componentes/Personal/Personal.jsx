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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_persona: "",
    cargo: "",
    fecha_contratacion: "",
    codigo_rac: "",
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
    solicitudPersonas({ setPersonas }); // carga personas para el select; reutiliza [cliente/src/Componentes/Usuario/Solicitudes/solicitudPersonas.jsx](cliente/src/Componentes/Usuario/Solicitudes/solicitudPersonas.jsx)
  }, []);

  const openModal = (item = null) => {
    setCurrentItem(item);
    if (item) {
      setFormData({
        id_persona: item.id_persona,
        cargo: item.cargo,
        fecha_contratacion: item.fecha_contratacion
          ? item.fecha_contratacion.split(" ")[0]
          : "",
        codigo_rac: item.codigo_rac || "",
      });
    } else {
      setFormData({
        id_persona: "",
        cargo: "",
        fecha_contratacion: "",
        codigo_rac: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
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
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (currentItem) {
                const respuesta = await axios.put(
                  `${API_URL}/${currentItem.id_personal}`,
                  formData,
                  { withCredentials: true }
                );
                console.log(respuesta);
                Swal.fire("¡Actualizado!", "Personal actualizado.", "success");
              } else {
                const respuesta = await axios.post(API_URL, formData, {
                  withCredentials: true,
                });
                console.log(respuesta);
                Swal.fire("¡Creado!", "Personal creado.", "success");
              }
              cargar();
              closeModal();
            } catch (error) {
              const errData = error.response?.data;
              if (errData?.errors) {
                const errors = Object.entries(errData.errors)
                  .map(([k, v]) => `${k}: ${v.join(", ")}`)
                  .join("\n");
                Swal.fire("Error de validación", errors, "error");
              } else {
                Swal.fire(
                  "Error",
                  errData?.message || "Ocurrió un error.",
                  "error"
                );
              }
            }
          }}
          personas={personas}
          formData={formData}
          setFormData={setFormData}
          currentItem={currentItem}
        />
      </div>
    </>
  );
};
