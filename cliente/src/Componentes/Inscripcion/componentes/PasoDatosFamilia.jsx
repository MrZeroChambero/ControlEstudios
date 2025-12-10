import React from "react";
import { inscripcionFormClasses } from "../../EstilosCliente/EstilosClientes";

const crearCampo = (id, etiqueta, tipo = "text", placeholder = "") => ({
  id,
  etiqueta,
  tipo,
  placeholder,
});

const camposPrincipales = [
  crearCampo("fecha_inscripcion", "Fecha de inscripción", "date"),
  crearCampo("vive_con", "El estudiante vive con"),
  crearCampo("tipo_vivienda", "Tipo de vivienda"),
  crearCampo("zona_vivienda", "Zona de vivienda"),
  crearCampo("tenencia_viviencia", "Tenencia de la vivienda"),
];

const camposNumericos = [
  crearCampo("ingreso_familiar", "Ingreso familiar mensual (en Bs)", "number"),
  crearCampo("miembros_familia", "Miembros del grupo familiar", "number"),
  crearCampo("altura", "Altura (cm)", "number"),
  crearCampo("peso", "Peso (kg)", "number"),
  crearCampo("talla_zapatos", "Talla de zapatos", "number"),
  crearCampo("talla_camisa", "Talla de camisa", "number"),
  crearCampo("talla_pantalon", "Talla de pantalón", "number"),
];

const opcionesSiNo = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
];

export const PasoDatosFamilia = ({
  datos,
  errores,
  onChange,
  tiposInscripcion,
  tipoSeleccionado,
  onTipoChange,
}) => {
  const handleChange = (evento) => {
    const { name, value } = evento.target;
    onChange(name, value);
  };

  return (
    <form
      name="formulario-datos-familia"
      className="space-y-6"
      autoComplete="off"
    >
      <section
        name="seccion-tipo-inscripcion"
        className={inscripcionFormClasses.section}
      >
        <h3 className={inscripcionFormClasses.sectionTitle}>
          Tipo de inscripción
        </h3>
        <div
          name="grupo-tipo-inscripcion"
          className={inscripcionFormClasses.group}
        >
          <label
            htmlFor="tipo_inscripcion"
            className={inscripcionFormClasses.label}
          >
            Selecciona el tipo de inscripción
          </label>
          <select
            id="tipo_inscripcion"
            name="tipo_inscripcion"
            value={tipoSeleccionado}
            onChange={(e) => onTipoChange(e.target.value)}
            className={inscripcionFormClasses.select}
          >
            {tiposInscripcion.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section
        name="seccion-datos-generales-hogar"
        className={inscripcionFormClasses.section}
      >
        <h3 className={inscripcionFormClasses.sectionTitle}>
          Datos generales del hogar
        </h3>
        <div
          name="contenedor-datos-generales"
          className={inscripcionFormClasses.inline}
        >
          {camposPrincipales.map((campo) => (
            <div
              key={campo.id}
              name={`campo-${campo.id}`}
              className={inscripcionFormClasses.fieldWrapper}
            >
              <label
                htmlFor={campo.id}
                className={inscripcionFormClasses.label}
              >
                {campo.etiqueta}
              </label>
              <input
                type={campo.tipo}
                id={campo.id}
                name={campo.id}
                value={datos[campo.id] ?? ""}
                onChange={handleChange}
                placeholder={campo.placeholder}
                className={
                  errores[campo.id]
                    ? inscripcionFormClasses.inputInvalid
                    : inscripcionFormClasses.input
                }
              />
              {errores[campo.id] ? (
                <p className={inscripcionFormClasses.error}>
                  {errores[campo.id]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section
        name="seccion-indicadores-socioeconomicos"
        className={inscripcionFormClasses.section}
      >
        <h3 className={inscripcionFormClasses.sectionTitle}>
          Indicadores socioeconómicos
        </h3>
        <div
          name="contenedor-indicadores-socioeconomicos"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {camposNumericos.map((campo) => {
            const minPermitido = [
              "talla_zapatos",
              "talla_camisa",
              "talla_pantalon",
              "miembros_familia",
            ].includes(campo.id)
              ? 1
              : 0;

            return (
              <div
                key={campo.id}
                name={`campo-${campo.id}`}
                className={inscripcionFormClasses.fieldWrapper}
              >
                <label
                  htmlFor={campo.id}
                  className={inscripcionFormClasses.label}
                >
                  {campo.etiqueta}
                </label>
                <input
                  type={campo.tipo}
                  id={campo.id}
                  name={campo.id}
                  value={datos[campo.id] ?? ""}
                  onChange={handleChange}
                  placeholder={campo.placeholder}
                  min={minPermitido}
                  className={
                    errores[campo.id]
                      ? inscripcionFormClasses.inputInvalid
                      : inscripcionFormClasses.input
                  }
                />
                {errores[campo.id] ? (
                  <p className={inscripcionFormClasses.error}>
                    {errores[campo.id]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section
        name="seccion-participacion-colaboracion"
        className={inscripcionFormClasses.section}
      >
        <h3 className={inscripcionFormClasses.sectionTitle}>
          Participación y colaboración
        </h3>
        <div
          name="contenedor-participacion"
          className={inscripcionFormClasses.inline}
        >
          {[
            {
              id: "tareas_comunitarias",
              etiqueta: "¿La familia realiza tareas comunitarias?",
            },
            {
              id: "participar_comite",
              etiqueta: "¿Desean integrarse al comité escolar?",
            },
          ].map((campo) => (
            <div
              key={campo.id}
              name={`campo-${campo.id}`}
              className={inscripcionFormClasses.fieldWrapper}
            >
              <label
                htmlFor={campo.id}
                className={inscripcionFormClasses.label}
              >
                {campo.etiqueta}
              </label>
              <select
                id={campo.id}
                name={campo.id}
                value={datos[campo.id] ?? "no"}
                onChange={handleChange}
                className={inscripcionFormClasses.select}
              >
                {opcionesSiNo.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section
        name="seccion-detalle-participacion"
        className={inscripcionFormClasses.section}
      >
        <h3 className={inscripcionFormClasses.sectionTitle}>
          Detalle de participación
        </h3>
        <div
          name="grupo-detalles-participacion"
          className={inscripcionFormClasses.group}
        >
          <label
            htmlFor="detalles_participacion"
            className={inscripcionFormClasses.label}
          >
            Describe cómo participa la familia en actividades comunitarias
          </label>
          <textarea
            id="detalles_participacion"
            name="detalles_participacion"
            value={datos.detalles_participacion ?? ""}
            onChange={handleChange}
            placeholder="Ej: Madre participa en el comité de cultura los días viernes"
            className={
              errores.detalles_participacion
                ? `${inscripcionFormClasses.textAreaInvalid} ${inscripcionFormClasses.textAreaAuto}`
                : `${inscripcionFormClasses.textArea} ${inscripcionFormClasses.textAreaAuto}`
            }
            rows={4}
          />
          {errores.detalles_participacion ? (
            <p className={inscripcionFormClasses.error}>
              {errores.detalles_participacion}
            </p>
          ) : null}
        </div>
      </section>
    </form>
  );
};
