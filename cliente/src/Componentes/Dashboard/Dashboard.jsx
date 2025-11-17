import React from "react";
import { BotonesSection } from "./Secciones.jsx";
import { GraficosSection } from "./Secciones.jsx";
import { MultimediaSection } from "./Secciones.jsx";

export const Dashboard = () => {
  return (
    // Agregar el return
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <BotonesSection />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <GraficosSection />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <MultimediaSection />
      </div>
    </>
  );
};
