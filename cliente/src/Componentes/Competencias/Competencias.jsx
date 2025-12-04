import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  contenidosLayout,
  contenidosFormClasses,
} from "../EstilosCliente/EstilosClientes";
import { CompetenciasTable } from "./CompetenciasTable";
import { CompetenciaFormModal } from "./CompetenciaFormModal";
import { IndicadoresModal } from "./IndicadoresModal";
import { CompetenciasFilterModal } from "./CompetenciasFilterModal";
import { useCompetenciasData } from "./hooks/useCompetenciasData";
import {
  crearCompetencia,
  actualizarCompetencia,
  eliminarCompetencia,
  obtenerIndicadoresPorCompetencia,
  crearIndicador,
  actualizarIndicador,
  eliminarIndicador,
  actualizarVisibilidadIndicador,
} from "./competenciasService";

const layout = contenidosLayout;

export const Competencias = () => {
  const {
    areas,
    componentes,
    competencias,
    isLoading,
    filters,
    applyFilters,
    resetFilters,
    hasFilters,
    selectedArea,
    selectedComponent,
    reloadCompetencias,
  } = useCompetenciasData();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [modalCompetencia, setModalCompetencia] = useState({
    abierto: false,
    modo: "crear",
    dato: null,
  });

  const [modalIndicadores, setModalIndicadores] = useState({
    abierto: false,
    competencia: null,
    indicadores: [],
    cargando: false,
  });

  const abrirModalCompetencia = (modo = "crear", dato = null) => {
    setModalCompetencia({ abierto: true, modo, dato });
  };

  const cerrarModalCompetencia = () => {
    setModalCompetencia({ abierto: false, modo: "crear", dato: null });
  };

  const manejarSubmitCompetencia = async (formData) => {
    const payload = {
      fk_componente: formData.fk_componente,
      nombre_competencia: formData.nombre_competencia,
      descripcion_competencia: formData.descripcion_competencia,
    };

    try {
      if (modalCompetencia.modo === "editar" && modalCompetencia.dato) {
        await actualizarCompetencia(
          modalCompetencia.dato.id_competencia,
          payload
        );
        Swal.fire("Hecho", "Competencia actualizada correctamente.", "success");
      } else {
        await crearCompetencia(payload);
        Swal.fire("Hecho", "Competencia registrada correctamente.", "success");
      }

      await reloadCompetencias();
    } catch (error) {
      if (!error?.validation) {
        Swal.fire(
          "Error",
          error.message ?? "Ocurrio un error inesperado.",
          "error"
        );
      }
      throw error;
    }
  };

  const manejarEliminarCompetencia = async (competencia) => {
    const confirmacion = await Swal.fire({
      title: "¿Desea eliminar la competencia?",
      text: "Se eliminaran tambien los indicadores asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await eliminarCompetencia(competencia.id_competencia);
      Swal.fire("Hecho", "Competencia eliminada correctamente.", "success");
      await reloadCompetencias();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const abrirIndicadores = async (competencia) => {
    setModalIndicadores({
      abierto: true,
      competencia,
      indicadores: [],
      cargando: true,
    });

    try {
      const respuesta = await obtenerIndicadoresPorCompetencia(
        competencia.id_competencia
      );
      setModalIndicadores({
        abierto: true,
        competencia,
        indicadores: respuesta.indicadores,
        cargando: false,
      });
    } catch (error) {
      Swal.fire("Aviso", error.message, "warning");
      setModalIndicadores({
        abierto: true,
        competencia,
        indicadores: [],
        cargando: false,
      });
    }
  };

  const cerrarIndicadores = () => {
    setModalIndicadores({
      abierto: false,
      competencia: null,
      indicadores: [],
      cargando: false,
    });
  };

  const manejarCrearIndicador = async (datos) => {
    try {
      await crearIndicador({
        ...datos,
        fk_competencia:
          modalIndicadores.competencia?.id_competencia || datos.fk_competencia,
      });
      Swal.fire("Hecho", "Indicador registrado correctamente.", "success");
      await recargarIndicadores();
    } catch (error) {
      if (error?.validation) {
        throw error;
      }
      Swal.fire("Error", error.message, "error");
      throw error;
    }
  };

  const manejarActualizarIndicador = async (indicador, datos) => {
    try {
      await actualizarIndicador(indicador.id_indicador, datos);
      Swal.fire("Hecho", "Indicador actualizado correctamente.", "success");
      await recargarIndicadores();
    } catch (error) {
      if (error?.validation) {
        throw error;
      }
      Swal.fire("Error", error.message, "error");
      throw error;
    }
  };

  const manejarEliminarIndicador = async (indicador) => {
    const confirmacion = await Swal.fire({
      title: "¿Desea eliminar el indicador?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await eliminarIndicador(indicador.id_indicador);
      Swal.fire("Hecho", "Indicador eliminado correctamente.", "success");
      await recargarIndicadores();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const manejarToggleIndicador = async (indicador) => {
    try {
      const nuevoEstado = indicador.ocultar === "si" ? "no" : "si";
      await actualizarVisibilidadIndicador(indicador.id_indicador, nuevoEstado);
      Swal.fire("Hecho", "Visibilidad actualizada.", "success");
      await recargarIndicadores();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const recargarIndicadores = async () => {
    if (!modalIndicadores.competencia) {
      return;
    }

    try {
      const respuesta = await obtenerIndicadoresPorCompetencia(
        modalIndicadores.competencia.id_competencia
      );
      setModalIndicadores((prev) => ({
        ...prev,
        indicadores: respuesta.indicadores,
      }));
      await reloadCompetencias();
    } catch (error) {
      Swal.fire("Aviso", error.message, "warning");
      setModalIndicadores((prev) => ({ ...prev, indicadores: [] }));
    }
  };

  const filtroAreaLabel = selectedArea
    ? selectedArea.nombre
    : "Todas las areas";
  const filtroComponenteLabel = selectedComponent
    ? selectedComponent.nombre
    : "Todos los componentes";

  return (
    <section className="p-6">
      <div className={layout.container}>
        <header className={layout.header}>
          <div>
            <h1 className={layout.title}>Gestion de competencias</h1>
            <p className={layout.description}>
              Seleccione un area y un componente para administrar las
              competencias disponibles. Las competencias se registran como
              reutilizables de forma predeterminada.
            </p>
          </div>
          <button
            type="button"
            onClick={() => abrirModalCompetencia("crear", null)}
            className={layout.addButton}
          >
            <FaPlus className="h-4 w-4" />
            <span>Agregar competencia</span>
          </button>
        </header>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={contenidosFormClasses.ghostButton}
            >
              Abrir filtros
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className={contenidosFormClasses.ghostButton}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
              <span className="font-semibold text-slate-700">Area:</span>
              {filtroAreaLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
              <span className="font-semibold text-slate-700">Componente:</span>
              {filtroComponenteLabel}
            </span>
          </div>
        </div>

        <CompetenciasTable
          competencias={competencias}
          isLoading={isLoading}
          onEdit={(dato) => abrirModalCompetencia("editar", dato)}
          onDelete={manejarEliminarCompetencia}
          onViewIndicators={abrirIndicadores}
        />
      </div>

      <CompetenciaFormModal
        isOpen={modalCompetencia.abierto}
        onClose={cerrarModalCompetencia}
        onSubmit={manejarSubmitCompetencia}
        modo={modalCompetencia.modo}
        datos={modalCompetencia.dato}
        areas={areas}
        componentes={componentes}
        defaultAreaId={filters.areaId}
      />

      <CompetenciasFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={applyFilters}
        areas={areas}
        componentes={componentes}
        filters={filters}
      />

      <IndicadoresModal
        isOpen={modalIndicadores.abierto}
        onClose={cerrarIndicadores}
        competencia={modalIndicadores.competencia}
        indicadores={modalIndicadores.indicadores}
        isLoading={modalIndicadores.cargando}
        onCrearIndicador={manejarCrearIndicador}
        onActualizarIndicador={manejarActualizarIndicador}
        onEliminarIndicador={manejarEliminarIndicador}
        onToggleOcultar={manejarToggleIndicador}
      />
    </section>
  );
};
