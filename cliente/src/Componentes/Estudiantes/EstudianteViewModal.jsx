import React from "react";
import {
  calcularEdad,
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";
import { estudiantesViewModalClasses } from "../EstilosCliente/EstilosClientes";

export const EstudianteViewModal = ({ isOpen, onClose, estudiante }) => {
  if (!isOpen || !estudiante) return null;

  const Section = ({ title, children }) => (
    <div className={estudiantesViewModalClasses.section.wrapper}>
      <h3 className={estudiantesViewModalClasses.section.title}>{title}</h3>
      <div className={estudiantesViewModalClasses.section.body}>{children}</div>
    </div>
  );

  const Row = ({ label, value }) => (
    <div className={estudiantesViewModalClasses.row.container}>
      <span className={estudiantesViewModalClasses.row.label}>{label}</span>
      <span className={estudiantesViewModalClasses.row.value}>
        {value ?? "-"}
      </span>
    </div>
  );

  const persona = estudiante?.persona || estudiante; // fallback si ya viene plano
  const docs = estudiante?.documentos || [];
  const alergias = estudiante?.alergias || [];
  const condiciones = estudiante?.condiciones_salud || [];
  const vacunas = estudiante?.vacunas || [];
  const consultas = estudiante?.consultas_medicas || [];

  const fechaNacimiento = formatearFechaCorta(persona?.fecha_nacimiento);
  const edad = calcularEdad(persona?.fecha_nacimiento);
  const edadTexto = edad === null ? "-" : `${edad} año${edad === 1 ? "" : "s"}`;
  const fechaIngreso = formatearFechaCorta(estudiante?.fecha_ingreso_escuela);

  return (
    <div className={estudiantesViewModalClasses.overlay}>
      <div className={estudiantesViewModalClasses.content}>
        <div className={estudiantesViewModalClasses.header}>
          <h2 className={estudiantesViewModalClasses.title}>
            Detalle del Estudiante
          </h2>
          <button
            onClick={onClose}
            type="button"
            className={estudiantesViewModalClasses.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={estudiantesViewModalClasses.body}>
          <Section title="Datos de Persona">
            <Row
              label="Nombre"
              value={`${persona.primer_nombre} ${
                persona.segundo_nombre || ""
              } ${persona.primer_apellido} ${persona.segundo_apellido || ""}`}
            />
            <Row label="Cédula" value={persona.cedula} />
            <Row label="Fecha de nacimiento" value={fechaNacimiento || "-"} />
            <Row label="Edad" value={edadTexto} />
            <Row label="Género" value={persona.genero} />
            <Row label="Estado" value={persona.estado} />
          </Section>

          <Section title="Datos del Estudiante">
            <Row label="Cédula escolar" value={estudiante.cedula_escolar} />
            <Row label="Fecha ingreso" value={fechaIngreso || "-"} />
            <Row label="Vive con padres" value={estudiante.vive_con_padres} />
            <Row label="Orden nacimiento" value={estudiante.orden_nacimiento} />
            <Row
              label="Semanas gestación"
              value={estudiante.tiempo_gestacion}
            />
            <Row label="Embarazo deseado" value={estudiante.embarazo_deseado} />
            <Row label="Tipo parto" value={estudiante.tipo_parto} />
            <Row
              label="Control esfínteres"
              value={estudiante.control_esfinteres}
            />
            <Row label="Control embarazo" value={estudiante.control_embarazo} />
            <Row
              label="Estado estudiante"
              value={estudiante.estado_estudiante || estudiante.estado}
            />
          </Section>

          <Section title="Documentos Académicos">
            {docs.length === 0 && (
              <div className={estudiantesViewModalClasses.empty}>
                Sin documentos.
              </div>
            )}
            {docs.map((d) => (
              <div
                key={
                  d.id_documento ||
                  `${d.tipo_documento}-${d.id || Math.random()}`
                }
                className={estudiantesViewModalClasses.card.container}
              >
                <div className={estudiantesViewModalClasses.card.title}>
                  {d.tipo_documento}
                </div>
                <div className={estudiantesViewModalClasses.card.text}>
                  Entregado: {d.entregado ? "Sí" : "No"}
                </div>
                {d.observaciones && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Obs.: {d.observaciones}
                  </div>
                )}
              </div>
            ))}
          </Section>

          <Section title="Alergias">
            {alergias.length === 0 && (
              <div className={estudiantesViewModalClasses.empty}>
                Sin alergias registradas.
              </div>
            )}
            {alergias.map((a) => (
              <div
                key={a.id_lista_alergia || a.id}
                className={estudiantesViewModalClasses.card.container}
              >
                <div className={estudiantesViewModalClasses.card.title}>
                  {a.nombre_alergia || a.nombre}
                </div>
                {a.observaciones && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Obs.: {a.observaciones}
                  </div>
                )}
              </div>
            ))}
          </Section>

          <Section title="Condiciones de Salud / Patologías">
            {condiciones.length === 0 && (
              <div className={estudiantesViewModalClasses.empty}>
                Sin condiciones registradas.
              </div>
            )}
            {condiciones.map((c) => (
              <div
                key={c.id_condicion || c.id}
                className={estudiantesViewModalClasses.card.container}
              >
                <div className={estudiantesViewModalClasses.card.title}>
                  {c.nombre_patologia || c.patologia}
                </div>
                {c.tratamiento && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Tratamiento: {c.tratamiento}
                  </div>
                )}
                {c.estado && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Estado: {c.estado}
                  </div>
                )}
                {c.observaciones && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Obs.: {c.observaciones}
                  </div>
                )}
              </div>
            ))}
          </Section>

          <Section title="Vacunas">
            {vacunas.length === 0 && (
              <div className={estudiantesViewModalClasses.empty}>
                Sin vacunas registradas.
              </div>
            )}
            {vacunas.map((v) => (
              <div
                key={v.id_vacuna_estudiante || v.id}
                className={estudiantesViewModalClasses.card.container}
              >
                <div className={estudiantesViewModalClasses.card.title}>
                  {v.nombre_vacuna || v.nombre}
                </div>
                {v.fecha_aplicacion && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Fecha: {formatearFechaCorta(v.fecha_aplicacion) || "-"}
                  </div>
                )}
                {typeof v.refuerzos !== "undefined" && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Refuerzos: {v.refuerzos}
                  </div>
                )}
              </div>
            ))}
          </Section>

          <Section title="Consultas Médicas">
            {consultas.length === 0 && (
              <div className={estudiantesViewModalClasses.empty}>
                Sin consultas registradas.
              </div>
            )}
            {consultas.map((cm) => (
              <div
                key={cm.id_consulta || cm.id}
                className={estudiantesViewModalClasses.card.container}
              >
                <div className={estudiantesViewModalClasses.card.title}>
                  {cm.tipo_consulta}
                </div>
                {cm.fecha && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Fecha: {formatearFechaHoraCorta(cm.fecha) || "-"}
                  </div>
                )}
                {cm.descripcion && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Descripción: {cm.descripcion}
                  </div>
                )}
                {cm.tratamiento && (
                  <div className={estudiantesViewModalClasses.card.text}>
                    Tratamiento: {cm.tratamiento}
                  </div>
                )}
              </div>
            ))}
          </Section>
        </div>

        <div className={estudiantesViewModalClasses.footer}>
          <button
            onClick={onClose}
            type="button"
            className={estudiantesViewModalClasses.footerButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
