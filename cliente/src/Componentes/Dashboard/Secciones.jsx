import {
  MdAddCircle,
  MdBarChart,
  MdSettings,
  MdVideocam,
} from "react-icons/md";
import {
  dashboardSectionClasses,
  dashboardQuickActionClasses,
} from "./dashboardEstilos";

export const MultimediaSection = () => {
  return (
    <>
      <h2 className={dashboardSectionClasses.heading}>Sección Multimedia</h2>
      <div className={dashboardSectionClasses.mediaGrid}>
        <div className={dashboardSectionClasses.mediaCard}>
          <h3 className="text-xl font-semibold mb-2">Imagen de Muestra</h3>
          <img
            src="https://placehold.co/600x400/22c55e/ffffff?text=Imagen+Multimedia"
            alt="Placeholder"
            className={dashboardSectionClasses.mediaImage}
          />
        </div>
        <div className={dashboardSectionClasses.mediaCard}>
          <h3 className="text-xl font-semibold mb-2">Video de Muestra</h3>
          <div className={dashboardSectionClasses.mediaPlaceholder}>
            <p className="text-gray-500">Espacio para video</p>
          </div>
        </div>
      </div>
    </>
  );
};

export const GraficosSection = () => {
  return (
    <>
      <h2 className={dashboardSectionClasses.heading}>Sección de Gráficos</h2>
      <div className={dashboardSectionClasses.graphContainer}>
        <p className="text-gray-500">Espacio para gráfico</p>
      </div>
    </>
  );
};

export const BotonesSection = () => {
  return (
    <>
      <h2 className={dashboardSectionClasses.heading}>Sección de Botones</h2>
      <div className={dashboardQuickActionClasses.grid}>
        <button className={dashboardQuickActionClasses.create}>
          <MdAddCircle
            className={`${dashboardQuickActionClasses.icon} text-blue-500`}
          />
          <span className={dashboardQuickActionClasses.label}>Crear Nuevo</span>
        </button>
        <button className={dashboardQuickActionClasses.report}>
          <MdBarChart
            className={`${dashboardQuickActionClasses.icon} text-green-500`}
          />
          <span className={dashboardQuickActionClasses.label}>
            Generar Informe
          </span>
        </button>
        <button className={dashboardQuickActionClasses.settings}>
          <MdSettings
            className={`${dashboardQuickActionClasses.icon} text-yellow-500`}
          />
          <span className={dashboardQuickActionClasses.label}>
            Configuración
          </span>
        </button>
      </div>
    </>
  );
};
