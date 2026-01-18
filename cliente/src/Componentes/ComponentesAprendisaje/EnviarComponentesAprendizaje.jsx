import axios from "axios";
import {
  normalizarRespuesta,
  asegurarCompatibilidad,
} from "../../utilidades/respuestaBackend";

const formatearErrores = (errores) => {
  if (!errores) {
    return "Ocurrió un error inesperado.";
  }

  // Manejo específico de error de unicidad
  if (errores.nombre_componente) {
    const mensajesUnicidad = errores.nombre_componente.filter(
      (m) =>
        m.includes("único") ||
        m.includes("ya existe") ||
        m.includes("duplicado")
    );

    if (mensajesUnicidad.length > 0) {
      return "Ya existe un componente con este nombre en el área seleccionada.\nPor favor, elige un nombre diferente.";
    }
  }

  // Manejo específico de FK inválida
  if (errores.fk_area && errores.fk_area.some((m) => m.includes("no existe"))) {
    return "El área seleccionada no existe o no está disponible.";
  }

  return Object.values(errores)
    .flat()
    .map((mensaje) => `• ${mensaje}`)
    .join("\n");
};

export const enviarComponenteAprendizaje = async ({
  formData,
  currentComponente,
  API_URL,
  refetchData,
  closeModal,
  Swal,
}) => {
  // Validación previa
  if (!formData.fk_area) {
    Swal.fire("Error", "El área de aprendizaje es requerida", "error");
    return;
  }

  if (!formData.nombre_componente?.trim()) {
    Swal.fire("Error", "El nombre del componente es requerido", "error");
    return;
  }

  if (!formData.especialista?.trim()) {
    Swal.fire("Error", "El tipo de docente es requerido", "error");
    return;
  }

  const DatosFormulario = {
    fk_area: Number(formData.fk_area), // Asegurar que es número
    nombre_componente: formData.nombre_componente.trim().replace(/\s+/g, " "),
    especialista: formData.especialista.trim().replace(/\s+/g, " "),
    evalua: formData.evalua || "no", // Valor por defecto
    grupo: formData.grupo || "Completo", // Valor por defecto
  };

  // Logs de depuración antes de enviar
  console.log("📤 Datos a enviar:", DatosFormulario);
  console.log("📦 Current Componente:", currentComponente);

  try {
    const url = currentComponente
      ? `${API_URL}/${currentComponente.id_componente}`
      : API_URL;
    const metodo = currentComponente ? axios.put : axios.post;

    console.log("🔗 URL:", url);
    console.log("🔄 Método:", currentComponente ? "PUT" : "POST");

    const response = await metodo(url, DatosFormulario, {
      withCredentials: true,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const compat = normalizarRespuesta(
      asegurarCompatibilidad(response.data),
      currentComponente
        ? "No se pudo actualizar el componente."
        : "No se pudo crear el componente."
    );
    console.log({ Accion: "Resgistrar Componente de aprendizaje", response });
    if (compat.success) {
      const mensaje =
        compat.message ||
        (currentComponente
          ? "Componente actualizado correctamente."
          : "Componente creado correctamente.");
      Swal.fire("¡Éxito!", mensaje, "success");
      refetchData();
      closeModal();
      return;
    }

    const mensajeError =
      formatearErrores(compat.errors) ||
      compat.message ||
      "Los datos enviados no son válidos.";
    Swal.fire(
      "Error de validación",
      mensajeError.replace(/\n/g, "<br>"),
      "error"
    );
  } catch (error) {
    console.error("Error al guardar el componente de aprendizaje:", error);

    // Log detallado para 422
    if (error.response?.status === 422) {
      console.log("🔴 Error 422 - Detalles:");
      console.log("Datos enviados:", DatosFormulario);
      console.log("Respuesta del error:", error.response.data);
    }

    const compat = normalizarRespuesta(
      asegurarCompatibilidad(error.response?.data),
      "No se pudo comunicar con el servidor."
    );

    if (compat.errors) {
      const detalle = formatearErrores(compat.errors);
      Swal.fire("Error", detalle.replace(/\n/g, "<br>"), "error");
      return;
    }

    Swal.fire("Error", compat.message, "error");
  }
};
