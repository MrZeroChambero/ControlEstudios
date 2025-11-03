import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import EstudiantePersonaForm from "./EstudiantePersonaForm";
import EstudianteDatosForm from "./EstudianteDatosForm";

const API_BASE = "http://localhost:8080/controlestudios/servidor/estudiantes";
const API_PERSONA = `${API_BASE}/persona`; // POST /estudiantes/persona
const API_ESTUDIANTE = `${API_BASE}`; // POST /estudiantes
const API_COMPLETE = `${API_BASE}/complete`; // POST /estudiantes/complete (opcional)

/**
 * CrearEstudiante modal — usa los dos formularios independientes.
 * por defecto hace 2 pasos (persona -> estudiante) usando /estudiantes/persona y /estudiantes
 * si prefieres enviar en una sola petición usa la ruta /estudiantes/complete (variable useCompleteEndpoint).
 */
const CrearEstudiante = ({
  isOpen = false,
  onClose = () => {},
  onCreated = () => {},
  estudianteActual = null,
}) => {
  const [paso, setPaso] = useState(1);
  const [idPersona, setIdPersona] = useState(null);
  const [personaData, setPersonaData] = useState({
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
    tipo_persona: "estudiante",
  });
  const [erroresPersona, setErroresPersona] = useState({});
  const [datosEstudiante, setDatosEstudiante] = useState({
    cedula_escolar: "",
    fecha_ingreso_escuela: "",
    vive_con_padres: "si",
    orden_nacimiento: "",
    tiempo_gestacion: "",
    embarazo_deseado: "si",
    tipo_parto: "normal",
    control_esfinteres: "si",
  });
  const [erroresEstudiante, setErroresEstudiante] = useState({});

  // Cambiar a true para usar /estudiantes/complete (una sola petición)
  const useCompleteEndpoint = false;

  useEffect(() => {
    if (!isOpen) resetForm();
    // eslint-disable-next-line
  }, [isOpen]);

  const resetForm = () => {
    setPaso(1);
    setIdPersona(null);
    setPersonaData({
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
      tipo_persona: "estudiante",
    });
    setDatosEstudiante({
      cedula_escolar: "",
      fecha_ingreso_escuela: "",
      vive_con_padres: "si",
      orden_nacimiento: "",
      tiempo_gestacion: "",
      embarazo_deseado: "si",
      tipo_parto: "normal",
      control_esfinteres: "si",
    });
    setErroresPersona({});
    setErroresEstudiante({});
  };

  const manejarCambioPersona = (e) => {
    let { name, value } = e.target;
    if (["telefono_principal", "telefono_secundario", "cedula"].includes(name))
      value = value.replace(/[^0-9]/g, "");
    setPersonaData({ ...personaData, [name]: value });
    if (erroresPersona[name]) {
      const copia = { ...erroresPersona };
      delete copia[name];
      setErroresPersona(copia);
    }
  };

  const manejarEnvioPersona = async () => {
    setErroresPersona({});
    const nuevosErrores = {};
    if (!personaData.primer_nombre?.trim())
      nuevosErrores.primer_nombre = "Requerido";
    if (!personaData.primer_apellido?.trim())
      nuevosErrores.primer_apellido = "Requerido";
    if (!personaData.fecha_nacimiento)
      nuevosErrores.fecha_nacimiento = "Requerido";
    if (!personaData.telefono_principal?.trim())
      nuevosErrores.telefono_principal = "Requerido";
    if (Object.keys(nuevosErrores).length) {
      setErroresPersona(nuevosErrores);
      return;
    }

    try {
      const res = await axios.post(API_PERSONA, personaData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (res.data?.id_persona) {
        setIdPersona(res.data.id_persona);
        setPersonaData((p) => ({ ...p, id_persona: res.data.id_persona }));
        setPaso(2);
        Swal.fire(
          "Éxito",
          "Persona creada. Complete los datos de estudiante.",
          "success"
        );
      } else if (res.data?.errors) {
        setErroresPersona(res.data.errors);
      } else {
        Swal.fire("Error", "No se pudo crear la persona.", "error");
      }
    } catch (err) {
      const srvErrors = err.response?.data?.errors;
      if (srvErrors) setErroresPersona(srvErrors);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error del servidor",
        "error"
      );
    }
  };

  const manejarCambioEstudiante = (e) => {
    let { name, value } = e.target;
    if (["orden_nacimiento", "tiempo_gestacion"].includes(name))
      value = value.replace(/[^0-9]/g, "");
    setDatosEstudiante({ ...datosEstudiante, [name]: value });
    if (erroresEstudiante[name]) {
      const copia = { ...erroresEstudiante };
      delete copia[name];
      setErroresEstudiante(copia);
    }
  };

  const manejarEnvioEstudiante = async () => {
    setErroresEstudiante({});
    const nuevosErrores = {};
    if (!datosEstudiante.fecha_ingreso_escuela)
      nuevosErrores.fecha_ingreso_escuela = "Requerido";
    if (Object.keys(nuevosErrores).length) {
      setErroresEstudiante(nuevosErrores);
      return;
    }

    try {
      if (useCompleteEndpoint) {
        // enviar persona + estudiante en una sola petición
        const payload = { persona: personaData, estudiante: datosEstudiante };
        const res = await axios.post(API_COMPLETE, payload, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        if (res.data?.id_estudiante) {
          Swal.fire("Éxito", "Persona y estudiante creados.", "success");
          onCreated();
          onClose();
          resetForm();
        } else if (res.data?.errors) {
          // errores pueden venir de persona o estudiante
          setErroresPersona(res.data.errors || {});
          setErroresEstudiante(res.data.errors || {});
        } else {
          Swal.fire("Error", "No se pudo crear el estudiante.", "error");
        }
      } else {
        // flujo normal: ya tenemos idPersona desde paso 1
        const payload = { id_persona: idPersona, ...datosEstudiante };
        const res = await axios.post(API_ESTUDIANTE, payload, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        if (res.data?.id_estudiante) {
          Swal.fire("Éxito", "Estudiante creado correctamente.", "success");
          onCreated();
          onClose();
          resetForm();
        } else if (res.data?.errors) {
          setErroresEstudiante(res.data.errors);
        } else {
          Swal.fire("Error", "No se pudo crear el estudiante.", "error");
        }
      }
    } catch (err) {
      const srvErrors = err.response?.data?.errors;
      if (srvErrors) setErroresEstudiante(srvErrors);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error del servidor",
        "error"
      );
    }
  };

  const nombreCompleto = () => {
    const n1 = personaData.primer_nombre || "";
    const n2 = personaData.segundo_nombre || "";
    const a1 = personaData.primer_apellido || "";
    const a2 = personaData.segundo_apellido || "";
    return `${n1} ${n2} ${a1} ${a2}`.replace(/\s+/g, " ").trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {estudianteActual ? "Editar Estudiante" : "Crear Estudiante"}
          </h3>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            Cerrar
          </button>
        </div>

        {paso === 1 && (
          <>
            <p className="mb-4 text-gray-600">Paso 1: Datos de la persona</p>
            <EstudiantePersonaForm
              formData={personaData}
              onChange={manejarCambioPersona}
              onSubmit={manejarEnvioPersona}
              onCancel={() => {
                onClose();
                resetForm();
              }}
              errors={erroresPersona}
            />
          </>
        )}

        {paso === 2 && (
          <>
            <p className="mb-4 text-gray-600">Paso 2: Datos del estudiante</p>
            <EstudianteDatosForm
              datos={datosEstudiante}
              onChange={manejarCambioEstudiante}
              onSubmit={manejarEnvioEstudiante}
              onBack={() => setPaso(1)}
              onCancel={() => {
                onClose();
                resetForm();
              }}
              errors={erroresEstudiante}
              nombreCompleto={nombreCompleto()}
              idPersona={idPersona}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CrearEstudiante;
