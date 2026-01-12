import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";
const CONTENIDOS_URL = `${BASE_URL}/contenidos`;
const COMPONENTES_SELECT_URL = `${BASE_URL}/componentes_aprendizaje/listar-select`;
const TEMAS_POR_CONTENIDO_URL = (idContenido) =>
  `${BASE_URL}/temas/contenido/${idContenido}`;

export const solicitarContenidos = async ({
  setContenidos,
  setIsLoading,
  Swal,
}) => {
  try {
    setIsLoading?.(true);

    const { data } = await axios.get(CONTENIDOS_URL, {
      withCredentials: true,
    });

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudieron cargar los contenidos."
    );

    if (compat.success) {
      const registros = Array.isArray(compat.data) ? compat.data : [];
      setContenidos(registros);
      return registros;
    }

    Swal.fire("Error", compat.message, "error");
    setContenidos([]);
    return [];
  } catch (error) {
    console.error("Error al obtener contenidos:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar los contenidos."
    );
    Swal.fire("Error", compat.message, "error");
    setContenidos([]);
    return [];
  } finally {
    setIsLoading?.(false);
  }
};

export const solicitarComponentesSelect = async ({ setComponentes, Swal }) => {
  try {
    const { data } = await axios.get(COMPONENTES_SELECT_URL, {
      withCredentials: true,
    });

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudieron cargar los componentes disponibles."
    );

    if (compat.success) {
      const registros = Array.isArray(compat.data) ? compat.data : [];
      setComponentes(registros);
      return registros;
    }

    Swal.fire("Aviso", compat.message, "warning");
    setComponentes([]);
    return [];
  } catch (error) {
    console.error("Error al obtener componentes para contenido:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar los componentes disponibles."
    );
    Swal.fire("Error", compat.message, "error");
    setComponentes([]);
    return [];
  }
};

export const solicitarTemasPorContenido = async (idContenido, Swal) => {
  try {
    const { data } = await axios.get(TEMAS_POR_CONTENIDO_URL(idContenido), {
      withCredentials: true,
    });

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudieron cargar los temas."
    );

    if (compat.success) {
      return Array.isArray(compat.data) ? compat.data : [];
    }

    Swal.fire("Aviso", compat.message, "warning");
    return [];
  } catch (error) {
    console.error("Error al obtener temas por contenido:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudieron cargar los temas asociados."
    );
    Swal.fire("Error", compat.message, "error");
    return [];
  }
};

export const eliminarContenido = async ({ idContenido, recargar, Swal }) => {
  const resultado = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará el contenido y sus relaciones.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!resultado.isConfirmed) {
    return false;
  }

  try {
    const { data } = await axios.delete(`${CONTENIDOS_URL}/${idContenido}`, {
      withCredentials: true,
    });

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo eliminar el contenido."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message || "Contenido eliminado.", "success");
      recargar?.();
      return true;
    }

    Swal.fire("Aviso", compat.message, "warning");
    return false;
  } catch (error) {
    console.error("Error al eliminar contenido:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo eliminar el contenido seleccionado."
    );
    Swal.fire("Error", compat.message, "error");
    return false;
  }
};

export const enviarContenido = async ({
  datos,
  contenidoActual,
  cerrarModal,
  recargar,
  Swal,
}) => {
  const payload = {
    ...datos,
    nombre_contenido: datos.nombre_contenido?.trim().replace(/\s+/g, " ") ?? "",
    fk_componente: datos.fk_componente ? Number(datos.fk_componente) : null,
    descripcion: datos.descripcion?.trim().replace(/\s+/g, " ") ?? "",
  };

  const metodo = contenidoActual ? "put" : "post";
  const url = contenidoActual
    ? `${CONTENIDOS_URL}/${contenidoActual.id_contenido}`
    : CONTENIDOS_URL;

  try {
    console.log("[Contenidos] Payload enviado:", payload);

    const response = await axios({
      method: metodo,
      url,
      data: payload,
      withCredentials: true,
    });

    console.log("[Contenidos] Respuesta completa (guardar):", response);

    const { data } = response;

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo guardar el contenido."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message, "success");
      recargar?.();
      cerrarModal();
      return compat.data;
    }

    console.warn("[Contenidos] Respuesta sin éxito (guardar):", compat.raw);

    if (compat.errors) {
      const detalle = Object.entries(compat.errors)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      Swal.fire("Aviso", compat.message, "warning");
    }
    return null;
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    if (error.response) {
      console.error("[Contenidos] Respuesta de error:", error.response);
    }
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo guardar la información del contenido."
    );

    if (compat.errors) {
      const detalle = Object.entries(compat.errors)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      Swal.fire("Error", compat.message, "error");
    }

    return null;
  }
};

export const cambioEstadoContenido = async ({ idContenido, estado, Swal }) => {
  try {
    const { data } = await axios.patch(
      `${CONTENIDOS_URL}/${idContenido}/estado`,
      estado ? { estado } : {},
      { withCredentials: true }
    );

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo cambiar el estado del contenido."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message, "success");
      return compat.data;
    }

    Swal.fire("Aviso", compat.message, "warning");
    return null;
  } catch (error) {
    console.error("Error al cambiar estado del contenido:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo cambiar el estado del contenido seleccionado."
    );

    if (compat.errors) {
      const detalle = Object.entries(compat.errors)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      Swal.fire("Error", compat.message, "error");
    }

    return null;
  }
};
