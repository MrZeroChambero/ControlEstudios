// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Componentes/Dashboard/Dashboard.jsx";
import { Login } from "./Componentes/Login/Login.jsx";
import { AdminRutas } from "./Componentes/AdministradorRutas/AdminRutas.jsx";
import { Usuarios } from "./Componentes/Usuario/Usuarios.jsx";
import { Personas } from "./Componentes/Persona/Personas.jsx";
import { ServerErrorPage } from "./Componentes/AdministradorRutas/ServerErrorPage.jsx";
import { Personal } from "./Componentes/Personal/Personal.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminRutas />} />
      <Route path="Estudiantes" element={<Dashboard />} />
      <Route path="Personal" element={<Personal />} />
      <Route path="Estudiantes" element={<Dashboard />} />
      <Route path="Representantes" element={<Dashboard />} />
      <Route path="Areas de aprendizaje y temas" element={<Dashboard />} />
      <Route path="Asistencia de estudiantes" element={<Dashboard />} />
      <Route path="Competencias" element={<Dashboard />} />
      <Route path="Indicadores" element={<Dashboard />} />
      <Route path="Evaluaciones" element={<Dashboard />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/server-error" element={<ServerErrorPage />} />
      <Route path="/personas" element={<Personas />} />
      <Route path="/usuarios" element={<Usuarios />} />

      {/* Aquí puedes agregar más rutas */}
    </Routes>
  );
}

export default App;
