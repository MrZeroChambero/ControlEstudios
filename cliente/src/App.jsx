// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Componentes/Dashboard/Dashboard.jsx";
import { Login } from "./Componentes/Login/Login.jsx";
import { AdminRutas } from "./Componentes/AdministradorRutas/AdminRutas.jsx";
import { Usuarios } from "./Componentes/Usuario/Usuarios.jsx";
import { Personas } from "./Componentes/Persona/Personas.jsx";
import { ServerErrorPage } from "./Componentes/AdministradorRutas/ServerErrorPage.jsx";

import "./index.css";
import { Estudiantes } from "./Componentes/Estudiantes/Estudiantes.jsx";
import { ComponentesAprendizajes } from "./Componentes/ComponentesAprendisaje/ComponentesAprendizajes.jsx";
import { AreasAprendizajes } from "./Componentes/AreasAprendizaje/AreasAprendizajes.jsx";
import { Contenidos } from "./Componentes/Contenidos/Contenidos.jsx";
import { Evaluaciones } from "./Componentes/Evaluaciones/MenuEvaluaciones.jsx";
import { Personal } from "./Componentes/Personal/Personal.jsx";
import Representante from "./Componentes/Representantes/Representante.jsx";
import Parentesco from "./Componentes/Parentesco/Parentesco.jsx";
import AnioEscolar from "./Componentes/AnioEscolar/AnioEscolar.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminRutas />} />
      <Route path="Estudiantes" element={<Estudiantes />} />
      <Route path="Personal" element={<Personal />} />
      {/* Ruta duplicada de Estudiantes removida para evitar conflictos */}
      <Route path="Representantes" element={<Representante />} />
      <Route path="areas-de-aprendizaje" element={<AreasAprendizajes />} />
      <Route path="contenido" element={<Contenidos />} />
      <Route
        path="componentes-de-aprendizaje"
        element={<ComponentesAprendizajes />}
      />
      <Route path="AnioEscolar" element={<AnioEscolar />} />
      <Route path="Parentesco" element={<Parentesco />} />
      <Route path="Asistencia de estudiantes" element={<Dashboard />} />
      <Route path="Competencias" element={<Dashboard />} />
      <Route path="Indicadores" element={<Dashboard />} />
      <Route path="Evaluaciones" element={<Evaluaciones />} />
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
