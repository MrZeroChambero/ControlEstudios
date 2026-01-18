import React, { useState, useEffect, useMemo } from "react";
import { FaFilePdf } from "react-icons/fa";
import FiltrosDocente from "./componentes/FiltrosDocente";
import TablaHorarioSemanal from "./componentes/TablaHorarioSemanal";
import { getHorarios, getCatalogos } from "../../api/horariosService";
import { exportarHorarioSemanal } from "../../utilidades/exportadorPDF";
import { useAuth } from "../../hooks/useAuth";
import { BLOQUES_HORARIO_BASE as bloquesConfig } from "./config/bloquesHorario";

const VistaHorarioDocente = () => {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState([]);
  const [catalogos, setCatalogos] = useState({
    anios: [],
    momentos: [],
    aulas: [],
  });
  const [filtros, setFiltros] = useState({
    fk_anio_escolar: "",
    fk_momento: "",
    fk_aula: "",
  });
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [error, setError] = useState(null);

  // Cargar catálogos iniciales
  useEffect(() => {
    setCargandoCatalogos(true);
    getCatalogos()
      .then((res) => {
        const anioActivo = res.datos.anios.find((a) => a.estado === "activo");
        setCatalogos(res.datos);
        if (anioActivo) {
          setFiltros((f) => ({ ...f, fk_anio_escolar: anioActivo.id }));
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar los filtros.");
      })
      .finally(() => setCargandoCatalogos(false));
  }, []);

  // Cargar horarios cuando cambien los filtros
  useEffect(() => {
    // El backend filtra por docente, así que no es necesario pasar fk_personal
    if (!filtros.fk_anio_escolar) {
      setHorarios([]);
      return;
    }

    setCargandoHorarios(true);
    setError(null);
    getHorarios(filtros)
      .then((res) => {
        setHorarios(res.datos);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar los horarios.");
      })
      .finally(() => setCargandoHorarios(false));
  }, [filtros]);

  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const handleExportar = () => {
    const titulo = "Mi Horario Semanal";
    const subtitulo = user ? user.nombre_usuario : "Docente";
    exportarHorarioSemanal(titulo, subtitulo, horarios);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mi Horario</h1>
          <p className="text-sm text-slate-500">
            Aquí puedes ver todos los bloques de clase que tienes asignados.
            Utiliza los filtros para refinar tu búsqueda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportar}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60"
          disabled={horarios.length === 0}
        >
          <FaFilePdf />
          <span>Exportar a PDF</span>
        </button>
      </header>

      <FiltrosDocente
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        catalogos={catalogos}
        cargando={cargandoCatalogos}
      />

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">
          Agenda Semanal
        </h3>
        {cargandoHorarios ? (
          <p>Cargando horario...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <TablaHorarioSemanal
            bloques={horarios}
            bloquesConfig={bloquesConfig}
            emptyMessage="No tienes bloques académicos asignados según los filtros seleccionados."
            // renderAcciones={...} // Se definirá más adelante si el docente puede editar
          />
        )}
      </div>
    </div>
  );
};

export default VistaHorarioDocente;
