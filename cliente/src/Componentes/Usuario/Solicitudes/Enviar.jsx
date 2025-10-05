export const Enviar = async (props) => {
  const {
    e,
    formData,
    currentUser,
    closeModal,
    API_URL,
    Swal,
    axios,
    solicitudUsuarios,
    setIsLoading,
    setUsuarios,
  } = props;
  e.preventDefault();
  const dataToSend = { ...formData };
  // No enviar la contraseña si está vacía en modo edición
  if (currentUser && !dataToSend.contrasena) {
    delete dataToSend.contrasena;
  }

  try {
    let response;
    if (currentUser) {
      // Actualizar usuario
      response = await axios.put(
        `${API_URL}/${currentUser.id_usuario}`,
        dataToSend,
        { withCredentials: true }
      );

      Swal.fire("¡Actualizado!", response.data.message, "success");
    } else {
      // Crear usuario
      response = await axios.post(API_URL, dataToSend, {
        withCredentials: true,
      });
      Swal.fire("¡Creado!", response.data.message, "success");
    }
    console.log(response.data);
    solicitudUsuarios({ setIsLoading, setUsuarios });
    closeModal();
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    const errorData = error.response?.data;
    console.log("Error data:", errorData);
    if (errorData && errorData?.errors) {
      const errors = Object.entries(errorData.errors).map(
        ([key, value]) => `${key}: ${value.join(", ")}`
      );
      const errorMsg = errors.join("\n");
      Swal.fire("Error de validación", errorMsg, "error");
    } else {
      const errorMsg = errorData?.message || "Ocurrió un error.";
      Swal.fire("Error", errorMsg, "error");
    }
  }
};
