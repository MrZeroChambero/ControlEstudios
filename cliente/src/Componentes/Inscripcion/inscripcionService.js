import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_INSCRIPCIONES = `${API_BASE}/inscripciones`;

const showError = (Swal, error, mensajeDefecto) => {
  const errorData = error?.response?.data;
  if (errorData?.errors) {
    const errores = Object.entries(errorData.errors).map(([campo, detalle]) => {
      const valor = Array.isArray(detalle) ? detalle.join(", ") : detalle;
      return `${campo}: ${valor}`;
    });
    Swal?.fire("Error de validación", errores.join("\n"), "error");
  } else {
    Swal?.fire("Error", errorData?.message || mensajeDefecto, "error");
  }
};

export const verificarPrecondicionesInscripcion = async (Swal) => {
  try {
    const respuesta = await axios.get(`${API_INSCRIPCIONES}/precondiciones`, {
      withCredentials: true,
    });
    if (respuesta.data?.back === true) {
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      Swal,
      error,
      "No se pudieron verificar las precondiciones de inscripción."
    );
    return null;
  }
};

export const listarEstudiantesElegibles = async (Swal) => {
  try {
    const respuesta = await axios.get(`${API_INSCRIPCIONES}/estudiantes`, {
      withCredentials: true,
    });
    if (respuesta.data?.back === true) {
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar los estudiantes elegibles.");
    return null;
  }
};

export const listarAulasDisponibles = async (Swal) => {
  try {
    const respuesta = await axios.get(
      `${API_INSCRIPCIONES}/aulas-disponibles`,
      {
        withCredentials: true,
      }
    );
    if (respuesta.data?.back === true) {
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      Swal,
      error,
      "No se pudieron cargar los grados y secciones disponibles."
    );
    return null;
  }
};

export const listarRepresentantesPorEstudiante = async (estudianteId, Swal) => {
  try {
    const respuesta = await axios.get(
      `${API_INSCRIPCIONES}/estudiantes/${estudianteId}/representantes`,
      {
        withCredentials: true,
      }
    );
    if (respuesta.data?.back === true) {
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(
      Swal,
      error,
      "No se pudieron cargar los representantes asociados."
    );
    return null;
  }
};

export const registrarInscripcion = async (payload, Swal) => {
  try {
    const respuesta = await axios.post(`${API_INSCRIPCIONES}`, payload, {
      withCredentials: true,
    });
    if (respuesta.data?.back === true) {
      Swal?.fire(
        "¡Inscripción registrada!",
        respuesta.data?.message || "La inscripción se creó correctamente.",
        "success"
      );
      return respuesta.data.data;
    }
    throw new Error(
      respuesta.data?.message || "Respuesta inválida del servidor."
    );
  } catch (error) {
    showError(Swal, error, "No se pudo registrar la inscripción.");
    return null;
  }
};
