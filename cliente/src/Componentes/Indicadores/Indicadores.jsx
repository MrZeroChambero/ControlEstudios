import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { indicadoresLayout } from "./indicadoresEstilos";
import { IndicadorFormModal } from "../Competencias/IndicadorFormModal";
import { IndicadorViewModal } from "./IndicadorViewModal";
import { IndicadoresEncabezado } from "./componentes/IndicadoresEncabezado";
import { IndicadoresFiltros } from "./componentes/IndicadoresFiltros";
import { IndicadoresTabla } from "./componentes/IndicadoresTabla";
import {
  solicitarAreasIndicadores,
  solicitarComponentesIndicadores,
  solicitarCompetenciasIndicadores,
  registrarIndicador,
  actualizarIndicadorExistente,
  eliminarIndicadorPorId,
  actualizarVisibilidadIndicadorPorId,
} from "./solicitudesIndicadores";

const layout = indicadoresLayout;

export const Indicadores = () => {
  const [areas, setAreas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [competencias, setCompetencias] = useState([]);

  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [componenteSeleccionado, setComponenteSeleccionado] = useState("");
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState("");

  const [isLoadingCompetencias, setIsLoadingCompetencias] = useState(false);

  const [modalIndicador, setModalIndicador] = useState({
    abierto: false,
    modo: "crear",
    indicador: null,
  });

  const [modalVerIndicador, setModalVerIndicador] = useState({
    abierto: false,
    indicador: null,
  });

  const cargarCatalogos = useCallback(async () => {
    try {
      const [areasData, componentesData] = await Promise.all([
        solicitarAreasIndicadores(),
        solicitarComponentesIndicadores(),
      ]);
      setAreas(areasData);
      setComponentes(componentesData);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const cargarCompetenciasDisponibles = useCallback(
    async (areaId, componenteId) => {
      setIsLoadingCompetencias(true);
      try {
        const registros = await solicitarCompetenciasIndicadores({
          areaId: areaId ? parseInt(areaId, 10) : undefined,
          componenteId: componenteId ? parseInt(componenteId, 10) : undefined,
        });
        setCompetencias(registros);

        if (
          competenciaSeleccionada &&
          !registros.some(
            (comp) =>
              comp.id_competencia?.toString() ===
              competenciaSeleccionada?.toString()
          )
        ) {
          setCompetenciaSeleccionada("");
        }
      } catch (error) {
        Swal.fire("Aviso", error.message, "warning");
        setCompetencias([]);
        setCompetenciaSeleccionada("");
      } finally {
        setIsLoadingCompetencias(false);
      }
    },
    [competenciaSeleccionada]
  );

  useEffect(() => {
    cargarCompetenciasDisponibles(areaSeleccionada, componenteSeleccionado);
  }, [areaSeleccionada, componenteSeleccionado, cargarCompetenciasDisponibles]);

  const componentesFiltrados = useMemo(() => {
    if (!areaSeleccionada) {
      return componentes;
    }
    return componentes.filter(
      (item) => item.fk_area?.toString() === areaSeleccionada.toString()
    );
  }, [componentes, areaSeleccionada]);

  const indicadoresDisponibles = useMemo(() => {
    return competencias.flatMap((competencia) => {
      const lista = Array.isArray(competencia.indicadores)
        ? competencia.indicadores
        : [];
      return lista.map((indicador) => ({
        ...indicador,
        competencia: {
          id: competencia.id_competencia,
          nombre: competencia.nombre_competencia,
        },
        componente: competencia.componente,
        area: competencia.area,
      }));
    });
  }, [competencias]);

  const indicadoresFiltrados = useMemo(() => {
    let registros = indicadoresDisponibles;

    if (areaSeleccionada) {
      registros = registros.filter(
        (item) => item.area?.id?.toString() === areaSeleccionada.toString()
      );
    }

    if (componenteSeleccionado) {
      registros = registros.filter(
        (item) =>
          item.componente?.id?.toString() === componenteSeleccionado.toString()
      );
    }

    if (competenciaSeleccionada) {
      registros = registros.filter(
        (item) =>
          item.competencia?.id?.toString() ===
          competenciaSeleccionada.toString()
      );
    }

    return registros;
  }, [
    indicadoresDisponibles,
    areaSeleccionada,
    componenteSeleccionado,
    competenciaSeleccionada,
  ]);

  const manejarCambioArea = (valor) => {
    setAreaSeleccionada(valor);
    setComponenteSeleccionado("");
    setCompetenciaSeleccionada("");
  };

  const manejarCambioComponente = (valor) => {
    setComponenteSeleccionado(valor);
    setCompetenciaSeleccionada("");
  };

  const manejarCambioCompetencia = (valor) => {
    setCompetenciaSeleccionada(valor);
  };

  const puedeCrearIndicador = Boolean(competenciaSeleccionada);

  const abrirModalCrear = () => {
    setModalIndicador({ abierto: true, modo: "crear", indicador: null });
  };

  const abrirModalEditar = useCallback((indicador) => {
    setModalIndicador({ abierto: true, modo: "editar", indicador });
  }, []);

  const cerrarModalIndicador = useCallback(() => {
    setModalIndicador({ abierto: false, modo: "crear", indicador: null });
  }, []);

  const abrirModalVerIndicador = useCallback((indicador) => {
    setModalVerIndicador({ abierto: true, indicador });
  }, []);

  const cerrarModalVerIndicador = useCallback(() => {
    setModalVerIndicador({ abierto: false, indicador: null });
  }, []);

  const recargarIndicadores = useCallback(async () => {
    await cargarCompetenciasDisponibles(
      areaSeleccionada,
      componenteSeleccionado
    );
  }, [areaSeleccionada, componenteSeleccionado, cargarCompetenciasDisponibles]);

  const manejarCrearIndicador = async (datos) => {
    if (!competenciaSeleccionada) {
      Swal.fire(
        "Aviso",
        "Seleccione una competencia antes de registrar un indicador.",
        "info"
      );
      return;
    }

    const payload = {
      ...datos,
      fk_competencia: parseInt(competenciaSeleccionada, 10),
    };

    try {
      await registrarIndicador(payload);
      Swal.fire("Hecho", "Indicador registrado correctamente.", "success");
      cerrarModalIndicador();
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
      await actualizarIndicadorExistente(indicador.id_indicador, datos);
      Swal.fire("Hecho", "Indicador actualizado correctamente.", "success");
      cerrarModalIndicador();
      await recargarIndicadores();
    } catch (error) {
      if (error?.validation) {
        throw error;
      }
      Swal.fire("Error", error.message, "error");
      throw error;
    }
  };

  const manejarEliminarIndicador = useCallback(
    async (indicador) => {
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
        await eliminarIndicadorPorId(indicador.id_indicador);
        Swal.fire("Hecho", "Indicador eliminado correctamente.", "success");
        await recargarIndicadores();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    },
    [recargarIndicadores]
  );

  const manejarToggleIndicador = useCallback(
    async (indicador) => {
      try {
        const nuevoEstado = indicador.ocultar === "si" ? "no" : "si";
        await actualizarVisibilidadIndicadorPorId(
          indicador.id_indicador,
          nuevoEstado
        );
        Swal.fire("Hecho", "Visibilidad actualizada.", "success");
        await recargarIndicadores();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    },
    [recargarIndicadores]
  );

  const competenciaActual = useMemo(() => {
    return competencias.find(
      (item) =>
        item.id_competencia?.toString() === competenciaSeleccionada?.toString()
    );
  }, [competencias, competenciaSeleccionada]);

  return (
    <section className="p-6">
      <div className={layout.container}>
        <IndicadoresEncabezado
          onRecargar={recargarIndicadores}
          onCrear={abrirModalCrear}
          puedeCrear={puedeCrearIndicador}
          cargando={isLoadingCompetencias}
        />

        <IndicadoresFiltros
          areas={areas}
          componentes={componentesFiltrados}
          competencias={competencias}
          areaSeleccionada={areaSeleccionada}
          componenteSeleccionado={componenteSeleccionado}
          competenciaSeleccionada={competenciaSeleccionada}
          onAreaChange={manejarCambioArea}
          onComponenteChange={manejarCambioComponente}
          onCompetenciaChange={manejarCambioCompetencia}
        />

        <IndicadoresTabla
          indicadores={indicadoresFiltrados}
          estaCargando={isLoadingCompetencias}
          onVerIndicador={abrirModalVerIndicador}
          onEditarIndicador={abrirModalEditar}
          onEliminarIndicador={manejarEliminarIndicador}
          onToggleIndicador={manejarToggleIndicador}
        />
      </div>

      <IndicadorFormModal
        isOpen={modalIndicador.abierto}
        onClose={cerrarModalIndicador}
        onSubmit={async (datos) => {
          if (modalIndicador.modo === "editar" && modalIndicador.indicador) {
            await manejarActualizarIndicador(modalIndicador.indicador, datos);
          } else {
            await manejarCrearIndicador(datos);
          }
        }}
        modo={modalIndicador.modo}
        indicador={modalIndicador.indicador}
        competencia={competenciaActual}
      />

      <IndicadorViewModal
        isOpen={modalVerIndicador.abierto}
        onClose={cerrarModalVerIndicador}
        indicador={modalVerIndicador.indicador}
      />
    </section>
  );
};
