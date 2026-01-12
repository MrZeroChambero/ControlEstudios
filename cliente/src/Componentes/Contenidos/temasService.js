import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const API_URL = "http://localhost:8080/controlestudios/servidor/temas";

const normalizarNombreTema = (valor) =>
  valor?.trim().replace(/\s+/g, " ") ?? "";

const mostrarErrores = (Swal, compat) => {
  if (!compat?.errors) {
    return false;
  }

  const detalle = Object.entries(compat.errors)
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

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo registrar el tema."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message, "success");
      return compat.data;
    }

    if (!mostrarErrores(Swal, compat)) {
      Swal.fire("Aviso", compat.message, "warning");
    }

    throw new Error(compat.message || "No se pudo registrar el tema.");
  } catch (error) {
    console.error("Error al crear tema:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo registrar la información del tema."
    );

    if (mostrarErrores(Swal, compat)) {
      throw error;
    }

    Swal.fire("Error", compat.message, "error");
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

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo actualizar el tema."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message, "success");
      return compat.data;
    }

    if (!mostrarErrores(Swal, compat)) {
      Swal.fire("Aviso", compat.message, "warning");
    }

    throw new Error(compat.message || "No se pudo actualizar el tema.");
  } catch (error) {
    console.error("Error al actualizar tema:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo actualizar la información del tema."
    );

    if (mostrarErrores(Swal, compat)) {
      throw error;
    }

    Swal.fire("Error", compat.message, "error");
    throw error;
  }
};

export const eliminarTema = async (idTema, Swal) => {
  try {
    const { data } = await axios.delete(`${API_URL}/${idTema}`, {
      withCredentials: true,
    });

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo eliminar el tema."
    );

    if (compat.success) {
      return compat.data;
    }

    if (!mostrarErrores(Swal, compat)) {
      Swal.fire("Aviso", compat.message, "warning");
    }

    throw new Error(compat.message || "No se pudo eliminar el tema.");
  } catch (error) {
    console.error("Error al eliminar tema:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo eliminar el tema seleccionado."
    );

    if (mostrarErrores(Swal, compat)) {
      throw error;
    }

    Swal.fire("Error", compat.message, "error");
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

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(data),
      "No se pudo cambiar el estado del tema."
    );

    if (compat.success) {
      Swal.fire("Hecho", compat.message, "success");
      return compat.data;
    }

    if (!mostrarErrores(Swal, compat)) {
      Swal.fire("Aviso", compat.message, "warning");
    }

    throw new Error(compat.message || "No se pudo cambiar el estado del tema.");
  } catch (error) {
    console.error("Error al cambiar estado del tema:", error);
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo cambiar el estado del tema."
    );

    if (mostrarErrores(Swal, compat)) {
      throw error;
    }

    Swal.fire("Error", compat.message, "error");
    throw error;
  }
};
