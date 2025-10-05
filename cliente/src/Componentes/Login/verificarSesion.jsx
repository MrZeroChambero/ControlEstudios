import axios from "axios";
export const verificarSesion = async (navigate) => {
  console.log("Verificando sesión...");
  try {
    // Hacemos una petición a un endpoint que verifique la sesión.
    // Axios enviará la cookie 'session_token' automáticamente.
    const response = await axios.get(
      "http://localhost:8080/controlestudios/servidor/verificar-sesion",
      {
        withCredentials: true,
      }
    );
    // Si la petición es exitosa, la sesión es válida. Guardamos los datos del usuario.
    localStorage.setItem("usuario", response.data.nombre_usuario);
    localStorage.setItem("nivel", response.data.rol);
    navigate("/dashboard"); // Y redirigimos al dashboard
  } catch (error) {
    // Si la petición falla (ej. 401 Unauthorized), no hay sesión activa.
    // No hacemos nada y el usuario se queda en la página de login.
    console.log("No hay sesión activa." + error);
  }
};
