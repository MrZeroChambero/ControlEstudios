import React, { useState, useEffect } from "react";
import axios from "axios";
import { LoginForm } from "./Formulario.jsx";
import { verificarSesion } from "./VerificarSesion.jsx";
import { Solicitud } from "./Solicitud.jsx";
// Importar useNavigate para la redirección
import { useNavigate } from "react-router-dom";
import "sweetalert2/dist/sweetalert2.min.css";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    Solicitud(e, username, password, navigate);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
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
      </div>
    </div>
  );
};
