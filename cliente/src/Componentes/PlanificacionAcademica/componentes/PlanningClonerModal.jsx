import React, { useState, useEffect } from "react";
import PlanificationCard from "./PlanificationCard";
import { listarPlanificaciones } from "../../../api/planificacionesService";

const PlanningClonerModal = ({
  isOpen,
  onClose,
  currentTeacherId,
  selectedComponent,
  selectedClassroom,
  selectedMoment,
  onClonePlanification,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTeacherPlans, setCurrentTeacherPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState({ current: false, all: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    if (!isOpen || !currentTeacherId || !selectedComponent) return;
    const loadCurrentTeacherPlans = async () => {
      setLoading((p) => ({ ...p, current: true }));
      try {
        const response = await listarPlanificaciones({
          fk_personal: currentTeacherId,
          fk_componente: selectedComponent,
          fk_aula: selectedClassroom,
          fk_momento: selectedMoment,
          estado: "activo",
          expandir: "competencias,indicadores",
        });
        if (response.success) {
          const list = Array.isArray(response.data)
            ? response.data
            : response.data?.planificaciones || [];
          setCurrentTeacherPlans(
            list.map((p) => ({
              ...p,
              docenteNombre:
                p.docente?.nombre_completo ||
                p.docente?.label ||
                p.docente?.nombre ||
                `Docente #${p.fk_personal}`,
              competencias: p.competencias || [],
            }))
          );
        }
      } catch (err) {
        console.error("Error cargando planificaciones del docente:", err);
      } finally {
        setLoading((p) => ({ ...p, current: false }));
      }
    };
    loadCurrentTeacherPlans();
  }, [
    isOpen,
    currentTeacherId,
    selectedComponent,
    selectedClassroom,
    selectedMoment,
  ]);

  useEffect(() => {
    if (!isOpen || !selectedComponent || activeTab !== 1) return;
    const loadAllPlans = async () => {
      setLoading((p) => ({ ...p, all: true }));
      try {
        const response = await listarPlanificaciones({
          fk_componente: selectedComponent,
          fk_aula: selectedClassroom,
          fk_momento: selectedMoment,
          estado: "activo",
          expandir: "competencias,indicadores,docente",
        });
        if (response.success) {
          const list = Array.isArray(response.data)
            ? response.data
            : response.data?.planificaciones || [];
          const filtered = list
            .map((p) => ({
              ...p,
              docenteNombre:
                p.docente?.nombre_completo ||
                p.docente?.label ||
                p.docente?.nombre ||
                `Docente #${p.fk_personal}`,
              competencias: p.competencias || [],
            }))
            .filter((p) => String(p.fk_personal) !== String(currentTeacherId));
          setAllPlans(filtered);
        }
      } catch (err) {
        console.error("Error cargando todas las planificaciones:", err);
      } finally {
        setLoading((p) => ({ ...p, all: false }));
      }
    };
    loadAllPlans();
  }, [
    isOpen,
    selectedComponent,
    selectedClassroom,
    selectedMoment,
    activeTab,
    currentTeacherId,
  ]);

  const handleClone = (planification) => {
    const competenciasClonadas =
      (planification.competencias || []).map((comp) => ({
        id: comp.id,
        nombre: comp.nombre,
        descripcion: comp.descripcion,
        indicadores: (comp.indicadores || []).map((ind) => ({
          id: ind.id,
          nombre: ind.nombre,
          aspecto: ind.aspecto,
        })),
      })) || [];
    onClonePlanification && onClonePlanification(competenciasClonadas);
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Planificaciones disponibles
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Componente:{" "}
                {selectedComponent?.nombre || `#${selectedComponent}`}
                {selectedClassroom && ` • Aula: ${selectedClassroom}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="px-6 pt-4">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 0
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              }`}
              onClick={() => setActiveTab(0)}
            >
              Mis planificaciones ({currentTeacherPlans.length})
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 1
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              }`}
              onClick={() => setActiveTab(1)}
            >
              Clonar de otros ({allPlans.length})
            </button>
            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar docente o competencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 border rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="individual">Individual</option>
                <option value="aula">Aula completa</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border rounded-lg text-sm"
              >
                <option value="recent">Más recientes</option>
                <option value="competences">Por # competencias</option>
              </select>
              <button
                onClick={() => {
                  // simple reload: toggle activeTab to trigger effects or call loaders
                  if (activeTab === 0) {
                    // reload current teacher plans
                    (async () => {
                      setLoading((p) => ({ ...p, current: true }));
                      try {
                        const response = await listarPlanificaciones({
                          fk_personal: currentTeacherId,
                          fk_componente: selectedComponent,
                          fk_aula: selectedClassroom,
                          fk_momento: selectedMoment,
                          estado: "activo",
                          expandir: "competencias,indicadores",
                        });
                        if (response.success) {
                          const list = Array.isArray(response.data)
                            ? response.data
                            : response.data?.planificaciones || [];
                          setCurrentTeacherPlans(
                            list.map((p) => ({
                              ...p,
                              docenteNombre:
                                p.docente?.nombre_completo ||
                                p.docente?.label ||
                                p.docente?.nombre ||
                                `Docente #${p.fk_personal}`,
                              competencias: p.competencias || [],
                            }))
                          );
                        }
                      } catch (err) {
                        console.error(
                          "Error recargando planificaciones del docente:",
                          err
                        );
                      } finally {
                        setLoading((p) => ({ ...p, current: false }));
                      }
                    })();
                  } else {
                    // reload all plans
                    (async () => {
                      setLoading((p) => ({ ...p, all: true }));
                      try {
                        const response = await listarPlanificaciones({
                          fk_componente: selectedComponent,
                          fk_aula: selectedClassroom,
                          fk_momento: selectedMoment,
                          estado: "activo",
                          expandir: "competencias,indicadores,docente",
                        });
                        if (response.success) {
                          const list = Array.isArray(response.data)
                            ? response.data
                            : response.data?.planificaciones || [];
                          const filtered = list
                            .map((p) => ({
                              ...p,
                              docenteNombre:
                                p.docente?.nombre_completo ||
                                p.docente?.label ||
                                p.docente?.nombre ||
                                `Docente #${p.fk_personal}`,
                              competencias: p.competencias || [],
                            }))
                            .filter(
                              (p) =>
                                String(p.fk_personal) !==
                                String(currentTeacherId)
                            );
                          setAllPlans(filtered);
                        }
                      } catch (err) {
                        console.error(
                          "Error recargando todas las planificaciones:",
                          err
                        );
                      } finally {
                        setLoading((p) => ({ ...p, all: false }));
                      }
                    })();
                  }
                }}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="mt-2">
            {activeTab === 0 ? (
              loading.current ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-2 text-gray-600">
                    Cargando tus planificaciones...
                  </p>
                </div>
              ) : currentTeacherPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No tienes planificaciones registradas para este componente.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Crear primera planificación
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {(() => {
                    const base = currentTeacherPlans || [];
                    const filtered = base.filter((plan) => {
                      const term = searchTerm.trim().toLowerCase();
                      const matchesSearch =
                        !term ||
                        (plan.docenteNombre || "")
                          .toLowerCase()
                          .includes(term) ||
                        (Array.isArray(plan.competencias) &&
                          plan.competencias.some((c) =>
                            (c.nombre || "").toLowerCase().includes(term)
                          ));
                      const matchesFilter =
                        filterType === "all" ||
                        (filterType === "individual" &&
                          plan.tipo === "individual") ||
                        (filterType === "aula" && plan.tipo === "aula");
                      return matchesSearch && matchesFilter;
                    });

                    const sorted = filtered.slice().sort((a, b) => {
                      if (sortBy === "recent") {
                        const ta = new Date(
                          a.created_at ||
                            a.raw?.created_at ||
                            a.raw?.createdAt ||
                            0
                        ).getTime();
                        const tb = new Date(
                          b.created_at ||
                            b.raw?.created_at ||
                            b.raw?.createdAt ||
                            0
                        ).getTime();
                        return tb - ta;
                      }
                      if (sortBy === "competences") {
                        return (
                          (b.competencias?.length || 0) -
                          (a.competencias?.length || 0)
                        );
                      }
                      return 0;
                    });

                    return sorted.map((plan) => (
                      <PlanificationCard
                        key={plan.id ?? plan.id_planificacion}
                        planificacion={plan}
                        isCurrentTeacher={true}
                        onView={() => {}}
                        onClone={handleClone}
                      />
                    ));
                  })()}
                </div>
              )
            ) : loading.all ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-600">
                  Buscando planificaciones disponibles...
                </p>
              </div>
            ) : allPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hay planificaciones de otros docentes disponibles para
                  clonar.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {(() => {
                  const base = allPlans || [];
                  const filtered = base.filter((plan) => {
                    const term = searchTerm.trim().toLowerCase();
                    const matchesSearch =
                      !term ||
                      (plan.docenteNombre || "").toLowerCase().includes(term) ||
                      (Array.isArray(plan.competencias) &&
                        plan.competencias.some((c) =>
                          (c.nombre || "").toLowerCase().includes(term)
                        ));
                    const matchesFilter =
                      filterType === "all" ||
                      (filterType === "individual" &&
                        plan.tipo === "individual") ||
                      (filterType === "aula" && plan.tipo === "aula");
                    return matchesSearch && matchesFilter;
                  });

                  const sorted = filtered.slice().sort((a, b) => {
                    if (sortBy === "recent") {
                      const ta = new Date(
                        a.created_at ||
                          a.raw?.created_at ||
                          a.raw?.createdAt ||
                          0
                      ).getTime();
                      const tb = new Date(
                        b.created_at ||
                          b.raw?.created_at ||
                          b.raw?.createdAt ||
                          0
                      ).getTime();
                      return tb - ta;
                    }
                    if (sortBy === "competences") {
                      return (
                        (b.competencias?.length || 0) -
                        (a.competencias?.length || 0)
                      );
                    }
                    return 0;
                  });

                  return sorted.map((plan) => (
                    <PlanificationCard
                      key={plan.id ?? plan.id_planificacion}
                      planificacion={plan}
                      isCurrentTeacher={false}
                      onView={() => {}}
                      onClone={handleClone}
                    />
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningClonerModal;
