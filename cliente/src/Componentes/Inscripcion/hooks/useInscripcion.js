import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  listarAulasDisponibles,
  listarEstudiantesElegibles,
  listarRepresentantesPorEstudiante,
  registrarInscripcion,
  verificarPrecondicionesInscripcion,
} from "../inscripcionService";

const crearFechaHoy = () => {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const datosIniciales = {
  fecha_inscripcion: crearFechaHoy(),
  vive_con: "",
  altura: "",
  talla_zapatos: "",
  talla_camisa: "",
  talla_pantalon: "",
  peso: "",
  tipo_vivienda: "",
  zona_vivienda: "",
  tenencia_viviencia: "",
  ingreso_familiar: "",
  miembros_familia: "",
  tareas_comunitarias: "no",
  participar_comite: "no",
  detalles_participacion: "",
  foto_estudiante: "no",
  foto_representante: "no",
  cedula_estudiante: "no",
  cedula_representante: "no",
};

const tiposInscripcion = [
  { valor: "regular", etiqueta: "Regular" },
  { valor: "nuevo_ingreso", etiqueta: "Nuevo ingreso" },
  { valor: "traslado", etiqueta: "Traslado" },
  { valor: "educado_en_casa", etiqueta: "Educado en casa" },
];

export const useInscripcion = () => {
  const [pasoActual, setPasoActual] = useState(0);
  const [precondiciones, setPrecondiciones] = useState(null);
  const [cargandoPrecondiciones, setCargandoPrecondiciones] = useState(false);

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  const [aulas, setAulas] = useState([]);
  const [cargandoAulas, setCargandoAulas] = useState(false);
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null);

  const [representantes, setRepresentantes] = useState([]);
  const [cargandoRepresentantes, setCargandoRepresentantes] = useState(false);
  const [representanteSeleccionado, setRepresentanteSeleccionado] =
    useState(null);

  const [tipoInscripcion, setTipoInscripcion] = useState(
    tiposInscripcion[0].valor
  );
  const [datosFormulario, setDatosFormulario] = useState(datosIniciales);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [resultadoRegistro, setResultadoRegistro] = useState(null);

  const totalPasos = 7;

  const cargarPrecondiciones = useCallback(async () => {
    setCargandoPrecondiciones(true);
    const respuesta = await verificarPrecondicionesInscripcion(Swal);
    setPrecondiciones(respuesta);
    setCargandoPrecondiciones(false);
  }, []);

  const cargarEstudiantes = useCallback(async () => {
    setCargandoEstudiantes(true);
    const respuesta = await listarEstudiantesElegibles(Swal);
    setEstudiantes(
      Array.isArray(respuesta?.estudiantes) ? respuesta.estudiantes : []
    );
    setCargandoEstudiantes(false);
  }, []);

  const cargarAulas = useCallback(async () => {
    setCargandoAulas(true);
    const respuesta = await listarAulasDisponibles(Swal);
    setAulas(Array.isArray(respuesta?.aulas) ? respuesta.aulas : []);
    setCargandoAulas(false);
  }, []);

  const cargarRepresentantes = useCallback(async (estudianteId) => {
    if (!estudianteId) {
      setRepresentantes([]);
      return;
    }
    setCargandoRepresentantes(true);
    const respuesta = await listarRepresentantesPorEstudiante(
      estudianteId,
      Swal
    );
    setRepresentantes(
      Array.isArray(respuesta?.representantes) ? respuesta.representantes : []
    );
    setCargandoRepresentantes(false);
  }, []);

  useEffect(() => {
    cargarPrecondiciones();
  }, [cargarPrecondiciones]);

  useEffect(() => {
    if (precondiciones?.listo) {
      cargarEstudiantes();
      cargarAulas();
    }
  }, [precondiciones, cargarEstudiantes, cargarAulas]);

  useEffect(() => {
    if (pasoActual === 3 && estudianteSeleccionado) {
      cargarRepresentantes(estudianteSeleccionado.id);
    }
  }, [pasoActual, estudianteSeleccionado, cargarRepresentantes]);

  const reiniciar = useCallback(() => {
    setPasoActual(0);
    setEstudianteSeleccionado(null);
    setAulaSeleccionada(null);
    setRepresentanteSeleccionado(null);
    setDatosFormulario(datosIniciales);
    setErroresFormulario({});
    setResultadoRegistro(null);
    setTipoInscripcion(tiposInscripcion[0].valor);
    cargarPrecondiciones();
  }, [cargarPrecondiciones]);

  const actualizarDato = useCallback((campo, valor) => {
    setDatosFormulario((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const alternarDatoSiNo = useCallback((campo) => {
    setDatosFormulario((prev) => ({
      ...prev,
      [campo]: prev[campo] === "si" ? "no" : "si",
    }));
  }, []);

  const validarPasoActual = useCallback(() => {
    switch (pasoActual) {
      case 0:
        if (!precondiciones?.listo) {
          Swal.fire(
            "Sistema no disponible",
            "Debes completar los requisitos del año escolar antes de inscribir.",
            "warning"
          );
          return false;
        }
        return true;
      case 1:
        if (!estudianteSeleccionado) {
          Swal.fire(
            "Selecciona un estudiante",
            "Debes elegir un estudiante para continuar.",
            "info"
          );
          return false;
        }
        return true;
      case 2:
        if (!aulaSeleccionada) {
          Swal.fire(
            "Selecciona la sección",
            "Debes elegir un grado y sección con cupo disponible.",
            "info"
          );
          return false;
        }
        return true;
      case 3:
        if (!representanteSeleccionado) {
          Swal.fire(
            "Selecciona un representante",
            "El estudiante debe tener un representante autorizado para continuar.",
            "info"
          );
          return false;
        }
        return true;
      case 4: {
        const camposRequeridos = [
          "fecha_inscripcion",
          "vive_con",
          "altura",
          "talla_zapatos",
          "talla_camisa",
          "talla_pantalon",
          "peso",
          "tipo_vivienda",
          "zona_vivienda",
          "tenencia_viviencia",
          "ingreso_familiar",
          "miembros_familia",
          "detalles_participacion",
        ];
        const nuevosErrores = {};
        camposRequeridos.forEach((campo) => {
          if (!datosFormulario[campo]) {
            nuevosErrores[campo] = "Este campo es obligatorio.";
          }
        });

        const numericFields = [
          "altura",
          "peso",
          "ingreso_familiar",
          "talla_zapatos",
          "talla_camisa",
          "talla_pantalon",
          "miembros_familia",
        ];
        numericFields.forEach((campo) => {
          const valor = datosFormulario[campo];
          if (valor === "") {
            return;
          }
          const numero = Number(valor);
          if (Number.isNaN(numero) || numero < 0) {
            nuevosErrores[campo] = "Debe ser un número válido.";
          }
        });

        if (Object.keys(nuevosErrores).length > 0) {
          setErroresFormulario(nuevosErrores);
          Swal.fire(
            "Revisa los datos",
            "Completa todos los campos obligatorios antes de continuar.",
            "warning"
          );
          return false;
        }
        setErroresFormulario({});
        return true;
      }
      default:
        return true;
    }
  }, [
    pasoActual,
    precondiciones,
    estudianteSeleccionado,
    aulaSeleccionada,
    representanteSeleccionado,
    datosFormulario,
  ]);

  const avanzar = useCallback(() => {
    if (!validarPasoActual()) {
      return;
    }
    setPasoActual((prev) => Math.min(prev + 1, totalPasos - 1));
  }, [validarPasoActual]);

  const retroceder = useCallback(() => {
    setPasoActual((prev) => Math.max(prev - 1, 0));
  }, []);

  const puedeAvanzar = useMemo(() => {
    if (pasoActual === totalPasos - 1) {
      return false;
    }
    switch (pasoActual) {
      case 0:
        return precondiciones?.listo ?? false;
      case 1:
        return Boolean(estudianteSeleccionado);
      case 2:
        return Boolean(aulaSeleccionada);
      case 3:
        return Boolean(representanteSeleccionado);
      case 4:
        return Object.values(datosFormulario).every((valor) => valor !== "");
      case 5:
        return true;
      default:
        return false;
    }
  }, [
    pasoActual,
    precondiciones,
    estudianteSeleccionado,
    aulaSeleccionada,
    representanteSeleccionado,
    datosFormulario,
  ]);

  const guardarInscripcion = useCallback(async () => {
    if (!validarPasoActual()) {
      return;
    }
    if (
      !estudianteSeleccionado ||
      !aulaSeleccionada ||
      !representanteSeleccionado
    ) {
      Swal.fire(
        "Datos incompletos",
        "Verifica la información seleccionada antes de guardar.",
        "warning"
      );
      return;
    }

    const payload = {
      estudiante_id: estudianteSeleccionado.id,
      aula_id: aulaSeleccionada.id_aula,
      representante_id: representanteSeleccionado.id,
      tipo_inscripcion: tipoInscripcion,
      datos: datosFormulario,
    };

    setGuardando(true);
    const respuesta = await registrarInscripcion(payload, Swal);
    setGuardando(false);

    if (respuesta) {
      setResultadoRegistro(respuesta);
      setPasoActual(totalPasos - 1);
      Swal.fire(
        "Inscripción lista",
        "Los datos se guardaron correctamente.",
        "success"
      );
    }
  }, [
    validarPasoActual,
    estudianteSeleccionado,
    aulaSeleccionada,
    representanteSeleccionado,
    tipoInscripcion,
    datosFormulario,
  ]);

  const resumen = useMemo(() => {
    if (
      !estudianteSeleccionado ||
      !aulaSeleccionada ||
      !representanteSeleccionado
    ) {
      return null;
    }
    return {
      estudiante: estudianteSeleccionado,
      aula: aulaSeleccionada,
      representante: representanteSeleccionado,
      datos: datosFormulario,
      tipoInscripcion,
      resultado: resultadoRegistro,
    };
  }, [
    estudianteSeleccionado,
    aulaSeleccionada,
    representanteSeleccionado,
    datosFormulario,
    tipoInscripcion,
    resultadoRegistro,
  ]);

  return {
    pasoActual,
    totalPasos,
    puedeAvanzar,
    avanzar,
    retroceder,
    guardarInscripcion,
    guardando,
    reiniciar,

    precondiciones,
    cargandoPrecondiciones,

    estudiantes,
    cargandoEstudiantes,
    estudianteSeleccionado,
    setEstudianteSeleccionado,

    aulas,
    cargandoAulas,
    aulaSeleccionada,
    setAulaSeleccionada,

    representantes,
    cargandoRepresentantes,
    representanteSeleccionado,
    setRepresentanteSeleccionado,

    datosFormulario,
    actualizarDato,
    alternarDatoSiNo,
    erroresFormulario,

    tipoInscripcion,
    setTipoInscripcion,
    tiposInscripcion,

    resumen,
    cargarPrecondiciones,
  };
};
