import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaUserPlus } from "react-icons/fa";
import {
  solicitarPersonasParaPersonal,
  crearPersona,
  completarPersonal,
  actualizarPersonal,
  actualizarPersona,
  solicitarCargos,
  solicitarFunciones,
} from "./personalService";
import Swal from "sweetalert2";

export const PersonalModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentPersonal,
}) => {
  const [paso, setPaso] = useState(1);
  const [personas, setPersonas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [personaCreada, setPersonaCreada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Datos del formulario
  const [formDataPersona, setFormDataPersona] = useState({
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
  });

  const [formDataPersonal, setFormDataPersonal] = useState({
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
    estado: "activo",
  });

  // Validaciones
  const validarCampoPersona = (name, value) => {
    let error = "";

    switch (name) {
      case "primer_nombre":
        if (!value.trim()) error = "El primer nombre es requerido";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
          error = "Solo letras y espacios";
        else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
        break;

      case "primer_apellido":
        if (!value.trim()) error = "El primer apellido es requerido";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
          error = "Solo letras y espacios";
        else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
        break;

      case "cedula":
        if (!value.trim()) error = "La cédula es requerida";
        else if (!/^[0-9-]+$/.test(value)) error = "Solo números y guiones";
        break;

      case "fecha_nacimiento":
        if (!value) error = "La fecha de nacimiento es requerida";
        else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          if (age < 18) error = "Debe ser mayor de 18 años";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Formato de email inválido";
        break;

      case "telefono_principal":
        if (!value.trim()) error = "El teléfono principal es requerido";
        else if (!/^[0-9+-\s()]+$/.test(value))
          error = "Formato de teléfono inválido";
        break;

      default:
        break;
    }

    return error;
  };

  const validarCampoPersonal = (name, value) => {
    let error = "";

    switch (name) {
      case "fk_cargo":
        if (!value) error = "El cargo es requerido";
        break;

      case "fk_funcion":
        if (!value) error = "La función es requerida";
        break;

      case "fecha_contratacion":
        if (!value) error = "La fecha de contratación es requerida";
        break;

      case "horas_trabajo":
        if (value && (value < 0 || value > 168)) error = "Horas inválidas";
        break;

      case "cantidad_hijas":
      case "cantidad_hijos_varones":
        if (value && (value < 0 || value > 50)) error = "Cantidad inválida";
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (e, tipo) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = "";
    if (tipo === "persona") {
      error = validarCampoPersona(name, value);
    } else {
      error = validarCampoPersonal(name, value);
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChangePersona = (e) => {
    const { name, value } = e.target;
    setFormDataPersona((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validarCampoPersona(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChangePersonal = (e) => {
    const { name, value } = e.target;
    setFormDataPersonal((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validarCampoPersonal(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const getInputClass = (fieldName, tipo) => {
    const baseClass =
      "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200";
    const isTouched = touched[fieldName];
    const hasError = errors[fieldName];

    if (!isTouched) {
      return `${baseClass} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }

    if (hasError) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    } else {
      return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
      if (currentPersonal) {
        // Modo edición
        setModoEdicion(true);
        setFormDataPersona({
          primer_nombre: currentPersonal.primer_nombre || "",
          segundo_nombre: currentPersonal.segundo_nombre || "",
          primer_apellido: currentPersonal.primer_apellido || "",
          segundo_apellido: currentPersonal.segundo_apellido || "",
          fecha_nacimiento: currentPersonal.fecha_nacimiento || "",
          genero: currentPersonal.genero || "",
          cedula: currentPersonal.cedula || "",
          nacionalidad: currentPersonal.nacionalidad || "Venezolana",
          direccion: currentPersonal.direccion || "",
          telefono_principal: currentPersonal.telefono_principal || "",
          telefono_secundario: currentPersonal.telefono_secundario || "",
          email: currentPersonal.email || "",
          tipo_sangre: currentPersonal.tipo_sangre || "No sabe",
        });
        setFormDataPersonal({
          fk_cargo: currentPersonal.fk_cargo || "",
          fk_funcion: currentPersonal.fk_funcion || "",
          fecha_contratacion: currentPersonal.fecha_contratacion || "",
          nivel_academico: currentPersonal.nivel_academico || "",
          horas_trabajo: currentPersonal.horas_trabajo || "",
          rif: currentPersonal.rif || "",
          etnia_religion: currentPersonal.etnia_religion || "",
          cantidad_hijas: currentPersonal.cantidad_hijas || "",
          cantidad_hijos_varones: currentPersonal.cantidad_hijos_varones || "",
          cod_dependencia: currentPersonal.cod_dependencia || "",
          estado: currentPersonal.estado || "activo",
        });
        setPaso(1); // Empezar en el paso 1 (datos de persona) para edición
      } else {
        // Modo creación
        setModoEdicion(false);
        resetForm();
      }
    }
  }, [isOpen, currentPersonal]);

  const cargarDatosIniciales = async () => {
    await solicitarPersonasParaPersonal(setPersonas, Swal);
    await solicitarCargos(setCargos, Swal);
    await solicitarFunciones(setFunciones, Swal);
  };

  const filtrarPersonas = personas.filter((persona) =>
    `${persona.primer_nombre} ${persona.primer_apellido} ${persona.cedula}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const handleSeleccionarPersona = (persona) => {
    setPersonaSeleccionada(persona);
    // Cargar datos de la persona seleccionada en el formulario
    setFormDataPersona({
      primer_nombre: persona.primer_nombre || "",
      segundo_nombre: persona.segundo_nombre || "",
      primer_apellido: persona.primer_apellido || "",
      segundo_apellido: persona.segundo_apellido || "",
      fecha_nacimiento: persona.fecha_nacimiento || "",
      genero: persona.genero || "",
      cedula: persona.cedula || "",
      nacionalidad: persona.nacionalidad || "Venezolana",
      direccion: persona.direccion || "",
      telefono_principal: persona.telefono_principal || "",
      telefono_secundario: persona.telefono_secundario || "",
      email: persona.email || "",
      tipo_sangre: persona.tipo_sangre || "No sabe",
    });
    // Ir directamente al paso 3 (datos de personal) cuando se selecciona una persona existente
    setPaso(3);
  };

  const handleCrearNuevaPersona = () => {
    setPersonaSeleccionada(null);
    setPaso(2); // Ir al paso 2 para crear una nueva persona
  };

  const validarFormularioPersona = () => {
    const newErrors = {};
    Object.keys(formDataPersona).forEach((key) => {
      if (
        key !== "segundo_nombre" &&
        key !== "segundo_apellido" &&
        key !== "telefono_secundario" &&
        key !== "email"
      ) {
        const error = validarCampoPersona(key, formDataPersona[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarFormularioPersonal = () => {
    const newErrors = {};
    const camposRequeridos = [
      "fk_cargo",
      "fk_funcion",
      "fecha_contratacion",
      "estado",
    ];

    camposRequeridos.forEach((key) => {
      const error = validarCampoPersonal(key, formDataPersonal[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPersona = async (e) => {
    e.preventDefault();
    setTouched(
      Object.keys(formDataPersona).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    if (!validarFormularioPersona()) {
      Swal.fire(
        "Error",
        "Por favor corrige los errores en el formulario",
        "error"
      );
      return;
    }

    const resultado = await crearPersona(formDataPersona, Swal);
    if (resultado) {
      setPersonaCreada(resultado);
      setPaso(3);
    }
  };

  const handleSubmitPersonal = async (e) => {
    e.preventDefault();
    setTouched(
      Object.keys(formDataPersonal).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    if (!validarFormularioPersonal()) {
      Swal.fire(
        "Error",
        "Por favor corrige los errores en el formulario",
        "error"
      );
      return;
    }

    if (modoEdicion) {
      // Actualizar persona y personal existente
      try {
        // Actualizar la persona
        const personaActualizada = await actualizarPersona(
          currentPersonal.id_persona,
          formDataPersona,
          Swal
        );

        if (personaActualizada) {
          // Actualizar el personal
          const personalActualizado = await actualizarPersonal(
            currentPersonal.id_personal,
            formDataPersonal,
            Swal
          );

          if (personalActualizado) {
            onSuccess(personalActualizado);
            onClose();
            resetForm();
          }
        }
      } catch (error) {
        console.error("Error al actualizar:", error);
      }
    } else {
      // Crear nuevo personal
      const idPersona = personaSeleccionada
        ? personaSeleccionada.id_persona
        : personaCreada.id_persona;
      const resultado = await completarPersonal(
        idPersona,
        formDataPersonal,
        Swal
      );

      if (resultado) {
        onSuccess(resultado);
        onClose();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setPaso(1);
    setPersonaSeleccionada(null);
    setPersonaCreada(null);
    setModoEdicion(false);
    setErrors({});
    setTouched({});
    setFormDataPersona({
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
    });
    setFormDataPersonal({
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
      estado: "activo",
    });
  };

  const handleCancelar = () => {
    onClose();
    resetForm();
  };

  // Navegación entre pasos
  const handleSiguiente = () => {
    if (paso === 1 && personaSeleccionada) {
      // Si hay persona seleccionada, ir directamente a datos de personal
      setPaso(3);
    } else if (paso === 1) {
      // Si no hay persona seleccionada, ir a crear persona
      setPaso(2);
    } else if (paso === 2) {
      // Validar formulario de persona antes de continuar
      if (validarFormularioPersona()) {
        setPaso(3);
      } else {
        Swal.fire(
          "Error",
          "Por favor corrige los errores en el formulario",
          "error"
        );
      }
    }
  };

  const handleAnterior = () => {
    if (paso === 3 && !personaSeleccionada) {
      setPaso(2);
    } else if (paso === 2 || (paso === 3 && personaSeleccionada)) {
      setPaso(1);
    }
  };

  // Filtrar funciones según el tipo de cargo seleccionado
  const funcionesFiltradas = funciones.filter((funcion) => {
    if (!formDataPersonal.fk_cargo) return true;

    const cargoSeleccionado = cargos.find(
      (c) => c.id_cargo == formDataPersonal.fk_cargo
    );
    if (!cargoSeleccionado) return true;

    switch (cargoSeleccionado.tipo) {
      case "Administrativo":
        return funcion.tipo === "Administrativo";
      case "Docente":
        return funcion.tipo === "Docente" || funcion.tipo === "Especialista";
      case "Obrero":
        return funcion.tipo === "Obrero";
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">
          {modoEdicion
            ? "Editar Personal"
            : paso === 1 && "Seleccionar o Crear Personal"}
          {!modoEdicion && paso === 2 && "Datos de la Persona"}
          {!modoEdicion && paso === 3 && "Datos de Personal"}
        </h2>

        {/* Paso 1: Selección de Persona (solo para creación) */}
        {!modoEdicion && paso === 1 && (
          <div>
            <div className="mb-6">
              <button
                onClick={handleCrearNuevaPersona}
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
                  placeholder="Buscar persona por nombre, apellido o cédula..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3">
                Personas Disponibles (Mayores de 18 años)
              </h3>
              {filtrarPersonas.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay personas disponibles para asignar como personal.
                </p>
              ) : (
                filtrarPersonas.map((persona) => (
                  <div
                    key={persona.id_persona}
                    className="border border-gray-200 rounded-lg p-4 mb-3 hover:bg-gray-50 cursor-pointer transition duration-200"
                    onClick={() => handleSeleccionarPersona(persona)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {persona.primer_nombre} {persona.segundo_nombre || ""}{" "}
                          {persona.primer_apellido}{" "}
                          {persona.segundo_apellido || ""}
                        </h4>
                        <p className="text-gray-600">
                          Cédula: {persona.cedula}
                        </p>
                        <p className="text-gray-600">
                          Tipo: {persona.tipo_persona} | Estado:{" "}
                          {persona.estado} | Edad: {persona.edad} años
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {persona.tipo_persona}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleCancelar}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSiguiente}
                disabled={
                  !personaSeleccionada &&
                  busqueda &&
                  filtrarPersonas.length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {personaSeleccionada ? "Continuar" : "Crear Nueva Persona"}
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Formulario de Persona (solo para creación) */}
        {!modoEdicion && paso === 2 && (
          <form onSubmit={handleSubmitPersona}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  name="primer_nombre"
                  value={formDataPersona.primer_nombre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("primer_nombre", "persona")}
                  required
                />
                {errors.primer_nombre && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.primer_nombre}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  name="segundo_nombre"
                  value={formDataPersona.segundo_nombre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("segundo_nombre", "persona")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  name="primer_apellido"
                  value={formDataPersona.primer_apellido}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("primer_apellido", "persona")}
                  required
                />
                {errors.primer_apellido && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.primer_apellido}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  name="segundo_apellido"
                  value={formDataPersona.segundo_apellido}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("segundo_apellido", "persona")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cédula *
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formDataPersona.cedula}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("cedula", "persona")}
                  required
                  disabled={!!personaSeleccionada}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formDataPersona.fecha_nacimiento}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("fecha_nacimiento", "persona")}
                  required
                />
                {errors.fecha_nacimiento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fecha_nacimiento}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Género *
                </label>
                <select
                  name="genero"
                  value={formDataPersona.genero}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("genero", "persona")}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.genero && (
                  <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo de Sangre *
                </label>
                <select
                  name="tipo_sangre"
                  value={formDataPersona.tipo_sangre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("tipo_sangre", "persona")}
                  required
                >
                  <option value="No sabe">No sabe</option>
                  <option value="O-">O-</option>
                  <option value="O+">O+</option>
                  <option value="A-">A-</option>
                  <option value="A+">A+</option>
                  <option value="B-">B-</option>
                  <option value="B+">B+</option>
                  <option value="AB-">AB-</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formDataPersona.direccion}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("direccion", "persona")}
                  required
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.direccion}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Teléfono Principal *
                </label>
                <input
                  type="text"
                  name="telefono_principal"
                  value={formDataPersona.telefono_principal}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("telefono_principal", "persona")}
                  required
                />
                {errors.telefono_principal && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.telefono_principal}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Teléfono Secundario
                </label>
                <input
                  type="text"
                  name="telefono_secundario"
                  value={formDataPersona.telefono_secundario}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("telefono_secundario", "persona")}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formDataPersona.email}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("email", "persona")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleAnterior}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Atrás
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mr-2 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Continuar con Datos de Personal
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Paso 3: Formulario de Personal (para creación y edición) */}
        {(paso === 3 || modoEdicion) && (
          <form onSubmit={handleSubmitPersonal}>
            {!modoEdicion && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">
                  Persona Seleccionada:
                </h3>
                <p>
                  {personaSeleccionada
                    ? `${personaSeleccionada.primer_nombre} ${personaSeleccionada.primer_apellido} - ${personaSeleccionada.cedula}`
                    : `${personaCreada.primer_nombre} ${personaCreada.primer_apellido} - ${personaCreada.cedula}`}
                </p>
              </div>
            )}

            {modoEdicion && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800">
                  Editando Personal:
                </h3>
                <p>
                  {currentPersonal.primer_nombre}{" "}
                  {currentPersonal.primer_apellido} - {currentPersonal.cedula}
                </p>
              </div>
            )}

            {/* En modo edición, mostrar también el formulario de persona */}
            {modoEdicion && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Primer Nombre *
                    </label>
                    <input
                      type="text"
                      name="primer_nombre"
                      value={formDataPersona.primer_nombre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("primer_nombre", "persona")}
                      required
                    />
                    {errors.primer_nombre && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primer_nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      name="segundo_nombre"
                      value={formDataPersona.segundo_nombre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("segundo_nombre", "persona")}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Primer Apellido *
                    </label>
                    <input
                      type="text"
                      name="primer_apellido"
                      value={formDataPersona.primer_apellido}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("primer_apellido", "persona")}
                      required
                    />
                    {errors.primer_apellido && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primer_apellido}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      name="segundo_apellido"
                      value={formDataPersona.segundo_apellido}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("segundo_apellido", "persona")}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Cédula *
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      value={formDataPersona.cedula}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("cedula", "persona")}
                      required
                      disabled={!!personaSeleccionada}
                    />
                    {errors.cedula && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.cedula}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formDataPersona.fecha_nacimiento}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("fecha_nacimiento", "persona")}
                      required
                    />
                    {errors.fecha_nacimiento && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fecha_nacimiento}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Género *
                    </label>
                    <select
                      name="genero"
                      value={formDataPersona.genero}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("genero", "persona")}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                    {errors.genero && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.genero}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tipo de Sangre *
                    </label>
                    <select
                      name="tipo_sangre"
                      value={formDataPersona.tipo_sangre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("tipo_sangre", "persona")}
                      required
                    >
                      <option value="No sabe">No sabe</option>
                      <option value="O-">O-</option>
                      <option value="O+">O+</option>
                      <option value="A-">A-</option>
                      <option value="A+">A+</option>
                      <option value="B-">B-</option>
                      <option value="B+">B+</option>
                      <option value="AB-">AB-</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formDataPersona.direccion}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("direccion", "persona")}
                      required
                    />
                    {errors.direccion && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.direccion}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Teléfono Principal *
                    </label>
                    <input
                      type="text"
                      name="telefono_principal"
                      value={formDataPersona.telefono_principal}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("telefono_principal", "persona")}
                      required
                    />
                    {errors.telefono_principal && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.telefono_principal}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Teléfono Secundario
                    </label>
                    <input
                      type="text"
                      name="telefono_secundario"
                      value={formDataPersona.telefono_secundario}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass(
                        "telefono_secundario",
                        "persona"
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formDataPersona.email}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("email", "persona")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
                Información Laboral
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cargo *
                  </label>
                  <select
                    name="fk_cargo"
                    value={formDataPersonal.fk_cargo}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fk_cargo", "personal")}
                    required
                  >
                    <option value="">Seleccione un cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id_cargo} value={cargo.id_cargo}>
                        {cargo.nombre_cargo} ({cargo.tipo})
                      </option>
                    ))}
                  </select>
                  {errors.fk_cargo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fk_cargo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Función *
                  </label>
                  <select
                    name="fk_funcion"
                    value={formDataPersonal.fk_funcion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fk_funcion", "personal")}
                    required
                  >
                    <option value="">Seleccione una función</option>
                    {funcionesFiltradas.map((funcion) => (
                      <option
                        key={funcion.id_funcion_personal}
                        value={funcion.id_funcion_personal}
                      >
                        {funcion.nombre} ({funcion.tipo})
                      </option>
                    ))}
                  </select>
                  {errors.fk_funcion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fk_funcion}
                    </p>
                  )}
                  {funcionesFiltradas.length === 0 &&
                    formDataPersonal.fk_cargo && (
                      <p className="text-red-500 text-xs mt-1">
                        No hay funciones disponibles para el cargo seleccionado.
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Fecha de Contratación *
                  </label>
                  <input
                    type="date"
                    name="fecha_contratacion"
                    value={formDataPersonal.fecha_contratacion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fecha_contratacion", "personal")}
                    required
                  />
                  {errors.fecha_contratacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_contratacion}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={formDataPersonal.estado}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("estado", "personal")}
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="jubilado">Jubilado</option>
                  </select>
                  {errors.estado && (
                    <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nivel Académico
                  </label>
                  <input
                    type="text"
                    name="nivel_academico"
                    value={formDataPersonal.nivel_academico}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("nivel_academico", "personal")}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Horas de Trabajo
                  </label>
                  <input
                    type="number"
                    name="horas_trabajo"
                    value={formDataPersonal.horas_trabajo}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("horas_trabajo", "personal")}
                    min="0"
                    max="168"
                  />
                  {errors.horas_trabajo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.horas_trabajo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    RIF
                  </label>
                  <input
                    type="text"
                    name="rif"
                    value={formDataPersonal.rif}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("rif", "personal")}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Etnia/Religión
                  </label>
                  <input
                    type="text"
                    name="etnia_religion"
                    value={formDataPersonal.etnia_religion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("etnia_religion", "personal")}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cantidad de Hijas
                  </label>
                  <input
                    type="number"
                    name="cantidad_hijas"
                    value={formDataPersonal.cantidad_hijas}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("cantidad_hijas", "personal")}
                    min="0"
                    max="50"
                  />
                  {errors.cantidad_hijas && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cantidad_hijas}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cantidad de Hijos Varones
                  </label>
                  <input
                    type="number"
                    name="cantidad_hijos_varones"
                    value={formDataPersonal.cantidad_hijos_varones}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass(
                      "cantidad_hijos_varones",
                      "personal"
                    )}
                    min="0"
                    max="50"
                  />
                  {errors.cantidad_hijos_varones && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cantidad_hijos_varones}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Código de Dependencia
                  </label>
                  <input
                    type="text"
                    name="cod_dependencia"
                    value={formDataPersonal.cod_dependencia}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("cod_dependencia", "personal")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              {!modoEdicion ? (
                <button
                  type="button"
                  onClick={handleAnterior}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Atrás
                </button>
              ) : (
                <div></div>
              )}
              <div>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mr-2 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  {modoEdicion ? "Actualizar Personal" : "Guardar Personal"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
