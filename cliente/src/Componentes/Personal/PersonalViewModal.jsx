import React from "react";
import { formatearFechaCorta } from "../../utilidades/formatoFechas";
import { personalViewModalClasses } from "../EstilosCliente/EstilosClientes";

const getDisplayValue = (value) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return "No especificado";
  }
  return value;
};

const buildVariantClass = (base, variants, key) => {
  const variant = variants?.[key] || variants?.default || "";
  return `${base} ${variant}`.trim();
};

export const PersonalViewModal = ({ isOpen, onClose, personal }) => {
  if (!isOpen || !personal) return null;

  const fechaNacimiento = formatearFechaCorta(personal.fecha_nacimiento);
  const fechaContratacion = formatearFechaCorta(personal.fecha_contratacion);
  const nombreCompleto = `${personal.primer_nombre ?? ""} ${
    personal.segundo_nombre ?? ""
  } ${personal.primer_apellido ?? ""} ${personal.segundo_apellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim();

  const Section = ({ title, children, bodyClass }) => (
    <section className={personalViewModalClasses.section.wrapper}>
      <h3 className={personalViewModalClasses.section.title}>{title}</h3>
      <div className={bodyClass || personalViewModalClasses.section.body}>
        {children}
      </div>
    </section>
  );

  const Field = ({ label, value, children }) => (
    <div>
      <span className={personalViewModalClasses.label}>{label}</span>
      <p className={personalViewModalClasses.value}>
        {children ?? getDisplayValue(value)}
      </p>
    </div>
  );

  const estadoPersonaClass = buildVariantClass(
    personalViewModalClasses.statusChipBase,
    personalViewModalClasses.statusChipVariants,
    personal.estado_persona || personal.estado
  );

  const estadoPersonalClass = buildVariantClass(
    personalViewModalClasses.statusChipBase,
    personalViewModalClasses.statusChipVariants,
    personal.estado_personal
  );

  const tipoCargoClass = buildVariantClass(
    personalViewModalClasses.typeChipBase,
    personalViewModalClasses.typeChipVariants,
    personal.tipo_cargo
  );

  const tipoFuncionClass = buildVariantClass(
    personalViewModalClasses.typeChipBase,
    personalViewModalClasses.typeChipVariants,
    personal.tipo_funcion
  );

  return (
    <div className={personalViewModalClasses.overlay}>
      <div className={personalViewModalClasses.content}>
        <div className={personalViewModalClasses.header}>
          <h2 className={personalViewModalClasses.title}>
            Información Completa del Personal
          </h2>
          <button
            onClick={onClose}
            type="button"
            className={personalViewModalClasses.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={personalViewModalClasses.body}>
          <Section title="Estados">
            <Field label="Estado persona">
              <span className={estadoPersonaClass}>
                {personal.estado_persona_nombre || personal.estado || "-"}
              </span>
            </Field>
            <Field label="Estado personal">
              <span className={estadoPersonalClass}>
                {personal.estado_personal_nombre ||
                  personal.estado_personal ||
                  "-"}
              </span>
            </Field>
          </Section>

          <Section title="Información personal">
            <Field label="Nombre completo" value={nombreCompleto || "-"} />
            <Field label="Cédula" value={personal.cedula} />
            <Field
              label="Fecha de nacimiento"
              value={fechaNacimiento || "No especificado"}
            />
            <Field
              label="Edad"
              value={
                personal.edad ? `${personal.edad} años` : "No especificado"
              }
            />
            <Field
              label="Género"
              value={personal.genero === "M" ? "Masculino" : "Femenino"}
            />
            <Field label="Nacionalidad" value={personal.nacionalidad} />
            <Field label="Tipo de sangre" value={personal.tipo_sangre} />
          </Section>

          <Section title="Información de contacto">
            <Field label="Dirección" value={personal.direccion} />
            <Field
              label="Teléfono principal"
              value={personal.telefono_principal}
            />
            <Field
              label="Teléfono secundario"
              value={personal.telefono_secundario}
            />
            <Field label="Email" value={personal.email} />
          </Section>

          <Section title="Información laboral">
            <Field label="Cargo" value={personal.nombre_cargo} />
            <Field label="Función" value={personal.nombre_funcion} />
            <Field label="Tipo de cargo">
              <span className={tipoCargoClass}>
                {getDisplayValue(personal.tipo_cargo)}
              </span>
            </Field>
            <Field label="Tipo de función">
              <span className={tipoFuncionClass}>
                {getDisplayValue(personal.tipo_funcion)}
              </span>
            </Field>
            <Field
              label="Fecha de contratación"
              value={fechaContratacion || "No especificado"}
            />
            <Field label="Nivel académico" value={personal.nivel_academico} />
            <Field label="Horas de trabajo" value={personal.horas_trabajo} />
            <Field label="RIF" value={personal.rif} />
            <Field label="Etnia / Religión" value={personal.etnia_religion} />
            <Field label="Cantidad de hijas" value={personal.cantidad_hijas} />
            <Field
              label="Cantidad de hijos varones"
              value={personal.cantidad_hijos_varones}
            />
            <Field
              label="Código de dependencia"
              value={personal.cod_dependencia}
            />
          </Section>

          <Section
            title="Habilidades"
            bodyClass={personalViewModalClasses.sectionStack}
          >
            {Array.isArray(personal.habilidades) &&
            personal.habilidades.length > 0 ? (
              <ul className={personalViewModalClasses.listGrid}>
                {personal.habilidades.map((hab) => (
                  <li
                    key={hab.id_habilidad || hab.id}
                    className={personalViewModalClasses.listItem}
                  >
                    {hab.nombre_habilidad}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                Sin habilidades registradas.
              </p>
            )}
          </Section>
        </div>

        <div className={personalViewModalClasses.footer}>
          <button
            onClick={onClose}
            type="button"
            className={personalViewModalClasses.footerButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
