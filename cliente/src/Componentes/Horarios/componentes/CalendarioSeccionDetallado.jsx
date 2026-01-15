import React from "react";
import TablaHorarioSemanal from "./TablaHorarioSemanal";
import TablaDocentesSeccion from "./TablaDocentesSeccion";

const buildMetaItems = (seccion) => [
  {
    label: "Grado",
    value: seccion?.grado ?? "N/D",
  },
  {
    label: "Sección",
    value: seccion?.seccion ?? "N/D",
  },
  {
    label: "Momento",
    value: seccion?.momento ?? "Sin momento",
  },
  {
    label: "Año escolar",
    value: seccion?.anioEscolar ?? "N/D",
  },
];

const CalendarioSeccionDetallado = ({
  seccion,
  mostrarDocentes = true,
  emptyMessage = "Sin bloques programados para esta sección.",
}) => {
  if (!seccion) {
    return (
      <p className="text-sm text-slate-500">
        Selecciona una sección para visualizar su calendario.
      </p>
    );
  }

  const metaItems = buildMetaItems(seccion);
  const bloques = seccion.horarios || [];
  const bloquesFijos = seccion.bloquesFijos || [];

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {metaItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {item.label}:
              </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <TablaHorarioSemanal
        bloques={bloques}
        bloquesFijos={bloquesFijos}
        emptyMessage={emptyMessage}
      />

      {mostrarDocentes ? (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">
            Docentes y especialistas asignados
          </h4>
          <TablaDocentesSeccion bloques={bloques} />
        </section>
      ) : null}
    </div>
  );
};

export default CalendarioSeccionDetallado;
