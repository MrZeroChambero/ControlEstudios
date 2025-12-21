import axios from "axios";

const BASE_URL = "http://localhost:8080/controlestudios/servidor";
const HORARIOS_URL = `${BASE_URL}/horarios`;

export const listarHorarios = async ({
  filtros = {},
  setHorarios,
  setIsLoading,
  Swal,
}) => {
  try {
    setIsLoading?.(true);
    const params = new URLSearchParams();

    if (filtros.fk_aula) {
      params.append("fk_aula", filtros.fk_aula);
    }
    if (filtros.fk_momento) {
      params.append("fk_momento", filtros.fk_momento);
    }
    if (filtros.dia_semana) {
      params.append("dia_semana", filtros.dia_semana);
    }

    const { data } = await axios.get(
      `${HORARIOS_URL}${params.toString() ? `?${params.toString()}` : ""}`,
      {
        withCredentials: true,
      }
    );

    if (data?.exito) {
      const registros = Array.isArray(data.datos) ? data.datos : [];
      setHorarios?.(registros);
      return registros;
    }

    Swal?.fire(
      "Aviso",
      data?.mensaje || "No fue posible cargar los horarios.",
      "warning"
    );
    setHorarios?.([]);
    return [];
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    const mensaje =
      error.response?.data?.mensaje || "No fue posible cargar los horarios.";
    Swal?.fire("Error", mensaje, "error");
    setHorarios?.([]);
    return [];
  } finally {
    setIsLoading?.(false);
  }
};

export const obtenerCatalogosHorarios = async ({ filtros = {}, Swal }) => {
  try {
    const params = new URLSearchParams();

    if (filtros.fk_anio_escolar) {
      params.append("fk_anio_escolar", filtros.fk_anio_escolar);
    }

    if (filtros.fk_aula) {
      params.append("fk_aula", filtros.fk_aula);
    }

    const { data } = await axios.get(
      `${HORARIOS_URL}/catalogos${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        withCredentials: true,
      }
    );

    if (data?.exito) {
      return data.datos ?? {};
    }

    Swal?.fire(
      "Aviso",
      data?.mensaje || "No fue posible cargar los catálogos.",
      "warning"
    );
    return {};
  } catch (error) {
    console.error("Error al obtener catálogos de horarios:", error);
    const mensaje =
      error.response?.data?.mensaje || "No fue posible cargar los catálogos.";
    Swal?.fire("Error", mensaje, "error");
    return {};
  }
};

export const crearHorario = async ({ datos, Swal }) => {
  try {
    const { data } = await axios.post(HORARIOS_URL, datos, {
      withCredentials: true,
    });

    if (data?.exito) {
      Swal?.fire(
        "Hecho",
        data.mensaje || "Horario registrado correctamente.",
        "success"
      );
      return data.datos;
    }

    if (data?.errores) {
      return Promise.reject(data.errores);
    }

    const mensaje = data?.mensaje || "No fue posible registrar el horario.";
    Swal?.fire("Aviso", mensaje, "warning");
    return null;
  } catch (error) {
    const respuesta = error.response?.data;
    if (respuesta?.errores) {
      return Promise.reject(respuesta.errores);
    }

    const mensaje =
      respuesta?.mensaje || "No fue posible registrar el horario.";
    Swal?.fire("Error", mensaje, "error");
    return null;
  }
};

export const actualizarHorario = async ({ idHorario, datos, Swal }) => {
  try {
    const { data } = await axios.put(`${HORARIOS_URL}/${idHorario}`, datos, {
      withCredentials: true,
    });

    if (data?.exito) {
      Swal?.fire("Hecho", data.mensaje || "Horario actualizado.", "success");
      return data.datos;
    }

    if (data?.errores) {
      return Promise.reject(data.errores);
    }

    const mensaje = data?.mensaje || "No fue posible actualizar el horario.";
    Swal?.fire("Aviso", mensaje, "warning");
    return null;
  } catch (error) {
    const respuesta = error.response?.data;
    if (respuesta?.errores) {
      return Promise.reject(respuesta.errores);
    }

    const mensaje =
      respuesta?.mensaje || "No fue posible actualizar el horario.";
    Swal?.fire("Error", mensaje, "error");
    return null;
  }
};

export const eliminarHorario = async ({ idHorario, Swal }) => {
  try {
    const { data } = await axios.delete(`${HORARIOS_URL}/${idHorario}`, {
      withCredentials: true,
    });

    if (data?.exito) {
      Swal?.fire("Hecho", data.mensaje || "Horario eliminado.", "success");
      return true;
    }

    const mensaje = data?.mensaje || "No fue posible eliminar el horario.";
    Swal?.fire("Aviso", mensaje, "warning");
    return false;
  } catch (error) {
    const mensaje =
      error.response?.data?.mensaje || "No fue posible eliminar el horario.";
    Swal?.fire("Error", mensaje, "error");
    return false;
  }
};

export const sincronizarSubgrupo = async ({ idHorario, estudiantes, Swal }) => {
  try {
    const { data } = await axios.patch(
      `${HORARIOS_URL}/${idHorario}/subgrupo`,
      { estudiantes },
      { withCredentials: true }
    );

    if (data?.exito) {
      Swal?.fire(
        "Hecho",
        data.mensaje || "Subgrupo actualizado correctamente.",
        "success"
      );
      return data.datos;
    }

    if (data?.errores) {
      return Promise.reject(data.errores);
    }

    const mensaje = data?.mensaje || "No fue posible actualizar el subgrupo.";
    Swal?.fire("Aviso", mensaje, "warning");
    return null;
  } catch (error) {
    const respuesta = error.response?.data;
    if (respuesta?.errores) {
      return Promise.reject(respuesta.errores);
    }

    const mensaje =
      respuesta?.mensaje || "No fue posible actualizar el subgrupo.";
    Swal?.fire("Error", mensaje, "error");
    return null;
  }
};
