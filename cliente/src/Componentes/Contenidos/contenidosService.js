import axios from "axios";

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

    if (data?.exito === true) {
      const registros = Array.isArray(data.datos) ? data.datos : [];
      setContenidos(registros);
      return registros;
    }

    const mensaje = data?.mensaje || "No se pudieron cargar los contenidos.";
    Swal.fire("Error", mensaje, "error");
    setContenidos([]);
    return [];
  } catch (error) {
    console.error("Error al obtener contenidos:", error);
    const mensaje =
      error.response?.data?.mensaje || "No se pudieron cargar los contenidos.";
    Swal.fire("Error", mensaje, "error");
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

    if (data?.exito === true) {
      const registros = Array.isArray(data.datos) ? data.datos : [];
      setComponentes(registros);
      return registros;
    }

    const mensaje =
      data?.mensaje || "No se pudieron cargar los componentes disponibles.";
    Swal.fire("Aviso", mensaje, "warning");
    setComponentes([]);
    return [];
  } catch (error) {
    console.error("Error al obtener componentes para contenido:", error);
    const mensaje =
      error.response?.data?.mensaje ||
      "No se pudieron cargar los componentes disponibles.";
    Swal.fire("Error", mensaje, "error");
    setComponentes([]);
    return [];
  }
};

export const solicitarTemasPorContenido = async (idContenido, Swal) => {
  try {
    const { data } = await axios.get(TEMAS_POR_CONTENIDO_URL(idContenido), {
      withCredentials: true,
    });

    if (data?.exito === true) {
      return Array.isArray(data.datos) ? data.datos : [];
    }

    const mensaje = data?.mensaje || "No se pudieron cargar los temas.";
    Swal.fire("Aviso", mensaje, "warning");
    return [];
  } catch (error) {
    console.error("Error al obtener temas por contenido:", error);
    const mensaje =
      error.response?.data?.mensaje ||
      "No se pudieron cargar los temas asociados.";
    Swal.fire("Error", mensaje, "error");
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

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje || "Contenido eliminado.", "success");
      recargar?.();
      return true;
    }

    const mensaje = data?.mensaje || "No se pudo eliminar el contenido.";
    Swal.fire("Aviso", mensaje, "warning");
    return false;
  } catch (error) {
    console.error("Error al eliminar contenido:", error);
    const mensaje =
      error.response?.data?.mensaje ||
      "No se pudo eliminar el contenido seleccionado.";
    Swal.fire("Error", mensaje, "error");
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

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje, "success");
      recargar?.();
      cerrarModal();
      return data.datos;
    }

    console.warn("[Contenidos] Respuesta sin éxito (guardar):", data);

    const mensaje = data?.mensaje || "No se pudo guardar el contenido.";
    if (data?.errores) {
      const detalle = Object.entries(data.errores)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      Swal.fire("Aviso", mensaje, "warning");
    }
    return null;
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    if (error.response) {
      console.error("[Contenidos] Respuesta de error:", error.response);
    }
    const respuesta = error.response?.data;

    if (respuesta?.errores) {
      const detalle = Object.entries(respuesta.errores)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      const mensaje =
        respuesta?.mensaje ||
        "No se pudo guardar la información del contenido.";
      Swal.fire("Error", mensaje, "error");
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

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje, "success");
      return data.datos;
    }

    const mensaje =
      data?.mensaje || "No se pudo cambiar el estado del contenido.";
    Swal.fire("Aviso", mensaje, "warning");
    return null;
  } catch (error) {
    console.error("Error al cambiar estado del contenido:", error);
    const respuesta = error.response?.data;

    if (respuesta?.errores) {
      const detalle = Object.entries(respuesta.errores)
        .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
        .join("\n");
      Swal.fire("Errores de validación", detalle, "error");
    } else {
      const mensaje =
        respuesta?.mensaje ||
        "No se pudo cambiar el estado del contenido seleccionado.";
      Swal.fire("Error", mensaje, "error");
    }

    return null;
  }
};
