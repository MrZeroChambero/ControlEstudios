import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import { FaPlus, FaEye } from "react-icons/fa";
import {
  horariosLayout,
  horariosIconClasses,
  horariosTableClasses,
} from "../EstilosCliente/EstilosClientes";
import { TablaEntradas } from "../Tablas/Tablas";
import BarraBusquedaHorarios from "./componentes/BarraBusquedaHorarios";
import ModalCalendarioAula from "./componentes/ModalCalendarioAula";
import ModalAgendaDocente from "./componentes/ModalAgendaDocente";
import ModalFormularioHorario from "./componentes/ModalFormularioHorario";
import ModalDetalleSubgrupo from "./componentes/ModalDetalleSubgrupo";
import { useAuth } from "../../hooks/useAuth";
import {
  crearFormularioInicial,
  crearCatalogosIniciales,
  formatearDocente,
  obtenerMensajeError,
  diasSemanaOrdenados,
  normalizarHoraInput,
  completarHoraBlur,
  validarHorasFormulario,
  obtenerOrdenHora,
  obtenerDuracionesPermitidas,
} from "./utilidadesHorarios";
import {
  listarHorarios,
  eliminarHorario,
  obtenerCatalogosHorarios,
  crearHorario,
  listarBloquesHorario,
  sincronizarSubgrupo,
} from "./solicitudesHorarios";
import { removerEstudianteDeSubgrupo } from "../../api/horariosService";

const obtenerAnioDesdeFecha = (valor) => {
  if (!valor) {
    return null;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }
  return fecha.getUTCFullYear();
};

const formatearAnioEscolarEtiqueta = (inicio, fin) => {
  const anioInicio = obtenerAnioDesdeFecha(inicio);
  const anioFin = obtenerAnioDesdeFecha(fin);

  if (anioInicio && anioFin) {
    return anioInicio === anioFin
      ? `${anioInicio}`
      : `${anioInicio} - ${anioFin}`;
  }
  if (anioInicio) {
    return `${anioInicio}`;
  }
  if (anioFin) {
    return `${anioFin}`;
  }
  return "Sin definir";
};

const obtenerAnioDesdeMomento = (momento) => {
  if (!momento) {
    return null;
  }

  const candidatos = [
    momento.anio_escolar,
    momento.fk_anio_escolar,
    momento.anio,
    momento.anioId,
  ];

  for (const candidato of candidatos) {
    const numero = Number(candidato);
    if (!Number.isNaN(numero) && numero > 0) {
      return numero;
    }
  }

  return null;
};

const obtenerIdMomento = (momento) => {
  if (!momento) {
    return null;
  }

  const candidatos = [
    momento.id,
    momento.id_momento,
    momento.idMomento,
    momento.momento_id,
  ];

  for (const candidato of candidatos) {
    const numero = Number(candidato);
    if (!Number.isNaN(numero) && numero > 0) {
      return numero;
    }
  }

  return null;
};

const filtrarMomentosPorAnio = (momentos = [], anioId) => {
  if (!Array.isArray(momentos)) {
    return [];
  }
  if (!anioId) {
    return momentos;
  }
  const anioNumero = Number(anioId);
  if (!Number.isFinite(anioNumero) || anioNumero <= 0) {
    return momentos;
  }

  return momentos.filter(
    (momento) => obtenerAnioDesdeMomento(momento) === anioNumero
  );
};

const seleccionarMomentoPreferido = (momentos = []) => {
  if (!Array.isArray(momentos) || momentos.length === 0) {
    return null;
  }
  const normalizarEstado = (valor) =>
    typeof valor === "string" ? valor.trim().toLowerCase() : "";
  const prioridades = ["activo", "pendiente", "planificado", "incompleto"];
  for (const estado of prioridades) {
    const candidato = momentos.find(
      (momento) => normalizarEstado(momento.estado) === estado
    );
    if (candidato) {
      return candidato;
    }
  }
  return momentos[0];
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
  const [modalSeccionAbierto, setModalSeccionAbierto] = useState(false);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [modalDocenteAbierto, setModalDocenteAbierto] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [modalDetalleSubgrupoAbierto, setModalDetalleSubgrupoAbierto] =
    useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [bloquesHorario, setBloquesHorario] = useState([]);
  const [MostrarGeneral, setMostrarGeneral] = useState(true);
  const consultaHorariosRef = useRef(0);

  const [anioFiltro, setAnioFiltro] = useState(null);
  const [momentoFiltro, setMomentoFiltro] = useState(null);

  const ResumenAula = ({ registro }) => (
    <div className="flex flex-col text-left text-sm text-slate-700">
      <p className="font-semibold text-slate-900">
        {`Grado ${registro.grado ?? "?"} - Sección ${registro.seccion ?? "?"}`}
      </p>
      <p className="text-xs text-slate-500">
        {registro.momento || "Momento sin definir"}
      </p>
    </div>
  );

  const DocenteResumen = ({ docente }) => (
    <div className="flex flex-col gap-2 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{docente.nombre}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {docente.funcion}
        </span>
      </div>
      <div className="space-y-1 text-xs text-slate-500">
        <p>
          <span className="font-semibold text-slate-600">Componentes:</span>{" "}
          {docente.componentesTexto}
        </p>
        <p>
          <span className="font-semibold text-slate-600">Momentos:</span>{" "}
          {docente.momentosTexto}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.isArray(docente.secciones) && docente.secciones.length > 0 ? (
          docente.secciones.map((seccion) => (
            <span
              key={seccion}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {seccion}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">
            Sin secciones registradas
          </span>
        )}
      </div>
    </div>
  );

  const abrirModalSeccion = useCallback((registro) => {
    setSeccionSeleccionada(registro);
    setModalSeccionAbierto(true);
  }, []);

  const cerrarModalSeccion = useCallback(() => {
    setModalSeccionAbierto(false);
    setSeccionSeleccionada(null);
  }, []);

  const abrirModalDocente = useCallback((registro) => {
    setDocenteSeleccionado(registro);
    setModalDocenteAbierto(true);
  }, []);

  const cerrarModalDocente = useCallback(() => {
    setModalDocenteAbierto(false);
    setDocenteSeleccionado(null);
  }, []);

  const construirFiltrosCatalogo = useCallback(
    (aulaId, momentoId = null, componenteId = null, personalId = null) => {
      if (!aulaId) {
        return {};
      }

      const filtros = {
        fk_aula: Number(aulaId),
      };

      const aula = catalogos.aulas.find(
        (item) => item.id?.toString() === aulaId.toString()
      );

      if (aula?.anio_escolar) {
        filtros.fk_anio_escolar = Number(aula.anio_escolar);
      }

      if (momentoId) {
        filtros.fk_momento = Number(momentoId);
      }

      if (componenteId) {
        filtros.fk_componente = Number(componenteId);
      }

      if (personalId) {
        filtros.fk_personal = Number(personalId);
      }

      return filtros;
    },
    [catalogos.aulas]
  );

  const refrescar = useCallback(async (filtros = {}) => {
    await listarHorarios({ filtros, setHorarios, setIsLoading, Swal });
  }, []);

  const cargarBloquesHorario = useCallback(async () => {
    const resultado = await listarBloquesHorario({ Swal });
    if (resultado?.bloques?.length) {
      setBloquesHorario(resultado.bloques);
    }
  }, []);

  useEffect(() => {
    // carga inicial sin filtros (refrescar() maneja filtros opcionales)
    refrescar();
  }, [refrescar]);

  // Reconsultar horarios en el servidor cuando el usuario cambie año o momento
  useEffect(() => {
    const filtros = {};
    if (anioFiltro) {
      filtros.fk_anio_escolar = anioFiltro;
    }
    if (momentoFiltro) {
      filtros.fk_momento = momentoFiltro;
    }

    // Si no hay filtros, dejamos la consulta inicial (sin filtros)
    refrescar(Object.keys(filtros).length ? filtros : {});
  }, [anioFiltro, momentoFiltro, refrescar]);

  useEffect(() => {
    cargarBloquesHorario();
  }, [cargarBloquesHorario]);

  // momentoActivoGlobal no se usa actualmente

  const aniosEscolares = useMemo(() => {
    const anios = Array.isArray(catalogos.anios) ? catalogos.anios : [];
    return anios.map((a) => {
      const id = a.id ?? a.id_anio_escolar ?? null;
      const inicio = a.fecha_inicio ?? a.fechaInicio ?? a.inicio ?? null;
      const fin = a.fecha_fin ?? a.fechaFin ?? a.fin ?? null;
      return {
        id,
        etiqueta: formatearAnioEscolarEtiqueta(inicio, fin),
        inicio,
        fin,
      };
    });
  }, [catalogos.anios]);

  useEffect(() => {
    if (aniosEscolares.length > 0 && anioFiltro === null) {
      // seleccionar por defecto el año escolar activo (por id) si existe,
      // sino el primer año disponible
      const activo = aniosEscolares.find(
        (a) =>
          a.id &&
          catalogos.anios.find(
            (c) => (c.id ?? c.id_anio_escolar) === a.id && c.estado === "activo"
          )
      );
      const seleccionado = activo ? activo.id : aniosEscolares[0].id;
      setAnioFiltro(seleccionado ?? null);
    }
  }, [aniosEscolares, anioFiltro, catalogos.anios]);

  const momentosFiltrados = useMemo(() => {
    if (!anioFiltro) return catalogos.momentos;
    return catalogos.momentos.filter((m) => {
      const fkAnio = m.fk_anio_escolar ?? m.id_anio_escolar ?? null;
      if (fkAnio !== null && String(fkAnio) === String(anioFiltro)) return true;
      if (m.anio_escolar && String(m.anio_escolar) === String(anioFiltro))
        return true;
      return false;
    });
  }, [catalogos.momentos, anioFiltro]);

  const momentoActivo = useMemo(() => {
    return (
      momentosFiltrados.find((m) => m.estado === "activo") ||
      momentosFiltrados[0]
    );
  }, [momentosFiltrados]);

  // useEffect(() => {
  //   if (momentoActivo?.id && !momentoFiltro) {
  //     setMomentoFiltro(momentoActivo.id);
  //   }
  // }, [momentoActivo, momentoFiltro]);

  useEffect(() => {
    setMomentoFiltro(null);
  }, [anioFiltro]);

  const registrosFiltrados = useMemo(() => {
    let filtrados = horarios;

    // Filtro por búsqueda
    const termino = busqueda.trim().toLowerCase();
    if (termino !== "") {
      filtrados = filtrados.filter((horario) => {
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
    }

    // Eliminar filtros de año y momento (ya se aplican desde el backend)

    return filtrados;
  }, [horarios, busqueda]);

  const seccionesAgrupadas = useMemo(() => {
    const mapa = new Map();

    registrosFiltrados.forEach((item) => {
      const aulaId = item.fk_aula ?? "";
      const momentoId = item.fk_momento ?? "";
      const clave = `${aulaId}-${momentoId}`;
      const anioInicio =
        item.anio_fecha_inicio ?? item.anio_inicio ?? item.fecha_inicio ?? null;
      const anioFin =
        item.anio_fecha_fin ?? item.anio_fin ?? item.fecha_fin ?? null;
      const etiquetaAnio = formatearAnioEscolarEtiqueta(anioInicio, anioFin);

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: clave,
          fkAula: aulaId,
          fkMomento: item.fk_momento ?? null,
          grado: item.grado ?? "N/D",
          seccion: item.seccion ?? "N/D",
          momento: item.nombre_momento ?? "Sin momento",
          anioEscolar: etiquetaAnio,
          anioEscolarId: item.fk_anio_escolar ?? null,
          anioInicio,
          anioFin,
          horarios: [],
        });
      }

      const registro = mapa.get(clave);
      registro.horarios.push(item);
    });

    return Array.from(mapa.values()).sort((a, b) => {
      const gradoA = String(a.grado ?? "");
      const gradoB = String(b.grado ?? "");
      const comparacionGrado = gradoA.localeCompare(gradoB, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      if (comparacionGrado !== 0) {
        return comparacionGrado;
      }

      const seccionA = String(a.seccion ?? "");
      const seccionB = String(b.seccion ?? "");
      return seccionA.localeCompare(seccionB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [registrosFiltrados]);

  const docentesAgrupados = useMemo(() => {
    const mapa = new Map();

    const construirEtiquetaSeccion = (grado, seccion) => {
      const gradoTexto =
        typeof grado === "number" || typeof grado === "string"
          ? String(grado).trim()
          : "";
      const seccionTexto =
        typeof seccion === "number" || typeof seccion === "string"
          ? String(seccion).trim().toUpperCase()
          : "";

      if (!gradoTexto && !seccionTexto) {
        return null;
      }

      if (!gradoTexto || !seccionTexto) {
        return `${gradoTexto || "?"}"${seccionTexto || "?"}`;
      }

      return `${gradoTexto}"${seccionTexto}"`;
    };

    registrosFiltrados.forEach((item) => {
      if (!item.fk_personal) {
        return;
      }

      const clave = String(item.fk_personal);
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: clave,
          fkPersonal: item.fk_personal,
          nombre: formatearDocente(item) || "Docente sin nombre",
          funcion:
            item.nombre_funcion ??
            item.nombre_cargo ??
            item.funcion ??
            item.tipo_cargo ??
            item.tipo_funcion ??
            "Sin función",
          tipo: item.tipo_cargo ?? item.tipo_funcion ?? "",
          componentes: new Set(),
          momentos: new Set(),
          secciones: new Set(),
          horarios: [],
        });
      }

      const registro = mapa.get(clave);
      registro.horarios.push(item);
      if (item.nombre_componente) {
        registro.componentes.add(item.nombre_componente);
      }
      if (item.nombre_momento) {
        registro.momentos.add(item.nombre_momento);
      }

      const etiquetaSeccion = construirEtiquetaSeccion(
        item.grado,
        item.seccion
      );

      if (etiquetaSeccion) {
        registro.secciones.add(etiquetaSeccion);
      }
    });

    return Array.from(mapa.values())
      .map((docente) => {
        const componentes = Array.from(docente.componentes).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        const momentos = Array.from(docente.momentos).sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
        const secciones = Array.from(docente.secciones).sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );

        return {
          ...docente,
          componentes,
          momentos,
          secciones,
          componentesTexto: componentes.join(", ") || "Sin componentes",
          momentosTexto: momentos.join(", ") || "Sin momentos",
          seccionesTexto: secciones.join(", ") || "Sin secciones",
        };
      })
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, undefined, {
          sensitivity: "base",
        })
      );
  }, [registrosFiltrados]);

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

  const componentesDisponibles = useMemo(() => {
    const listaBase = Array.isArray(catalogos.componentes)
      ? catalogos.componentes
      : [];

    if (!formulario.fk_aula) {
      return listaBase;
    }

    const personalSeleccionado = formulario.fk_personal
      ? String(formulario.fk_personal)
      : null;
    const momentoSeleccionado = formulario.fk_momento
      ? String(formulario.fk_momento)
      : null;

    const normalizarColeccionIds = (valor) => {
      if (Array.isArray(valor)) {
        return valor.map((item) => String(item));
      }

      if (typeof valor === "string" && valor.trim() !== "") {
        return valor
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      }

      return [];
    };

    return listaBase.filter((componente) => {
      const personales = normalizarColeccionIds(
        componente.personal_ids ?? componente.personalIds
      );
      const momentos = normalizarColeccionIds(
        componente.momento_ids ?? componente.momentoIds
      );

      const coincidePersonal = personalSeleccionado
        ? personales.includes(personalSeleccionado)
        : true;
      const coincideMomento = momentoSeleccionado
        ? momentos.includes(momentoSeleccionado)
        : true;

      return coincidePersonal && coincideMomento;
    });
  }, [
    catalogos.componentes,
    formulario.fk_aula,
    formulario.fk_personal,
    formulario.fk_momento,
  ]);

  const componenteSeleccionado = useMemo(() => {
    if (!formulario.fk_componente) {
      return null;
    }

    return (
      componentesDisponibles.find(
        (componente) =>
          String(componente.id) === String(formulario.fk_componente)
      ) || null
    );
  }, [componentesDisponibles, formulario.fk_componente]);

  const esComponenteEspecialista = useMemo(() => {
    if (!componenteSeleccionado) {
      return false;
    }

    const indicador =
      componenteSeleccionado.especialista ??
      componenteSeleccionado.esEspecialista ??
      componenteSeleccionado.es_especialista ??
      componenteSeleccionado.especialista_activo;

    if (typeof indicador === "string") {
      return indicador.trim().toLowerCase() === "si";
    }

    if (typeof indicador === "number") {
      return indicador === 1;
    }

    return Boolean(indicador);
  }, [componenteSeleccionado]);

  const duracionesPermitidas = useMemo(
    () => obtenerDuracionesPermitidas(esComponenteEspecialista),
    [esComponenteEspecialista]
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

  const cargarCatalogos = useCallback(async (filtros = {}) => {
    setCatalogosCargando(true);
    try {
      const datos = await obtenerCatalogosHorarios({ filtros, Swal });
      const normalizados = {
        aulas: Array.isArray(datos?.aulas) ? datos.aulas : [],
        momentos: Array.isArray(datos?.momentos) ? datos.momentos : [],
        anios: Array.isArray(datos?.anios) ? datos.anios : [],
        componentes: Array.isArray(datos?.componentes) ? datos.componentes : [],
        personal: Array.isArray(datos?.personal) ? datos.personal : [],
        estudiantes: Array.isArray(datos?.estudiantes) ? datos.estudiantes : [],
      };

      setCatalogos(normalizados);

      // Preseleccionar momento activo si no hay uno seleccionado
      const momentoActivo =
        normalizados.momentos.find((m) => m.estado === "activo") ||
        normalizados.momentos[0];
      if (momentoActivo) {
        // Preselección en formulario (si aplica)
        setFormulario((prev) => {
          if (prev && prev.fk_momento) {
            return prev;
          }
          return {
            ...prev,
            fk_momento: momentoActivo.id ? String(momentoActivo.id) : "",
          };
        });

        // Establecer filtros por defecto para las tablas: año y momento activo,
        // pero sin sobreescribir selecciones previas del usuario.
        // const anioDesdeMomento = obtenerAnioDesdeMomento(momentoActivo);
        // const idMomento = obtenerIdMomento(momentoActivo);
        // if (anioDesdeMomento !== null) {
        //   setAnioFiltro((prev) => (prev == null ? anioDesdeMomento : prev));
        // }
        // if (idMomento !== null) {
        //   setMomentoFiltro((prev) => (prev == null ? idMomento : prev));
        // }
      }

      setFormulario((prev) => {
        let modificado = false;
        const actualizado = { ...prev };

        if (prev.fk_personal) {
          const docenteDisponible = normalizados.personal.some(
            (docente) => docente.id?.toString() === prev.fk_personal.toString()
          );

          if (!docenteDisponible) {
            actualizado.fk_personal = "";
            actualizado.fk_componente = "";
            modificado = true;
          }
        }

        if (prev.fk_componente) {
          const componenteDisponible = normalizados.componentes.some(
            (comp) => comp.id?.toString() === prev.fk_componente.toString()
          );

          if (!componenteDisponible) {
            actualizado.fk_componente = "";
            modificado = true;
          }
        }

        return modificado ? actualizado : prev;
      });

      return normalizados;
    } catch (error) {
      console.error("Error al obtener catálogos de horarios:", error);
      return null;
    } finally {
      setCatalogosCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const actualizarHorariosAula = useCallback(
    async (idAula, idMomento = null) => {
      if (!idAula) {
        consultaHorariosRef.current += 1;
        setHorariosAula([]);
        setCargandoHorariosAula(false);
        return;
      }

      const llamadaId = consultaHorariosRef.current + 1;
      consultaHorariosRef.current = llamadaId;

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

        if (consultaHorariosRef.current === llamadaId) {
          setHorariosAula(Array.isArray(registros) ? registros : []);
        }
      } catch (error) {
        if (consultaHorariosRef.current === llamadaId) {
          setHorariosAula([]);
        }
        console.error("Error al cargar horarios del aula:", error);
      } finally {
        if (consultaHorariosRef.current === llamadaId) {
          setCargandoHorariosAula(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!modalAbierto) {
      return;
    }

    if (!formulario.fk_aula) {
      actualizarHorariosAula(null);
      return;
    }

    actualizarHorariosAula(formulario.fk_aula, formulario.fk_momento || null);
  }, [
    modalAbierto,
    formulario.fk_aula,
    formulario.fk_momento,
    actualizarHorariosAula,
  ]);

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

    if (name === "fk_aula") {
      if (!value) {
        setFormulario((previo) => ({
          ...previo,
          fk_aula: "",
          fk_momento: "",
          fk_componente: "",
          fk_personal: "",
          estudiantes: [],
        }));
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

      const aulaSeleccionada = catalogos.aulas.find(
        (aula) => aula.id?.toString() === value.toString()
      );
      const momentosRelacionados = filtrarMomentosPorAnio(
        catalogos.momentos,
        aulaSeleccionada?.anio_escolar
      );
      let momentoPreferido = seleccionarMomentoPreferido(momentosRelacionados);
      let momentoDestinoNumero = obtenerIdMomento(momentoPreferido);
      let momentoDestinoId = momentoDestinoNumero
        ? String(momentoDestinoNumero)
        : "";

      setFormulario((previo) => ({
        ...previo,
        fk_aula: value,
        fk_momento: momentoDestinoId,
        fk_componente: "",
        fk_personal: "",
        estudiantes: [],
      }));

      let filtros = construirFiltrosCatalogo(value, momentoDestinoId || null);

      const nuevosCatalogos = await cargarCatalogos(filtros);

      if (!momentoDestinoId && nuevosCatalogos?.momentos?.length) {
        momentoPreferido = seleccionarMomentoPreferido(
          filtrarMomentosPorAnio(
            nuevosCatalogos.momentos,
            aulaSeleccionada?.anio_escolar
          )
        );
        momentoDestinoNumero = obtenerIdMomento(momentoPreferido);
        if (momentoDestinoNumero) {
          momentoDestinoId = String(momentoDestinoNumero);
          setFormulario((previo) => ({
            ...previo,
            fk_momento: momentoDestinoId,
          }));
          filtros = construirFiltrosCatalogo(value, momentoDestinoId);
          await cargarCatalogos(filtros);
        }
      }

      if (!momentoDestinoId) {
        setErroresFormulario((previo) => ({
          ...previo,
          fk_momento:
            "No se encontró un momento activo para el año escolar del aula seleccionada.",
        }));
      } else {
        setErroresFormulario((previo) => {
          if (!previo.fk_momento) {
            return previo;
          }
          const copia = { ...previo };
          delete copia.fk_momento;
          return copia;
        });
      }

      return;
    }

    if (name === "fk_momento") {
      setFormulario((previo) => ({
        ...previo,
        fk_momento: value,
        fk_componente: "",
        fk_personal: "",
        estudiantes: [],
      }));

      if (formulario.fk_aula) {
        const filtrosCatalogo = construirFiltrosCatalogo(
          formulario.fk_aula,
          value || null
        );

        if (Object.keys(filtrosCatalogo).length > 0) {
          await cargarCatalogos(filtrosCatalogo);
        }
      }
      return;
    }

    if (name === "fk_personal") {
      setFormulario((previo) => ({
        ...previo,
        fk_personal: value,
        fk_componente: "",
      }));

      if (formulario.fk_aula) {
        const filtrosCatalogo = construirFiltrosCatalogo(
          formulario.fk_aula,
          formulario.fk_momento,
          null,
          value || null
        );

        if (Object.keys(filtrosCatalogo).length > 0) {
          await cargarCatalogos(filtrosCatalogo);
        }
      }
      return;
    }

    setFormulario((previo) => ({
      ...previo,
      [name]: value,
    }));

    if (name === "fk_componente" && formulario.fk_aula) {
      const filtrosCatalogo = construirFiltrosCatalogo(
        formulario.fk_aula,
        formulario.fk_momento,
        value || null,
        formulario.fk_personal
      );

      if (Object.keys(filtrosCatalogo).length > 0) {
        await cargarCatalogos(filtrosCatalogo);
      }
    }
  };

  const manejarCambioEstudiantes = (evento) => {
    const valores = Array.from(
      evento.target.selectedOptions,
      (opcion) => opcion.value
    );

    setFormulario((previo) => ({
      ...previo,
      estudiantes: valores,
      grupo: valores.length > 0 ? "subgrupo" : previo.grupo,
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

    const erroresLocales = validarHorasFormulario(formulario, {
      esEspecialista: esComponenteEspecialista,
      bloquesConfig: bloquesHorario,
    });
    if (Object.keys(erroresLocales).length > 0) {
      setErroresFormulario(erroresLocales);
      return;
    }

    if (!formulario.fk_momento) {
      setErroresFormulario((previo) => ({
        ...previo,
        fk_momento:
          "Configura un momento académico activo para el año escolar antes de registrar horarios.",
      }));
      return;
    }

    setErroresFormulario({});
    setGuardando(true);

    const aulaActual = formulario.fk_aula;
    const momentoActual = formulario.fk_momento;

    const grupoFinal =
      formulario.estudiantes?.length > 0 ? "subgrupo" : formulario.grupo;

    const datos = {
      fk_aula: formulario.fk_aula ? Number(formulario.fk_aula) : null,
      fk_momento: formulario.fk_momento ? Number(formulario.fk_momento) : null,
      fk_componente: formulario.fk_componente
        ? Number(formulario.fk_componente)
        : null,
      fk_personal: formulario.fk_personal
        ? Number(formulario.fk_personal)
        : null,
      grupo: grupoFinal,
      dia_semana: formulario.dia_semana || null,
      hora_inicio: formulario.hora_inicio || null,
      hora_fin: formulario.hora_fin || null,
      estudiantes:
        grupoFinal === "subgrupo"
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
    if (horario.grupo === "subgrupo") {
      setBloqueSeleccionado(horario);
      setModalDetalleSubgrupoAbierto(true);
    } else {
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
            <p><strong>Docente:</strong> ${
              formatearDocente(horario) || "N/D"
            }</p>
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
    }
  };

  const { user } = useAuth();

  const manejarRemoverEstudiante = async (idHorario, idEstudiante) => {
    Swal.fire({
      title: "¿Remover estudiante?",
      text: "¿Estás seguro de que quieres remover a este estudiante del subgrupo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      try {
        await removerEstudianteDeSubgrupo(idHorario, idEstudiante);
        Swal.fire(
          "¡Removido!",
          "El estudiante ha sido removido del subgrupo.",
          "success"
        );
        // Actualizar la data
        await refrescar();
        // Si el modal de detalle está abierto, actualizamos su data también
        if (bloqueSeleccionado && bloqueSeleccionado.id_horario === idHorario) {
          const nuevosEstudiantes = bloqueSeleccionado.estudiantes.filter(
            (e) => e.id_estudiante !== idEstudiante
          );
          setBloqueSeleccionado({
            ...bloqueSeleccionado,
            estudiantes: nuevosEstudiantes,
          });
        }
      } catch (error) {
        console.error("Error al remover estudiante:", error);
        Swal.fire("Error", "No se pudo remover al estudiante.", "error");
      }
    });
  };

  const manejarActualizarSubgrupo = async (idHorario, estudiantes) => {
    try {
      await sincronizarSubgrupo({ idHorario, estudiantes, Swal });
      // Actualizar vista
      await refrescar();
      if (bloqueSeleccionado && bloqueSeleccionado.id_horario === idHorario) {
        // reconsultar detalle más reciente
        const actualizado = (
          await listarHorarios({
            filtros: {},
            setHorarios: null,
            setIsLoading: null,
            Swal,
          })
        )?.find((h) => h.id_horario === idHorario);
        if (actualizado) {
          setBloqueSeleccionado(actualizado);
        }
      }
    } catch (errores) {
      console.error("Error al actualizar subgrupo:", errores);
    }
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
        if (horario.fk_aula) {
          await actualizarHorariosAula(
            horario.fk_aula,
            horario.fk_momento || null
          );
        }
      }
    });
  };

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

  const columnasAulas = useMemo(
    () => [
      {
        name: "Grado/Sección",
        selector: (row) =>
          `Grado ${row.grado ?? "?"} - Sección ${row.seccion ?? "?"}`,
        sortable: true,
        grow: 1.4,
        wrap: true,
        cell: (row) => <ResumenAula registro={row} />,
      },
      {
        name: "Momento",
        selector: (row) => row.momento,
        sortable: true,
        width: "180px",
        wrap: true,
      },
      {
        name: "Año escolar",
        selector: (row) => row.anioEscolar ?? "N/D",
        sortable: true,
        width: "140px",
      },
      {
        name: "Bloques",
        selector: (row) => row.horarios.length,
        sortable: true,
        width: "120px",
        center: true,
      },
      {
        name: "Acciones",
        width: "100px",
        cell: (row) => (
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
            onClick={() => abrirModalSeccion(row)}
            title="Ver horario del aula"
            aria-label="Ver horario del aula"
          >
            <FaEye className={horariosIconClasses.base} />
          </button>
        ),
      },
    ],
    [abrirModalSeccion]
  );
  const MostrarTabla = () => {
    setMostrarGeneral((prev) => !prev);
  };
  const columnasDocentes = useMemo(
    () => [
      {
        name: "Docente",
        selector: (row) => row.nombre,
        sortable: true,
        grow: 2,
        wrap: true,
        cell: (row) => <DocenteResumen docente={row} />,
      },
      {
        name: "Acciones",
        width: "100px",
        center: true,
        cell: (row) => (
          <button
            type="button"
            className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
            onClick={() => abrirModalDocente(row)}
            title="Ver agenda docente"
            aria-label="Ver agenda docente"
          >
            <FaEye className={horariosIconClasses.base} />
          </button>
        ),
      },
    ],
    [abrirModalDocente]
  );

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

      <div className="mt-6">
        <BarraBusquedaHorarios
          valor={busqueda}
          onCambio={setBusqueda}
          onActualizar={refrescar}
          MostrarTabla={MostrarTabla}
          MostrarGeneral={MostrarGeneral}
          aniosEscolares={aniosEscolares}
          momentos={momentosFiltrados}
          anioSeleccionado={anioFiltro}
          momentoSeleccionado={momentoFiltro}
          onCambioAnio={setAnioFiltro}
          onCambioMomento={setMomentoFiltro}
        />
      </div>
      <div className="mt-6 space-y-12">
        {MostrarGeneral === true ? (
          <>
            <section className="space-y-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Horarios por aula
                  </h3>
                  <p className="text-sm text-slate-500">
                    Visualiza cada grado y sección por momento académico y
                    consulta su agenda semanal en un calendario.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {seccionesAgrupadas.length} combinaciones encontradas
                </span>
              </div>

              <TablaEntradas
                columns={columnasAulas}
                data={seccionesAgrupadas}
                isLoading={isLoading}
                filterConfig={null}
              />
            </section>
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Horarios por docente y especialista
                </h3>
                <p className="text-sm text-slate-500">
                  Consulta la asignación semanal de cada docente según los
                  momentos y componentes que atiende.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {docentesAgrupados.length} docentes con agenda
              </span>
            </div>

            <TablaEntradas
              columns={columnasDocentes}
              data={docentesAgrupados}
              isLoading={isLoading}
              filterConfig={null}
            />
          </section>
        )}
      </div>

      <ModalCalendarioAula
        abierto={modalSeccionAbierto}
        alCerrar={cerrarModalSeccion}
        seccion={seccionSeleccionada}
        bloquesConfig={bloquesHorario}
        onVerDetalle={manejarVerDetalle}
      />

      <ModalAgendaDocente
        abierto={modalDocenteAbierto}
        alCerrar={cerrarModalDocente}
        docente={docenteSeleccionado}
        onVerDetalle={manejarVerDetalle}
        onEliminar={manejarEliminar}
        bloquesConfig={bloquesHorario}
      />

      <ModalFormularioHorario
        abierto={modalAbierto}
        alCerrar={cerrarModal}
        formulario={formulario}
        catalogos={catalogos}
        errores={errores}
        catalogosCargando={catalogosCargando}
        guardando={guardando}
        momentosDisponibles={momentosDisponibles}
        componentesDisponibles={componentesDisponibles}
        personalDisponible={personalDisponible}
        estudiantesDisponibles={estudiantesDisponibles}
        esEspecialistaSeleccionado={esComponenteEspecialista}
        bloquesConfig={bloquesHorario}
        duracionesPermitidas={duracionesPermitidas}
        calendarioPorDia={calendarioPorDia}
        cargandoHorariosAula={cargandoHorariosAula}
        onCambio={manejarCambio}
        onCambioEstudiantes={manejarCambioEstudiantes}
        onBlurHora={manejarBlurHora}
        onSubmit={manejarSubmit}
        onVerDetalle={manejarVerDetalle}
        onEliminar={manejarEliminar}
      />

      <ModalDetalleSubgrupo
        abierto={modalDetalleSubgrupoAbierto}
        alCerrar={() => {
          setModalDetalleSubgrupoAbierto(false);
          setBloqueSeleccionado(null);
        }}
        bloque={bloqueSeleccionado}
        onRemoverEstudiante={manejarRemoverEstudiante}
        onActualizarSubgrupo={manejarActualizarSubgrupo}
        puedeGestionar={Boolean(
          user &&
            (String(user.rol).toLowerCase() === "director" ||
              (bloqueSeleccionado &&
                user.fk_personal === bloqueSeleccionado.fk_personal))
        )}
      />
    </div>
  );
};

export default Horarios;
