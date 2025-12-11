import React, { useState, useEffect } from "react";
import { LoginForm } from "./Formulario.jsx";
import { verificarSesion } from "./verificarSesion.jsx";
import { Solicitud } from "./Solicitud.jsx";
// Importar useNavigate para la redirección
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
        {attemptInfo && (
          <div
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            style={{ whiteSpace: "pre-line" }}
          >
            {attemptInfo}
          </div>
        )}
        <p className="mt-4 text-center text-sm text-blue-600">
          <Link to="/recuperar-clave" className="hover:underline">
            Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
};
