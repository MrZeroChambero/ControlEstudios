import axios from "axios";

const API_URL = "http://localhost:8080/controlestudios/servidor/usuarios";

export const solicitarUsuarios = async (setUsuarios, setIsLoading, Swal) => {
  try {
    setIsLoading(true);
    const response = await axios.get(API_URL, { withCredentials: true });

    if (response.data && response.data.back === true) {
      setUsuarios(response.data.data);
    } else {
      console.error("El backend no respondió correctamente:", response.data);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
      setUsuarios([]);
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar los usuarios.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    }
  } finally {
    setIsLoading(false);
  }
};

export const solicitarPersonalParaSelect = async (setPersonal, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/personal-select`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      setPersonal(response.data.data);
    } else {
      console.error("Backend no respondió para personal:", response.data);
      Swal.fire("Error", "No se pudieron cargar el personal.", "error");
    }
  } catch (error) {
    console.error("Error al obtener personal:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudieron cargar el personal.",
        "error"
      );
    } else {
      Swal.fire("Error", "No se pudieron cargar el personal.", "error");
    }
  }
};

export const obtenerUsuarioCompleto = async (id, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/completo`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      return response.data.data;
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al obtener usuario completo:", error);
    const errorData = error.response?.data;
    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message || "No se pudo cargar la información del usuario.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudo cargar la información del usuario.",
        "error"
      );
    }
    return null;
  }
};

export const eliminarUsuario = async (id, cargarDatos, Swal) => {
  Swal.fire({
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
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
        Swal.fire("¡Borrado!", "El usuario ha sido eliminado.", "success");
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        const errorData = error.response?.data;
        Swal.fire(
          "Error",
          errorData?.message || "No se pudo eliminar el usuario.",
          "error"
        );
      }
    }
  });
};

export const enviarUsuario = async (
  e,
  formData,
  preguntas,
  currentUsuario,
  closeModal,
  cargarDatos,
  Swal
) => {
  e.preventDefault();

  try {
    const { confirmacion_contrasena, ...datosUsuario } = formData;
    const payload = {
      ...datosUsuario,
      preguntas,
    };

    let response;
    if (currentUsuario) {
      response = await axios.put(
        `${API_URL}/${currentUsuario.id_usuario}`,
        payload,
        {
          withCredentials: true,
        }
      );
    } else {
      response = await axios.post(API_URL, payload, {
        withCredentials: true,
      });
    }

    if (response.data && response.data.back === true) {
      const successMessage = currentUsuario ? "¡Actualizado!" : "¡Creado!";
      Swal.fire(successMessage, response.data.message, "success");
      cargarDatos();
      closeModal();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    const errorData = error.response?.data;

    if (errorData) {
      if (errorData.back === false) {
        if (errorData.errors) {
          const errors = Object.entries(errorData.errors).map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          );
          const errorMsg = errors.join("\n");
          Swal.fire("Error de validación", errorMsg, "error");
        } else {
          Swal.fire("Error", errorData.message || "Ocurrió un error.", "error");
        }
      } else {
        Swal.fire("Error", "Error de comunicación con el servidor.", "error");
      }
    } else {
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
    }
  }
};

export const cambioEstadoUsuario = async (id, cargarDatos, Swal) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/estado`,
      {},
      { withCredentials: true }
    );

    if (response.data && response.data.back === true) {
      Swal.fire(
        "¡Éxito!",
        "Estado del usuario cambiado correctamente.",
        "success"
      );
      cargarDatos();
    } else {
      throw new Error("El backend no respondió correctamente");
    }
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    const errorData = error.response?.data;
    Swal.fire(
      "Error",
      errorData?.message || "No se pudo cambiar el estado del usuario.",
      "error"
    );
    throw error;
  }
};

export const obtenerPreguntasSeguridad = async (id, Swal) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/preguntas`, {
      withCredentials: true,
    });

    if (response.data && response.data.back === true) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    throw new Error("El backend no respondió correctamente");
  } catch (error) {
    console.error("Error al obtener preguntas de seguridad:", error);
    const errorData = error.response?.data;

    if (errorData && errorData.back === false) {
      Swal.fire(
        "Error",
        errorData.message ||
          "No se pudieron cargar las preguntas de seguridad.",
        "error"
      );
    } else {
      Swal.fire(
        "Error",
        "No se pudieron cargar las preguntas de seguridad.",
        "error"
      );
    }

    return [];
  }
};
