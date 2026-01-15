import React, { useState, useEffect } from "react";
import { LoginForm } from "./Formulario.jsx";
import { verificarSesion } from "./verificarSesion.jsx";
import { Solicitud } from "./Solicitud.jsx";
import { IntentosSeguridad } from "./IntentosSeguridad.jsx";
import { loginLayoutClasses, loginSupportClasses } from "./loginEstilos";
import { useNavigate, Link } from "react-router-dom";
import "sweetalert2/dist/sweetalert2.min.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const navigate = useNavigate(); // Inicializar useNavigate

  // useEffect para verificar si la sesión ya está iniciada
  // Ahora, en lugar de leer el localStorage, hacemos una petición al servidor.
  useEffect(() => {
    verificarSesion(navigate);
  }, [navigate]);

  const handleInputChange = (e, setter) => {
    const { value } = e.target;
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (value.startsWith(" ") && value.trim() === "") {
      setter("");
    } else if (regex.test(value)) {
      setter(value);
    }
  };

  const handleSubmit = (e) => {
    Solicitud(e, username, password, navigate, setAttemptInfo);
  };

  return (
    <div className={loginLayoutClasses.page}>
      <div className={loginLayoutClasses.wrapper}>
        <div className={loginLayoutClasses.card}>
          <div className={loginLayoutClasses.header}>
            <h2 className={loginLayoutClasses.title}>Iniciar Sesión</h2>
            <p className={loginLayoutClasses.description}>
              Ingresa tus credenciales para acceder al panel de control.
            </p>
          </div>
          <LoginForm
            username={username}
            password={password}
            showPassword={showPassword}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            setShowPassword={setShowPassword}
            setUsername={setUsername}
            setPassword={setPassword}
          />
          <IntentosSeguridad mensaje={attemptInfo} />
          <p className={loginSupportClasses.forgotPassword}>
            <Link to="/recuperar-clave" className={loginSupportClasses.link}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
