import axios from "axios";

const API_URL =
  "http://localhost:8080/controlestudios/servidor/preguntas-seguridad";

export const iniciarRecuperacionClave = async (nombreUsuario) => {
  const response = await axios.post(`${API_URL}/iniciar-recuperacion`, {
    nombre_usuario: nombreUsuario,
  });

  return response.data;
};

export const restablecerClave = async (payload) => {
  const response = await axios.post(`${API_URL}/restablecer`, payload);
  return response.data;
};
