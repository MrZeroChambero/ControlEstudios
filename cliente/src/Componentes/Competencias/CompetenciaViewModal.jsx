import React from "react";
import PropTypes from "prop-types";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { competenciasViewModalClasses } from "../EstilosCliente/EstilosClientes";

const getDisplayValue = (value, fallback = "No especificado") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
};

const aspectLabels = {
  ser: "Ser",
  hacer: "Hacer",
  conocer: "Conocer",
  convivir: "Convivir",
};

const Section = ({ title, children }) => (
  <section className={competenciasViewModalClasses.section.wrapper}>
    <h3 className={competenciasViewModalClasses.section.title}>{title}</h3>
    <div className={competenciasViewModalClasses.section.body}>{children}</div>
  </section>
);

const Field = ({ label, value, children }) => (
  <div className={competenciasViewModalClasses.field}>
    <span className={competenciasViewModalClasses.label}>{label}</span>
    <div className={competenciasViewModalClasses.valueBox}>
      {children ?? value}
    </div>
  </div>
);

export const CompetenciaViewModal = ({
  isOpen,
  onClose,
  competencia,
  indicadores = [],
  isLoading = false,
}) => {
  if (!isOpen || !competencia) {
    return null;
  }

  const areaNombre = competencia?.area?.nombre ?? competencia?.area ?? null;
  const componenteNombre =
    competencia?.componente?.nombre ?? competencia?.componente ?? null;

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={competencia.nombre_competencia || "Detalle de competencia"}
      subtitle={componenteNombre || areaNombre || undefined}
      size="xl"
      bodyClassName={competenciasViewModalClasses.bodyLayout}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={competenciasViewModalClasses.footerButton}
        >
          Cerrar
        </button>
      }
    >
      <>
        <Section title="Resumen general">
          <Field label="Área" value={getDisplayValue(areaNombre)} />
          <Field label="Componente" value={getDisplayValue(componenteNombre)} />
          <Field
            label="Indicadores asociados"
            value={getDisplayValue(indicadores.length, "Sin indicadores")}
          />
        </Section>

        <Section title="Descripción">
          <div className="md:col-span-2">
            <div className={competenciasViewModalClasses.descriptionBox}>
              {getDisplayValue(
                competencia.descripcion_competencia,
                "Sin descripción registrada"
              )}
            </div>
          </div>
        </Section>

        <Section title="Indicadores asociados">
          <div className="md:col-span-2">
            {isLoading ? (
              <div className={competenciasViewModalClasses.empty}>
                Cargando indicadores...
              </div>
            ) : indicadores.length > 0 ? (
              <div className={competenciasViewModalClasses.indicators.wrapper}>
                {indicadores.map((indicador) => (
                  <article
                    key={`${indicador.id_indicador}-${indicador.nombre_indicador}`}
                    className={competenciasViewModalClasses.indicators.item}
                  >
                    <header className="flex flex-wrap items-start justify-between gap-2">
                      <h4
                        className={
                          competenciasViewModalClasses.indicators.title
                        }
                      >
                        {indicador.nombre_indicador}
                      </h4>
                      <span className={competenciasViewModalClasses.pill}>
                        {aspectLabels[indicador.aspecto] ||
                          indicador.aspecto ||
                          "Aspecto sin definir"}
                      </span>
                    </header>
                    <p className={competenciasViewModalClasses.indicators.meta}>
                      Orden: {getDisplayValue(indicador.orden, "No asignado")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className={competenciasViewModalClasses.empty}>
                No hay indicadores registrados para esta competencia.
              </div>
            )}
          </div>
        </Section>
      </>
    </VentanaModal>
  );
};

CompetenciaViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  competencia: PropTypes.object,
  indicadores: PropTypes.array,
  isLoading: PropTypes.bool,
};
