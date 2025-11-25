import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaUserPlus,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import {
  solicitarPersonasParaPersonal,
  crearPersona,
  completarPersonal,
  actualizarPersonal,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Eliminado 'estado'
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
  });

  // Validaciones mejoradas
  const validarCampoPersona = (name, value) => {
    let error = "";

    switch (name) {
      case "primer_nombre":
        if (!value.trim()) error = "El primer nombre es requerido";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(value))
          error = "Solo letras y espacios, entre 2 y 50 caracteres";
        break;

      case "primer_apellido":
        if (!value.trim()) error = "El primer apellido es requerido";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(value))
          error = "Solo letras y espacios, entre 2 y 50 caracteres";
        break;

      case "cedula":
        if (!value.trim()) error = "La cédula es requerida";
        else if (!/^[VEve]?[-]?[0-9]{5,9}$/.test(value))
          error = "Formato de cédula inválido (Ej: V-12345678)";
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
          if (age > 100) error = "Edad inválida";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Formato de email inválido";
        break;

      case "telefono_principal":
        if (!value.trim()) error = "El teléfono principal es requerido";
        else if (!/^(\+?58)?[0-9]{10,11}$/.test(value.replace(/[-\s()]/g, "")))
          error = "Formato de teléfono venezolano inválido";
        break;

      case "direccion":
        if (!value.trim()) error = "La dirección es requerida";
        else if (value.length < 10)
          error = "La dirección debe tener al menos 10 caracteres";
        break;

      case "segundo_nombre":
      case "segundo_apellido":
        if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{0,50}$/.test(value))
          error = "Solo letras y espacios, máximo 50 caracteres";
        break;

      case "telefono_secundario":
        if (
          value &&
          !/^(\+?58)?[0-9]{10,11}$/.test(value.replace(/[-\s()]/g, ""))
        )
          error = "Formato de teléfono venezolano inválido";
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
        else {
          const contratacionDate = new Date(value);
          const today = new Date();
          if (contratacionDate > today) error = "La fecha no puede ser futura";
        }
        break;

      case "horas_trabajo":
        if (value && (value < 0 || value > 168))
          error = "Horas inválidas (0-168)";
        break;

      case "cantidad_hijas":
      case "cantidad_hijos_varones":
        if (value && (value < 0 || value > 50))
          error = "Cantidad inválida (0-50)";
        break;

      case "nivel_academico":
        if (value && value.length > 100) error = "Máximo 100 caracteres";
        break;

      case "rif":
        if (value && !/^[JVG]-\d{8}-\d$/.test(value))
          error = "Formato RIF inválido (Ej: J-12345678-9)";
        break;

      case "cod_dependencia":
        if (value && value.length > 20) error = "Máximo 20 caracteres";
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

  const getInputClass = (fieldName) => {
    const base =
      "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition duration-200";
    if (!touched[fieldName])
      return `${base} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    return errors[fieldName]
      ? `${base} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`
      : `${base} border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50`;
  };

  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
      if (currentPersonal) {
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
        });
        setPaso(1); // Empezar en paso 1 para edición completa
      } else {
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

  const filtrarPersonas = personas.filter((p) =>
    `${p.primer_nombre} ${p.primer_apellido} ${p.cedula}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const handleSeleccionarPersona = (p) => {
    setPersonaSeleccionada(p);
    setPaso(3);
  };

  const handleCrearNuevaPersona = () => {
    setPersonaSeleccionada(null);
    setPaso(2);
  };

  const validarFormularioPersona = () => {
    const req = [
      "primer_nombre",
      "primer_apellido",
      "cedula",
      "fecha_nacimiento",
      "genero",
      "direccion",
      "telefono_principal",
      "tipo_sangre",
      "nacionalidad",
    ];
    const newErrors = {};
    req.forEach((k) => {
      const err = validarCampoPersona(k, formDataPersona[k]);
      if (err) newErrors[k] = err;
    });
    if (formDataPersona.email) {
      const err = validarCampoPersona("email", formDataPersona.email);
      if (err) newErrors.email = err;
    }
    if (formDataPersona.telefono_secundario) {
      const err = validarCampoPersona(
        "telefono_secundario",
        formDataPersona.telefono_secundario
      );
      if (err) newErrors.telefono_secundario = err;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarFormularioPersonal = () => {
    const req = ["fk_cargo", "fk_funcion", "fecha_contratacion"];
    const newErrors = {};
    req.forEach((k) => {
      const err = validarCampoPersonal(k, formDataPersonal[k]);
      if (err) newErrors[k] = err;
    });
    if (formDataPersonal.horas_trabajo) {
      const err = validarCampoPersonal(
        "horas_trabajo",
        formDataPersonal.horas_trabajo
      );
      if (err) newErrors.horas_trabajo = err;
    }
    if (formDataPersonal.rif) {
      const err = validarCampoPersonal("rif", formDataPersonal.rif);
      if (err) newErrors.rif = err;
    }
    if (formDataPersonal.cantidad_hijas) {
      const err = validarCampoPersonal(
        "cantidad_hijas",
        formDataPersonal.cantidad_hijas
      );
      if (err) newErrors.cantidad_hijas = err;
    }
    if (formDataPersonal.cantidad_hijos_varones) {
      const err = validarCampoPersonal(
        "cantidad_hijos_varones",
        formDataPersonal.cantidad_hijos_varones
      );
      if (err) newErrors.cantidad_hijos_varones = err;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPersona = async (e) => {
    e.preventDefault();
    setTouched(
      Object.keys(formDataPersona).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {}
      )
    );

    if (!validarFormularioPersona()) {
      Swal.fire("Error", "Corrige los errores del formulario", "error");
      return;
    }

    const r = await crearPersona(formDataPersona, Swal);
    if (r) {
      setPersonaCreada(r);
      setPaso(3);
    }
  };

  const handleSubmitPersonal = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const allTouched = {};
    Object.keys(formDataPersonal).forEach((k) => (allTouched[k] = true));
    if (modoEdicion)
      Object.keys(formDataPersona).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    let valido =
      (modoEdicion ? validarFormularioPersona() : true) &&
      validarFormularioPersonal();
    if (!valido) {
      Swal.fire("Error", "Corrige los errores del formulario", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      if (modoEdicion) {
        if (!currentPersonal?.id_personal) {
          Swal.fire("Error", "No se identificó el personal.", "error");
          setIsSubmitting(false);
          return;
        }
        const datos = { ...formDataPersonal, ...formDataPersona };
        const r = await actualizarPersonal(
          currentPersonal.id_personal,
          datos,
          Swal
        );
        if (r) {
          onSuccess(r);
          onClose();
          resetForm();
        }
      } else {
        const idPersona = personaSeleccionada
          ? personaSeleccionada.id_persona
          : personaCreada.id_persona;
        if (!idPersona) {
          Swal.fire("Error", "Persona no identificada.", "error");
          setIsSubmitting(false);
          return;
        }
        const r = await completarPersonal(idPersona, formDataPersonal, Swal);
        if (r) {
          onSuccess(r);
          onClose();
          resetForm();
        }
      }
    } catch {
      Swal.fire("Error", "Error al guardar.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaso(1);
    setPersonaSeleccionada(null);
    setPersonaCreada(null);
    setModoEdicion(false);
    setErrors({});
    setTouched({});
    setBusqueda("");
    setIsSubmitting(false);
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
    });
  };

  const handleCancelar = () => {
    onClose();
    resetForm();
  };

  // Navegación entre pasos
  const handleSiguiente = () => {
    if (paso === 1 && personaSeleccionada) setPaso(3);
    else if (paso === 1) setPaso(2);
    else if (paso === 2) {
      if (validarFormularioPersona()) setPaso(3);
      else Swal.fire("Error", "Corrige los errores", "error");
    }
  };

  const handleAnterior = () => {
    if (paso === 3 && !personaSeleccionada) setPaso(2);
    else if (paso === 2 || (paso === 3 && personaSeleccionada)) setPaso(1);
  };

  // Filtrar funciones según el tipo de cargo seleccionado
  const funcionesFiltradas = funciones.filter((f) => {
    if (!formDataPersonal.fk_cargo) return true;
    const cargoSeleccionado = cargos.find(
      (c) => c.id_cargo == formDataPersonal.fk_cargo
    );
    if (!cargoSeleccionado) return true;
    switch (cargoSeleccionado.tipo) {
      case "Administrativo":
        return f.tipo === "Administrativo";
      case "Docente":
        return f.tipo === "Docente" || f.tipo === "Especialista";
      case "Obrero":
        return f.tipo === "Obrero";
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {modoEdicion
              ? "Editar Personal"
              : paso === 1
              ? "Seleccionar o Crear Persona"
              : paso === 2
              ? "Datos de la Persona"
              : "Datos de Personal"}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Paso {paso} de 3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((st) => (
                <div
                  key={st}
                  className={`w-3 h-3 rounded-full ${
                    paso === st ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

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
                  placeholder="Buscar persona (nombre, apellido, cédula)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 p-4 bg-gray-50 border-b">
                Personas Disponibles
              </h3>
              {filtrarPersonas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay personas disponibles.
                </p>
              ) : (
                <div className="divide-y">
                  {filtrarPersonas.map((p) => (
                    <div
                      key={p.id_persona}
                      className="p-4 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleSeleccionarPersona(p)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {p.primer_nombre} {p.segundo_nombre || ""}{" "}
                            {p.primer_apellido} {p.segundo_apellido || ""}
                          </h4>
                          <p className="text-gray-600">Cédula: {p.cedula}</p>
                          <p className="text-gray-600">
                            Tipo: {p.tipo_persona} | Estado: {p.estado} | Edad:{" "}
                            {p.edad} años
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {p.tipo_persona}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleCancelar}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Cancelar
              </button>
              <button
                type="button"
                onClick={handleSiguiente}
                disabled={
                  !personaSeleccionada &&
                  busqueda &&
                  filtrarPersonas.length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {personaSeleccionada ? "Continuar" : "Crear Nueva Persona"}{" "}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Formulario de Persona (solo para creación) */}
        {!modoEdicion && paso === 2 && (
          <form onSubmit={handleSubmitPersona}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Campos persona */}
              {/* (igual que antes, usando getInputClass) */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  name="primer_nombre"
                  value={formDataPersona.primer_nombre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("primer_nombre")}
                  required
                />
                {errors.primer_nombre && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.primer_nombre}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  name="segundo_nombre"
                  value={formDataPersona.segundo_nombre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("segundo_nombre")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  name="primer_apellido"
                  value={formDataPersona.primer_apellido}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("primer_apellido")}
                  required
                />
                {errors.primer_apellido && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.primer_apellido}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  name="segundo_apellido"
                  value={formDataPersona.segundo_apellido}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("segundo_apellido")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Cédula *</label>
                <input
                  type="text"
                  name="cedula"
                  value={formDataPersona.cedula}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("cedula")}
                  required
                  placeholder="V-12345678"
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formDataPersona.fecha_nacimiento}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("fecha_nacimiento")}
                  required
                />
                {errors.fecha_nacimiento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fecha_nacimiento}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Género *</label>
                <select
                  name="genero"
                  value={formDataPersona.genero}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("genero")}
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
                <label className="block text-sm font-bold mb-2">
                  Nacionalidad *
                </label>
                <input
                  type="text"
                  name="nacionalidad"
                  value={formDataPersona.nacionalidad}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("nacionalidad")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Tipo de Sangre *
                </label>
                <select
                  name="tipo_sangre"
                  value={formDataPersona.tipo_sangre}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("tipo_sangre")}
                  required
                >
                  {[
                    "No sabe",
                    "O-",
                    "O+",
                    "A-",
                    "A+",
                    "B-",
                    "B+",
                    "AB-",
                    "AB+",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formDataPersona.direccion}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("direccion")}
                  required
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.direccion}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Teléfono Principal *
                </label>
                <input
                  type="text"
                  name="telefono_principal"
                  value={formDataPersona.telefono_principal}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("telefono_principal")}
                  required
                />
                {errors.telefono_principal && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.telefono_principal}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Teléfono Secundario
                </label>
                <input
                  type="text"
                  name="telefono_secundario"
                  value={formDataPersona.telefono_secundario}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("telefono_secundario")}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formDataPersona.email}
                  onChange={handleChangePersona}
                  onBlur={(e) => handleBlur(e, "persona")}
                  className={getInputClass("email")}
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
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Atrás
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                  Continuar <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Paso 3: Formulario de Personal (para creación y edición) */}
        {(paso === 3 || modoEdicion) && (
          <form onSubmit={handleSubmitPersonal}>
            {!modoEdicion && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Persona Seleccionada:
                </h3>
                <p className="text-blue-700">
                  {personaSeleccionada
                    ? `${personaSeleccionada.primer_nombre} ${personaSeleccionada.primer_apellido} - ${personaSeleccionada.cedula}`
                    : `${personaCreada.primer_nombre} ${personaCreada.primer_apellido} - ${personaCreada.cedula}`}
                </p>
              </div>
            )}

            {modoEdicion && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Editando Personal:
                </h3>
                <p className="text-yellow-700">
                  {currentPersonal.primer_nombre}{" "}
                  {currentPersonal.primer_apellido} - {currentPersonal.cedula}
                </p>
              </div>
            )}

            {modoEdicion && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Campos persona en edición (reutilizados) */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Primer Nombre *
                    </label>
                    <input
                      type="text"
                      name="primer_nombre"
                      value={formDataPersona.primer_nombre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("primer_nombre")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      name="segundo_nombre"
                      value={formDataPersona.segundo_nombre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("segundo_nombre")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Primer Apellido *
                    </label>
                    <input
                      type="text"
                      name="primer_apellido"
                      value={formDataPersona.primer_apellido}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("primer_apellido")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      name="segundo_apellido"
                      value={formDataPersona.segundo_apellido}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("segundo_apellido")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Cédula *
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      value={formDataPersona.cedula}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("cedula")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formDataPersona.fecha_nacimiento}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("fecha_nacimiento")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Género *
                    </label>
                    <select
                      name="genero"
                      value={formDataPersona.genero}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("genero")}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Tipo de Sangre *
                    </label>
                    <select
                      name="tipo_sangre"
                      value={formDataPersona.tipo_sangre}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("tipo_sangre")}
                      required
                    >
                      {[
                        "No sabe",
                        "O-",
                        "O+",
                        "A-",
                        "A+",
                        "B-",
                        "B+",
                        "AB-",
                        "AB+",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formDataPersona.direccion}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("direccion")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Teléfono Principal *
                    </label>
                    <input
                      type="text"
                      name="telefono_principal"
                      value={formDataPersona.telefono_principal}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("telefono_principal")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Teléfono Secundario
                    </label>
                    <input
                      type="text"
                      name="telefono_secundario"
                      value={formDataPersona.telefono_secundario}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("telefono_secundario")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formDataPersona.email}
                      onChange={handleChangePersona}
                      onBlur={(e) => handleBlur(e, "persona")}
                      className={getInputClass("email")}
                    />
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
                  <label className="block text-sm font-bold mb-2">
                    Cargo *
                  </label>
                  <select
                    name="fk_cargo"
                    value={formDataPersonal.fk_cargo}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fk_cargo")}
                    required
                  >
                    <option value="">Seleccione un cargo</option>
                    {cargos.map((c) => (
                      <option key={c.id_cargo} value={c.id_cargo}>
                        {c.nombre_cargo} ({c.tipo})
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
                  <label className="block text-sm font-bold mb-2">
                    Función *
                  </label>
                  <select
                    name="fk_funcion"
                    value={formDataPersonal.fk_funcion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fk_funcion")}
                    required
                  >
                    <option value="">Seleccione una función</option>
                    {funcionesFiltradas.map((f) => (
                      <option
                        key={f.id_funcion_personal}
                        value={f.id_funcion_personal}
                      >
                        {f.nombre} ({f.tipo})
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
                  <label className="block text-sm font-bold mb-2">
                    Fecha de Contratación *
                  </label>
                  <input
                    type="date"
                    name="fecha_contratacion"
                    value={formDataPersonal.fecha_contratacion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("fecha_contratacion")}
                    required
                  />
                  {errors.fecha_contratacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_contratacion}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nivel Académico
                  </label>
                  <input
                    type="text"
                    name="nivel_academico"
                    value={formDataPersonal.nivel_academico}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("nivel_academico")}
                    placeholder="Licenciatura..."
                  />
                  {errors.nivel_academico && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nivel_academico}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Horas de Trabajo
                  </label>
                  <input
                    type="number"
                    name="horas_trabajo"
                    value={formDataPersonal.horas_trabajo}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("horas_trabajo")}
                    min="0"
                    max="168"
                    placeholder="40"
                  />
                  {errors.horas_trabajo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.horas_trabajo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">RIF</label>
                  <input
                    type="text"
                    name="rif"
                    value={formDataPersonal.rif}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("rif")}
                    placeholder="J-12345678-9"
                  />
                  {errors.rif && (
                    <p className="text-red-500 text-xs mt-1">{errors.rif}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Etnia/Religión
                  </label>
                  <input
                    type="text"
                    name="etnia_religion"
                    value={formDataPersonal.etnia_religion}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("etnia_religion")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Cantidad de Hijas
                  </label>
                  <input
                    type="number"
                    name="cantidad_hijas"
                    value={formDataPersonal.cantidad_hijas}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("cantidad_hijas")}
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
                  <label className="block text-sm font-bold mb-2">
                    Cantidad de Hijos Varones
                  </label>
                  <input
                    type="number"
                    name="cantidad_hijos_varones"
                    value={formDataPersonal.cantidad_hijos_varones}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("cantidad_hijos_varones")}
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
                  <label className="block text-sm font-bold mb-2">
                    Código de Dependencia
                  </label>
                  <input
                    type="text"
                    name="cod_dependencia"
                    value={formDataPersonal.cod_dependencia}
                    onChange={handleChangePersonal}
                    onBlur={(e) => handleBlur(e, "personal")}
                    className={getInputClass("cod_dependencia")}
                  />
                  {errors.cod_dependencia && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cod_dependencia}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              {!modoEdicion ? (
                <button
                  type="button"
                  onClick={handleAnterior}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Atrás
                </button>
              ) : (
                <div />
              )}
              <div>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : modoEdicion
                    ? "Actualizar Personal"
                    : "Guardar Personal"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
