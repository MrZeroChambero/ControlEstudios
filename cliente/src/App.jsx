// src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Componentes/Dashboard/Dashboard.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      {/* Aquí puedes agregar más rutas */}
    </Routes>
  );
}

export default App;
