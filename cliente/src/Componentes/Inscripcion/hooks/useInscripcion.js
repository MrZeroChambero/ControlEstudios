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
  { valor: "no_escolarizado", etiqueta: "No escolarizado" },
];

const camposObligatoriosGenerales = [
  "fecha_inscripcion",
  "vive_con",
  "tipo_vivienda",
  "zona_vivienda",
  "tenencia_viviencia",
];

const camposObligatoriosIndicadores = [
  "ingreso_familiar",
  "miembros_familia",
  "altura",
  "peso",
  "talla_zapatos",
  "talla_camisa",
  "talla_pantalon",
];

const mapaCampoSeccion = {
  tipo_inscripcion: "tipo",
  fecha_inscripcion: "generales",
  vive_con: "generales",
  tipo_vivienda: "generales",
  zona_vivienda: "generales",
  tenencia_viviencia: "generales",
  ingreso_familiar: "indicadores",
  miembros_familia: "indicadores",
  altura: "indicadores",
  peso: "indicadores",
  talla_zapatos: "indicadores",
  talla_camisa: "indicadores",
  talla_pantalon: "indicadores",
};

const estadoInicialSeccionesFamilia = {
  tipo: "neutral",
  generales: "neutral",
  indicadores: "neutral",
};

export const useInscripcion = () => {
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
  const [datosFormulario, setDatosFormulario] = useState(() => ({
    ...datosIniciales,
  }));
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [estadoSeccionesFamilia, setEstadoSeccionesFamilia] = useState(
    estadoInicialSeccionesFamilia
  );
  const [guardando, setGuardando] = useState(false);
  const [resultadoRegistro, setResultadoRegistro] = useState(null);

  const cargarPrecondiciones = useCallback(async () => {
    setCargandoPrecondiciones(true);
    const respuesta = await verificarPrecondicionesInscripcion(Swal);
    setPrecondiciones(respuesta);
    setCargandoPrecondiciones(false);
  }, []);

  useEffect(() => {
    if (!precondiciones || precondiciones.listo !== false) {
      return;
    }

    const motivos = Array.isArray(precondiciones.motivos)
      ? precondiciones.motivos.filter(
          (motivo) => typeof motivo === "string" && motivo.trim().length > 0
        )
      : [];

    const detalle =
      motivos.length > 0
        ? motivos.join("\n")
        : "La funcion de inscribir estudiantes se encuentra en desarrollo. Aun no es posible registrar nuevas inscripciones.";

    Swal.fire("Inscripcion no disponible", detalle, "info");
  }, [precondiciones]);

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
      setCargandoRepresentantes(false);
      return;
    }

    setCargandoRepresentantes(true);
    try {
      const respuesta = await listarRepresentantesPorEstudiante(
        estudianteId,
        Swal
      );
      setRepresentantes(
        Array.isArray(respuesta?.representantes) ? respuesta.representantes : []
      );
    } catch {
      setRepresentantes([]);
    } finally {
      setCargandoRepresentantes(false);
    }
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
    if (!estudianteSeleccionado?.id) {
      setRepresentantes([]);
      setRepresentanteSeleccionado(null);
      return;
    }

    setRepresentanteSeleccionado(null);
    cargarRepresentantes(estudianteSeleccionado.id);
  }, [estudianteSeleccionado, cargarRepresentantes]);

  const reiniciar = useCallback(() => {
    setPrecondiciones(null);
    setEstudiantes([]);
    setAulas([]);
    setRepresentantes([]);
    setEstudianteSeleccionado(null);
    setAulaSeleccionada(null);
    setRepresentanteSeleccionado(null);
    setDatosFormulario({ ...datosIniciales });
    setErroresFormulario({});
    setResultadoRegistro(null);
    setTipoInscripcion(tiposInscripcion[0].valor);
    setEstadoSeccionesFamilia(estadoInicialSeccionesFamilia);
    cargarPrecondiciones();
  }, [cargarPrecondiciones]);

  const seleccionarEstudiante = useCallback((estudiante) => {
    setEstudianteSeleccionado(estudiante || null);
    setResultadoRegistro(null);
  }, []);

  const seleccionarAula = useCallback((aula) => {
    setAulaSeleccionada(aula || null);
    setResultadoRegistro(null);
  }, []);

  const seleccionarRepresentante = useCallback((representante) => {
    setRepresentanteSeleccionado(representante || null);
    setResultadoRegistro(null);
  }, []);

  const actualizarDato = useCallback((campo, valor) => {
    setDatosFormulario((prev) => {
      if (prev[campo] === valor) {
        return prev;
      }
      return { ...prev, [campo]: valor };
    });
    setResultadoRegistro(null);

    setErroresFormulario((prev) => {
      if (!prev[campo]) {
        return prev;
      }
      const actualizado = { ...prev };
      delete actualizado[campo];
      return actualizado;
    });

    const seccion = mapaCampoSeccion[campo];
    if (seccion) {
      setEstadoSeccionesFamilia((prev) => {
        if (prev[seccion] === "error") {
          return { ...prev, [seccion]: "neutral" };
        }
        return prev;
      });
    }
  }, []);

  const alternarDatoSiNo = useCallback((campo) => {
    setDatosFormulario((prev) => ({
      ...prev,
      [campo]: prev[campo] === "si" ? "no" : "si",
    }));
    setResultadoRegistro(null);
  }, []);

  const actualizarTipoInscripcion = useCallback((valor) => {
    setTipoInscripcion(valor);
    setResultadoRegistro(null);
    setEstadoSeccionesFamilia((prev) => ({
      ...prev,
      tipo: valor ? "neutral" : "error",
    }));
  }, []);

  const validarDatosFamilia = useCallback(() => {
    const nuevosErrores = {};

    let generalesValidos = true;
    camposObligatoriosGenerales.forEach((campo) => {
      const valor = datosFormulario[campo];
      if (valor === undefined || valor === null) {
        nuevosErrores[campo] = "Este campo es obligatorio.";
        generalesValidos = false;
        return;
      }
      if (String(valor).trim() === "") {
        nuevosErrores[campo] = "Este campo es obligatorio.";
        generalesValidos = false;
      }
    });

    let indicadoresValidos = true;
    camposObligatoriosIndicadores.forEach((campo) => {
      const valor = datosFormulario[campo];
      if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
      ) {
        nuevosErrores[campo] = "Este campo es obligatorio.";
        indicadoresValidos = false;
        return;
      }

      const numero = Number(valor);
      const esNumeroValido = !Number.isNaN(numero);
      if (!esNumeroValido || numero < 0) {
        nuevosErrores[campo] = "Debe ser un número válido.";
        indicadoresValidos = false;
      }
      if (campo === "miembros_familia" && numero < 1) {
        nuevosErrores[campo] = "Debe registrar al menos un miembro.";
        indicadoresValidos = false;
      }
    });

    const tipoValido = Boolean(tipoInscripcion);

    const hayErrores =
      !tipoValido ||
      !generalesValidos ||
      !indicadoresValidos ||
      Object.keys(nuevosErrores).length > 0;

    setErroresFormulario(hayErrores ? nuevosErrores : {});
    setEstadoSeccionesFamilia({
      tipo: tipoValido ? "success" : "error",
      generales: generalesValidos ? "success" : "error",
      indicadores: indicadoresValidos ? "success" : "error",
    });

    if (hayErrores) {
      const seccionesPendientes = [];
      if (!tipoValido) seccionesPendientes.push("Tipo de inscripción");
      if (!generalesValidos)
        seccionesPendientes.push("Datos generales del hogar");
      if (!indicadoresValidos)
        seccionesPendientes.push("Indicadores socioeconómicos");

      const detalle =
        seccionesPendientes.length > 0
          ? `Completa o corrige: ${seccionesPendientes.join(", ")}.`
          : "Revisa los campos resaltados en rojo.";

      Swal.fire(
        "Información incompleta",
        `${detalle}\nLos campos obligatorios están resaltados para tu revisión.`,
        "warning"
      );

      return false;
    }

    return true;
  }, [datosFormulario, tipoInscripcion]);

  const validarFormulario = useCallback(() => {
    if (!precondiciones?.listo) {
      Swal.fire(
        "Sistema no disponible",
        "Debes completar los requisitos del año escolar antes de inscribir.",
        "warning"
      );
      return false;
    }

    if (!estudianteSeleccionado) {
      Swal.fire(
        "Selecciona un estudiante",
        "Debes elegir un estudiante para continuar.",
        "info"
      );
      return false;
    }

    if (!aulaSeleccionada) {
      Swal.fire(
        "Selecciona la sección",
        "Debes elegir un grado y sección con cupo disponible.",
        "info"
      );
      return false;
    }

    if (!representanteSeleccionado) {
      Swal.fire(
        "Selecciona un representante",
        "El estudiante debe tener un representante autorizado para continuar.",
        "info"
      );
      return false;
    }

    return validarDatosFamilia();
  }, [
    precondiciones,
    estudianteSeleccionado,
    aulaSeleccionada,
    representanteSeleccionado,
    validarDatosFamilia,
  ]);

  const guardarInscripcion = useCallback(async () => {
    if (!validarFormulario()) {
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
      setResultadoRegistro(respuesta?.inscripcion ?? respuesta);
    }
  }, [
    validarFormulario,
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
    guardarInscripcion,
    guardando,
    reiniciar,

    precondiciones,
    cargandoPrecondiciones,

    estudiantes,
    cargandoEstudiantes,
    estudianteSeleccionado,
    seleccionarEstudiante,

    aulas,
    cargandoAulas,
    aulaSeleccionada,
    seleccionarAula,

    representantes,
    cargandoRepresentantes,
    representanteSeleccionado,
    seleccionarRepresentante,

    datosFormulario,
    actualizarDato,
    alternarDatoSiNo,
    erroresFormulario,

    tipoInscripcion,
    actualizarTipoInscripcion,
    tiposInscripcion,

    estadoSeccionesFamilia,

    resumen,
    cargarPrecondiciones,
  };
};
