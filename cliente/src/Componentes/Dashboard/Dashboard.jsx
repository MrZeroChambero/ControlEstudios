import React from "react";
import { BotonesSection } from "./Secciones.jsx";
import { GraficosSection } from "./Secciones.jsx";
import { MultimediaSection } from "./Secciones.jsx";
import { dashboardLayoutClasses } from "./dashboardEstilos";

export const Dashboard = () => {
  return (
    // Agregar el return
    <>
      <div className={dashboardLayoutClasses.sectionWrapper}>
        <BotonesSection />
      </div>

      <div className={dashboardLayoutClasses.sectionWrapper}>
        <GraficosSection />
      </div>

      <div className={dashboardLayoutClasses.finalSection}>
        <MultimediaSection />
      </div>
    </>
  );
};
