import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { contenidosFormClasses } from "../EstilosCliente/EstilosClientes";
import { planificacionFormBaseClasses } from "./planificacionEstilos";
import {
  obtenerCompetencias,
  actualizarCompetencia,
  crearCompetencia,
  eliminarCompetencia,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
} from "../Competencias/competenciasService";
import {
  listarPlanificaciones,
  crearPlanificacion as crearPlanificacionApi,
  actualizarPlanificacion as actualizarPlanificacionApi,
  cambiarEstadoPlanificacion,
} from "../../api/planificacionesService";
import { PanelContextoActual } from "./componentes/PanelContextoActual";
import { SelectorDocenteInteractivo } from "./componentes/SelectorDocenteInteractivo";
import { SeccionCompetencias } from "./componentes/SeccionCompetencias";
import { ModalPlanificacionesDocente } from "./componentes/ModalPlanificacionesDocente";

const {
  rolePillBase: rolePillBaseClass,
  competenciaMetaPill: competenciaMetaPillClass,
  competenciaItemBase,
  competenciaItemActive: competenciaItemActivo,
  competenciaCard: competenciaCardClase,
  indicadorRow: indicadorRowClase,
} = planificacionFormBaseClasses;

const defaultForm = {
  fk_momento: "",
  fk_personal: "",
  fk_aula: "",
  fk_componente: "",
  tipo: "aula",
  estado: "activo",
  reutilizable: "no",
  competencias: [],
  estudiantes: [],
};

const MAX_COMPETENCIAS_POR_PLAN = 10;

const obtenerClaveComponente = (valor) => {
  const normalizado = normalizarEntero(valor);
  return normalizado === null ? "sin-componente" : String(normalizado);
};

const normalizarEntero = (valor) => {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    return Math.trunc(valor);
  }

  if (typeof valor === "boolean") {
    return valor ? 1 : 0;
  }

  if (typeof valor === "string") {
    const texto = valor.trim();
    if (texto === "") {
      return null;
    }
    if (/^-?\d+$/.test(texto)) {
      const numero = Number.parseInt(texto, 10);
      return Number.isNaN(numero) ? null : numero;
    }
    if (!Number.isNaN(Number(texto))) {
      return Math.trunc(Number(texto));
    }
    return null;
  }

  if (typeof valor === "object") {
    const posibleId =
      valor?.id ??
      valor?.id_personal ??
      valor?.id_aula ??
      valor?.id_componente ??
      valor?.id_momento;
    return normalizarEntero(posibleId);
  }

  return null;
};

const obtenerTextoPlano = (valor, fallback = "") => {
  if (valor === null || valor === undefined) {
    return fallback;
  }

  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto || fallback;
  }

  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor);
  }

  if (Array.isArray(valor)) {
    const texto = valor
      .map((item) => obtenerTextoPlano(item, ""))
      .filter(Boolean)
      .join(" ");
    return texto.trim() || fallback;
  }

  if (typeof valor === "object") {
    const clavesPreferidas = [
      "nombre",
      "nombre_competencia",
      "nombre_indicador",
      "titulo",
      "descripcion",
      "detalle",
      "label",
      "texto",
      "valor",
    ];

    for (const clave of clavesPreferidas) {
      const candidato = valor[clave];
      if (typeof candidato === "string" && candidato.trim()) {
        return candidato.trim();
      }
    }

    if (valor.raw && valor.raw !== valor) {
      const textoRaw = obtenerTextoPlano(valor.raw, "");
      if (textoRaw) {
        return textoRaw;
      }
    }
  }

  if (typeof valor.toString === "function") {
    const texto = valor.toString();
    if (texto && texto !== "[object Object]") {
      return texto;
    }
  }

  return fallback;
};

const mapCatalogToOptions = (items, config = {}) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const { idExtractor, labelExtractor } = config;
  const resultado = [];
  const vistos = new Set();

  items.forEach((item) => {
    if (!item) {
      return;
    }

    const idCrudo = idExtractor ? idExtractor(item) : item.id;
    const idNormalizado =
      normalizarEntero(idCrudo) ??
      (typeof idCrudo === "string" ? idCrudo.trim() : null);

    if (idNormalizado === null || idNormalizado === "") {
      return;
    }

    const clave = String(idNormalizado);
    if (vistos.has(clave)) {
      return;
    }

    const etiquetaCruda = labelExtractor ? labelExtractor(item) : undefined;
    const label =
      obtenerTextoPlano(etiquetaCruda ?? item.label ?? item.nombre, "") ||
      `Opción #${clave}`;

    if (!label) {
      return;
    }

    vistos.add(clave);
    resultado.push({
      id: idNormalizado,
      label,
      raw: item,
    });
  });

  return resultado;
};

const generarIniciales = (texto) => {
  if (!texto) {
    return "?";
  }

  const limpio = texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .trim();

  if (!limpio) {
    return "?";
  }

  const partes = limpio.split(/\s+/).filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return (partes[0][0] + partes[1][0]).toUpperCase();
};

const sanitizarParaHtmlInput = (valor) =>
  (valor ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sanitizarParaTextarea = (valor) =>
  (valor ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const PlanificacionFormModal = ({
  isOpen,
  modo = "crear",
  initialData = {},
  contexto,
  catalogos = {},
  onClose,
  onSubmit,
  cargarAsignacionDocente,
  bloqueado,
}) => {
  const [form, setForm] = useState(defaultForm);
  const [errores, setErrores] = useState({});
  const [competenciasDisponibles, setCompetenciasDisponibles] = useState([]);
  const [cargandoCompetencias, setCargandoCompetencias] = useState(false);
  const [indicadorContenidos, setIndicadorContenidos] = useState({});
  const [contenidosDisponibles, setContenidosDisponibles] = useState([]);
  const [contenidosCargando, setContenidosCargando] = useState(false);
  const [asignacion, setAsignacion] = useState(null);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [estudiantesTexto, setEstudiantesTexto] = useState("");
  const [docentesAsignacion, setDocentesAsignacion] = useState({});
  const [cargandoDocentesAsignacion, setCargandoDocentesAsignacion] =
    useState(false);
  const ultimaCargaDocentes = useRef({ momento: null, total: 0 });
  const contenidosCargadosRef = useRef(false);
  const selectorDocenteRef = useRef(null);
  const [selectorDocenteAbierto, setSelectorDocenteAbierto] = useState(false);
  const [docenteFiltro, setDocenteFiltro] = useState("");
  const [gestionCompetenciasCargando, setGestionCompetenciasCargando] =
    useState(false);
  const [
    seleccionCompetenciasPorComponente,
    setSeleccionCompetenciasPorComponente,
  ] = useState({});
  const [
    catalogoCompetenciasPorComponente,
    setCatalogoCompetenciasPorComponente,
  ] = useState({});
  const [planificacionesModalAbierta, setPlanificacionesModalAbierta] =
    useState(false);
  const [planificacionesModalEstado, setPlanificacionesModalEstado] = useState({
    cargando: false,
    registros: [],
    error: "",
  });
  const seleccionCompetenciasRef = useRef(seleccionCompetenciasPorComponente);

  const momentosCatalogoRaw = Array.isArray(catalogos?.momentos)
    ? catalogos.momentos
    : [];
  const contextoMomentoId = normalizarEntero(
    contexto?.momento?.id_momento ?? contexto?.momento?.id
  );
  const contextoAnioId = normalizarEntero(
    contexto?.anio?.id_anio_escolar ??
      contexto?.anio?.id_anio ??
      contexto?.anio?.id
  );

  const momentosDisponibles = useMemo(() => {
    if (modo !== "crear") {
      return momentosCatalogoRaw;
    }

    return momentosCatalogoRaw.filter((momento) => {
      const idMomento = normalizarEntero(momento.id_momento ?? momento.id);
      const estado = (
        momento.estado ??
        momento.raw?.estado ??
        momento.raw?.estado_momento ??
        momento.raw?.momento_estado ??
        ""
      )
        .toString()
        .toLowerCase();
      const fkAnio = normalizarEntero(
        momento.fk_anio_escolar ??
          momento.raw?.fk_anio_escolar ??
          momento.raw?.fk_anio ??
          momento.raw?.id_anio_escolar
      );

      const esActivo = estado === "activo";
      const coincideAnio =
        contextoAnioId !== null ? fkAnio === contextoAnioId : true;
      const coincideMomento =
        contextoMomentoId !== null ? idMomento === contextoMomentoId : true;

      return esActivo && coincideAnio && coincideMomento;
    });
  }, [momentosCatalogoRaw, modo, contextoAnioId, contextoMomentoId]);

  const momentoDestino = useMemo(() => {
    const seleccionado = normalizarEntero(form.fk_momento);
    if (seleccionado !== null) {
      return seleccionado;
    }
    if (contextoMomentoId !== null) {
      return contextoMomentoId;
    }
    return normalizarEntero(initialData?.fk_momento);
  }, [form.fk_momento, contextoMomentoId, initialData?.fk_momento]);

  const titulo =
    modo === "editar"
      ? "Editar planificación"
      : modo === "clonar"
      ? "Clonar planificación"
      : "Registrar planificación";

  const submitLabel =
    modo === "editar" ? "Actualizar planificación" : "Guardar planificación";

  const catalogoMomentos = useMemo(
    () =>
      mapCatalogToOptions(momentosDisponibles, {
        idExtractor: (item) => item.id_momento ?? item.id,
        labelExtractor: (item) =>
          item.label ??
          item.nombre ??
          item.nombre_momento ??
          item.momento_nombre ??
          item.descripcion ??
          `Momento #${item.id_momento ?? item.id}`,
      }),
    [momentosDisponibles]
  );

  const bloquearCambioMomento = modo === "crear" && contextoMomentoId !== null;

  const momentoSeleccionadoLabel = useMemo(() => {
    const id = normalizarEntero(form.fk_momento) ?? momentoDestino;
    if (id === null) {
      return "Sin momento";
    }
    const opcion = catalogoMomentos.find(
      (momento) => normalizarEntero(momento.id) === id
    );
    return opcion?.label ?? `Momento #${id}`;
  }, [form.fk_momento, momentoDestino, catalogoMomentos]);

  const personalAsignable = useMemo(() => {
    const lista = Array.isArray(catalogos?.personal) ? catalogos.personal : [];

    const seleccionadoActual = normalizarEntero(form.fk_personal);
    const seleccionadoInicial = normalizarEntero(initialData?.fk_personal);
    const seleccionadoReferencia =
      seleccionadoActual ?? seleccionadoInicial ?? null;

    return lista
      .map((persona) => {
        const id = normalizarEntero(persona.id ?? persona.id_personal);
        if (id === null) {
          return null;
        }

        const asignacionDoc = docentesAsignacion[id];
        const esSeleccionado =
          seleccionadoReferencia !== null && id === seleccionadoReferencia;

        const asignacionValida =
          asignacionDoc &&
          asignacionDoc.tiene_asignaciones &&
          Array.isArray(asignacionDoc.componentes) &&
          asignacionDoc.componentes.length > 0;

        if (!asignacionValida && modo === "crear" && !esSeleccionado) {
          return null;
        }

        const rolesSet = new Set(
          (asignacionDoc?.componentes || [])
            .map((comp) => {
              const tipo = (comp?.tipo_docente || "").toLowerCase();
              if (tipo === "aula") {
                return "Docente de aula";
              }
              if (tipo === "especialista") {
                return "Especialista";
              }
              return null;
            })
            .filter(Boolean)
        );

        let rolesTexto = rolesSet.size ? Array.from(rolesSet).join(" y ") : "";

        if (
          !rolesTexto &&
          (persona.raw?.tipo_cargo || persona.raw?.tipo_funcion)
        ) {
          const tipoFuncion = (
            persona.raw.tipo_cargo ||
            persona.raw.tipo_funcion ||
            ""
          ).toLowerCase();
          if (tipoFuncion.includes("docente")) {
            rolesTexto = "Docente de aula";
          } else if (
            tipoFuncion.includes("especialist") ||
            tipoFuncion.includes("especialista")
          ) {
            rolesTexto = "Especialista";
          } else {
            rolesTexto = persona.raw.tipo_cargo || persona.raw.tipo_funcion;
          }
        }

        const rolesLista = rolesSet.size
          ? Array.from(rolesSet)
          : rolesTexto
          ? [rolesTexto]
          : [];

        const nombres =
          persona.raw?.nombres ??
          persona.nombres ??
          persona.nombre ??
          persona.raw?.nombre ??
          "";
        const apellidos =
          persona.raw?.apellidos ??
          persona.apellidos ??
          persona.apellido ??
          persona.raw?.apellido ??
          "";
        const baseLabel =
          [nombres, apellidos]
            .map((parte) => (parte || "").toString().trim())
            .filter(Boolean)
            .join(" ")
            .trim() ||
          persona.label ||
          "Docente";

        let roleVariant = "default";
        const rolesMinusculas = rolesTexto.toLowerCase();
        const tieneDocente = rolesMinusculas.includes("docente");
        const tieneEspecialista = rolesMinusculas.includes("especialista");

        if (tieneDocente && tieneEspecialista) {
          roleVariant = "mixto";
        } else if (tieneDocente) {
          roleVariant = "docente";
        } else if (tieneEspecialista) {
          roleVariant = "especialista";
        }

        return {
          ...persona,
          id,
          label: baseLabel,
          labelBase: baseLabel,
          roleLabel: rolesTexto,
          roleList: rolesLista,
          roleVariant,
        };
      })
      .filter(Boolean);
  }, [
    catalogos?.personal,
    docentesAsignacion,
    modo,
    form.fk_personal,
    initialData?.fk_personal,
  ]);

  const catalogoPersonal = useMemo(() => {
    return personalAsignable.map((item) => {
      const id = item.id;
      const base = item.labelBase ?? item.label ?? "Docente";
      const roles = (item.roleLabel || "")
        .split(" y ")
        .map((fragmento) => fragmento.trim())
        .filter(Boolean);

      let variante = item.roleVariant ?? "default";
      if (variante === "default" && roles.length === 1) {
        const rolLower = roles[0].toLowerCase();
        if (rolLower.includes("docente")) {
          variante = "docente";
        } else if (rolLower.includes("especialista")) {
          variante = "especialista";
        }
      }

      const roleBadge =
        variante === "docente"
          ? "Docente de Aula"
          : variante === "especialista"
          ? "Especialista"
          : variante === "mixto"
          ? "Docente de Aula / Especialista"
          : roles.length
          ? roles
              .map((rol) =>
                rol
                  .split(" ")
                  .map((parte) =>
                    parte
                      ? parte.charAt(0).toUpperCase() +
                        parte.slice(1).toLowerCase()
                      : parte
                  )
                  .join(" ")
              )
              .join(" / ")
          : "Personal";

      const rolePillClass = (() => {
        switch (variante) {
          case "docente":
            return `${rolePillBaseClass} bg-blue-100 text-blue-700`;
          case "especialista":
            return `${rolePillBaseClass} bg-emerald-100 text-emerald-700`;
          case "mixto":
            return `${rolePillBaseClass} bg-sky-100 text-sky-700`;
          default:
            return `${rolePillBaseClass} bg-slate-200 text-slate-600`;
        }
      })();

      const label = base;
      const searchTokens = `${base} ${item.roleLabel ?? ""} ${roleBadge}`
        .toLowerCase()
        .trim();

      return {
        id: String(id),
        label,
        baseLabel: base,
        roleBadge,
        rolePillClass,
        initials: generarIniciales(base),
        roleVariant: variante,
        roleLabel: item.roleLabel ?? "",
        searchTokens,
      };
    });
  }, [personalAsignable]);

  const catalogoAulas = useMemo(
    () =>
      mapCatalogToOptions(catalogos?.aulas, {
        idExtractor: (item) => item.id_aula ?? item.id,
        labelExtractor: (item) =>
          item.nombre ??
          (item.grado || item.seccion
            ? `Grado ${item.grado ?? "?"} - Seccion ${item.seccion ?? "?"}`
            : `Aula #${item.id_aula ?? item.id}`),
      }),
    [catalogos?.aulas]
  );

  const catalogoPersonalFiltrado = useMemo(() => {
    const termino = docenteFiltro.trim().toLowerCase();
    if (!termino) {
      return catalogoPersonal;
    }
    return catalogoPersonal.filter((docente) =>
      docente.searchTokens ? docente.searchTokens.includes(termino) : false
    );
  }, [catalogoPersonal, docenteFiltro]);

  const mapearCompetencias = useCallback((registros) => {
    if (!Array.isArray(registros)) {
      return [];
    }

    return registros
      .map((item) => {
        const id = normalizarEntero(item.id_competencia ?? item.id);
        if (id === null) {
          return null;
        }

        const nombreInicial = obtenerTextoPlano(
          item.nombre_competencia ??
            item.nombre ??
            item.titulo ??
            item.raw?.nombre ??
            ""
        );

        const descripcionInicial = obtenerTextoPlano(
          item.descripcion_competencia ??
            item.descripcion ??
            item.detalle ??
            item.raw?.descripcion ??
            ""
        );

        let nombre = nombreInicial;
        let descripcion = descripcionInicial;

        if (!nombre || /^\d+$/.test(nombre)) {
          if (descripcion) {
            nombre = descripcion;
            descripcion = "";
          } else {
            nombre = "Competencia sin nombre";
          }
        }

        const componenteNombre = obtenerTextoPlano(
          item.componente_nombre ??
            item.nombre_componente ??
            item.componente ??
            item.raw?.componente_nombre ??
            item.raw?.componente ??
            ""
        );

        const componenteId = normalizarEntero(
          item.fk_componente ??
            item.componente?.id ??
            item.raw?.fk_componente ??
            item.componente_id
        );

        const areaNombre = obtenerTextoPlano(
          item.area_nombre ??
            item.nombre_area ??
            item.area ??
            item.raw?.area_nombre ??
            item.raw?.area ??
            ""
        );

        const areaId = normalizarEntero(
          item.fk_area ?? item.area?.id ?? item.area_id ?? item.raw?.fk_area
        );

        const reutilizableValor = obtenerTextoPlano(
          item.reutilizable ?? item.raw?.reutilizable ?? "no",
          "no"
        )
          .toString()
          .toLowerCase();

        const reutilizable = reutilizableValor === "si" ? "si" : "no";

        const indicadores = Array.isArray(item.indicadores)
          ? item.indicadores
              .map((indicador) => {
                const indicadorId = normalizarEntero(
                  indicador.id_indicador ?? indicador.id
                );
                if (indicadorId === null) {
                  return null;
                }

                const nombreIndicador =
                  obtenerTextoPlano(
                    indicador.nombre_indicador ?? indicador.nombre ?? "",
                    "Indicador sin nombre"
                  ) || "Indicador sin nombre";

                const aspectoIndicador = obtenerTextoPlano(
                  indicador.aspecto ?? indicador.tipo ?? "",
                  ""
                );

                const ordenIndicador = normalizarEntero(
                  indicador.orden ?? indicador.position ?? indicador.indice
                );

                const oculto =
                  obtenerTextoPlano(
                    indicador.ocultar ?? indicador.oculto ?? "no",
                    "no"
                  )
                    .toString()
                    .toLowerCase() === "si";

                return {
                  id: indicadorId,
                  nombre: nombreIndicador,
                  aspecto: aspectoIndicador || null,
                  orden: ordenIndicador,
                  oculto,
                  raw: indicador,
                };
              })
              .filter(Boolean)
          : [];

        return {
          id,
          nombre,
          descripcion,
          componente: componenteNombre || null,
          componenteId: componenteId ?? null,
          area: areaNombre || null,
          areaId: areaId ?? null,
          reutilizable,
          indicadores,
          raw: item,
        };
      })
      .filter(Boolean);
  }, []);

  useEffect(() => {
    seleccionCompetenciasRef.current = seleccionCompetenciasPorComponente;
  }, [seleccionCompetenciasPorComponente]);

  const recargarCompetencias = useCallback(
    async ({ mostrarAlertas = true } = {}) => {
      const componenteId = normalizarEntero(form.fk_componente);
      const claveComponente = obtenerClaveComponente(componenteId);

      if (componenteId === null) {
        if (mostrarAlertas) {
          Swal.fire(
            "Aviso",
            "Selecciona un componente antes de gestionar competencias.",
            "warning"
          );
        }
        setCompetenciasDisponibles([]);
        setForm((prev) => ({ ...prev, competencias: [] }));
        setIndicadorContenidos({});
        return [];
      }

      setCargandoCompetencias(true);
      try {
        const registros = await obtenerCompetencias({
          areaId: undefined,
          componenteId,
        });

        const opciones = mapearCompetencias(registros);
        setCompetenciasDisponibles(opciones);
        setCatalogoCompetenciasPorComponente((prev) => ({
          ...prev,
          [claveComponente]: opciones,
        }));

        const validos = new Set(opciones.map((opcion) => opcion.id));
        const seleccionAnterior =
          seleccionCompetenciasRef.current?.[claveComponente] ?? [];
        const seleccionDepurada = seleccionAnterior.filter((valor) =>
          validos.has(valor)
        );

        setSeleccionCompetenciasPorComponente((prev) => ({
          ...prev,
          [claveComponente]: seleccionDepurada,
        }));
        setForm((prev) => ({
          ...prev,
          competencias: seleccionDepurada,
        }));

        setIndicadorContenidos((prev) => {
          const disponibles = new Set();
          opciones.forEach((competencia) => {
            competencia.indicadores.forEach((indicador) => {
              disponibles.add(indicador.id);
            });
          });

          const actualizado = {};
          disponibles.forEach((indicadorId) => {
            if (prev[indicadorId]) {
              actualizado[indicadorId] = prev[indicadorId];
            }
          });
          return actualizado;
        });

        return opciones;
      } catch (error) {
        if (mostrarAlertas) {
          Swal.fire(
            "Aviso",
            error?.message ||
              "No se pudieron cargar las competencias disponibles.",
            "warning"
          );
        }
        setCompetenciasDisponibles([]);
        setForm((prev) => ({ ...prev, competencias: [] }));
        setIndicadorContenidos({});
        throw error;
      } finally {
        setCargandoCompetencias(false);
      }
    },
    [form.fk_componente, mapearCompetencias]
  );

  const catalogoComponentes = useMemo(
    () =>
      mapCatalogToOptions(catalogos?.componentes, {
        idExtractor: (item) => item.id_componente ?? item.id,
        labelExtractor: (item) =>
          item.nombre_componente ??
          item.nombre ??
          item.descripcion ??
          `Componente #${item.id_componente ?? item.id}`,
      }),
    [catalogos?.componentes]
  );

  const catalogoComponentesMap = useMemo(() => {
    const mapa = new Map();
    catalogoComponentes.forEach((componente) => {
      const clave = obtenerClaveComponente(componente.id);
      mapa.set(clave, componente.label);
    });
    return mapa;
  }, [catalogoComponentes]);

  const docenteSeleccionado = useMemo(() => {
    if (!form.fk_personal) {
      return null;
    }
    const seleccionado = String(form.fk_personal);
    return (
      catalogoPersonal.find((docente) => String(docente.id) === seleccionado) ||
      null
    );
  }, [catalogoPersonal, form.fk_personal]);

  const competenciasSeleccionadasPorComponente = useMemo(() => {
    const grupos = [];

    Object.entries(seleccionCompetenciasPorComponente).forEach(
      ([clave, ids]) => {
        if (!Array.isArray(ids) || ids.length === 0) {
          return;
        }

        const listado = catalogoCompetenciasPorComponente[clave] || [];
        const seleccion = new Set(ids);
        const coincidencias = listado.filter((competencia) =>
          seleccion.has(competencia.id)
        );

        const componenteId = normalizarEntero(clave);
        const componenteLabel =
          coincidencias[0]?.componente ||
          catalogoComponentesMap.get(clave) ||
          (componenteId
            ? `Componente #${componenteId}`
            : "Componente sin nombre");

        const competenciasRender = coincidencias.length
          ? coincidencias
          : ids.map((id) => ({
              id,
              nombre: `Competencia #${id}`,
              descripcion: "",
              indicadores: [],
              componente: componenteLabel,
              componenteId,
            }));

        grupos.push({
          clave,
          componenteId,
          componenteLabel,
          competencias: competenciasRender,
        });
      }
    );

    return grupos;
  }, [
    seleccionCompetenciasPorComponente,
    catalogoCompetenciasPorComponente,
    catalogoComponentesMap,
  ]);

  const totalCompetenciasSeleccionadas = useMemo(
    () =>
      Object.values(seleccionCompetenciasPorComponente).reduce(
        (acumulado, lista) =>
          acumulado + (Array.isArray(lista) ? lista.length : 0),
        0
      ),
    [seleccionCompetenciasPorComponente]
  );

  const limpiarErrores = () => setErrores({});

  const prepararEstadoInicial = () => {
    const contextoMomento = normalizarEntero(
      initialData?.fk_momento ?? contexto?.momento?.id_momento
    );

    const base = {
      ...defaultForm,
      fk_momento: contextoMomento ?? "",
      estado: initialData?.estado ?? "activo",
      tipo: initialData?.tipo ?? "aula",
    };

    const merged = {
      ...base,
      ...initialData,
    };

    let fkMomentoInicial =
      merged.fk_momento ?? contextoMomentoId ?? base.fk_momento ?? "";

    if (
      modo === "crear" &&
      (!fkMomentoInicial || fkMomentoInicial === "") &&
      momentosDisponibles.length === 1
    ) {
      const unico = momentosDisponibles[0];
      const idUnico = normalizarEntero(unico.id_momento ?? unico.id);
      if (idUnico !== null) {
        fkMomentoInicial = idUnico;
      }
    }

    const competenciasNormalizadas = Array.isArray(merged.competencias)
      ? merged.competencias
          .map((valor) => normalizarEntero(valor))
          .filter((valor) => valor !== null)
      : [];

    const estudiantesNormalizados = Array.isArray(merged.estudiantes)
      ? merged.estudiantes
          .map((valor) => normalizarEntero(valor))
          .filter((valor) => valor !== null)
      : [];

    setForm({
      ...merged,
      fk_personal: merged.fk_personal ?? "",
      fk_aula: merged.fk_aula ?? "",
      fk_componente: merged.fk_componente ?? "",
      fk_momento: fkMomentoInicial ?? "",
      tipo: merged.tipo ?? "aula",
      estado: merged.estado ?? "activo",
      reutilizable: "no",
      competencias: competenciasNormalizadas,
      estudiantes: estudiantesNormalizados,
    });

    if (Array.isArray(merged.estudiantes) && merged.estudiantes.length) {
      setEstudiantesTexto(merged.estudiantes.join("\n"));
    } else {
      setEstudiantesTexto("");
    }

    const componenteInicial = normalizarEntero(merged.fk_componente);
    const claveSeleccion = obtenerClaveComponente(componenteInicial);
    setSeleccionCompetenciasPorComponente(
      competenciasNormalizadas.length
        ? { [claveSeleccion]: competenciasNormalizadas }
        : {}
    );
    setCatalogoCompetenciasPorComponente({});
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    prepararEstadoInicial();
    limpiarErrores();
    setSelectorDocenteAbierto(false);
    setPlanificacionesModalAbierta(false);
  }, [isOpen, initialData, contexto, modo, momentosDisponibles]);

  useEffect(() => {
    if (!selectorDocenteAbierto) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        selectorDocenteRef.current &&
        !selectorDocenteRef.current.contains(event.target)
      ) {
        setSelectorDocenteAbierto(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectorDocenteAbierto(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectorDocenteAbierto]);

  useEffect(() => {
    if (!selectorDocenteAbierto) {
      setDocenteFiltro("");
    }
  }, [selectorDocenteAbierto]);

  useEffect(() => {
    if (cargandoDocentesAsignacion || catalogoPersonal.length === 0) {
      setSelectorDocenteAbierto(false);
    }
  }, [cargandoDocentesAsignacion, catalogoPersonal.length]);

  useEffect(() => {
    if (!isOpen || !cargarAsignacionDocente) {
      return;
    }

    const listaPersonal = Array.isArray(catalogos?.personal)
      ? catalogos.personal
      : [];

    if (!listaPersonal.length || !momentoDestino) {
      setDocentesAsignacion({});
      ultimaCargaDocentes.current = { momento: null, total: 0 };
      return;
    }

    const totalPersonal = listaPersonal.length;
    if (
      ultimaCargaDocentes.current.momento === momentoDestino &&
      ultimaCargaDocentes.current.total === totalPersonal
    ) {
      return;
    }

    ultimaCargaDocentes.current = {
      momento: momentoDestino,
      total: totalPersonal,
    };

    let cancelado = false;

    const cargarAsignacionesMasivas = async () => {
      setCargandoDocentesAsignacion(true);
      try {
        const resultados = await Promise.allSettled(
          listaPersonal.map((docente) => {
            const id = normalizarEntero(docente.id ?? docente.id_personal);
            if (id === null) {
              return Promise.resolve(null);
            }
            return cargarAsignacionDocente(id, { fk_momento: momentoDestino });
          })
        );

        if (cancelado) {
          return;
        }

        const mapa = {};
        resultados.forEach((resultado, indice) => {
          const docente = listaPersonal[indice];
          const docenteId = normalizarEntero(
            docente?.id ?? docente?.id_personal
          );
          if (docenteId === null) {
            return;
          }
          if (resultado.status !== "fulfilled" || !resultado.value) {
            return;
          }
          const respuesta = resultado.value;
          if (!respuesta?.success) {
            return;
          }
          const asignacionDoc = respuesta.data?.asignacion;
          if (!asignacionDoc) {
            return;
          }
          const componentesValidos = Array.isArray(asignacionDoc.componentes)
            ? asignacionDoc.componentes.filter(Boolean)
            : [];
          if (
            !asignacionDoc.tiene_asignaciones ||
            componentesValidos.length === 0
          ) {
            return;
          }
          mapa[docenteId] = {
            ...asignacionDoc,
            componentes: componentesValidos,
          };
        });

        setDocentesAsignacion(mapa);
      } catch (error) {
        console.error(
          "No se pudieron precargar las asignaciones de los docentes",
          error
        );
        if (!cancelado) {
          setDocentesAsignacion({});
        }
      } finally {
        if (!cancelado) {
          setCargandoDocentesAsignacion(false);
        }
      }
    };

    cargarAsignacionesMasivas();

    return () => {
      cancelado = true;
    };
  }, [isOpen, catalogos?.personal, cargarAsignacionDocente, momentoDestino]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelado = false;

    recargarCompetencias({ mostrarAlertas: false }).catch((error) => {
      if (!cancelado) {
        console.error("No se pudieron cargar las competencias", error);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [isOpen, form.fk_componente, recargarCompetencias]);

  useEffect(() => {
    if (!isOpen || !form.fk_personal || !cargarAsignacionDocente) {
      setAsignacion(null);
      setCargandoAsignacion(false);
      return;
    }

    const docenteId = normalizarEntero(form.fk_personal);
    if (docenteId === null || !momentoDestino) {
      setAsignacion(null);
      setCargandoAsignacion(false);
      return;
    }

    const cacheAsignacion = docentesAsignacion[docenteId];
    const cacheMomento = normalizarEntero(cacheAsignacion?.momento_id);
    if (cacheAsignacion && cacheMomento === momentoDestino) {
      setAsignacion(cacheAsignacion);
      setCargandoAsignacion(false);
      return;
    }

    let cancelado = false;
    setCargandoAsignacion(true);

    const ejecutar = async () => {
      try {
        const respuesta = await cargarAsignacionDocente(docenteId, {
          fk_momento: momentoDestino,
        });
        if (!cancelado) {
          const asignacionDoc = respuesta?.data?.asignacion ?? null;
          setAsignacion(asignacionDoc);
          if (
            asignacionDoc?.tiene_asignaciones &&
            Array.isArray(asignacionDoc.componentes) &&
            asignacionDoc.componentes.length > 0
          ) {
            setDocentesAsignacion((prev) => ({
              ...prev,
              [docenteId]: {
                ...asignacionDoc,
                componentes: asignacionDoc.componentes.filter(Boolean),
              },
            }));
          }
        }
      } catch (error) {
        if (!cancelado) {
          setAsignacion(null);
        }
      } finally {
        if (!cancelado) {
          setCargandoAsignacion(false);
        }
      }
    };

    ejecutar();

    return () => {
      cancelado = true;
    };
  }, [
    isOpen,
    form.fk_personal,
    cargarAsignacionDocente,
    docentesAsignacion,
    momentoDestino,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (form.tipo !== "individual") {
      setForm((prev) => ({ ...prev, estudiantes: [] }));
      setEstudiantesTexto("");
    }
  }, [isOpen, form.tipo]);

  const asignacionAula = useMemo(
    () => (asignacion?.aula ? asignacion.aula : null),
    [asignacion]
  );

  const componentesAsignados = useMemo(
    () =>
      Array.isArray(asignacion?.componentes) ? asignacion.componentes : [],
    [asignacion]
  );

  const filtrosPlanificacionesDocente = useMemo(() => {
    const docenteId = normalizarEntero(form.fk_personal);
    const aulaId = normalizarEntero(form.fk_aula);
    const momentoId = normalizarEntero(momentoDestino);
    return { fk_personal: docenteId, fk_aula: aulaId, fk_momento: momentoId };
  }, [form.fk_personal, form.fk_aula, momentoDestino]);

  const puedeConsultarPlanificaciones = Boolean(
    filtrosPlanificacionesDocente.fk_personal &&
      filtrosPlanificacionesDocente.fk_momento
  );

  const handleAbrirModalPlanificaciones = () => {
    if (!puedeConsultarPlanificaciones) {
      Swal.fire(
        "Datos incompletos",
        "Selecciona un docente, un momento y un aula antes de consultar las planificaciones registradas.",
        "warning"
      );
      return;
    }
    setPlanificacionesModalAbierta(true);
  };

  const handleCerrarModalPlanificaciones = () => {
    setPlanificacionesModalAbierta(false);
  };

  const planificacionesAgrupadas = useMemo(() => {
    const mapa = new Map();

    planificacionesModalEstado.registros.forEach((plan) => {
      const clave = obtenerClaveComponente(plan.fk_componente);
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          componenteId: normalizarEntero(plan.fk_componente),
          componenteLabel:
            catalogoComponentesMap.get(clave) ||
            (plan.fk_componente
              ? `Componente #${plan.fk_componente}`
              : "Componente sin nombre"),
          planificaciones: [],
        });
      }
      mapa.get(clave).planificaciones.push(plan);
    });

    componentesAsignados.forEach((componente) => {
      const clave = obtenerClaveComponente(componente.id);
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          componenteId: normalizarEntero(componente.id),
          componenteLabel:
            componente.nombre ||
            catalogoComponentesMap.get(clave) ||
            "Componente sin nombre",
          planificaciones: [],
        });
      }
    });

    return Array.from(mapa.values()).sort((a, b) =>
      (a.componenteLabel || "").localeCompare(b.componenteLabel || "")
    );
  }, [
    planificacionesModalEstado.registros,
    catalogoComponentesMap,
    componentesAsignados,
  ]);

  const handleEliminarPlanificacionModal = async (plan) => {
    if (!plan?.id_planificacion) {
      return;
    }
    const confirmacion = await Swal.fire({
      title: "Inactivar planificación",
      text: `¿Deseas inactivar la planificación #${plan.id_planificacion}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Inactivar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) {
      return;
    }
    try {
      const respuesta = await cambiarEstadoPlanificacion(
        plan.id_planificacion,
        "inactivo"
      );
      if (!respuesta.success) {
        throw new Error(
          respuesta.message ||
            "No fue posible actualizar el estado de la planificación."
        );
      }
      Swal.fire(
        "Planificación inactiva",
        "El estado se actualizó correctamente.",
        "success"
      );
      cargarPlanificacionesDocente();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message ||
          "No fue posible actualizar el estado de la planificación.",
        "error"
      );
    }
  };

  const handleModificarPlanificacionModal = async (plan) => {
    if (!plan?.id_planificacion) {
      return;
    }

    const { value } = await Swal.fire({
      title: `Modificar planificación #${plan.id_planificacion}`,
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600">Tipo</label>
            <select id="swal-plan-tipo" class="swal2-select">
              <option value="aula" ${
                plan.tipo === "aula" ? "selected" : ""
              }>Aula completa</option>
              <option value="individual" ${
                plan.tipo === "individual" ? "selected" : ""
              }>Individual</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600">Estado</label>
            <select id="swal-plan-estado" class="swal2-select">
              <option value="activo" ${
                plan.estado === "activo" ? "selected" : ""
              }>Activo</option>
              <option value="inactivo" ${
                plan.estado === "inactivo" ? "selected" : ""
              }>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const popup = Swal.getPopup();
        const tipo = popup?.querySelector("#swal-plan-tipo")?.value;
        const estado = popup?.querySelector("#swal-plan-estado")?.value;
        if (!tipo || !estado) {
          Swal.showValidationMessage("Debe seleccionar el tipo y el estado.");
          return false;
        }
        return { tipo, estado };
      },
    });

    if (!value) {
      return;
    }

    try {
      const respuesta = await actualizarPlanificacionApi(
        plan.id_planificacion,
        value
      );
      if (!respuesta.success) {
        throw new Error(
          respuesta.message || "No fue posible actualizar la planificación."
        );
      }
      Swal.fire(
        "Planificación actualizada",
        "Los cambios se aplicaron correctamente.",
        "success"
      );
      cargarPlanificacionesDocente();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "No fue posible actualizar la planificación.",
        "error"
      );
    }
  };

  const handleAgregarPlanificacionModal = async (componenteId) => {
    const componenteDestino = normalizarEntero(componenteId);
    if (componenteDestino === null) {
      Swal.fire(
        "Componente inválido",
        "No se pudo determinar el componente seleccionado.",
        "warning"
      );
      return;
    }

    if (!puedeConsultarPlanificaciones) {
      Swal.fire(
        "Datos incompletos",
        "Selecciona docente, momento y aula antes de registrar la planificación.",
        "warning"
      );
      return;
    }

    if (!filtrosPlanificacionesDocente.fk_aula) {
      Swal.fire(
        "Aula obligatoria",
        "Debes seleccionar un aula válida para registrar la planificación.",
        "warning"
      );
      return;
    }

    const componenteLabel =
      catalogoComponentesMap.get(obtenerClaveComponente(componenteDestino)) ||
      `Componente #${componenteDestino}`;

    const confirmacion = await Swal.fire({
      title: "Crear planificación",
      text: `¿Deseas crear una planificación base para ${componenteLabel}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const payloadBase = {
      fk_personal: filtrosPlanificacionesDocente.fk_personal,
      fk_aula: filtrosPlanificacionesDocente.fk_aula,
      fk_componente: componenteDestino,
      fk_momento: filtrosPlanificacionesDocente.fk_momento,
      tipo: form.tipo,
      estado: "activo",
      reutilizable: "no",
      competencias:
        seleccionCompetenciasPorComponente[
          obtenerClaveComponente(componenteDestino)
        ] ?? [],
      estudiantes: obtenerEstudiantesSeleccionados(),
    };

    try {
      const respuesta = await crearPlanificacionApi(payloadBase);
      if (!respuesta.success) {
        throw new Error(
          respuesta.message ||
            "No fue posible registrar la planificación solicitada."
        );
      }
      Swal.fire(
        "Planificación creada",
        `Se registró la planificación para ${componenteLabel}.`,
        "success"
      );
      cargarPlanificacionesDocente();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message ||
          "No fue posible registrar la planificación solicitada.",
        "error"
      );
    }
  };

  const cargarPlanificacionesDocente = useCallback(async () => {
    if (!puedeConsultarPlanificaciones) {
      setPlanificacionesModalEstado({
        cargando: false,
        registros: [],
        error:
          "Selecciona docente, momento y aula para consultar las planificaciones registradas.",
      });
      return;
    }

    setPlanificacionesModalEstado((prev) => ({
      ...prev,
      cargando: true,
      error: "",
    }));

    try {
      const respuesta = await listarPlanificaciones(
        filtrosPlanificacionesDocente
      );
      if (!respuesta.success) {
        setPlanificacionesModalEstado({
          cargando: false,
          registros: [],
          error:
            respuesta.message ||
            "No fue posible obtener las planificaciones existentes.",
        });
        return;
      }
      const datos = respuesta.data;
      const registros = Array.isArray(datos?.planificaciones)
        ? datos.planificaciones
        : Array.isArray(datos)
        ? datos
        : [];
      setPlanificacionesModalEstado({
        cargando: false,
        registros,
        error: "",
      });
    } catch (error) {
      setPlanificacionesModalEstado({
        cargando: false,
        registros: [],
        error:
          error?.message ||
          "No se pudieron cargar las planificaciones registradas.",
      });
    }
  }, [filtrosPlanificacionesDocente, puedeConsultarPlanificaciones]);

  useEffect(() => {
    if (!planificacionesModalAbierta) {
      return;
    }
    cargarPlanificacionesDocente();
  }, [planificacionesModalAbierta, cargarPlanificacionesDocente]);
  const descripcionAulaAsignada = useMemo(() => {
    if (!asignacionAula) {
      return null;
    }
    const nombrePreferido =
      asignacionAula.nombre ??
      asignacionAula.label ??
      asignacionAula.nombre_aula ??
      asignacionAula.descripcion;
    if (nombrePreferido) {
      return nombrePreferido;
    }

    const gradoTexto = obtenerTextoPlano(
      asignacionAula.grado ??
        asignacionAula.nombre_grado ??
        asignacionAula.grado_nombre,
      ""
    );
    const seccionTexto = obtenerTextoPlano(
      asignacionAula.seccion ??
        asignacionAula.nombre_seccion ??
        asignacionAula.seccion_nombre,
      ""
    );

    const partes = [];
    if (gradoTexto) {
      partes.push(`Grado ${gradoTexto}`);
    }
    if (seccionTexto) {
      partes.push(`Sección ${seccionTexto}`);
    }

    return partes.length ? partes.join(" - ") : null;
  }, [asignacionAula]);

  const resumenComponentesAsignados = useMemo(() => {
    if (!componentesAsignados.length) {
      return [];
    }
    return componentesAsignados
      .map((componente, indice) => {
        const id =
          normalizarEntero(componente?.id ?? componente?.fk_componente) ??
          indice;
        const nombre =
          componente?.nombre ??
          componente?.label ??
          componente?.nombre_componente ??
          componente?.descripcion ??
          null;
        return nombre ? { id: `${id}-${indice}`, nombre } : null;
      })
      .filter(Boolean);
  }, [componentesAsignados]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const aulaId = normalizarEntero(
      asignacionAula?.id_aula ?? asignacionAula?.id
    );
    if (aulaId === null) {
      return;
    }
    setForm((prev) => {
      const actual = normalizarEntero(prev.fk_aula);
      if (actual === aulaId) {
        return prev;
      }
      return {
        ...prev,
        fk_aula: String(aulaId),
      };
    });
  }, [isOpen, asignacionAula]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (!componentesAsignados.length) {
      return;
    }
    setForm((prev) => {
      const actual = normalizarEntero(prev.fk_componente);
      const disponible = componentesAsignados.some(
        (componente) => normalizarEntero(componente?.id) === actual
      );
      if (disponible) {
        return prev;
      }
      const primero = componentesAsignados[0];
      const primerId = normalizarEntero(primero?.id);
      if (primerId === null) {
        return prev;
      }
      return {
        ...prev,
        fk_componente: String(primerId),
      };
    });
  }, [isOpen, componentesAsignados]);

  const opcionesAulas = useMemo(() => {
    const base = Array.isArray(catalogoAulas) ? [...catalogoAulas] : [];

    const aulaAsignadaId = normalizarEntero(
      asignacionAula?.id_aula ?? asignacionAula?.id
    );

    if (aulaAsignadaId === null) {
      return base;
    }

    const yaExiste = base.some(
      (aula) => normalizarEntero(aula?.id) === aulaAsignadaId
    );

    if (yaExiste) {
      return base;
    }

    const etiquetaAsignada = asignacionAula?.nombre
      ? asignacionAula.nombre
      : `Grado ${asignacionAula?.grado ?? "?"} - Seccion ${
          asignacionAula?.seccion ?? "?"
        }`;

    return [
      {
        id: aulaAsignadaId,
        label: etiquetaAsignada,
        raw: asignacionAula ?? null,
      },
      ...base,
    ];
  }, [asignacionAula, catalogoAulas]);

  const opcionesComponentes = useMemo(() => {
    if (componentesAsignados.length) {
      return componentesAsignados.map((componente) => ({
        id: normalizarEntero(componente.id),
        label:
          componente.nombre ??
          componente.label ??
          `Componente #${componente.id}`,
      }));
    }
    return catalogoComponentes;
  }, [componentesAsignados, catalogoComponentes]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    limpiarErrores();
    if (name === "fk_componente") {
      const clave = obtenerClaveComponente(value);
      const seleccion = seleccionCompetenciasPorComponente[clave] ?? [];
      setForm((prev) => ({ ...prev, [name]: value, competencias: seleccion }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectorDocenteDeshabilitado =
    cargandoDocentesAsignacion || catalogoPersonal.length === 0;

  const toggleSelectorDocente = () => {
    if (selectorDocenteDeshabilitado) {
      return;
    }
    setSelectorDocenteAbierto((prev) => !prev);
  };

  const handleSeleccionarDocente = (id) => {
    limpiarErrores();
    setForm((prev) => ({ ...prev, fk_personal: String(id) }));
    setSelectorDocenteAbierto(false);
  };

  const handleToggleCompetencia = (id) => {
    limpiarErrores();
    const componenteId = normalizarEntero(form.fk_componente);
    if (componenteId === null) {
      Swal.fire(
        "Selecciona un componente",
        "Necesitas definir el componente para asociar competencias.",
        "warning"
      );
      return;
    }

    const clave = obtenerClaveComponente(componenteId);
    setSeleccionCompetenciasPorComponente((prev) => {
      const actual = new Set(prev[clave] ?? []);
      if (actual.has(id)) {
        actual.delete(id);
      } else {
        if (actual.size >= MAX_COMPETENCIAS_POR_PLAN) {
          Swal.fire(
            "Aviso",
            `Solo puede asociar hasta ${MAX_COMPETENCIAS_POR_PLAN} competencias por planificación.`,
            "warning"
          );
          return prev;
        }
        actual.add(id);
      }

      const actualizado = Array.from(actual);
      setForm((prevForm) => ({ ...prevForm, competencias: actualizado }));
      return {
        ...prev,
        [clave]: actualizado,
      };
    });
  };

  const handleQuitarCompetenciaPlan = (id, componenteId) => {
    limpiarErrores();
    const clave = obtenerClaveComponente(componenteId);
    setSeleccionCompetenciasPorComponente((prev) => {
      const lista = prev[clave] ?? [];
      const filtrada = lista.filter((valor) => valor !== id);
      if (filtrada.length === lista.length) {
        return prev;
      }
      if (
        clave === obtenerClaveComponente(normalizarEntero(form.fk_componente))
      ) {
        setForm((prevForm) => ({ ...prevForm, competencias: filtrada }));
      }
      return {
        ...prev,
        [clave]: filtrada,
      };
    });
  };

  const manejarResultadoAccion = async (mensajeExito) => {
    await recargarCompetencias({ mostrarAlertas: false });
    if (mensajeExito) {
      Swal.fire("Listo", mensajeExito, "success");
    }
  };

  const handleEditarCompetencia = async (competencia) => {
    const { value: valores } = await Swal.fire({
      title: "Editar competencia",
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600" for="swal-comp-nombre">Nombre</label>
            <input id="swal-comp-nombre" class="swal2-input" value="${sanitizarParaHtmlInput(
              competencia.nombre
            )}" placeholder="Nombre de la competencia" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600" for="swal-comp-descripcion">Descripción</label>
            <textarea id="swal-comp-descripcion" class="swal2-textarea" rows="3" placeholder="Descripción">${sanitizarParaTextarea(
              competencia.descripcion
            )}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const popup = Swal.getPopup();
        const nombre = popup?.querySelector("#swal-comp-nombre")?.value?.trim();
        const descripcion = popup
          ?.querySelector("#swal-comp-descripcion")
          ?.value?.trim();
        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio.");
          return false;
        }
        return { nombre, descripcion };
      },
    });

    if (!valores) {
      return;
    }

    setGestionCompetenciasCargando(true);
    try {
      await actualizarCompetencia(competencia.id, {
        fk_componente: competencia.componenteId ?? form.fk_componente ?? "",
        nombre_competencia: valores.nombre,
        descripcion_competencia: valores.descripcion ?? "",
        reutilizable: competencia.reutilizable ?? "no",
      });
      await manejarResultadoAccion("La competencia fue actualizada.");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "No pudimos actualizar la competencia.",
        "error"
      );
    } finally {
      setGestionCompetenciasCargando(false);
    }
  };

  const handleEliminarCompetenciaCatalogo = async (competencia) => {
    const confirmacion = await Swal.fire({
      title: "Eliminar competencia",
      text: `¿Deseas eliminar "${competencia.nombre}" del catálogo? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setGestionCompetenciasCargando(true);
    try {
      await eliminarCompetencia(competencia.id);
      setForm((prev) => ({
        ...prev,
        competencias: prev.competencias.filter(
          (valor) => valor !== competencia.id
        ),
      }));
      await manejarResultadoAccion("La competencia fue eliminada.");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "No pudimos eliminar la competencia.",
        "error"
      );
    } finally {
      setGestionCompetenciasCargando(false);
    }
  };

  const handleEditarIndicador = async (competencia, indicador) => {
    const { value: valores } = await Swal.fire({
      title: "Editar indicador",
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600" for="swal-ind-nombre">Nombre</label>
            <input id="swal-ind-nombre" class="swal2-input" value="${sanitizarParaHtmlInput(
              indicador.nombre
            )}" placeholder="Nombre del indicador" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-600" for="swal-ind-aspecto">Aspecto</label>
            <input id="swal-ind-aspecto" class="swal2-input" value="${sanitizarParaHtmlInput(
              indicador.aspecto || ""
            )}" placeholder="Aspecto (opcional)" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const popup = Swal.getPopup();
        const nombre = popup?.querySelector("#swal-ind-nombre")?.value?.trim();
        const aspecto = popup
          ?.querySelector("#swal-ind-aspecto")
          ?.value?.trim();
        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio.");
          return false;
        }
        return { nombre, aspecto };
      },
    });

    if (!valores) {
      return;
    }

    setGestionCompetenciasCargando(true);
    try {
      await actualizarIndicador(indicador.id, {
        fk_competencia: competencia.id,
        nombre_indicador: valores.nombre,
        aspecto: valores.aspecto ?? "",
        orden: indicador.orden ?? 0,
        ocultar: indicador.oculto ? "si" : "no",
      });
      await manejarResultadoAccion("El indicador fue actualizado.");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "No pudimos actualizar el indicador.",
        "error"
      );
    } finally {
      setGestionCompetenciasCargando(false);
    }
  };

  const handleEliminarIndicadorCatalogo = async (indicador) => {
    const confirmacion = await Swal.fire({
      title: "Eliminar indicador",
      text: `¿Eliminar "${indicador.nombre}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setGestionCompetenciasCargando(true);
    try {
      await eliminarIndicador(indicador.id);
      await manejarResultadoAccion("El indicador fue eliminado.");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.message || "No pudimos eliminar el indicador.",
        "error"
      );
    } finally {
      setGestionCompetenciasCargando(false);
    }
  };

  const obtenerEstudiantesSeleccionados = useCallback(() => {
    if (form.tipo !== "individual") {
      return [];
    }
    return Array.from(
      new Set(
        estudiantesTexto
          .split(/\n|,|;/)
          .map((valor) => normalizarEntero(valor.trim()))
          .filter((valor) => valor !== null)
      )
    );
  }, [form.tipo, estudiantesTexto]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (bloqueado) {
      Swal.fire("Contexto bloqueado", bloqueado, "warning");
      return;
    }

    const estudiantesSeleccionados = obtenerEstudiantesSeleccionados();

    const payload = {
      fk_personal: normalizarEntero(form.fk_personal),
      fk_aula: normalizarEntero(form.fk_aula),
      fk_componente: normalizarEntero(form.fk_componente),
      fk_momento: normalizarEntero(form.fk_momento),
      tipo: form.tipo,
      estado: form.estado,
      reutilizable: "no",
      competencias: form.competencias,
      estudiantes: estudiantesSeleccionados,
    };

    if (
      !payload.fk_personal ||
      !payload.fk_aula ||
      !payload.fk_componente ||
      !payload.fk_momento
    ) {
      setErrores({
        general: [
          "Debe seleccionar docente, aula, componente y momento antes de guardar.",
        ],
      });
      return;
    }

    const momentoSeleccionado = momentosCatalogoRaw.find(
      (momento) =>
        normalizarEntero(momento.id_momento ?? momento.id) ===
        payload.fk_momento
    );

    if (!momentoSeleccionado) {
      setErrores({
        fk_momento: ["El momento seleccionado no es válido."],
      });
      return;
    }

    if (modo === "crear") {
      const estadoMomento = (
        momentoSeleccionado.estado ??
        momentoSeleccionado.raw?.estado ??
        momentoSeleccionado.raw?.estado_momento ??
        momentoSeleccionado.raw?.momento_estado ??
        ""
      )
        .toString()
        .toLowerCase();
      const fkMomentoAnio = normalizarEntero(
        momentoSeleccionado.fk_anio_escolar ??
          momentoSeleccionado.raw?.fk_anio_escolar ??
          momentoSeleccionado.raw?.fk_anio ??
          momentoSeleccionado.raw?.id_anio_escolar
      );

      const esActivo = estadoMomento === "activo";
      const coincideAnio =
        contextoAnioId === null || fkMomentoAnio === contextoAnioId;

      if (!esActivo || !coincideAnio) {
        setErrores({
          fk_momento: [
            "Debe utilizar el momento activo configurado para el año escolar vigente.",
          ],
        });
        return;
      }
    }

    if (
      payload.tipo === "individual" &&
      (!payload.estudiantes || payload.estudiantes.length === 0)
    ) {
      setErrores({
        estudiantes: ["Debe indicar al menos un identificador de inscripción."],
      });
      return;
    }

    const componentesSeleccionados = Object.entries(
      seleccionCompetenciasPorComponente
    )
      .map(([clave, lista]) => ({
        componenteId: normalizarEntero(clave),
        clave,
        competencias: Array.isArray(lista) ? Array.from(new Set(lista)) : [],
      }))
      .filter(
        (item) => item.componenteId !== null && item.competencias.length > 0
      );

    if (modo === "crear" && componentesSeleccionados.length === 0) {
      setErrores({
        competencias: [
          "Debes seleccionar competencias para al menos un componente.",
        ],
      });
      return;
    }

    const componenteActualId = normalizarEntero(form.fk_componente);
    const claveActual = obtenerClaveComponente(componenteActualId);
    const seleccionActual =
      seleccionCompetenciasPorComponente[claveActual] ?? [];

    const listaValidaciones =
      modo === "crear"
        ? componentesSeleccionados
        : [
            {
              componenteId: componenteActualId,
              competencias: Array.from(new Set(seleccionActual)),
            },
          ];

    const exceso = listaValidaciones.find(
      (item) => item.competencias.length > MAX_COMPETENCIAS_POR_PLAN
    );
    if (exceso) {
      const etiqueta =
        catalogoComponentesMap.get(
          obtenerClaveComponente(exceso.componenteId)
        ) ||
        (exceso.componenteId
          ? `Componente #${exceso.componenteId}`
          : "Componente");
      setErrores({
        competencias: [
          `El ${etiqueta} excede el máximo de ${MAX_COMPETENCIAS_POR_PLAN} competencias por planificación.`,
        ],
      });
      return;
    }

    const payloads =
      modo === "crear"
        ? componentesSeleccionados.map((item) => ({
            ...payload,
            fk_componente: item.componenteId,
            competencias: item.competencias,
          }))
        : [
            {
              ...payload,
              fk_componente: componenteActualId,
              competencias: Array.from(new Set(seleccionActual)),
            },
          ];

    if (payloads.length === 0) {
      setErrores({
        competencias: ["No se detectaron componentes válidos para registrar."],
      });
      return;
    }

    try {
      await onSubmit(payloads.length === 1 ? payloads[0] : payloads);
      limpiarErrores();
      if (modo === "crear") {
        prepararEstadoInicial();
        setSeleccionCompetenciasPorComponente({});
        setCatalogoCompetenciasPorComponente({});
      }
    } catch (error) {
      const validation = error?.validation ?? error?.errors;
      if (validation) {
        setErrores(validation);
      } else if (error?.message) {
        setErrores({ general: [error.message] });
      } else {
        setErrores({ general: ["No fue posible completar la operación."] });
      }
    }
  };

  const mensajeErrores = useMemo(() => {
    const lista = [];
    const etiquetas = {
      general: "Aviso",
      fk_momento: "Momento",
      fk_personal: "Docente",
      fk_aula: "Aula",
      fk_componente: "Componente",
      estudiantes: "Estudiantes",
      competencias: "Competencias",
    };
    Object.entries(errores).forEach(([campo, mensajes]) => {
      (Array.isArray(mensajes) ? mensajes : [mensajes]).forEach((mensaje) => {
        const campoLabel = etiquetas[campo] ?? campo;
        lista.push(`${campoLabel}: ${mensaje}`);
      });
    });
    return lista;
  }, [errores]);

  const deshabilitarSubmit =
    Boolean(bloqueado) || (modo === "crear" && catalogoMomentos.length === 0);

  const accionesCompetenciaDeshabilitadas =
    gestionCompetenciasCargando || cargandoCompetencias;

  return (
    <React.Fragment>
      <VentanaModal
        isOpen={isOpen}
        onClose={onClose}
        title={titulo}
        size="lg"
        bodyClassName="space-y-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <PanelContextoActual
            contexto={contexto}
            modo={modo}
            bloqueado={bloqueado}
            cargandoAsignacion={cargandoAsignacion}
            asignacion={asignacion}
            descripcionAulaAsignada={descripcionAulaAsignada}
            resumenComponentesAsignados={resumenComponentesAsignados}
          />

          <div className={contenidosFormClasses.group}>
            <label className={contenidosFormClasses.label} htmlFor="fk_momento">
              Momento académico*
            </label>
            <select
              id="fk_momento"
              name="fk_momento"
              value={form.fk_momento}
              onChange={handleChange}
              className={contenidosFormClasses.select}
              disabled={modo !== "crear" || catalogoMomentos.length <= 1}
              required
            >
              <option value="">Selecciona un momento</option>
              {catalogoMomentos.map((momento) => (
                <option key={momento.id} value={momento.id}>
                  {momento.label}
                </option>
              ))}
            </select>
            {modo === "crear" && (
              <p className={contenidosFormClasses.helper}>
                El momento activo se asigna automáticamente según el año escolar
                vigente.
              </p>
            )}
            {modo === "crear" && catalogoMomentos.length === 0 && (
              <p className="text-xs font-semibold text-rose-500">
                No hay un momento activo disponible para el año escolar vigente.
              </p>
            )}
          </div>

          <div className={contenidosFormClasses.group}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="fk_personal"
            >
              Docente*
            </label>
            <SelectorDocenteInteractivo
              form={form}
              docenteSeleccionado={docenteSeleccionado}
              rolePillBaseClass={rolePillBaseClass}
              selectorDocenteAbierto={selectorDocenteAbierto}
              selectorDocenteDeshabilitado={selectorDocenteDeshabilitado}
              alAlternarSelector={toggleSelectorDocente}
              docenteFiltro={docenteFiltro}
              alFiltrarDocente={setDocenteFiltro}
              catalogoPersonal={catalogoPersonal}
              catalogoPersonalFiltrado={catalogoPersonalFiltrado}
              alSeleccionarDocente={handleSeleccionarDocente}
              selectorDocenteRef={selectorDocenteRef}
              cargandoDocentesAsignacion={cargandoDocentesAsignacion}
              mensajeSinDocentes="No hay docentes con aula o componentes asignados para el momento seleccionado."
            />
            {cargandoDocentesAsignacion && (
              <p className={contenidosFormClasses.helper}>
                Buscando docentes con asignaciones activas...
              </p>
            )}
            {!cargandoDocentesAsignacion && catalogoPersonal.length === 0 && (
              <p className="text-xs font-semibold text-rose-500">
                No hay docentes con aula o componentes asignados para el momento
                seleccionado.
              </p>
            )}
          </div>

          <div className={contenidosFormClasses.group}>
            <label className={contenidosFormClasses.label} htmlFor="fk_aula">
              Aula*
            </label>
            <select
              id="fk_aula"
              name="fk_aula"
              value={form.fk_aula}
              onChange={handleChange}
              className={contenidosFormClasses.select}
              required
              disabled={opcionesAulas.length === 1}
            >
              <option value="">Selecciona un aula</option>
              {opcionesAulas.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {aula.label}
                </option>
              ))}
            </select>
          </div>

          <div className={contenidosFormClasses.group}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="fk_componente"
            >
              Componente de aprendizaje*
            </label>
            <select
              id="fk_componente"
              name="fk_componente"
              value={form.fk_componente}
              onChange={handleChange}
              className={contenidosFormClasses.select}
              required
              disabled={opcionesComponentes.length === 1}
            >
              <option value="">Selecciona un componente</option>
              {opcionesComponentes.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.label}
                </option>
              ))}
            </select>
          </div>

          <div className={contenidosFormClasses.group}>
            <label className={contenidosFormClasses.label} htmlFor="tipo">
              Tipo de planificación*
            </label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className={contenidosFormClasses.select}
            >
              <option value="aula">Aula completa</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          <SeccionCompetencias
            competenciasDisponibles={competenciasDisponibles}
            cargandoCompetencias={cargandoCompetencias}
            competenciasSeleccionadas={form.competencias}
            competenciasSeleccionadasPorComponente={
              competenciasSeleccionadasPorComponente
            }
            totalCompetenciasSeleccionadas={totalCompetenciasSeleccionadas}
            gestionCompetenciasCargando={gestionCompetenciasCargando}
            competenciaItemBase={competenciaItemBase}
            competenciaItemActivo={competenciaItemActivo}
            competenciaCardClase={competenciaCardClase}
            indicadorRowClase={indicadorRowClase}
            puedeConsultarPlanificaciones={puedeConsultarPlanificaciones}
            alAbrirModalPlanificaciones={handleAbrirModalPlanificaciones}
            alAlternarCompetencia={handleToggleCompetencia}
            alEditarCompetencia={handleEditarCompetencia}
            alEliminarCompetencia={handleEliminarCompetenciaCatalogo}
            alRetirarCompetencia={handleQuitarCompetenciaPlan}
            alEditarIndicador={handleEditarIndicador}
            alEliminarIndicador={handleEliminarIndicadorCatalogo}
            accionesCompetenciaDeshabilitadas={
              accionesCompetenciaDeshabilitadas
            }
            competenciaMetaPillClass={competenciaMetaPillClass}
          />

          {form.tipo === "individual" && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Inscripciones individuales
              </h3>
              <p className={contenidosFormClasses.helper}>
                Indique los identificadores de inscripción (uno por línea).
                Asegúrese de que los estudiantes pertenecen al aula
                seleccionada.
              </p>
              <textarea
                id="planificacion_estudiantes"
                value={estudiantesTexto}
                onChange={(event) => {
                  limpiarErrores();
                  setEstudiantesTexto(event.target.value);
                }}
                className={`${contenidosFormClasses.textArea} h-32`}
                placeholder={`Ej. 120\n124\n170`}
              />
            </section>
          )}

          {mensajeErrores.length > 0 && (
            <div
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600"
              role="alert"
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Revisar antes de guardar
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {mensajeErrores.map((mensaje, indice) => (
                  <li key={indice}>{mensaje}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={contenidosFormClasses.actions}>
            <button
              type="button"
              onClick={onClose}
              className={contenidosFormClasses.secondaryButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={contenidosFormClasses.primaryButton}
              disabled={deshabilitarSubmit}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </VentanaModal>

      <ModalPlanificacionesDocente
        abierta={planificacionesModalAbierta}
        alCerrar={handleCerrarModalPlanificaciones}
        docenteSeleccionado={docenteSeleccionado}
        momentoSeleccionadoLabel={momentoSeleccionadoLabel}
        estadoModal={planificacionesModalEstado}
        puedeConsultarPlanificaciones={puedeConsultarPlanificaciones}
        alRefrescar={cargarPlanificacionesDocente}
        planificacionesAgrupadas={planificacionesAgrupadas}
        alAgregarPlanificacion={handleAgregarPlanificacionModal}
        alModificarPlanificacion={handleModificarPlanificacionModal}
        alEliminarPlanificacion={handleEliminarPlanificacionModal}
      />
    </React.Fragment>
  );
};
