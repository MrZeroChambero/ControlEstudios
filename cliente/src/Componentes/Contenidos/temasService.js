import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/temas";

const normalizarNombreTema = (valor) =>
  valor?.trim().replace(/\s+/g, " ") ?? "";

const mostrarErrores = (Swal, respuesta) => {
  if (!respuesta?.errores) {
    return false;
  }

  const detalle = Object.entries(respuesta.errores)
    .map(([campo, errores]) => `${campo}: ${[].concat(errores).join(", ")}`)
    .join("\n");

  Swal.fire("Errores de validación", detalle, "error");
  return true;
};

export const crearTema = async (datos, Swal) => {
  if (!datos?.fk_contenido) {
    Swal.fire(
      "Error de validación",
      "Debe seleccionar un contenido válido para registrar el tema.",
      "error"
    );
    throw new Error("fk_contenido es obligatorio");
  }

  const payload = {
    ...datos,
    nombre_tema: normalizarNombreTema(datos.nombre_tema),
  };

  try {
    const { data } = await axios.post(API_URL, payload, {
      withCredentials: true,
    });

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje, "success");
      return data.datos;
    }

    if (!mostrarErrores(Swal, data)) {
      const mensaje = data?.mensaje || "No se pudo registrar el tema.";
      Swal.fire("Aviso", mensaje, "warning");
    }

    throw new Error(data?.mensaje || "No se pudo registrar el tema.");
  } catch (error) {
    console.error("Error al crear tema:", error);
    const respuesta = error.response?.data;

    if (mostrarErrores(Swal, respuesta)) {
      throw error;
    }

    const mensaje =
      respuesta?.mensaje || "No se pudo registrar la información del tema.";
    Swal.fire("Error", mensaje, "error");
    throw error;
  }
};

export const actualizarTema = async (idTema, datos, Swal) => {
  if (!datos?.fk_contenido) {
    Swal.fire(
      "Error de validación",
      "Debe seleccionar un contenido válido para actualizar el tema.",
      "error"
    );
    throw new Error("fk_contenido es obligatorio");
  }

  const payload = {
    ...datos,
    nombre_tema: normalizarNombreTema(datos.nombre_tema),
  };

  try {
    const { data } = await axios.put(`${API_URL}/${idTema}`, payload, {
      withCredentials: true,
    });

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje, "success");
      return data.datos;
    }

    if (!mostrarErrores(Swal, data)) {
      const mensaje = data?.mensaje || "No se pudo actualizar el tema.";
      Swal.fire("Aviso", mensaje, "warning");
    }

    throw new Error(data?.mensaje || "No se pudo actualizar el tema.");
  } catch (error) {
    console.error("Error al actualizar tema:", error);
    const respuesta = error.response?.data;

    if (mostrarErrores(Swal, respuesta)) {
      throw error;
    }

    const mensaje =
      respuesta?.mensaje || "No se pudo actualizar la información del tema.";
    Swal.fire("Error", mensaje, "error");
    throw error;
  }
};

export const eliminarTema = async (idTema, Swal) => {
  try {
    const { data } = await axios.delete(`${API_URL}/${idTema}`, {
      withCredentials: true,
    });

    if (data?.exito === true) {
      return data.datos;
    }

    if (!mostrarErrores(Swal, data)) {
      const mensaje = data?.mensaje || "No se pudo eliminar el tema.";
      Swal.fire("Aviso", mensaje, "warning");
    }

    throw new Error(data?.mensaje || "No se pudo eliminar el tema.");
  } catch (error) {
    console.error("Error al eliminar tema:", error);
    const respuesta = error.response?.data;

    if (mostrarErrores(Swal, respuesta)) {
      throw error;
    }

    const mensaje =
      respuesta?.mensaje || "No se pudo eliminar el tema seleccionado.";
    Swal.fire("Error", mensaje, "error");
    throw error;
  }
};

export const cambioEstadoTema = async (idTema, Swal) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/${idTema}/estado`,
      {},
      { withCredentials: true }
    );

    if (data?.exito === true) {
      Swal.fire("Hecho", data.mensaje, "success");
      return data.datos;
    }

    if (!mostrarErrores(Swal, data)) {
      const mensaje = data?.mensaje || "No se pudo cambiar el estado del tema.";
      Swal.fire("Aviso", mensaje, "warning");
    }

    throw new Error(data?.mensaje || "No se pudo cambiar el estado del tema.");
  } catch (error) {
    console.error("Error al cambiar estado del tema:", error);
    const respuesta = error.response?.data;

    if (mostrarErrores(Swal, respuesta)) {
      throw error;
    }

    const mensaje =
      respuesta?.mensaje || "No se pudo cambiar el estado del tema.";
    Swal.fire("Error", mensaje, "error");
    throw error;
  }
};
