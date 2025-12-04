import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  obtenerAreasSelect,
  obtenerComponentesSelect,
  obtenerCompetencias,
} from "../competenciasService";

const initialFilters = {
  areaId: "",
  componenteId: "",
};

const parseFilterId = (valor) => {
  if (!valor) {
    return undefined;
  }

  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
};

export const useCompetenciasData = () => {
  const [areas, setAreas] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    try {
      const [areasData, componentesData] = await Promise.all([
        obtenerAreasSelect(),
        obtenerComponentesSelect(),
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

  const fetchCompetencias = useCallback(
    async (overrideFilters = filters) => {
      try {
        setIsLoading(true);
        const registros = await obtenerCompetencias({
          areaId: parseFilterId(overrideFilters.areaId),
          componenteId: parseFilterId(overrideFilters.componenteId),
        });
        setCompetencias(registros);
      } catch (error) {
        Swal.fire("Aviso", error.message, "warning");
        setCompetencias([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchCompetencias(filters);
  }, [filters, fetchCompetencias]);

  const applyFilters = useCallback((nuevosFiltros) => {
    setFilters((prev) => ({
      ...prev,
      areaId: nuevosFiltros.areaId ?? "",
      componenteId: nuevosFiltros.componenteId ?? "",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const selectedArea = useMemo(() => {
    if (!filters.areaId) {
      return null;
    }
    return (
      areas.find(
        (area) => area.id?.toString() === filters.areaId?.toString()
      ) ?? null
    );
  }, [areas, filters.areaId]);

  const selectedComponent = useMemo(() => {
    if (!filters.componenteId) {
      return null;
    }
    return (
      componentes.find(
        (item) => item.id?.toString() === filters.componenteId?.toString()
      ) ?? null
    );
  }, [componentes, filters.componenteId]);

  const hasFilters = Boolean(filters.areaId || filters.componenteId);

  const reloadCompetencias = useCallback(() => {
    return fetchCompetencias(filters);
  }, [fetchCompetencias, filters]);

  return {
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
  };
};
