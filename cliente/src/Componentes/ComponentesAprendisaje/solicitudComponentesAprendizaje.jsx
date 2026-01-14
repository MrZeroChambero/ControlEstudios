import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const API_URL =
  "http://localhost:8080/controlestudios/servidor/componentes_aprendizaje";

const tipoLabels = {
  aula: "Docente de aula",
  especialista: "Docente especialista",
  cultura: "Docente de cultura",
};

const toBoolean = (valor) => {
  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "number") {
    return valor > 0;
  }

  if (typeof valor === "string") {
    const limpio = valor.trim().toLowerCase();
    if (
      limpio === "" ||
      limpio === "0" ||
      limpio === "no" ||
      limpio === "false"
    ) {
      return false;
    }
    return ["1", "si", "sí", "true"].includes(limpio);
  }

  return Boolean(valor);
};

const normalizarTipoDocenteCodigo = (valor) => {
  if (!valor) {
    return null;
  }

  const texto = String(valor).toLowerCase();

  if (texto.includes("cultur")) {
    return "cultura";
  }

  if (texto.includes("especial")) {
    return "especialista";
  }

  if (texto.includes("aula")) {
    return "aula";
  }

  return null;
};

const mapearComponente = (item) => {
  const codigoDesdeApi = item?.tipo_docente;
  const derivado = normalizarTipoDocenteCodigo(item?.especialista);
  const codigo =
    codigoDesdeApi ||
    derivado ||
    (item?.requiere_especialista ? "especialista" : "aula");
  const etiqueta = item?.especialista || tipoLabels[codigo] || tipoLabels.aula;
  const esCultura = item?.es_cultura ?? codigo === "cultura";
  const esDocenteAula = item?.es_docente_aula ?? codigo === "aula";
  const requiereEspecialista =
    item?.requiere_especialista ??
    (codigo === "especialista" || codigo === "cultura");

  return {
    ...item,
    especialista: etiqueta,
    tipo_docente: codigo,
    es_cultura: toBoolean(esCultura),
    es_docente_aula: toBoolean(esDocenteAula),
    requiere_especialista: toBoolean(requiereEspecialista),
  };
};

export const solicitudComponentesAprendizaje = async ({
  setIsLoading,
  setComponentes,
  Swal,
}) => {
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      "No se pudieron cargar los componentes de aprendizaje."
    );

    if (compat.success) {
      const datos = Array.isArray(compat.data) ? compat.data : [];
      setComponentes(datos.map(mapearComponente));
    } else {
      Swal.fire("Error", compat.message, "error");
      setComponentes([]);
    }
  } catch (error) {
    console.error("Error al obtener componentes de aprendizaje:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar los componentes de aprendizaje."
    );
    Swal.fire("Error", compat.message, "error");
    setComponentes([]);
  } finally {
    setIsLoading(false);
  }
};
