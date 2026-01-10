import React from "react";
import {
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";
import { representantesViewModalClasses } from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

const getDisplayValue = (value, fallback = "No especificado") => {
  if (value === null || typeof value === "undefined" || value === "") {
    return fallback;
  }
  return value;
};

const buildVariantClass = (base, variants, key) => {
  const variant = variants?.[key] || variants?.default || "";
  return `${base} ${variant}`.trim();
};

export const RepresentanteViewModal = ({ isOpen, onClose, representante }) => {
  if (!isOpen || !representante) return null;

  const fechaNacimiento = formatearFechaCorta(
    representante.fecha_nacimiento || representante.fecha
  );

  const nombreCompleto = `${representante.primer_nombre ?? ""} ${
    representante.segundo_nombre ?? ""
  } ${representante.primer_apellido ?? ""} ${
    representante.segundo_apellido ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();

  const Section = ({ title, children, bodyClass }) => (
    <section className={representantesViewModalClasses.section.wrapper}>
      <h3 className={representantesViewModalClasses.section.title}>{title}</h3>
      <div className={bodyClass || representantesViewModalClasses.section.body}>
        {children}
      </div>
    </section>
  );

  const Field = ({ label, value, children }) => (
    <div className={representantesViewModalClasses.field}>
      <span className={representantesViewModalClasses.label}>{label}</span>
      <div className={representantesViewModalClasses.valueBox}>
        {children ?? getDisplayValue(value)}
      </div>
    </div>
  );

  const estadoClass = buildVariantClass(
    representantesViewModalClasses.chipBase,
    representantesViewModalClasses.chipVariants,
    representante.estado
  );

  const habilidades = Array.isArray(representante.habilidades)
    ? representante.habilidades
    : [];
  const alergias = Array.isArray(representante.alergias)
    ? representante.alergias
    : [];
  const vacunas = Array.isArray(representante.vacunas)
    ? representante.vacunas
    : [];
  const documentos = Array.isArray(representante.documentos)
    ? representante.documentos
    : [];
  const condiciones = Array.isArray(representante.condiciones_salud)
    ? representante.condiciones_salud
    : [];
  const consultas = Array.isArray(representante.consultas_medicas)
    ? representante.consultas_medicas
    : [];
  const estudiantesFamilia = Array.isArray(representante.estudiantes_familia)
    ? representante.estudiantes_familia
    : [];

  const fechaIngresoEstudiante = representante.estudiante
    ? formatearFechaCorta(representante.estudiante.fecha_ingreso_escuela)
    : null;

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Representante"
      size="xl"
      bodyClassName={representantesViewModalClasses.bodyLayout}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={representantesViewModalClasses.footerButton}
        >
          Cerrar
        </button>
      }
    >
      <>
        <Section title="Estado">
          <Field label="Estado persona">
            <span className={estadoClass}>
              {representante.estado_persona_nombre ||
                representante.estado ||
                "-"}
            </span>
          </Field>
        </Section>

        <Section title="Información general">
          <Field label="Nombre completo" value={nombreCompleto || "-"} />
          <Field label="Cédula" value={representante.cedula} />
          <Field label="Fecha de nacimiento" value={fechaNacimiento || "-"} />
          <Field label="Género" value={representante.genero} />
          <Field label="Nacionalidad" value={representante.nacionalidad} />
          <Field label="Dirección" value={representante.direccion} />
          <Field
            label="Teléfono principal"
            value={representante.telefono_principal}
          />
          <Field
            label="Teléfono secundario"
            value={representante.telefono_secundario}
          />
          <Field label="Email" value={representante.email} />
          <Field
            label="Tipo de sangre"
            value={representante.tipo_sangre || "No sabe"}
          />
        </Section>

        <Section title="Datos del representante">
          <Field
            label="Profesión"
            value={
              representante.profesion || representante.representante?.profesion
            }
          />
          <Field
            label="Oficio"
            value={representante.oficio || representante.representante?.oficio}
          />
          <Field
            label="Nivel educativo"
            value={
              representante.nivel_educativo ||
              representante.representante?.nivel_educativo
            }
          />
          <Field
            label="Lugar de trabajo"
            value={
              representante.lugar_trabajo ||
              representante.representante?.lugar_trabajo
            }
          />
        </Section>

        <Section
          title="Habilidades"
          bodyClass={representantesViewModalClasses.listGrid}
        >
          {habilidades.length > 0 ? (
            habilidades.map((hab) => (
              <div
                key={hab.id_habilidad || hab.id}
                className={representantesViewModalClasses.listItem}
              >
                {hab.nombre_habilidad}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Sin habilidades registradas.
            </p>
          )}
        </Section>

        {representante.personal && (
          <Section title="Personal asociado">
            <Field label="Cargo" value={representante.personal.nombre_cargo} />
            <Field
              label="Función"
              value={representante.personal.nombre_funcion}
            />
            <Field
              label="Nivel académico"
              value={representante.personal.nivel_academico}
            />
            <Field
              label="Horas de trabajo"
              value={representante.personal.horas_trabajo}
            />
          </Section>
        )}

        {representante.estudiante && (
          <Section title="Estudiante asociado">
            <Field
              label="ID estudiante"
              value={representante.estudiante.id_estudiante}
            />
            <Field
              label="Fecha de ingreso"
              value={fechaIngresoEstudiante || "No especificado"}
            />
            <Field label="Edad" value={representante.estudiante.edad} />
          </Section>
        )}

        <Section title="Documentos académicos">
          {documentos.length === 0 ? (
            <div className={representantesViewModalClasses.empty}>
              Sin documentos registrados.
            </div>
          ) : (
            documentos.map((doc) => (
              <div
                key={doc.id_documento || doc.id}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {doc.tipo_documento}
                </div>
                <div className={representantesViewModalClasses.card.text}>
                  Entregado: {doc.entregado ? "Sí" : "No"}
                </div>
                {doc.observaciones && (
                  <div className={representantesViewModalClasses.card.text}>
                    Obs.: {doc.observaciones}
                  </div>
                )}
              </div>
            ))
          )}
        </Section>

        <Section title="Alergias">
          {alergias.length === 0 ? (
            <div className={representantesViewModalClasses.empty}>
              Sin alergias registradas.
            </div>
          ) : (
            alergias.map((a) => (
              <div
                key={a.id_lista_alergia || a.id}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {a.nombre_alergia || a.nombre}
                </div>
                {a.observaciones && (
                  <div className={representantesViewModalClasses.card.text}>
                    Obs.: {a.observaciones}
                  </div>
                )}
              </div>
            ))
          )}
        </Section>

        <Section title="Condiciones de salud">
          {condiciones.length === 0 ? (
            <div className={representantesViewModalClasses.empty}>
              Sin condiciones registradas.
            </div>
          ) : (
            condiciones.map((c) => (
              <div
                key={c.id_condicion || c.id}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {c.nombre_patologia || c.patologia}
                </div>
                {c.tratamiento && (
                  <div className={representantesViewModalClasses.card.text}>
                    Tratamiento: {c.tratamiento}
                  </div>
                )}
                {c.estado && (
                  <div className={representantesViewModalClasses.card.text}>
                    Estado: {c.estado}
                  </div>
                )}
                {c.observaciones && (
                  <div className={representantesViewModalClasses.card.text}>
                    Obs.: {c.observaciones}
                  </div>
                )}
              </div>
            ))
          )}
        </Section>

        <Section title="Vacunas">
          {vacunas.length === 0 ? (
            <div className={representantesViewModalClasses.empty}>
              Sin vacunas registradas.
            </div>
          ) : (
            vacunas.map((v) => (
              <div
                key={v.id_vacuna_estudiante || v.id}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {v.nombre_vacuna || v.nombre}
                </div>
                {v.fecha_aplicacion && (
                  <div className={representantesViewModalClasses.card.text}>
                    Fecha: {formatearFechaCorta(v.fecha_aplicacion) || "-"}
                  </div>
                )}
                {typeof v.refuerzos !== "undefined" && (
                  <div className={representantesViewModalClasses.card.text}>
                    Refuerzos: {v.refuerzos}
                  </div>
                )}
              </div>
            ))
          )}
        </Section>

        <Section title="Consultas médicas">
          {consultas.length === 0 ? (
            <div className={representantesViewModalClasses.empty}>
              Sin consultas registradas.
            </div>
          ) : (
            consultas.map((cm) => (
              <div
                key={cm.id_consulta || cm.id}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {cm.tipo_consulta}
                </div>
                {cm.fecha && (
                  <div className={representantesViewModalClasses.card.text}>
                    Fecha: {formatearFechaHoraCorta(cm.fecha) || "-"}
                  </div>
                )}
                {cm.descripcion && (
                  <div className={representantesViewModalClasses.card.text}>
                    Descripción: {cm.descripcion}
                  </div>
                )}
                {cm.tratamiento && (
                  <div className={representantesViewModalClasses.card.text}>
                    Tratamiento: {cm.tratamiento}
                  </div>
                )}
              </div>
            ))
          )}
        </Section>

        {estudiantesFamilia.length > 0 && (
          <Section title="Estudiantes vinculados">
            {estudiantesFamilia.map((e) => (
              <div
                key={e.id_estudiante}
                className={representantesViewModalClasses.card.container}
              >
                <div className={representantesViewModalClasses.card.title}>
                  {e.primer_nombre} {e.primer_apellido}
                </div>
                <div className={representantesViewModalClasses.card.text}>
                  Cédula: {e.cedula || "-"}
                </div>
              </div>
            ))}
          </Section>
        )}
      </>
    </VentanaModal>
  );
};

export default RepresentanteViewModal;
