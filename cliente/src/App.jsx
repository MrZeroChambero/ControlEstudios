// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Componentes/Dashboard/Dashboard.jsx";
import { Login } from "./Componentes/Login/Login.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Login" element={<Login />} />
      {/* Aquí puedes agregar más rutas */}
    </Routes>
  );
}

export default App;
