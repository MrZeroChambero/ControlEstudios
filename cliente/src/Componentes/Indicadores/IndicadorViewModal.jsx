import React from "react";
import PropTypes from "prop-types";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { indicadoresViewModalClasses } from "../EstilosCliente/EstilosClientes";

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
  <section className={indicadoresViewModalClasses.section.wrapper}>
    <h3 className={indicadoresViewModalClasses.section.title}>{title}</h3>
    <div className={indicadoresViewModalClasses.section.body}>{children}</div>
  </section>
);

const Field = ({ label, value, children }) => (
  <div className={indicadoresViewModalClasses.field}>
    <span className={indicadoresViewModalClasses.label}>{label}</span>
    <div className={indicadoresViewModalClasses.valueBox}>
      {children ?? value}
    </div>
  </div>
);

export const IndicadorViewModal = ({ isOpen, onClose, indicador }) => {
  if (!isOpen || !indicador) {
    return null;
  }

  const aspectoEtiqueta = aspectLabels[indicador.aspecto] || indicador.aspecto;
  const visible = indicador.ocultar === "si" ? "Oculto" : "Visible";
  const visibilityTagClass =
    indicador.ocultar === "si"
      ? indicadoresViewModalClasses.warnTag
      : indicadoresViewModalClasses.highlightTag;

  const competenciaNombre =
    indicador?.competencia?.nombre ||
    indicador?.competencia?.nombre_competencia ||
    indicador?.competencia ||
    "No especificado";

  const componenteNombre =
    indicador?.componente?.nombre || indicador?.componente || "No especificado";

  const areaNombre =
    indicador?.area?.nombre || indicador?.area || "No especificado";

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={indicador.nombre_indicador || "Detalle del indicador"}
      subtitle={`Competencia: ${competenciaNombre}`}
      size="lg"
      bodyClassName={indicadoresViewModalClasses.bodyLayout}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={indicadoresViewModalClasses.footerButton}
        >
          Cerrar
        </button>
      }
    >
      <>
        <Section title="Resumen del indicador">
          <Field label="Aspecto" value={getDisplayValue(aspectoEtiqueta)} />
          <Field
            label="Orden"
            value={getDisplayValue(indicador.orden, "No asignado")}
          />
          <Field label="Visibilidad">
            <span className={visibilityTagClass}>{visible}</span>
          </Field>
        </Section>

        <Section title="Ubicación académica">
          <Field label="Área" value={getDisplayValue(areaNombre)} />
          <Field label="Componente" value={getDisplayValue(componenteNombre)} />
          <Field
            label="Competencia"
            value={getDisplayValue(competenciaNombre)}
          />
        </Section>

        {indicador?.descripcion && (
          <Section title="Descripción">
            <div className="md:col-span-2">
              <div className={indicadoresViewModalClasses.descriptionBox}>
                {indicador.descripcion}
              </div>
            </div>
          </Section>
        )}
      </>
    </VentanaModal>
  );
};

IndicadorViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  indicador: PropTypes.object,
};
