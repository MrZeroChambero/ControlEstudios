import React from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import {
  indicadoresLayout,
  indicadoresFormClasses,
  indicadoresPrimaryButton,
} from "../indicadoresEstilos";

const layout = indicadoresLayout;
const formClasses = indicadoresFormClasses;

export const IndicadoresEncabezado = ({
  onRecargar,
  onCrear,
  puedeCrear,
  cargando,
}) => (
  <header className={`${layout.header} items-start`}>
    <div>
      <h1 className={layout.title}>Gestión de indicadores</h1>
      <p className={layout.description}>
        Por defecto se muestran todos los indicadores registrados. Use los
        filtros para enfocarse en un área, componente o competencia específicos.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onRecargar}
        className={formClasses.ghostButton}
        disabled={cargando}
      >
        <FaSyncAlt className="h-4 w-4" />
        Recargar
      </button>
      <button
        type="button"
        onClick={onCrear}
        className={indicadoresPrimaryButton}
        disabled={!puedeCrear}
      >
        <FaPlus className="h-4 w-4" />
        Nuevo indicador
      </button>
    </div>
  </header>
);
