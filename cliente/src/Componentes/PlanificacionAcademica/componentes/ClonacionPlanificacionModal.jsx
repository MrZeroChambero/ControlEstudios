import React, { useState, useEffect, useCallback } from "react";
import { TablaEntradas } from "../../Tablas/Tablas";
import {
  listarPlanificaciones,
  obtenerPlanificacion,
} from "../../../api/planificacionesService";
import { contenidosTableClasses } from "../../Contenidos/contenidosEstilos";
import { PlanificacionCompleta } from "./PlanificacionCompleta";

export const ClonacionPlanificacionModal = ({
  isOpen,
  componenteSeleccionado,
  aulaSeleccionada,
  onClonarCompetencias,
}) => {
  const [planificaciones, setPlanificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarPlanificaciones = useCallback(async () => {
    setIsLoading(true);
    const filtros = {
      fk_componente: componenteSeleccionado,
      fk_aula: aulaSeleccionada,
      estado: "activo",
    };
    const respuesta = await listarPlanificaciones(filtros);
    if (respuesta.success) {
      const payload = respuesta.data;
      const coleccion = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.planificaciones)
        ? payload.planificaciones
        : [];
      // Cargar detalles de cada planificación
      const detallesPromises = coleccion.map((p) => obtenerPlanificacion(p.id));
      const detalles = await Promise.all(detallesPromises);
      const planificacionesCompletas = coleccion.map((p, i) => ({
        ...p,
        competencias: detalles[i].success
          ? detalles[i].data.competencias || []
          : [],
      }));
      setPlanificaciones(planificacionesCompletas);
    } else {
      setPlanificaciones([]);
    }
    setIsLoading(false);
  }, [componenteSeleccionado, aulaSeleccionada]);

  useEffect(() => {
    if (isOpen && componenteSeleccionado && aulaSeleccionada) {
      cargarPlanificaciones();
    }
  }, [isOpen, componenteSeleccionado, aulaSeleccionada, cargarPlanificaciones]);

  const columns = [
    {
      name: "Docente",
      selector: (row) =>
        row.docente || `Docente #${row.fk_personal}` || "Sin docente",
      sortable: true,
    },
  ];

  const competenciaCardClase =
    "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
  const indicadorRowClase =
    "flex items-start justify-between gap-3 p-2 rounded border border-slate-100";

  const alEditarCompetencia = () => {};
  const alEliminarCompetencia = () => {};
  const alRetirarCompetencia = () => {};
  const alEditarIndicador = () => {};
  const alEliminarIndicador = () => {};

  return (
    <TablaEntradas
      columns={columns}
      data={planificaciones}
      isLoading={isLoading}
      Cargar="Cargando planificaciones..."
      dataTableProps={{
        expandableRows: true,
        expandableRowsComponent: ({ data }) => (
          <div className="p-4">
            <PlanificacionCompleta
              competenciasSeleccionadasPorComponente={[
                {
                  clave: data.id,
                  componenteLabel: data.componente || "Componente",
                  competencias: data.competencias || [],
                },
              ]}
              competenciaCardClase={competenciaCardClase}
              indicadorRowClase={indicadorRowClase}
              alEditarCompetencia={alEditarCompetencia}
              alEliminarCompetencia={alEliminarCompetencia}
              alRetirarCompetencia={alRetirarCompetencia}
              alEditarIndicador={alEditarIndicador}
              alEliminarIndicador={alEliminarIndicador}
              accionesCompetenciaDeshabilitadas={true}
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => onClonarCompetencias(data)}
                className={`${contenidosTableClasses.actionButton} ${contenidosTableClasses.editButton}`}
                title="Clonar competencias e indicadores"
              >
                Clonar a mi planificación
              </button>
            </div>
          </div>
        ),
      }}
    />
  );
};
