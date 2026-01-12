import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../utilidades/respuestaBackend";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";

const ENDPOINTS = {
  personal: `${BASE_URL}/personal`,
  aulas: `${BASE_URL}/aulas`,
  componentes: `${BASE_URL}/componentes_aprendizaje/listar-select`,
  momentos: `${BASE_URL}/momentos_academicos`,
};

const withCredentials = { withCredentials: true };

const adaptArray = (payload, fallback) => {
  const compat = normalizarRespuesta(asegurarCompatibilidad(payload), fallback);
  if (compat.success) {
    const registros = compat.data ?? [];
    return Array.isArray(registros) ? registros : [];
  }
  throw new Error(compat.message || fallback);
};

const construirNombrePersona = (registro = {}) => {
  const partes = [
    registro.primer_nombre,
    registro.segundo_nombre,
    registro.primer_apellido,
    registro.segundo_apellido,
  ]
    .map((parte) => (typeof parte === "string" ? parte.trim() : ""))
    .filter((parte) => parte);
  return partes.join(" ");
};

const mapearPersonal = (registros = []) =>
  registros
    .map((registro) => {
      const id = registro.id_personal ?? registro.id ?? registro.value;
      if (!id) return null;
      const label = construirNombrePersona(registro) || `Docente #${id}`;
      const descripcion =
        registro.nombre_funcion ||
        registro.funcion ||
        registro.nombre_cargo ||
        registro.tipo_funcion ||
        "";
      return { id: Number(id), label, descripcion, raw: registro };
    })
    .filter(Boolean);

const mapearAulas = (registros = []) =>
  registros
    .map((registro) => {
      const id = registro.id_aula ?? registro.id ?? registro.value;
      if (!id) return null;
      const grado = registro.grado ?? registro.grado_aula;
      const seccion = registro.seccion ?? registro.seccion_aula;
      const gradoTexto = grado ? `Grado ${grado}` : null;
      const seccionTexto = seccion ? `Seccion ${seccion}` : null;
      const label =
        registro.nombre ||
        (grado || seccion
          ? `${gradoTexto ?? "Grado ?"} - ${seccionTexto ?? "Seccion ?"}`
          : `Aula #${id}`);
      return {
        id: Number(id),
        label,
        grado,
        seccion,
        estado: registro.estado ?? registro.estado_aula,
        raw: registro,
      };
    })
    .filter(Boolean);

const mapearComponentes = (registros = []) =>
  registros
    .map((registro) => {
      const id = registro.id_componente ?? registro.id ?? registro.value;
      if (!id) return null;
      const nombre =
        registro.nombre_componente ||
        registro.nombre ||
        registro.label ||
        `Componente #${id}`;
      return { id: Number(id), label: nombre, raw: registro };
    })
    .filter(Boolean);

const mapearMomentos = (registros = []) =>
  registros
    .map((registro) => {
      const id =
        registro.id_momento ??
        registro.id ??
        registro.value ??
        registro.momento_id;
      if (!id) return null;
      const nombre =
        registro.nombre ||
        registro.nombre_momento ||
        registro.momento_nombre ||
        `Momento #${id}`;
      const fechaInicio = registro.fecha_inicio ?? registro.inicio;
      const fechaFin =
        registro.fecha_fin ?? registro.fin ?? registro.fecha_final;
      const rango =
        fechaInicio && fechaFin ? `${fechaInicio} al ${fechaFin}` : null;
      return {
        id: Number(id),
        label: nombre,
        rango,
        estado:
          registro.estado ?? registro.estado_momento ?? registro.momento_estado,
        raw: registro,
      };
    })
    .filter(Boolean);

const fetchPersonal = async () => {
  const { data } = await axios.get(ENDPOINTS.personal, withCredentials);
  return mapearPersonal(
    adaptArray(data, "No se pudo cargar el personal disponible.")
  );
};

const fetchAulas = async () => {
  const { data } = await axios.get(ENDPOINTS.aulas, withCredentials);
  return mapearAulas(adaptArray(data, "No se pudo cargar la lista de aulas."));
};

const fetchComponentes = async () => {
  const { data } = await axios.get(ENDPOINTS.componentes, withCredentials);
  return mapearComponentes(
    adaptArray(data, "No se pudo cargar la lista de componentes.")
  );
};

const fetchMomentos = async () => {
  const { data } = await axios.get(ENDPOINTS.momentos, withCredentials);
  return mapearMomentos(
    adaptArray(data, "No se pudo cargar los momentos académicos.")
  );
};

export const obtenerCatalogosPlanificacion = async () => {
  const catalogos = {
    personal: [],
    aulas: [],
    componentes: [],
    momentos: [],
  };
  const errores = [];

  const fuentes = [
    { clave: "personal", fetcher: fetchPersonal, etiqueta: "personal" },
    { clave: "aulas", fetcher: fetchAulas, etiqueta: "aulas" },
    {
      clave: "componentes",
      fetcher: fetchComponentes,
      etiqueta: "componentes",
    },
    { clave: "momentos", fetcher: fetchMomentos, etiqueta: "momentos" },
  ];

  const resultados = await Promise.allSettled(
    fuentes.map((fuente) => fuente.fetcher())
  );

  resultados.forEach((resultado, indice) => {
    const { clave, etiqueta } = fuentes[indice];
    if (resultado.status === "fulfilled") {
      catalogos[clave] = resultado.value;
    } else {
      errores.push(
        `No se pudo cargar ${etiqueta}. ${
          resultado.reason?.message || ""
        }`.trim()
      );
    }
  });

  return { data: catalogos, errores };
};
