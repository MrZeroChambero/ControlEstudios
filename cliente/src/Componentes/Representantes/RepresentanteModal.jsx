import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaUserPlus,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import {
  solicitarPersonasCandidatas,
  crearRepresentante,
  actualizarRepresentante,
} from "./representanteService";
import { HabilidadesForm } from "./HabilidadesForm";
import { actualizarPersona, actualizarPersonal } from "./representanteService";

export const RepresentanteModal = ({ isOpen, onClose, onSaved, current }) => {
  const [step, setStep] = useState(1); // 1 select/create person, 2 representante form, 3 habilidades
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [creatingNewPersona, setCreatingNewPersona] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [errorPersonas, setErrorPersonas] = useState(null);
  const [personaData, setPersonaData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    fecha_nacimiento: "",
    genero: "",
    cedula: "",
    nacionalidad: "Venezolana",
    direccion: "",
    telefono_principal: "",
    telefono_secundario: "",
    email: "",
    tipo_sangre: "No sabe",
    estado: "incompleto",
  });
  const [repData, setRepData] = useState({
    oficio: "",
    nivel_educativo: "",
    profesion: "",
    lugar_trabajo: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [createdRep, setCreatedRep] = useState(null);
  const [personalData, setPersonalData] = useState({
    id_personal: null,
    fk_cargo: "",
    fk_funcion: "",
    fecha_contratacion: "",
    nivel_academico: "",
    horas_trabajo: "",
    rif: "",
    etnia_religion: "",
    cantidad_hijas: "",
    cantidad_hijos_varones: "",
    cod_dependencia: "",
  });

  async function cargarCandidatas() {
    setLoadingPersonas(true);
    setErrorPersonas(null);
    try {
      await solicitarPersonasCandidatas(setPersonas, Swal);
      console.log("[Modal Representante] Personas candidatas cargadas");
    } catch (e) {
      console.error("[Modal Representante] Error cargando candidatas", e);
      setErrorPersonas("No se pudieron cargar las personas candidatas");
    } finally {
      setLoadingPersonas(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    reset();
    if (current) {
      // Modo edición: cargar datos persona y representante, iniciar en paso 1
      setStep(1);
      setSelectedPersona({
        id_persona: current.fk_persona || current.id_persona,
        primer_nombre: current.primer_nombre,
        segundo_nombre: current.segundo_nombre,
        primer_apellido: current.primer_apellido,
        segundo_apellido: current.segundo_apellido,
        cedula: current.cedula,
      });
      setPersonaData({
        primer_nombre: current.primer_nombre || "",
        segundo_nombre: current.segundo_nombre || "",
        primer_apellido: current.primer_apellido || "",
        segundo_apellido: current.segundo_apellido || "",
        fecha_nacimiento: current.fecha_nacimiento || "",
        genero: current.genero || "",
        cedula: current.cedula || "",
        nacionalidad: current.nacionalidad || "Venezolana",
        direccion: current.direccion || "",
        telefono_principal: current.telefono_principal || "",
        telefono_secundario: current.telefono_secundario || "",
        email: current.email || "",
        tipo_sangre: current.tipo_sangre || "No sabe",
        estado: current.estado || "incompleto",
      });
      setRepData({
        oficio: current.oficio || "",
        nivel_educativo: current.nivel_educativo || "",
        profesion: current.profesion || "",
        lugar_trabajo: current.lugar_trabajo || "",
      });
      if (current.personal) {
        setPersonalData({
          id_personal: current.personal.id_personal,
          fk_cargo: current.personal.fk_cargo || "",
          fk_funcion: current.personal.fk_funcion || "",
          fecha_contratacion: current.personal.fecha_contratacion || "",
          nivel_academico: current.personal.nivel_academico || "",
          horas_trabajo: current.personal.horas_trabajo || "",
          rif: current.personal.rif || "",
          etnia_religion: current.personal.etnia_religion || "",
          cantidad_hijas: current.personal.cantidad_hijas || "",
          cantidad_hijos_varones: current.personal.cantidad_hijos_varones || "",
          cod_dependencia: current.personal.cod_dependencia || "",
        });
      }
    }
    cargarCandidatas();
  }, [isOpen, current]);

  const reset = () => {
    setStep(1);
    setSelectedPersona(null);
    setSearchTerm("");
    setCreatingNewPersona(false);
    setPersonaData({
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      fecha_nacimiento: "",
      genero: "",
      cedula: "",
      nacionalidad: "Venezolana",
      direccion: "",
      telefono_principal: "",
      telefono_secundario: "",
      email: "",
      tipo_sangre: "No sabe",
      estado: "incompleto",
    });
    setRepData({
      oficio: "",
      nivel_educativo: "",
      profesion: "",
      lugar_trabajo: "",
    });
    setCreatedRep(null);
    setErrors({});
    setTouched({});
    setPersonalData({
      id_personal: null,
      fk_cargo: "",
      fk_funcion: "",
      fecha_contratacion: "",
      nivel_academico: "",
      horas_trabajo: "",
      rif: "",
      etnia_religion: "",
      cantidad_hijas: "",
      cantidad_hijos_varones: "",
      cod_dependencia: "",
    });
  };

  const seleccionarPersona = (p) => {
    setSelectedPersona(p);
    console.log(
      "[Modal Representante] Persona pre-seleccionada:",
      p.id_persona
    );
    // Ya no avanzamos automáticamente; usuario confirma con botón "Continuar"
  };

  const crearDesdeCero = () => {
    setSelectedPersona(null);
    setCreatingNewPersona(true);
    console.log("[Modal Representante] Iniciando creación de nueva persona");
  };

  const validatePersona = () => {
    const newErr = {};
    if (!personaData.primer_nombre.trim()) newErr.primer_nombre = "Requerido";
    if (!personaData.primer_apellido.trim())
      newErr.primer_apellido = "Requerido";
    if (!personaData.cedula.trim()) newErr.cedula = "Requerido";
    if (personaData.cedula && !/^\d{6,10}$/.test(personaData.cedula))
      newErr.cedula = "Debe ser numérica (6-10 dígitos)";
    if (!personaData.fecha_nacimiento.trim())
      newErr.fecha_nacimiento = "Requerida";
    if (
      personaData.fecha_nacimiento &&
      !/^\d{4}-\d{2}-\d{2}$/.test(personaData.fecha_nacimiento)
    )
      newErr.fecha_nacimiento = "Formato YYYY-MM-DD";
    if (!personaData.genero.trim()) newErr.genero = "Seleccione género";
    if (personaData.email && !/.+@.+\..+/.test(personaData.email))
      newErr.email = "Email inválido";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const validateRep = () => {
    const newErr = {};
    if (!repData.profesion.trim()) newErr.profesion = "Requerida";
    setErrors((prev) => ({ ...prev, ...newErr }));
    return Object.keys(newErr).length === 0 && Object.keys(errors).length === 0;
  };

  const handleCrearPersonaYRepresentante = async () => {
    console.log(
      "[Modal Representante] Intentando crear persona + representante"
    );
    if (!validatePersona()) {
      Swal.fire(
        "Error",
        "Corrige los campos del formulario de persona",
        "error"
      );
      console.log("[Modal Representante] Validación persona falló", errors);
      return;
    }
    if (!validateRep()) {
      Swal.fire("Error", "Corrige los campos de representante", "error");
      console.log(
        "[Modal Representante] Validación representante falló",
        errors
      );
      return;
    }
    const payload = { ...personaData, ...repData };
    console.log("[Modal Representante] Payload creación combinado:", payload);
    const res = await crearRepresentante(payload, Swal);
    if (res) {
      console.log(
        "[Modal Representante] Creación exitosa representante id:",
        res.id_representante
      );
      setCreatedRep(res);
      setStep(3);
      // No cerrar aún: se muestran las habilidades en paso 3 y al finalizar se disparará onSaved
    }
  };

  const handleCrearParaPersonaExistente = async () => {
    console.log(
      "[Modal Representante] Creando representante para persona existente"
    );
    if (!selectedPersona) return;
    if (!validateRep()) {
      Swal.fire("Error", "Corrige los campos de representante", "error");
      console.log(
        "[Modal Representante] Validación representante falló",
        errors
      );
      return;
    }
    const payload = { id_persona: selectedPersona.id_persona, ...repData };
    console.log(
      "[Modal Representante] Payload creación (persona existente):",
      payload
    );
    const res = await crearRepresentante(payload, Swal);
    if (res) {
      console.log(
        "[Modal Representante] Creación exitosa representante id:",
        res.id_representante
      );
      setCreatedRep(res);
      setStep(3);
      // Se pospone el guardado final hasta terminar habilidades
    }
  };

  const handleGuardarEdicionRepresentante = async () => {
    if (!current) return;
    const upd = await actualizarRepresentante(
      current.id_representante,
      repData,
      Swal
    );
    if (upd) {
      Swal.fire("Éxito", "Datos de representante actualizados", "success");
    }
  };

  const handleGuardarEdicionPersona = async () => {
    if (!selectedPersona) return;
    const datosEnviar = { ...personaData }; // excluir tipo_persona y estado si llegaran
    delete datosEnviar.tipo_persona;
    delete datosEnviar.estado;
    const ok = await actualizarPersona(
      selectedPersona.id_persona,
      datosEnviar,
      Swal
    );
    if (ok) {
      Swal.fire("Éxito", "Datos de persona actualizados", "success");
    }
  };

  // Se elimina la capacidad de cambiar el estado desde el modal (solo desde la tabla)

  const handleGuardarEdicionPersonal = async () => {
    if (!personalData.id_personal) return;
    const payload = { ...personalData };
    delete payload.id_personal;
    const updated = await actualizarPersonal(
      personalData.id_personal,
      payload,
      Swal
    );
    if (updated)
      Swal.fire("Éxito", "Datos de personal actualizados", "success");
  };

  const totalSteps = current && current.personal ? 4 : 3; // añade Personal si existe

  const finalizarEdicion = () => {
    onSaved?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold pr-4">
            {current
              ? step === 1
                ? "Editar Persona"
                : step === 2
                ? "Editar Representante"
                : current.personal && step === 3
                ? "Editar Personal"
                : "Habilidades"
              : step === 1
              ? creatingNewPersona
                ? "Datos de la Persona"
                : "Seleccionar o Crear Persona"
              : step === 2
              ? "Datos de Representante"
              : "Habilidades"}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Paso {step} de {totalSteps}
            </span>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((st) => (
                <div
                  key={st}
                  className={`w-3 h-3 rounded-full ${
                    st === step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-2 rounded-lg text-sm"
            >
              <FaTimes className="mr-1" /> Cerrar
            </button>
          </div>
        </div>

        {!current && step === 1 && !creatingNewPersona && (
          <div>
            <div className="mb-6">
              <button
                onClick={crearDesdeCero}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition duration-200"
              >
                <FaUserPlus className="mr-2" /> Crear Nueva Persona
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar persona (nombre, apellido, cédula)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 p-4 bg-gray-50 border-b">
                Personas Disponibles
              </h3>
              {loadingPersonas && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm">
                  Cargando personas...
                </div>
              )}
              {!loadingPersonas && errorPersonas && (
                <div className="p-4 text-red-600 text-sm">
                  {errorPersonas}
                  <button
                    onClick={cargarCandidatas}
                    className="ml-2 text-blue-600 underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              {!loadingPersonas && !errorPersonas && (
                <div className="divide-y">
                  {personas
                    .filter((p) =>
                      `${p.primer_nombre} ${p.primer_apellido} ${p.cedula}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((p) => {
                      const isSelected =
                        selectedPersona?.id_persona === p.id_persona;
                      return (
                        <div
                          key={p.id_persona}
                          onClick={() => seleccionarPersona(p)}
                          className={`p-4 cursor-pointer transition-colors flex justify-between items-start ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div>
                            <h4 className="font-semibold text-lg flex items-center">
                              {p.primer_nombre} {p.segundo_nombre || ""}{" "}
                              {p.primer_apellido} {p.segundo_apellido || ""}
                              {isSelected && (
                                <span className="ml-2 text-xs font-bold text-blue-600">
                                  (Seleccionada)
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-600">Cédula: {p.cedula}</p>
                            <p className="text-gray-600 text-sm">
                              Estado: {p.estado || "-"}{" "}
                              {p.edad && `| Edad: ${p.edad} años`}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full h-fit">
                            {p.tipo_persona || "Persona"}
                          </span>
                        </div>
                      );
                    })}
                  {personas.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No hay personas disponibles.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => onClose()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  selectedPersona ? setStep(2) : crearDesdeCero()
                }
                disabled={!selectedPersona && personas.length === 0}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {selectedPersona ? "Continuar" : "Crear Nueva Persona"}{" "}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Formulario de persona (datos personales) shown when creating from cero */}
        {!current && step === 1 && creatingNewPersona && (
          <div className="mt-2">
            <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
              Crear Nueva Persona
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { key: "primer_nombre", label: "Primer Nombre *" },
                { key: "segundo_nombre", label: "Segundo Nombre" },
                { key: "primer_apellido", label: "Primer Apellido *" },
                { key: "segundo_apellido", label: "Segundo Apellido" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-bold mb-2">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={key}
                    placeholder={label}
                    value={personaData[key]}
                    onChange={(e) =>
                      setPersonaData({ ...personaData, [key]: e.target.value })
                    }
                    onBlur={() => setTouched({ ...touched, [key]: true })}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                      errors[key]
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched[key] && errors[key] && (
                    <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="text"
                  name="fecha_nacimiento"
                  placeholder="YYYY-MM-DD"
                  value={personaData.fecha_nacimiento}
                  onChange={(e) =>
                    setPersonaData({
                      ...personaData,
                      fecha_nacimiento: e.target.value,
                    })
                  }
                  onBlur={() =>
                    setTouched({ ...touched, fecha_nacimiento: true })
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                    errors.fecha_nacimiento
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {touched.fecha_nacimiento && errors.fecha_nacimiento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fecha_nacimiento}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Cédula *</label>
                <input
                  type="text"
                  name="cedula"
                  placeholder="Cédula"
                  value={personaData.cedula}
                  onChange={(e) =>
                    setPersonaData({ ...personaData, cedula: e.target.value })
                  }
                  onBlur={() => setTouched({ ...touched, cedula: true })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                    errors.cedula
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {touched.cedula && errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Género *</label>
                <select
                  name="genero"
                  value={personaData.genero}
                  onChange={(e) =>
                    setPersonaData({ ...personaData, genero: e.target.value })
                  }
                  onBlur={() => setTouched({ ...touched, genero: true })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                    errors.genero
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {touched.genero && errors.genero && (
                  <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={personaData.email}
                  onChange={(e) =>
                    setPersonaData({ ...personaData, email: e.target.value })
                  }
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="text"
                  name="telefono_principal"
                  value={personaData.telefono_principal}
                  onChange={(e) =>
                    setPersonaData({
                      ...personaData,
                      telefono_principal: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={personaData.direccion}
                  onChange={(e) =>
                    setPersonaData({
                      ...personaData,
                      direccion: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (validatePersona()) {
                    setStep(2);
                    console.log("[Modal Representante] Avanza a paso 2");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center"
              >
                Siguiente <FaArrowRight className="ml-2" />
              </button>
              <button
                onClick={() => {
                  setCreatingNewPersona(false);
                  console.log(
                    "[Modal Representante] Cancelar creación persona"
                  );
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Atrás
              </button>
            </div>
          </div>
        )}

        {/* Representante form */}
        {step === 2 && (
          <div className="mt-2">
            <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
              Datos de Representante
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Oficio"
                value={repData.oficio}
                onChange={(e) =>
                  setRepData({ ...repData, oficio: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={repData.nivel_educativo}
                onChange={(e) =>
                  setRepData({ ...repData, nivel_educativo: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione nivel educativo</option>
                <option value="Sin estudios">Sin estudios</option>
                <option value="Primaria incompleta">Primaria incompleta</option>
                <option value="Primaria completa">Primaria completa</option>
                <option value="Secundaria incompleta">
                  Secundaria incompleta
                </option>
                <option value="Secundaria completa">Secundaria completa</option>
                <option value="Bachiller">Bachiller</option>
                <option value="Técnico medio">Técnico medio</option>
                <option value="TSU">TSU</option>
                <option value="Universitario">Universitario</option>
                <option value="Postgrado">Postgrado</option>
                <option value="Doctorado">Doctorado</option>
              </select>
              <div>
                <input
                  placeholder="Profesión"
                  value={repData.profesion}
                  onChange={(e) =>
                    setRepData({ ...repData, profesion: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200 ${
                    errors.profesion
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  onBlur={() => setTouched({ ...touched, profesion: true })}
                />
                {touched.profesion && errors.profesion && (
                  <div className="text-xs text-red-600">{errors.profesion}</div>
                )}
              </div>
              <input
                placeholder="Lugar de trabajo"
                value={repData.lugar_trabajo}
                onChange={(e) =>
                  setRepData({ ...repData, lugar_trabajo: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
              {current ? (
                <>
                  <button
                    onClick={handleGuardarEdicionRepresentante}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Guardar Cambios Representante
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg"
                    >
                      Persona
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
                    >
                      Habilidades
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={
                      selectedPersona
                        ? handleCrearParaPersonaExistente
                        : handleCrearPersonaYRepresentante
                    }
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Crear representante
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Atrás
                  </button>
                  {selectedPersona && (
                    <span className="text-xs text-gray-500">
                      Persona existente: {selectedPersona.primer_nombre}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Habilidades step */}
        {step === totalSteps && (createdRep || current) && (
          <div className="mt-2">
            <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
              Habilidades
            </h3>
            <HabilidadesForm
              fk_representante={
                createdRep?.id_representante ?? current?.id_representante
              }
              Swal={Swal}
              onChange={() => {}}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  if (current) finalizarEdicion();
                  else {
                    onClose();
                    onSaved?.();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
              >
                Finalizar
              </button>
            </div>
          </div>
        )}
        {current && step === 1 && (
          <div className="mt-2">
            <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
              Editar Persona
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: "primer_nombre", label: "Primer Nombre" },
                { key: "segundo_nombre", label: "Segundo Nombre" },
                { key: "primer_apellido", label: "Primer Apellido" },
                { key: "segundo_apellido", label: "Segundo Apellido" },
                { key: "cedula", label: "Cédula" },
                { key: "fecha_nacimiento", label: "Fecha Nacimiento" },
                { key: "genero", label: "Género" },
                { key: "email", label: "Email" },
                { key: "telefono_principal", label: "Teléfono Principal" },
                { key: "telefono_secundario", label: "Teléfono Secundario" },
                { key: "direccion", label: "Dirección", full: true },
                // Estado removido de edición directa en el modal
              ].map(({ key, label, full }) => (
                <div key={key} className={full ? "col-span-2" : ""}>
                  <label className="block text-sm font-bold mb-1">
                    {label}
                  </label>
                  {key === "genero" ? (
                    <select
                      value={personaData.genero}
                      onChange={(e) =>
                        setPersonaData({
                          ...personaData,
                          genero: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={personaData[key]}
                      onChange={(e) =>
                        setPersonaData({
                          ...personaData,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleGuardarEdicionPersona}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Guardar Persona
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Representante
                </button>
                {current.personal && (
                  <button
                    onClick={() => setStep(3)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Personal
                  </button>
                )}
                <button
                  onClick={() => setStep(totalSteps)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Habilidades
                </button>
              </div>
            </div>
          </div>
        )}
        {current && current.personal && step === 3 && (
          <div className="mt-2">
            <h3 className="text-xl font-bold mb-4 text-purple-600 border-b pb-2">
              Datos de Personal
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: "fecha_contratacion", label: "Fecha Contratación" },
                { key: "nivel_academico", label: "Nivel Académico" },
                { key: "horas_trabajo", label: "Horas de Trabajo" },
                { key: "rif", label: "RIF" },
                { key: "etnia_religion", label: "Etnia / Religión" },
                { key: "cantidad_hijas", label: "Cantidad Hijas" },
                {
                  key: "cantidad_hijos_varones",
                  label: "Cantidad Hijos Varones",
                },
                { key: "cod_dependencia", label: "Código Dependencia" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-bold mb-1">
                    {label}
                  </label>
                  {key === "nivel_academico" ? (
                    <select
                      value={personalData.nivel_academico}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          nivel_academico: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccione nivel académico</option>
                      <option value="Sin estudios">Sin estudios</option>
                      <option value="Primaria incompleta">
                        Primaria incompleta
                      </option>
                      <option value="Primaria completa">
                        Primaria completa
                      </option>
                      <option value="Secundaria incompleta">
                        Secundaria incompleta
                      </option>
                      <option value="Secundaria completa">
                        Secundaria completa
                      </option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Técnico medio">Técnico medio</option>
                      <option value="TSU">TSU</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Postgrado">Postgrado</option>
                      <option value="Doctorado">Doctorado</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={personalData[key]}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between flex-wrap gap-2">
              <button
                onClick={handleGuardarEdicionPersonal}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg"
              >
                Guardar Cambios Personal
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Persona
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Representante
                </button>
                <button
                  onClick={() => setStep(totalSteps)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Habilidades
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
