import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { FaEye, FaTrash, FaSync, FaPlus } from "react-icons/fa";
import {
  horariosLayout,
  horariosFormClasses,
  horariosTableClasses,
  horariosStatusClasses,
  horariosIconClasses,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";
import {
  listarHorarios,
  eliminarHorario,
  obtenerCatalogosHorarios,
  crearHorario,
} from "./horariosService";

const formatearDocente = (registro) => {
  if (!registro) {
    return "";
  }

  const nombres = [
    registro.primer_nombre,
    registro.segundo_nombre,
    registro.primer_apellido,
    registro.segundo_apellido,
  ].filter(Boolean);

  return nombres.join(" ");
};

const diasSemanaOpciones = [
  { valor: "lunes", etiqueta: "Lunes" },
  { valor: "martes", etiqueta: "Martes" },
  { valor: "miercoles", etiqueta: "Miércoles" },
  { valor: "jueves", etiqueta: "Jueves" },
  { valor: "viernes", etiqueta: "Viernes" },
];

const diasSemanaOrdenados = diasSemanaOpciones.map((opcion) => opcion.valor);

const diasSemanaEtiquetas = diasSemanaOpciones.reduce((mapa, opcion) => {
  mapa[opcion.valor] = opcion.etiqueta;
  return mapa;
}, {});

const convertirHoraCadenaADecimal = (valor) => {
  if (typeof valor !== "string") {
    return 0;
  }

  const partes = valor.split(":");
  if (partes.length !== 2) {
    return 0;
  }

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return 0;
  }

  return horas + minutos / 60;
};

const obtenerOrdenHora = (bloque) => {
  if (!bloque) {
    return 0;
  }

  if (typeof bloque.hora_inicio === "number") {
    return bloque.hora_inicio;
  }

  if (typeof bloque.hora_inicio === "string" && bloque.hora_inicio !== "") {
    const comoNumero = Number(bloque.hora_inicio);
    if (!Number.isNaN(comoNumero)) {
      return comoNumero;
    }
    return convertirHoraCadenaADecimal(bloque.hora_inicio);
  }

  if (typeof bloque.hora_inicio_texto === "string") {
    return convertirHoraCadenaADecimal(bloque.hora_inicio_texto);
  }

  if (typeof bloque.hora_inicio_decimal === "number") {
    return bloque.hora_inicio_decimal;
  }

  return 0;
};

const crearFormularioInicial = () => ({
  fk_aula: "",
  fk_momento: "",
  fk_componente: "",
  fk_personal: "",
  dia_semana: "",
  grupo: "completo",
  hora_inicio: "",
  hora_fin: "",
  estudiantes: [],
});

const crearCatalogosIniciales = () => ({
  aulas: [],
  momentos: [],
  componentes: [],
  personal: [],
  estudiantes: [],
});

const obtenerMensajeError = (fuente) => {
  if (!fuente) {
    return null;
  }

  if (Array.isArray(fuente)) {
    return fuente.join(" ");
  }

  if (typeof fuente === "object") {
    return Object.values(fuente)
      .flatMap((valor) => {
        if (Array.isArray(valor)) {
          return valor;
        }
        return [valor];
      })
      .join(" ");
  }

  return String(fuente);
};

const normalizarHoraInput = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  const limpio = valor.replace(/[^0-9:]/g, "");
  const indiceDosPuntos = limpio.indexOf(":");

  if (indiceDosPuntos === -1) {
    return limpio.slice(0, 4);
  }

  const horas = limpio
    .slice(0, indiceDosPuntos)
    .replace(/[^0-9]/g, "")
    .slice(0, 2);
  const minutos = limpio
    .slice(indiceDosPuntos + 1)
    .replace(/[^0-9]/g, "")
    .slice(0, 2);

  if (horas.length === 0 && minutos.length === 0) {
    return "";
  }

  if (horas.length === 0) {
    return minutos;
  }

  if (minutos.length === 0) {
    return `${horas}`.slice(0, 2) + ":";
  }

  const horasNormalizadas = horas.slice(0, 2);
  return `${horasNormalizadas}:${minutos}`;
};

const completarHoraBlur = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length === 0) {
    return "";
  }

  if (digitos.length <= 2) {
    const horas = digitos.padStart(2, "0");
    return `${horas}:00`;
  }

  if (digitos.length === 3) {
    const horas = digitos.slice(0, 1).padStart(2, "0");
    const minutos = digitos.slice(1).padEnd(2, "0");
    return `${horas}:${minutos}`;
  }

  const horas = digitos.slice(0, 2).padStart(2, "0");
  const minutos = digitos.slice(2, 4).padEnd(2, "0");
  return `${horas}:${minutos}`;
};

const parseHoraTexto = (valor) => {
  if (typeof valor !== "string") {
    return null;
  }

  const coincidencia = /^([0-9]{2}):([0-9]{2})$/.exec(valor.trim());
  if (!coincidencia) {
    return null;
  }

  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    horas < 0 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  const totalMinutos = (horas === 12 ? 12 * 60 : horas * 60) + minutos;

  return {
    horas,
    minutos,
    totalMinutos,
  };
};

const validarHorasFormulario = ({ hora_inicio, hora_fin }) => {
  const errores = {};

  const inicio = parseHoraTexto(hora_inicio);
  if (!inicio) {
    errores.hora_inicio =
      "Ingresa la hora de inicio con formato HH:MM (ej. 07:00).";
  } else if (
    inicio.horas < 7 ||
    inicio.horas > 12 ||
    (inicio.horas === 12 && inicio.minutos > 0)
  ) {
    errores.hora_inicio =
      "La hora de inicio debe estar entre las 07:00 y las 12:00 m.";
  }

  const fin = parseHoraTexto(hora_fin);
  if (!fin) {
    errores.hora_fin =
      "Ingresa la hora de finalización con formato HH:MM (ej. 08:20).";
  } else if (
    fin.horas < 7 ||
    fin.horas > 12 ||
    (fin.horas === 12 && fin.minutos > 0)
  ) {
    errores.hora_fin =
      "La hora de finalización debe estar entre las 07:00 y las 12:00 m (máximo 12:00).";
  }

  if (!errores.hora_inicio && !errores.hora_fin && inicio && fin) {
    if (fin.totalMinutos <= inicio.totalMinutos) {
      const mensaje =
        "La hora de finalización debe ser mayor que la hora de inicio.";
      errores.horario = mensaje;
      errores.hora_fin = errores.hora_fin || mensaje;
    } else {
      const duracion = fin.totalMinutos - inicio.totalMinutos;
      if (duracion < 40 || duracion > 80) {
        const mensaje =
          "La duración del bloque debe estar entre 40 y 80 minutos.";
        errores.duracion = mensaje;
        errores.hora_fin = errores.hora_fin || mensaje;
      }
    }
  }

  return errores;
};

export const Horarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(() => crearFormularioInicial());
  const [catalogos, setCatalogos] = useState(() => crearCatalogosIniciales());
  const [catalogosCargando, setCatalogosCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [horariosAula, setHorariosAula] = useState([]);
  const [cargandoHorariosAula, setCargandoHorariosAula] = useState(false);

  const refrescar = async () => {
    await listarHorarios({ setHorarios, setIsLoading, Swal });
  };

  useEffect(() => {
    refrescar();
  }, []);

  const registrosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (termino === "") {
      return horarios;
    }

    return horarios.filter((horario) => {
      const docente = formatearDocente(horario).toLowerCase();
      const componente = (horario.nombre_componente || "").toLowerCase();
      const dia = (horario.dia_semana || "").toLowerCase();
      const momento = (horario.nombre_momento || "").toLowerCase();
      return (
        docente.includes(termino) ||
        componente.includes(termino) ||
        dia.includes(termino) ||
        momento.includes(termino)
      );
    });
  }, [busqueda, horarios]);

  const aulaSeleccionada = useMemo(() => {
    if (!formulario.fk_aula) {
      return null;
    }

    return (
      catalogos.aulas.find(
        (aula) => aula.id?.toString() === formulario.fk_aula.toString()
      ) || null
    );
  }, [catalogos.aulas, formulario.fk_aula]);

  const momentosDisponibles = useMemo(() => {
    const lista = Array.isArray(catalogos.momentos) ? catalogos.momentos : [];

    if (!aulaSeleccionada) {
      return lista;
    }

    return lista.filter(
      (momento) =>
        Number(momento.anio_escolar) === Number(aulaSeleccionada.anio_escolar)
    );
  }, [aulaSeleccionada, catalogos.momentos]);

  const componentesDisponibles = useMemo(
    () => (Array.isArray(catalogos.componentes) ? catalogos.componentes : []),
    [catalogos.componentes]
  );

  const personalDisponible = useMemo(
    () => (Array.isArray(catalogos.personal) ? catalogos.personal : []),
    [catalogos.personal]
  );

  const estudiantesDisponibles = useMemo(
    () => (Array.isArray(catalogos.estudiantes) ? catalogos.estudiantes : []),
    [catalogos.estudiantes]
  );

  const errores = useMemo(
    () => ({
      general: obtenerMensajeError(erroresFormulario.general),
      fk_aula: obtenerMensajeError(erroresFormulario.fk_aula),
      fk_momento: obtenerMensajeError(erroresFormulario.fk_momento),
      fk_componente: obtenerMensajeError(erroresFormulario.fk_componente),
      fk_personal: obtenerMensajeError(erroresFormulario.fk_personal),
      dia_semana: obtenerMensajeError(erroresFormulario.dia_semana),
      grupo: obtenerMensajeError(erroresFormulario.grupo),
      hora_inicio: obtenerMensajeError(erroresFormulario.hora_inicio),
      hora_fin: obtenerMensajeError(erroresFormulario.hora_fin),
      horario: obtenerMensajeError(erroresFormulario.horario),
      duracion: obtenerMensajeError(erroresFormulario.duracion),
      estudiantes: obtenerMensajeError(erroresFormulario.estudiantes),
    }),
    [erroresFormulario]
  );

  const cargarCatalogos = async (filtros = {}) => {
    setCatalogosCargando(true);
    try {
      const datos = await obtenerCatalogosHorarios({ filtros, Swal });
      setCatalogos({
        aulas: Array.isArray(datos?.aulas) ? datos.aulas : [],
        momentos: Array.isArray(datos?.momentos) ? datos.momentos : [],
        componentes: Array.isArray(datos?.componentes) ? datos.componentes : [],
        personal: Array.isArray(datos?.personal) ? datos.personal : [],
        estudiantes: Array.isArray(datos?.estudiantes) ? datos.estudiantes : [],
      });
    } catch (error) {
      console.error("Error al obtener catálogos de horarios:", error);
    } finally {
      setCatalogosCargando(false);
    }
  };

  const actualizarHorariosAula = async (idAula, idMomento = null) => {
    if (!idAula) {
      setHorariosAula([]);
      setCargandoHorariosAula(false);
      return;
    }

    setCargandoHorariosAula(true);
    setHorariosAula([]);

    try {
      const filtrosConsulta = {
        fk_aula: Number(idAula),
      };

      if (idMomento) {
        filtrosConsulta.fk_momento = Number(idMomento);
      }

      const registros = await listarHorarios({
        filtros: filtrosConsulta,
        Swal,
      });

      setHorariosAula(Array.isArray(registros) ? registros : []);
    } catch (error) {
      console.error("Error al cargar horarios del aula:", error);
    } finally {
      setCargandoHorariosAula(false);
    }
  };

  const abrirModal = () => {
    setErroresFormulario({});
    setFormulario(crearFormularioInicial());
    setCatalogos(crearCatalogosIniciales());
    setHorariosAula([]);
    setCargandoHorariosAula(false);
    setModalAbierto(true);
    cargarCatalogos();
  };

  const cerrarModal = () => {
    if (guardando) {
      return;
    }
    setModalAbierto(false);
  };

  const manejarCambio = async (evento) => {
    const { name, value } = evento.target;

    if (name === "hora_inicio" || name === "hora_fin") {
      const valorNormalizado = normalizarHoraInput(value);
      setFormulario((previo) => ({
        ...previo,
        [name]: valorNormalizado,
      }));
      setErroresFormulario((previo) => {
        const copia = { ...previo };
        delete copia[name];
        delete copia.horario;
        delete copia.duracion;
        return copia;
      });
      return;
    }

    if (name === "grupo") {
      setFormulario((previo) => ({
        ...previo,
        grupo: value,
        estudiantes: value === "subgrupo" ? previo.estudiantes : [],
      }));
      return;
    }

    if (name === "fk_momento") {
      setFormulario((previo) => ({
        ...previo,
        fk_momento: value,
      }));

      if (formulario.fk_aula) {
        await actualizarHorariosAula(formulario.fk_aula, value || null);
      }

      return;
    }

    if (name === "fk_aula") {
      setFormulario((previo) => ({
        ...previo,
        fk_aula: value,
        fk_momento: "",
        fk_componente: "",
        fk_personal: "",
        estudiantes: [],
      }));

      if (!value) {
        setCatalogos((previo) => ({
          ...previo,
          componentes: [],
          personal: [],
          estudiantes: [],
        }));
        setHorariosAula([]);
        setCargandoHorariosAula(false);
        return;
      }

      const aula = catalogos.aulas.find(
        (item) => item.id?.toString() === value
      );

      const filtros = {
        fk_aula: Number(value),
      };

      if (aula?.anio_escolar) {
        filtros.fk_anio_escolar = Number(aula.anio_escolar);
      }

      await cargarCatalogos(filtros);
      await actualizarHorariosAula(value);
      return;
    }

    setFormulario((previo) => ({
      ...previo,
      [name]: value,
    }));
  };

  const manejarCambioEstudiantes = (evento) => {
    const valores = Array.from(
      evento.target.selectedOptions,
      (opcion) => opcion.value
    );

    setFormulario((previo) => ({
      ...previo,
      estudiantes: valores,
    }));
  };

  const manejarBlurHora = (evento) => {
    const { name, value } = evento.target;
    if (name !== "hora_inicio" && name !== "hora_fin") {
      return;
    }

    const valorFormateado = completarHoraBlur(value);
    setFormulario((previo) => ({
      ...previo,
      [name]: valorFormateado,
    }));
    if (valorFormateado !== value) {
      evento.target.value = valorFormateado;
    }
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    const erroresLocales = validarHorasFormulario(formulario);
    if (Object.keys(erroresLocales).length > 0) {
      setErroresFormulario(erroresLocales);
      return;
    }

    setErroresFormulario({});
    setGuardando(true);

    const aulaActual = formulario.fk_aula;
    const momentoActual = formulario.fk_momento;

    const datos = {
      fk_aula: formulario.fk_aula ? Number(formulario.fk_aula) : null,
      fk_momento: formulario.fk_momento ? Number(formulario.fk_momento) : null,
      fk_componente: formulario.fk_componente
        ? Number(formulario.fk_componente)
        : null,
      fk_personal: formulario.fk_personal
        ? Number(formulario.fk_personal)
        : null,
      grupo: formulario.grupo,
      dia_semana: formulario.dia_semana || null,
      hora_inicio: formulario.hora_inicio || null,
      hora_fin: formulario.hora_fin || null,
      estudiantes:
        formulario.grupo === "subgrupo"
          ? formulario.estudiantes.map((id) => Number(id))
          : [],
    };

    try {
      const resultado = await crearHorario({ datos, Swal });
      if (resultado) {
        await refrescar();
        if (aulaActual) {
          await actualizarHorariosAula(aulaActual, momentoActual || null);
        }
      }
    } catch (errores) {
      if (errores && typeof errores === "object") {
        setErroresFormulario(errores);
      } else {
        console.error("Error desconocido al registrar horario:", errores);
        Swal.fire(
          "Error",
          "Ocurrió un problema inesperado al registrar el horario.",
          "error"
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  const manejarVerDetalle = (horario) => {
    const estudiantes = Array.isArray(horario.estudiantes)
      ? horario.estudiantes
      : [];

    const listaEstudiantes = estudiantes
      .map((est) => `<li>${est.nombre} (${est.cedula_escolar})</li>`)
      .join("");

    Swal.fire({
      title: "Detalle del horario",
      html: `
        <div class="text-left">
          <p><strong>Componente:</strong> ${
            horario.nombre_componente ?? "N/D"
          }</p>
          <p><strong>Docente:</strong> ${formatearDocente(horario) || "N/D"}</p>
          <p><strong>Momento:</strong> ${horario.nombre_momento ?? "N/D"}</p>
          <p><strong>Día:</strong> ${horario.dia_semana}</p>
          <p><strong>Hora:</strong> ${horario.hora_inicio_texto} - ${
        horario.hora_fin_texto
      }</p>
          <p><strong>Modalidad:</strong> ${horario.grupo}</p>
          ${
            estudiantes.length > 0
              ? `<p class="mt-3"><strong>Estudiantes asignados:</strong></p><ul class="list-disc pl-4">${listaEstudiantes}</ul>`
              : ""
          }
        </div>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  const manejarEliminar = (horario) => {
    Swal.fire({
      title: "¿Eliminar horario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      const exito = await eliminarHorario({
        idHorario: horario.id_horario,
        Swal,
      });

      if (exito) {
        refrescar();
      }
    });
  };

  const columnas = [
    {
      name: "Grado/Sección",
      selector: (row) => `${row.grado ?? ""} - ${row.seccion ?? ""}`,
      sortable: true,
      grow: 1.1,
      wrap: true,
    },
    {
      name: "Componente",
      selector: (row) => row.nombre_componente,
      sortable: true,
      grow: 1.6,
      wrap: true,
    },
    {
      name: "Momento",
      selector: (row) => row.nombre_momento,
      sortable: true,
      wrap: true,
      width: "140px",
    },
    {
      name: "Día",
      selector: (row) => row.dia_semana,
      sortable: true,
      width: "120px",
    },
    {
      name: "Horario",
      selector: (row) => `${row.hora_inicio_texto} - ${row.hora_fin_texto}`,
      sortable: true,
      width: "150px",
    },
    {
      name: "Modalidad",
      selector: (row) => row.grupo,
      sortable: true,
      width: "140px",
      center: true,
      cell: (row) => (
        <span
          className={`${horariosStatusClasses.base} ${
            row.grupo === "completo"
              ? horariosStatusClasses.completo
              : horariosStatusClasses.subgrupo
          }`}
        >
          {row.grupo}
        </span>
      ),
    },
    {
      name: "Docente",
      selector: (row) => formatearDocente(row),
      sortable: true,
      grow: 1.4,
      wrap: true,
    },
    {
      name: "Acciones",
      width: "140px",
      cell: (row) => (
        <div className={horariosTableClasses.actionGroup}>
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
            onClick={() => manejarVerDetalle(row)}
            title="Ver detalle"
          >
            <FaEye className={horariosIconClasses.base} />
          </button>
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
            onClick={() => manejarEliminar(row)}
            title="Eliminar"
          >
            <FaTrash className={horariosIconClasses.base} />
          </button>
        </div>
      ),
    },
  ];

  const barraBusqueda = (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-xs">
        <input
          type="text"
          className={horariosTableClasses.filterInput}
          placeholder="Buscar por docente, componente o día"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>
      <button
        type="button"
        className={`${horariosLayout.addButton}`}
        onClick={refrescar}
      >
        <FaSync className="h-4 w-4" />
        <span>Actualizar</span>
      </button>
    </div>
  );

  const calendarioPorDia = useMemo(() => {
    const base = diasSemanaOrdenados.reduce((acumulado, dia) => {
      acumulado[dia] = [];
      return acumulado;
    }, {});

    horariosAula.forEach((bloque) => {
      const dia = (bloque.dia_semana || "").toLowerCase();
      if (!base[dia]) {
        return;
      }
      base[dia].push({ ...bloque, esPreview: false });
    });

    diasSemanaOrdenados.forEach((dia) => {
      base[dia].sort((a, b) => obtenerOrdenHora(a) - obtenerOrdenHora(b));
    });

    return base;
  }, [horariosAula]);

  return (
    <div className={horariosLayout.container}>
      <div className={horariosLayout.header}>
        <h2 className={horariosLayout.title}>Gestión de Horarios</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={horariosLayout.addButton}
            onClick={abrirModal}
          >
            <FaPlus className="h-4 w-4" />
            <span>Nuevo horario</span>
          </button>
        </div>
      </div>
      <p className={horariosLayout.description}>
        Consulta y administra los horarios de aula y especialistas. Puedes ver
        los detalles de cada bloque y gestionar la asignación por subgrupos
        conforme a las políticas académicas.
      </p>

      <DataTable
        columns={columnas}
        data={registrosFiltrados}
        progressPending={isLoading}
        progressComponent={
          <p className={horariosTableClasses.helperText}>
            Cargando horarios...
          </p>
        }
        noDataComponent={
          <p className={horariosTableClasses.helperText}>
            No hay horarios registrados aún.
          </p>
        }
        customStyles={dataTableBaseStyles}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        subHeader
        subHeaderComponent={barraBusqueda}
        highlightOnHover
        striped
        responsive
        persistTableHead
      />

      <VentanaModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title="Registrar horario"
        size="lg"
        bodyClassName="space-y-6"
      >
        <form onSubmit={manejarSubmit} className="space-y-5" autoComplete="off">
          {errores.general ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {errores.general}
            </div>
          ) : null}

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="fk_aula">
                Aula / Sección
              </label>
              <select
                id="fk_aula"
                name="fk_aula"
                value={formulario.fk_aula}
                onChange={manejarCambio}
                className={
                  errores.fk_aula
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={catalogosCargando}
              >
                <option value="">Seleccione un aula</option>
                {catalogos.aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {`Grado ${aula.grado ?? ""} - Sección ${
                      aula.seccion ?? ""
                    }`}
                  </option>
                ))}
              </select>
              {errores.fk_aula ? (
                <p className={horariosFormClasses.error}>{errores.fk_aula}</p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Selecciona el aula para cargar los componentes y docentes
                  asignados.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="fk_momento">
                Momento académico
              </label>
              <select
                id="fk_momento"
                name="fk_momento"
                value={formulario.fk_momento}
                onChange={manejarCambio}
                className={
                  errores.fk_momento
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={catalogosCargando || catalogos.aulas.length === 0}
              >
                <option value="">Seleccione un momento</option>
                {momentosDisponibles.map((momento) => (
                  <option key={momento.id} value={momento.id}>
                    {`Momento ${momento.codigo} — Año ${momento.anio_escolar}`}
                  </option>
                ))}
              </select>
              {errores.fk_momento ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_momento}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Debe pertenecer al mismo año escolar del aula seleccionada.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="fk_componente"
              >
                Componente de aprendizaje
              </label>
              <select
                id="fk_componente"
                name="fk_componente"
                value={formulario.fk_componente}
                onChange={manejarCambio}
                className={
                  errores.fk_componente
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={
                  catalogosCargando ||
                  !formulario.fk_aula ||
                  componentesDisponibles.length === 0
                }
              >
                <option value="">Seleccione un componente</option>
                {componentesDisponibles.map((componente) => (
                  <option key={componente.id} value={componente.id}>
                    {componente.especialista === "si"
                      ? `${componente.nombre} — Especialista`
                      : componente.nombre}
                  </option>
                ))}
              </select>
              {errores.fk_componente ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_componente}
                </p>
              ) : componentesDisponibles.length === 0 && formulario.fk_aula ? (
                <p className={horariosFormClasses.helper}>
                  El aula seleccionada aún no tiene componentes asignados.
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Solo se muestran los componentes asignados a este aula.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="fk_personal"
              >
                Docente asignado
              </label>
              <select
                id="fk_personal"
                name="fk_personal"
                value={formulario.fk_personal}
                onChange={manejarCambio}
                className={
                  errores.fk_personal
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={
                  catalogosCargando ||
                  !formulario.fk_aula ||
                  personalDisponible.length === 0
                }
              >
                <option value="">Seleccione un docente</option>
                {personalDisponible.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {`${docente.nombre} — ${docente.funcion}`}
                  </option>
                ))}
              </select>
              {errores.fk_personal ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_personal}
                </p>
              ) : personalDisponible.length === 0 && formulario.fk_aula ? (
                <p className={horariosFormClasses.helper}>
                  El aula no tiene personal asociado al momento indicado.
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Solo se listan los docentes con asignación vigente para este
                  aula.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="dia_semana">
                Día de la semana
              </label>
              <select
                id="dia_semana"
                name="dia_semana"
                value={formulario.dia_semana}
                onChange={manejarCambio}
                className={
                  errores.dia_semana
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
              >
                <option value="">Seleccione un día</option>
                {diasSemanaOpciones.map((dia) => (
                  <option key={dia.valor} value={dia.valor}>
                    {dia.etiqueta}
                  </option>
                ))}
              </select>
              {errores.dia_semana ? (
                <p className={horariosFormClasses.error}>
                  {errores.dia_semana}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  El horario será válido únicamente para el día seleccionado.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="grupo">
                Modalidad del bloque
              </label>
              <select
                id="grupo"
                name="grupo"
                value={formulario.grupo}
                onChange={manejarCambio}
                className={
                  errores.grupo
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
              >
                <option value="completo">Grupo completo</option>
                <option value="subgrupo">Subgrupo</option>
              </select>
              {errores.grupo ? (
                <p className={horariosFormClasses.error}>{errores.grupo}</p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Los horarios grupales solo pueden crearse con cuentas de
                  dirección.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="hora_inicio"
              >
                Hora de inicio
              </label>
              <input
                type="text"
                id="hora_inicio"
                name="hora_inicio"
                value={formulario.hora_inicio}
                onChange={manejarCambio}
                onBlur={manejarBlurHora}
                className={
                  errores.hora_inicio || errores.horario || errores.duracion
                    ? horariosFormClasses.inputInvalid
                    : horariosFormClasses.input
                }
                inputMode="numeric"
                autoComplete="off"
                placeholder="hh:mm"
                maxLength={5}
                required
              />
              {errores.hora_inicio ? (
                <p className={horariosFormClasses.error}>
                  {errores.hora_inicio}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Formato HH:MM. Ingresa horas desde las 07:00 hasta las 12:00
                  m.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="hora_fin">
                Hora de finalización
              </label>
              <input
                type="text"
                id="hora_fin"
                name="hora_fin"
                value={formulario.hora_fin}
                onChange={manejarCambio}
                onBlur={manejarBlurHora}
                className={
                  errores.hora_fin || errores.horario || errores.duracion
                    ? horariosFormClasses.inputInvalid
                    : horariosFormClasses.input
                }
                inputMode="numeric"
                autoComplete="off"
                placeholder="hh:mm"
                maxLength={5}
                required
              />
              {errores.hora_fin ? (
                <p className={horariosFormClasses.error}>{errores.hora_fin}</p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Finaliza antes del mediodía. Ejemplo válido: 08:20 a 09:00.
                </p>
              )}
            </div>
          </div>

          {errores.horario ? (
            <p className={horariosFormClasses.error}>{errores.horario}</p>
          ) : null}
          {errores.duracion ? (
            <p className={horariosFormClasses.error}>{errores.duracion}</p>
          ) : !errores.horario ? (
            <p className={horariosFormClasses.helper}>
              Los bloques deben durar entre 40 y 80 minutos y concluir antes de
              las 12:00 m.
            </p>
          ) : null}

          {formulario.grupo === "subgrupo" ? (
            <div className={horariosFormClasses.group}>
              <label
                className={horariosFormClasses.label}
                htmlFor="estudiantes"
              >
                Estudiantes asignados
              </label>
              <select
                id="estudiantes"
                name="estudiantes"
                multiple
                value={formulario.estudiantes}
                onChange={manejarCambioEstudiantes}
                className={
                  errores.estudiantes
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                disabled={estudiantesDisponibles.length === 0}
              >
                {estudiantesDisponibles.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {`${estudiante.nombre} — ${estudiante.cedula_escolar}`}
                  </option>
                ))}
              </select>
              {errores.estudiantes ? (
                <p className={horariosFormClasses.error}>
                  {errores.estudiantes}
                </p>
              ) : estudiantesDisponibles.length === 0 ? (
                <p className={horariosFormClasses.helper}>
                  No se encontraron estudiantes activos para el aula
                  seleccionada.
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Mantén presionada la tecla Ctrl o Shift para seleccionar
                  múltiples estudiantes.
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Agenda semanal del aula
                </h3>
                <p className="text-xs text-slate-500">
                  Visualiza los bloques registrados de lunes a viernes.
                </p>
              </div>
            </div>

            {!formulario.fk_aula ? (
              <p className="text-sm text-slate-500">
                Selecciona un aula para visualizar su cronograma semanal.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-5">
                {diasSemanaOrdenados.map((dia) => (
                  <div
                    key={dia}
                    className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      {diasSemanaEtiquetas[dia]}
                    </p>
                    {(() => {
                      const bloquesDia = calendarioPorDia[dia] ?? [];
                      const mostrandoSkeleton = cargandoHorariosAula;
                      return (
                        <div className="mt-3 space-y-2">
                          {mostrandoSkeleton ? (
                            <div
                              className="h-20 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse"
                              aria-hidden="true"
                            />
                          ) : bloquesDia.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              Sin bloques registrados.
                            </p>
                          ) : (
                            bloquesDia.map((bloque, indice) => (
                              <div
                                key={`${dia}-${
                                  bloque.id_horario ??
                                  bloque.id_temporal ??
                                  indice
                                }`}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                              >
                                <p className="text-[11px] font-semibold uppercase tracking-wide">
                                  {`${bloque.hora_inicio_texto} - ${bloque.hora_fin_texto}`}
                                </p>
                                <p className="text-sm font-semibold">
                                  {bloque.nombre_componente ?? "Componente"}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {formatearDocente(bloque) ||
                                    "Docente sin definir"}
                                </p>
                                <p className="text-[11px] text-slate-500 capitalize">
                                  Modalidad: {bloque.grupo}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={horariosFormClasses.actions}>
            <button
              type="button"
              className={horariosFormClasses.ghostButton}
              onClick={cerrarModal}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={horariosFormClasses.primaryButton}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Registrar horario"}
            </button>
          </div>
        </form>
      </VentanaModal>
    </div>
  );
};
