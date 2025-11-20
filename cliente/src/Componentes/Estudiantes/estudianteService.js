import axios from "axios";

const API_BASE = "http://localhost:8080/controlestudios/servidor";
const API_ESTUDIANTES = `${API_BASE}/estudiantes`;
const API_DOCS = `${API_BASE}/documentos-academicos`;
const API_ALERGIAS = `${API_BASE}/alergias`;
const API_LISTA_ALERGIAS = `${API_BASE}/lista-alergias`;
const API_PATOLOGIAS = `${API_BASE}/patologias`;
const API_CONDICIONES = `${API_BASE}/condiciones-salud`;
const API_VACUNAS = `${API_BASE}/vacunas`;
const API_VACUNAS_EST = `${API_BASE}/vacunas-estudiante`;
const API_CONSULTAS = `${API_BASE}/consultas-medicas`;

// Utilidad de manejo de errores (simplificada)
const showError = (Swal, error, mensajeDefecto) => {
  console.log(error?.response);
  const errorData = error?.response?.data;
  if (errorData?.errors) {
    const errors = Object.entries(errorData.errors).map(
      ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
    );
    Swal?.fire("Error de validación", errors.join("\n"), "error");
  } else {
    Swal?.fire("Error", errorData?.message || mensajeDefecto, "error");
  }
};

// Estudiantes - listado y detalle
export const solicitarEstudiantes = async (
  setEstudiantes,
  setIsLoading,
  Swal
) => {
  try {
    setIsLoading?.(true);
    console.group("Solicitar estudiantes");
    console.log("GET", `${API_ESTUDIANTES}`);
    const res = await axios.get(`${API_ESTUDIANTES}`, {
      withCredentials: true,
    });
    console.log("Status:", res.status);
    console.log("Response data:", res.data);
    if (res.data?.back === true) {
      setEstudiantes?.(res.data.data || []);
      console.log("Estudiantes cargados:", (res.data.data || []).length);
    } else {
      throw new Error("Respuesta inválida del backend");
    }
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar los estudiantes.");
    setEstudiantes?.([]);
  } finally {
    console.groupEnd();
    setIsLoading?.(false);
  }
};

export const obtenerEstudianteCompleto = async (id, Swal) => {
  try {
    console.group("Obtener estudiante");
    console.log("GET", `${API_ESTUDIANTES}/${id}`);
    const res = await axios.get(`${API_ESTUDIANTES}/${id}`, {
      withCredentials: true,
    });
    console.log("Status:", res.status);
    console.log("Response data:", res.data);
    if (res.data?.back === true) return res.data.data;
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo cargar la información del estudiante.");
    return null;
  } finally {
    console.groupEnd();
  }
};

// Actualizar persona (datos biográficos) excepto tipo/estado
export const actualizarPersona = async (idPersona, formData, Swal) => {
  try {
    // Remover campos no editables si vinieran
    const { tipo: _omitTipo, estado: _omitEstado, ...rest } = formData;
    const res = await axios.put(`${API_BASE}/personas/${idPersona}`, rest, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Persona actualizada",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar la persona.");
    return null;
  }
};

// Candidatos y creación/registro
export const solicitarPersonasCandidatas = async (setPersonas, Swal) => {
  try {
    const res = await axios.get(`${API_ESTUDIANTES}/personas-candidatas`, {
      withCredentials: true,
    });
    if (res.data?.back === true) setPersonas?.(res.data.data || []);
    else throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar las personas candidatas.");
  }
};

export const crearPersonaEstudiante = async (formData, Swal) => {
  try {
    const res = await axios.post(`${API_ESTUDIANTES}/persona`, formData, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire("¡Éxito!", res.data.message || "Persona creada", "success");
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo crear la persona.");
    return null;
  }
};

export const completarRegistroEstudiante = async (
  idPersona,
  formData,
  Swal
) => {
  try {
    const res = await axios.post(
      `${API_ESTUDIANTES}/persona/${idPersona}/registrar`,
      formData,
      { withCredentials: true }
    );
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Estudiante registrado",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo completar el registro del estudiante.");
    return null;
  }
};

export const actualizarEstudiante = async (id, formData, Swal) => {
  try {
    const res = await axios.put(`${API_ESTUDIANTES}/${id}`, formData, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Estudiante actualizado",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar el estudiante.");
    return null;
  }
};

export const cambioEstadoEstudiante = async (id, cargarDatos, Swal) => {
  try {
    console.group("Cambio estado estudiante");
    console.log("ID:", id);
    const detalle = await obtenerEstudianteCompleto(id, Swal);
    if (!detalle) throw new Error("No se pudo obtener estado actual");
    const estadoActual = detalle.estado_persona || detalle.estado; // persona.estado
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    console.log("Estado actual:", estadoActual, "Nuevo estado:", nuevoEstado);
    const res = await axios.patch(
      `${API_ESTUDIANTES}/${id}/estado`,
      { estado: nuevoEstado },
      { withCredentials: true }
    );
    console.log("Status:", res.status);
    console.log("Response data:", res.data);
    if (res.data?.back === true) {
      Swal?.fire("¡Éxito!", `Estado cambiado a ${nuevoEstado}.`, "success");
      cargarDatos?.();
      console.log("Estado cambiado correctamente");
      return true;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo cambiar el estado del estudiante.");
    return false;
  } finally {
    console.groupEnd();
  }
};

// Documentos Académicos
export const listarDocumentosEstudiante = async (idEstudiante, Swal) => {
  try {
    const res = await axios.get(`${API_DOCS}/estudiante/${idEstudiante}`, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar los documentos.");
    return [];
  }
};

export const crearDocumento = async (payload, Swal) => {
  try {
    const res = await axios.post(`${API_DOCS}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Documento agregado",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo crear el documento.");
    return null;
  }
};

export const actualizarDocumento = async (idDocumento, payload, Swal) => {
  try {
    const res = await axios.put(`${API_DOCS}/${idDocumento}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Documento actualizado",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar el documento.");
    return null;
  }
};

export const eliminarDocumento = async (idDocumento, recargar, Swal) => {
  Swal?.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_DOCS}/${idDocumento}`, {
          withCredentials: true,
        });
        Swal?.fire("¡Borrado!", "El documento ha sido eliminado.", "success");
        recargar?.();
      } catch (error) {
        showError(Swal, error, "No se pudo eliminar el documento.");
      }
    }
  });
};

// Alergias
export const listarAlergiasCatalogo = async (Swal) => {
  try {
    const res = await axios.get(`${API_ALERGIAS}`, { withCredentials: true });
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo cargar el catálogo de alergias.");
    return [];
  }
};

export const listarAlergiasEstudiante = async (idEstudiante, Swal) => {
  try {
    const res = await axios.get(
      `${API_LISTA_ALERGIAS}/estudiante/${idEstudiante}`,
      { withCredentials: true }
    );
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(
      Swal,
      error,
      "No se pudieron cargar las alergias del estudiante."
    );
    return [];
  }
};

export const agregarAlergiaEstudiante = async (payload, Swal) => {
  try {
    const res = await axios.post(`${API_LISTA_ALERGIAS}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire("¡Éxito!", res.data.message || "Alergia agregada", "success");
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo agregar la alergia.");
    return null;
  }
};

export const eliminarAlergiaEstudiante = async (
  idListaAlergia,
  recargar,
  Swal
) => {
  Swal?.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_LISTA_ALERGIAS}/${idListaAlergia}`, {
          withCredentials: true,
        });
        Swal?.fire("¡Borrado!", "La alergia ha sido removida.", "success");
        recargar?.();
      } catch (error) {
        showError(Swal, error, "No se pudo eliminar la alergia.");
      }
    }
  });
};

// Patologías / Condiciones de Salud
export const listarPatologiasCatalogo = async (Swal) => {
  try {
    const res = await axios.get(`${API_PATOLOGIAS}`, { withCredentials: true });
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo cargar el catálogo de patologías.");
    return [];
  }
};

export const listarCondicionesSaludEstudiante = async (idEstudiante, Swal) => {
  try {
    const res = await axios.get(
      `${API_CONDICIONES}/estudiante/${idEstudiante}`,
      { withCredentials: true }
    );
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar las condiciones de salud.");
    return [];
  }
};

export const agregarCondicionSalud = async (payload, Swal) => {
  try {
    const res = await axios.post(`${API_CONDICIONES}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Condición agregada",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo agregar la condición.");
    return null;
  }
};

export const actualizarCondicionSalud = async (idCondicion, payload, Swal) => {
  try {
    const res = await axios.put(`${API_CONDICIONES}/${idCondicion}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Condición actualizada",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar la condición.");
    return null;
  }
};

export const eliminarCondicionSalud = async (idCondicion, recargar, Swal) => {
  Swal?.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_CONDICIONES}/${idCondicion}`, {
          withCredentials: true,
        });
        Swal?.fire("¡Borrado!", "La condición ha sido eliminada.", "success");
        recargar?.();
      } catch (error) {
        showError(Swal, error, "No se pudo eliminar la condición.");
      }
    }
  });
};

// Vacunas
export const listarVacunasCatalogo = async (Swal) => {
  try {
    const res = await axios.get(`${API_VACUNAS}`, { withCredentials: true });
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo cargar el catálogo de vacunas.");
    return [];
  }
};

export const listarVacunasEstudiante = async (idEstudiante, Swal) => {
  try {
    const res = await axios.get(
      `${API_VACUNAS_EST}/estudiante/${idEstudiante}`,
      { withCredentials: true }
    );
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar las vacunas del estudiante.");
    return [];
  }
};

export const agregarVacunaEstudiante = async (payload, Swal) => {
  try {
    const res = await axios.post(`${API_VACUNAS_EST}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire("¡Éxito!", res.data.message || "Vacuna registrada", "success");
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo agregar la vacuna.");
    return null;
  }
};

export const actualizarVacunaEstudiante = async (
  idVacunaEst,
  payload,
  Swal
) => {
  try {
    const res = await axios.put(`${API_VACUNAS_EST}/${idVacunaEst}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Vacuna actualizada",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar la vacuna.");
    return null;
  }
};

export const eliminarVacunaEstudiante = async (idVacunaEst, recargar, Swal) => {
  Swal?.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_VACUNAS_EST}/${idVacunaEst}`, {
          withCredentials: true,
        });
        Swal?.fire("¡Borrado!", "La vacuna ha sido eliminada.", "success");
        recargar?.();
      } catch (error) {
        showError(Swal, error, "No se pudo eliminar la vacuna.");
      }
    }
  });
};

// Consultas Médicas
export const listarConsultasMedicasEstudiante = async (idEstudiante, Swal) => {
  try {
    const res = await axios.get(`${API_CONSULTAS}/estudiante/${idEstudiante}`, {
      withCredentials: true,
    });
    if (res.data?.back === true) return res.data.data || [];
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudieron cargar las consultas médicas.");
    return [];
  }
};

export const agregarConsultaMedica = async (payload, Swal) => {
  try {
    const res = await axios.post(`${API_CONSULTAS}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire("¡Éxito!", res.data.message || "Consulta agregada", "success");
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo agregar la consulta médica.");
    return null;
  }
};

export const actualizarConsultaMedica = async (idConsulta, payload, Swal) => {
  try {
    const res = await axios.put(`${API_CONSULTAS}/${idConsulta}`, payload, {
      withCredentials: true,
    });
    if (res.data?.back === true) {
      Swal?.fire(
        "¡Éxito!",
        res.data.message || "Consulta actualizada",
        "success"
      );
      return res.data.data;
    }
    throw new Error("Respuesta inválida del backend");
  } catch (error) {
    showError(Swal, error, "No se pudo actualizar la consulta médica.");
    return null;
  }
};

export const eliminarConsultaMedica = async (idConsulta, recargar, Swal) => {
  Swal?.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ¡bórralo!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_CONSULTAS}/${idConsulta}`, {
          withCredentials: true,
        });
        Swal?.fire("¡Borrado!", "La consulta ha sido eliminada.", "success");
        recargar?.();
      } catch (error) {
        showError(Swal, error, "No se pudo eliminar la consulta médica.");
      }
    }
  });
};
