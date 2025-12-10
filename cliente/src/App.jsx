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
import { Personal } from "./Componentes/Personal/Personal.jsx";
import Representante from "./Componentes/Representantes/Representante.jsx";
import Parentesco from "./Componentes/Parentesco/Parentesco.jsx";
import AnioEscolar from "./Componentes/AnioEscolar/AnioEscolar.jsx";
import { Aulas } from "./Componentes/Aulas/Aulas.jsx";
import { Competencias } from "./Componentes/Competencias/Competencias.jsx";
import { Indicadores } from "./Componentes/Indicadores/Indicadores.jsx";
import { GestionGradosSecciones } from "./Componentes/GestionGradosSecciones/GestionGradosSecciones.jsx";
import Inscripcion from "./Componentes/Inscripcion/inscripcion.jsx";

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
      <Route path="GradosYSecciones" element={<GestionGradosSecciones />} />
      <Route path="Aperturar Aulas" element={<Aulas />} />
      <Route path="AnioEscolar" element={<AnioEscolar />} />
      <Route path="Aulas" element={<Aulas />} />
      <Route path="Parentesco" element={<Parentesco />} />
      <Route path="Asistencia de estudiantes" element={<Dashboard />} />
      <Route path="Competencias" element={<Competencias />} />
      <Route path="Indicadores" element={<Indicadores />} />
      <Route path="Inscripcion" element={<Inscripcion />} />

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
