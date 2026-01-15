import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  solicitarPersonasParaPersonal,
  crearPersona,
  completarPersonal,
  actualizarPersonal,
  solicitarCargos,
  solicitarFunciones,
} from "./personalService";
import {
  personalModalClasses,
  personalFormClasses,
  personalWizardClasses,
  personalWizardModalClasses,
} from "./personalEstilos";
import VentanaModal from "../EstilosCliente/VentanaModal";

const initialPersonaState = {
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
};

const initialPersonalState = {
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
};

const normalizarTexto = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .toLowerCase();

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
  const [formDataPersona, setFormDataPersona] = useState(initialPersonaState);
  const [formDataPersonal, setFormDataPersonal] =
    useState(initialPersonalState);

  const resetForm = () => {
    setPaso(1);
    setPersonaSeleccionada(null);
    setPersonaCreada(null);
    setModoEdicion(false);
    setErrors({});
    setTouched({});
    setBusqueda("");
    setIsSubmitting(false);
    setFormDataPersona(initialPersonaState);
    setFormDataPersonal(initialPersonalState);
  };

  const validarCampoPersona = (name, value) => {
    const currentValue = value ?? "";
    let error = "";

    switch (name) {
      case "primer_nombre":
      case "primer_apellido":
        if (!currentValue.trim()) {
          error = `El ${
            name === "primer_nombre" ? "primer nombre" : "primer apellido"
          } es requerido`;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(currentValue)) {
          error = "Solo letras y espacios, entre 2 y 50 caracteres";
        }
        break;
      case "segundo_nombre":
      case "segundo_apellido":
        if (
          currentValue &&
          !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{0,50}$/.test(currentValue)
        ) {
          error = "Solo letras y espacios, máximo 50 caracteres";
        }
        break;
      case "cedula":
        if (!currentValue.trim()) {
          error = "La cédula es requerida";
        } else if (!/^[VEve]?-?[0-9]{5,9}$/.test(currentValue)) {
          error = "Formato de cédula inválido (Ej: V-12345678)";
        }
        break;
      case "fecha_nacimiento":
        if (!currentValue) {
          error = "La fecha de nacimiento es requerida";
        } else {
          const birthDate = new Date(currentValue);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age -= 1;
          }
          if (Number.isNaN(age) || age < 18) {
            error = "Debe ser mayor de 18 años";
          } else if (age > 100) {
            error = "Edad inválida";
          }
        }
        break;
      case "email":
        if (currentValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue)) {
          error = "Formato de email inválido";
        }
        break;
      case "telefono_principal":
        if (!currentValue.trim()) {
          error = "El teléfono principal es requerido";
        } else if (
          !/^(\+?58)?[0-9]{10,11}$/.test(currentValue.replace(/[-\s()]/g, ""))
        ) {
          error = "Formato de teléfono venezolano inválido";
        }
        break;
      case "telefono_secundario":
        if (
          currentValue &&
          !/^(\+?58)?[0-9]{10,11}$/.test(currentValue.replace(/[-\s()]/g, ""))
        ) {
          error = "Formato de teléfono venezolano inválido";
        }
        break;
      case "direccion":
        if (!currentValue.trim()) {
          error = "La dirección es requerida";
        } else if (currentValue.length < 10) {
          error = "La dirección debe tener al menos 10 caracteres";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validarCampoPersonal = (name, value) => {
    const currentValue = value ?? "";
    let error = "";

    switch (name) {
      case "fk_cargo":
        if (!currentValue) {
          error = "El cargo es requerido";
        }
        break;
      case "fk_funcion":
        if (!currentValue) {
          error = "La función es requerida";
        }
        break;
      case "fecha_contratacion":
        if (!currentValue) {
          error = "La fecha de contratación es requerida";
        } else {
          const contratacionDate = new Date(currentValue);
          const today = new Date();
          if (contratacionDate > today) {
            error = "La fecha no puede ser futura";
          }
        }
        break;
      case "horas_trabajo": {
        if (currentValue) {
          const numericValue = Number(currentValue);
          if (
            Number.isNaN(numericValue) ||
            numericValue < 0 ||
            numericValue > 168
          ) {
            error = "Horas inválidas (0-168)";
          }
        }
        break;
      }
      case "cantidad_hijas":
      case "cantidad_hijos_varones": {
        if (currentValue) {
          const numericValue = Number(currentValue);
          if (
            Number.isNaN(numericValue) ||
            numericValue < 0 ||
            numericValue > 50
          ) {
            error = "Cantidad inválida (0-50)";
          }
        }
        break;
      }
      case "nivel_academico":
        if (currentValue && currentValue.length > 100) {
          error = "Máximo 100 caracteres";
        }
        break;
      case "rif":
        if (currentValue && !/^[JVG]-\d{8}-\d$/.test(currentValue)) {
          error = "Formato RIF inválido (Ej: J-12345678-9)";
        }
        break;
      case "cod_dependencia":
        if (currentValue && currentValue.length > 20) {
          error = "Máximo 20 caracteres";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleBlur = (event, tipo) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error =
      tipo === "persona"
        ? validarCampoPersona(name, value)
        : validarCampoPersonal(name, value);

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChangePersona = (event) => {
    const { name, value } = event.target;
    setFormDataPersona((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validarCampoPersona(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChangePersonal = (event) => {
    const { name, value } = event.target;
    setFormDataPersonal((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validarCampoPersonal(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const getFieldClass = (fieldName, inputType = "input") => {
    const hasError = Boolean(errors[fieldName]);
    const isTouched = Boolean(touched[fieldName]);

    if (inputType === "select") {
      if (!isTouched) {
        return personalFormClasses.select;
      }
      return hasError
        ? personalFormClasses.selectInvalid
        : personalFormClasses.select;
    }

    if (!isTouched) {
      return personalFormClasses.input;
    }
    return hasError
      ? personalFormClasses.inputInvalid
      : personalFormClasses.inputValid;
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const bootstrap = async () => {
      await solicitarPersonasParaPersonal(setPersonas, Swal);
      await solicitarCargos(setCargos, Swal);
      await solicitarFunciones(setFunciones, Swal);
    };

    bootstrap();

    if (currentPersonal) {
      setModoEdicion(true);
      setPaso(3);
      setErrors({});
      setTouched({});
      setBusqueda("");
      setPersonaSeleccionada(null);
      setPersonaCreada(null);
      setIsSubmitting(false);
      setFormDataPersona({
        ...initialPersonaState,
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
        ...initialPersonalState,
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
    } else {
      resetForm();
    }
  }, [isOpen, currentPersonal]);

  const personasFiltradas = useMemo(() => {
    const term = normalizarTexto(busqueda.trim());
    if (!term) {
      return personas;
    }

    return personas.filter((persona) => {
      const fullText = `${persona.primer_nombre || ""} ${
        persona.segundo_nombre || ""
      } ${persona.primer_apellido || ""} ${persona.segundo_apellido || ""} ${
        persona.cedula || ""
      }`;
      return normalizarTexto(fullText).includes(term);
    });
  }, [busqueda, personas]);

  const funcionesFiltradas = useMemo(() => {
    if (!formDataPersonal.fk_cargo) {
      return funciones;
    }

    const cargoSeleccionado = cargos.find(
      (cargo) => String(cargo.id_cargo) === String(formDataPersonal.fk_cargo)
    );

    if (!cargoSeleccionado) {
      return funciones;
    }

    switch (cargoSeleccionado.tipo) {
      case "Administrativo":
        return funciones.filter((funcion) => funcion.tipo === "Administrativo");
      case "Docente":
        return funciones.filter(
          (funcion) =>
            funcion.tipo === "Docente" || funcion.tipo === "Especialista"
        );
      case "Obrero":
        return funciones.filter((funcion) => funcion.tipo === "Obrero");
      default:
        return funciones;
    }
  }, [cargos, formDataPersonal.fk_cargo, funciones]);

  const handleSeleccionarPersona = (persona) => {
    setPersonaSeleccionada(persona);
    setPaso(3);
  };

  const handleCrearNuevaPersona = () => {
    setPersonaSeleccionada(null);
    setPaso(2);
  };

  const validarFormularioPersona = () => {
    const camposRequeridos = [
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

    const nuevosErrores = {};

    camposRequeridos.forEach((campo) => {
      const error = validarCampoPersona(campo, formDataPersona[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    if (formDataPersona.email) {
      const error = validarCampoPersona("email", formDataPersona.email);
      if (error) {
        nuevosErrores.email = error;
      }
    }

    if (formDataPersona.telefono_secundario) {
      const error = validarCampoPersona(
        "telefono_secundario",
        formDataPersona.telefono_secundario
      );
      if (error) {
        nuevosErrores.telefono_secundario = error;
      }
    }

    setErrors((prev) => ({ ...prev, ...nuevosErrores }));
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarFormularioPersonal = () => {
    const camposRequeridos = ["fk_cargo", "fk_funcion", "fecha_contratacion"];
    const nuevosErrores = {};

    camposRequeridos.forEach((campo) => {
      const error = validarCampoPersonal(campo, formDataPersonal[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    [
      "horas_trabajo",
      "rif",
      "cantidad_hijas",
      "cantidad_hijos_varones",
    ].forEach((campo) => {
      if (formDataPersonal[campo]) {
        const error = validarCampoPersonal(campo, formDataPersonal[campo]);
        if (error) {
          nuevosErrores[campo] = error;
        }
      }
    });

    setErrors((prev) => ({ ...prev, ...nuevosErrores }));
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmitPersona = async (event) => {
    event.preventDefault();

    setTouched((prev) => ({
      ...prev,
      ...Object.keys(formDataPersona).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      ),
    }));

    if (!validarFormularioPersona()) {
      Swal.fire("Error", "Corrige los errores del formulario", "error");
      return;
    }

    const persona = await crearPersona(formDataPersona, Swal);
    if (persona) {
      setPersonaCreada(persona);
      setPaso(3);
    }
  };

  const handleSubmitPersonal = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const nuevosTouched = {};
    Object.keys(formDataPersonal).forEach((campo) => {
      nuevosTouched[campo] = true;
    });
    if (modoEdicion) {
      Object.keys(formDataPersona).forEach((campo) => {
        nuevosTouched[campo] = true;
      });
    }
    setTouched((prev) => ({ ...prev, ...nuevosTouched }));

    const formulariosValidos =
      (modoEdicion ? validarFormularioPersona() : true) &&
      validarFormularioPersonal();

    if (!formulariosValidos) {
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

        const datosActualizados = { ...formDataPersonal, ...formDataPersona };
        const resultado = await actualizarPersonal(
          currentPersonal.id_personal,
          datosActualizados,
          Swal
        );

        if (resultado) {
          onSuccess(resultado);
          onClose();
          resetForm();
        }
      } else {
        const idPersona =
          personaSeleccionada?.id_persona || personaCreada?.id_persona;
        if (!idPersona) {
          Swal.fire("Error", "Persona no identificada.", "error");
          setIsSubmitting(false);
          return;
        }

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
    } catch (error) {
      console.error("Error al guardar personal", error);
      Swal.fire("Error", "Error al guardar.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    onClose();
    resetForm();
  };

  const handleSiguiente = () => {
    if (paso === 1 && personaSeleccionada) {
      setPaso(3);
    } else if (paso === 1) {
      setPaso(2);
    } else if (paso === 2) {
      if (validarFormularioPersona()) {
        setPaso(3);
      } else {
        Swal.fire("Error", "Corrige los errores", "error");
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

  if (!isOpen) {
    return null;
  }

  const modalTitle = modoEdicion
    ? "Editar Personal"
    : paso === 1
    ? "Seleccionar o Crear Persona"
    : paso === 2
    ? "Datos de la Persona"
    : "Datos de Personal";

  const renderStepIndicator = () => {
    if (modoEdicion) {
      return (
        <div className={personalModalClasses.meta}>
          <span className={personalModalClasses.stepBadge}>Modo edición</span>
        </div>
      );
    }

    return (
      <div className={personalModalClasses.meta}>
        <span className={personalModalClasses.stepBadge}>Paso {paso} de 3</span>
        <div className={personalModalClasses.stepDots}>
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`${personalModalClasses.stepDot} ${
                paso === step ? personalModalClasses.stepDotActive : ""
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderError = (field) =>
    errors[field] ? (
      <p className={personalFormClasses.error}>{errors[field]}</p>
    ) : null;

  const fieldGroupClass = `${personalFormClasses.group} mb-0`;

  const renderPersonaFields = () => (
    <div className={personalWizardClasses.gridTwoCols}>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="primer_nombre">
          Primer Nombre *
        </label>
        <input
          type="text"
          id="primer_nombre"
          name="primer_nombre"
          value={formDataPersona.primer_nombre}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("primer_nombre")}
          required
        />
        {renderError("primer_nombre")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="segundo_nombre">
          Segundo Nombre
        </label>
        <input
          type="text"
          id="segundo_nombre"
          name="segundo_nombre"
          value={formDataPersona.segundo_nombre}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("segundo_nombre")}
        />
        {renderError("segundo_nombre")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="primer_apellido">
          Primer Apellido *
        </label>
        <input
          type="text"
          id="primer_apellido"
          name="primer_apellido"
          value={formDataPersona.primer_apellido}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("primer_apellido")}
          required
        />
        {renderError("primer_apellido")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="segundo_apellido">
          Segundo Apellido
        </label>
        <input
          type="text"
          id="segundo_apellido"
          name="segundo_apellido"
          value={formDataPersona.segundo_apellido}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("segundo_apellido")}
        />
        {renderError("segundo_apellido")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="cedula">
          Cédula *
        </label>
        <input
          type="text"
          id="cedula"
          name="cedula"
          value={formDataPersona.cedula}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("cedula")}
          placeholder="V-12345678"
          required
        />
        {renderError("cedula")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="fecha_nacimiento">
          Fecha de Nacimiento *
        </label>
        <input
          type="date"
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          value={formDataPersona.fecha_nacimiento}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("fecha_nacimiento")}
          required
        />
        {renderError("fecha_nacimiento")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="genero">
          Género *
        </label>
        <select
          id="genero"
          name="genero"
          value={formDataPersona.genero}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("genero", "select")}
          required
        >
          <option value="">Seleccione...</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
        {renderError("genero")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="nacionalidad">
          Nacionalidad *
        </label>
        <input
          type="text"
          id="nacionalidad"
          name="nacionalidad"
          value={formDataPersona.nacionalidad}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("nacionalidad")}
          required
        />
        {renderError("nacionalidad")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="tipo_sangre">
          Tipo de Sangre *
        </label>
        <select
          id="tipo_sangre"
          name="tipo_sangre"
          value={formDataPersona.tipo_sangre}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("tipo_sangre", "select")}
          required
        >
          {["No sabe", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map(
            (tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            )
          )}
        </select>
        {renderError("tipo_sangre")}
      </div>
      <div className={`${fieldGroupClass} md:col-span-2`}>
        <label className={personalFormClasses.label} htmlFor="direccion">
          Dirección *
        </label>
        <input
          type="text"
          id="direccion"
          name="direccion"
          value={formDataPersona.direccion}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("direccion")}
          required
        />
        {renderError("direccion")}
      </div>
      <div className={fieldGroupClass}>
        <label
          className={personalFormClasses.label}
          htmlFor="telefono_principal"
        >
          Teléfono Principal *
        </label>
        <input
          type="text"
          id="telefono_principal"
          name="telefono_principal"
          value={formDataPersona.telefono_principal}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("telefono_principal")}
          required
        />
        {renderError("telefono_principal")}
      </div>
      <div className={fieldGroupClass}>
        <label
          className={personalFormClasses.label}
          htmlFor="telefono_secundario"
        >
          Teléfono Secundario
        </label>
        <input
          type="text"
          id="telefono_secundario"
          name="telefono_secundario"
          value={formDataPersona.telefono_secundario}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("telefono_secundario")}
        />
        {renderError("telefono_secundario")}
      </div>
      <div className={`${fieldGroupClass} md:col-span-2`}>
        <label className={personalFormClasses.label} htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formDataPersona.email}
          onChange={handleChangePersona}
          onBlur={(event) => handleBlur(event, "persona")}
          className={getFieldClass("email")}
        />
        {renderError("email")}
      </div>
    </div>
  );

  const renderPersonalFields = () => (
    <div className={personalWizardClasses.gridTwoCols}>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="fk_cargo">
          Cargo *
        </label>
        <select
          id="fk_cargo"
          name="fk_cargo"
          value={formDataPersonal.fk_cargo}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("fk_cargo", "select")}
          required
        >
          <option value="">Seleccione un cargo</option>
          {cargos.map((cargo) => (
            <option key={cargo.id_cargo} value={cargo.id_cargo}>
              {cargo.nombre_cargo} ({cargo.tipo})
            </option>
          ))}
        </select>
        {renderError("fk_cargo")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="fk_funcion">
          Función *
        </label>
        <select
          id="fk_funcion"
          name="fk_funcion"
          value={formDataPersonal.fk_funcion}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("fk_funcion", "select")}
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
        {renderError("fk_funcion")}
        {funcionesFiltradas.length === 0 && formDataPersonal.fk_cargo && (
          <p className={personalFormClasses.helper}>
            No hay funciones disponibles para el cargo seleccionado.
          </p>
        )}
      </div>
      <div className={fieldGroupClass}>
        <label
          className={personalFormClasses.label}
          htmlFor="fecha_contratacion"
        >
          Fecha de Contratación *
        </label>
        <input
          type="date"
          id="fecha_contratacion"
          name="fecha_contratacion"
          value={formDataPersonal.fecha_contratacion}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("fecha_contratacion")}
          required
        />
        {renderError("fecha_contratacion")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="nivel_academico">
          Nivel Académico
        </label>
        <input
          type="text"
          id="nivel_academico"
          name="nivel_academico"
          value={formDataPersonal.nivel_academico}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("nivel_academico")}
          placeholder="Licenciatura..."
        />
        {renderError("nivel_academico")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="horas_trabajo">
          Horas de Trabajo
        </label>
        <input
          type="number"
          id="horas_trabajo"
          name="horas_trabajo"
          value={formDataPersonal.horas_trabajo}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("horas_trabajo")}
          min="0"
          max="168"
          placeholder="40"
        />
        {renderError("horas_trabajo")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="rif">
          RIF
        </label>
        <input
          type="text"
          id="rif"
          name="rif"
          value={formDataPersonal.rif}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("rif")}
          placeholder="J-12345678-9"
        />
        {renderError("rif")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="etnia_religion">
          Etnia/Religión
        </label>
        <input
          type="text"
          id="etnia_religion"
          name="etnia_religion"
          value={formDataPersonal.etnia_religion}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("etnia_religion")}
        />
        {renderError("etnia_religion")}
      </div>
      <div className={fieldGroupClass}>
        <label className={personalFormClasses.label} htmlFor="cantidad_hijas">
          Cantidad de Hijas
        </label>
        <input
          type="number"
          id="cantidad_hijas"
          name="cantidad_hijas"
          value={formDataPersonal.cantidad_hijas}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("cantidad_hijas")}
          min="0"
          max="50"
        />
        {renderError("cantidad_hijas")}
      </div>
      <div className={fieldGroupClass}>
        <label
          className={personalFormClasses.label}
          htmlFor="cantidad_hijos_varones"
        >
          Cantidad de Hijos Varones
        </label>
        <input
          type="number"
          id="cantidad_hijos_varones"
          name="cantidad_hijos_varones"
          value={formDataPersonal.cantidad_hijos_varones}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("cantidad_hijos_varones")}
          min="0"
          max="50"
        />
        {renderError("cantidad_hijos_varones")}
      </div>
      <div className={`${fieldGroupClass} md:col-span-2`}>
        <label className={personalFormClasses.label} htmlFor="cod_dependencia">
          Código de Dependencia
        </label>
        <input
          type="text"
          id="cod_dependencia"
          name="cod_dependencia"
          value={formDataPersonal.cod_dependencia}
          onChange={handleChangePersonal}
          onBlur={(event) => handleBlur(event, "personal")}
          className={getFieldClass("cod_dependencia")}
        />
        {renderError("cod_dependencia")}
      </div>
    </div>
  );

  const renderPersonaSelectionStep = () => (
    <div className={personalWizardClasses.selectionLayout}>
      <button
        type="button"
        onClick={handleCrearNuevaPersona}
        className={`${personalFormClasses.primaryButton} ${personalWizardClasses.buttonBlock}`}
      >
        <FaUserPlus className={personalWizardClasses.iconSmall} />
        <span>Crear nueva persona</span>
      </button>

      <div className={personalWizardClasses.stackSm}>
        <div className={personalModalClasses.searchWrapper}>
          <FaSearch className={personalModalClasses.searchIcon} />
          <input
            type="text"
            placeholder="Buscar persona (nombre, apellido, cédula)..."
            className={personalWizardClasses.searchInput}
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      </div>

      <div className={personalModalClasses.listWrapper}>
        <div className={personalModalClasses.listHeader}>
          <span>Personas disponibles</span>
          <span>{personasFiltradas.length}</span>
        </div>
        {personasFiltradas.length === 0 ? (
          <p className={personalModalClasses.listEmpty}>
            No hay personas disponibles.
          </p>
        ) : (
          <div className={personalWizardClasses.listDivider}>
            {personasFiltradas.map((persona) => {
              const isSelected =
                personaSeleccionada?.id_persona === persona.id_persona;
              const nombreCompleto = `${persona.primer_nombre || ""} ${
                persona.segundo_nombre || ""
              } ${persona.primer_apellido || ""} ${
                persona.segundo_apellido || ""
              }`
                .replace(/\s+/g, " ")
                .trim();

              return (
                <button
                  type="button"
                  key={persona.id_persona}
                  onClick={() => handleSeleccionarPersona(persona)}
                  className={`${personalModalClasses.listItem} ${
                    isSelected ? personalWizardClasses.listItemSelected : ""
                  }`}
                >
                  <div className={personalModalClasses.listPerson}>
                    <span className={personalModalClasses.listName}>
                      {nombreCompleto}
                    </span>
                    <span className={personalModalClasses.listMeta}>
                      Cédula: {persona.cedula} · Tipo: {persona.tipo_persona} ·
                      Estado: {persona.estado}
                    </span>
                    <span className={personalModalClasses.listMeta}>
                      Edad: {persona.edad ?? "-"} años
                    </span>
                  </div>
                  <span className={personalModalClasses.listTag}>
                    {persona.tipo_persona}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={personalModalClasses.actionBar}>
        <div className={personalWizardClasses.actionLeft}>
          <button
            type="button"
            onClick={handleCancelar}
            className={`${personalFormClasses.cancelButton} ${personalWizardClasses.buttonBlock}`}
          >
            <FaArrowLeft className={personalWizardClasses.iconSmall} />
            <span>Cancelar</span>
          </button>
        </div>
        <div className={personalWizardClasses.actionRight}>
          <button
            type="button"
            onClick={handleSiguiente}
            disabled={
              !personaSeleccionada &&
              Boolean(busqueda) &&
              personasFiltradas.length === 0
            }
            className={`${personalFormClasses.primaryButton} ${personalWizardClasses.buttonBlock} ${personalWizardClasses.buttonDisabled}`}
          >
            <span>
              {personaSeleccionada ? "Continuar" : "Crear nueva persona"}
            </span>
            <FaArrowRight className={personalWizardClasses.iconSmall} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPersonaFormStep = () => (
    <form
      onSubmit={handleSubmitPersona}
      className={personalWizardClasses.stepForm}
      autoComplete="off"
    >
      <h3 className={personalFormClasses.sectionTitle}>Datos de la persona</h3>
      {renderPersonaFields()}
      <div className={personalModalClasses.actionBar}>
        <div className={personalWizardClasses.actionLeft}>
          <button
            type="button"
            onClick={handleAnterior}
            className={`${personalFormClasses.backButton} ${personalWizardClasses.buttonBlock}`}
          >
            <FaArrowLeft className={personalWizardClasses.iconSmall} />
            <span>Atrás</span>
          </button>
        </div>
        <div className={personalWizardClasses.actionRight}>
          <button
            type="button"
            onClick={handleCancelar}
            className={`${personalFormClasses.cancelButton} ${personalWizardClasses.buttonBlock}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`${personalFormClasses.primaryButton} ${personalWizardClasses.buttonBlock}`}
          >
            <span>Continuar</span>
            <FaArrowRight className={personalWizardClasses.iconSmall} />
          </button>
        </div>
      </div>
    </form>
  );

  const renderPersonalFormStep = () => {
    const personaResumen = personaSeleccionada || personaCreada;

    return (
      <form
        onSubmit={handleSubmitPersonal}
        className={personalWizardClasses.stepForm}
        autoComplete="off"
      >
        {!modoEdicion && personaResumen && (
          <div className={personalFormClasses.highlightCard}>
            <span className={personalWizardClasses.summaryLabel}>
              Persona seleccionada
            </span>
            <span className={personalWizardClasses.summaryText}>
              {personaResumen.primer_nombre} {personaResumen.primer_apellido} -{" "}
              {personaResumen.cedula}
            </span>
          </div>
        )}

        {modoEdicion && currentPersonal && (
          <div className={personalModalClasses.bannerWarning}>
            <span className={personalWizardClasses.summaryLabel}>
              Editando personal
            </span>
            <span className={personalWizardClasses.summaryText}>
              {currentPersonal.primer_nombre} {currentPersonal.primer_apellido}{" "}
              - {currentPersonal.cedula}
            </span>
          </div>
        )}

        {modoEdicion && (
          <div className={personalWizardClasses.stackMd}>
            <h3 className={personalFormClasses.sectionTitle}>
              Información personal
            </h3>
            {renderPersonaFields()}
          </div>
        )}

        <div className={personalWizardClasses.stackMd}>
          <h3 className={personalFormClasses.sectionTitle}>
            Información laboral
          </h3>
          {renderPersonalFields()}
        </div>

        <div className={personalModalClasses.actionBar}>
          <div className={personalWizardClasses.actionLeft}>
            {!modoEdicion && (
              <button
                type="button"
                onClick={handleAnterior}
                className={`${personalFormClasses.backButton} ${personalWizardClasses.buttonBlock}`}
              >
                <FaArrowLeft className={personalWizardClasses.iconSmall} />
                <span>Atrás</span>
              </button>
            )}
          </div>
          <div className={personalWizardClasses.actionRight}>
            <button
              type="button"
              onClick={handleCancelar}
              className={`${personalFormClasses.cancelButton} ${personalWizardClasses.buttonBlock}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${personalFormClasses.primaryButton} ${personalWizardClasses.buttonBlock} ${personalWizardClasses.buttonDisabled}`}
            >
              <span>
                {isSubmitting
                  ? "Guardando..."
                  : modoEdicion
                  ? "Actualizar personal"
                  : "Guardar personal"}
              </span>
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={handleCancelar}
      title={modalTitle}
      size="xl"
      bodyClassName={personalWizardModalClasses.body}
      headerSlot={renderStepIndicator()}
      contentClassName={personalWizardModalClasses.content}
    >
      <>
        {!modoEdicion && paso === 1 && renderPersonaSelectionStep()}
        {!modoEdicion && paso === 2 && renderPersonaFormStep()}
        {(paso === 3 || modoEdicion) && renderPersonalFormStep()}
      </>
    </VentanaModal>
  );
};
