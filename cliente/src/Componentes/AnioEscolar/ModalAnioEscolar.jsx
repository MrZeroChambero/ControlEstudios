import React from "react";
import {
  anioEscolarFormClasses,
  anioEscolarModalClasses,
} from "../EstilosCliente/EstilosClientes";
import { transformarErrores } from "./utilidadesAnioEscolar";

const obtenerClaseCampo = (errores, campo) =>
  errores?.[campo]
    ? anioEscolarFormClasses.inputInvalid
    : anioEscolarFormClasses.input;

export const ModalAnioEscolar = ({
  abierto,
  modo,
  datos,
  errores,
  onCerrar,
  onCambiarCampo,
  onCambiarMomento,
  onSubmit,
}) => {
  if (!abierto || !datos) {
    return null;
  }

  const listaErrores = transformarErrores(errores).filter((item) => {
    if (!item.mensaje) {
      return false;
    }
    if (item.clave?.startsWith("momento_")) {
      return false;
    }
    if (item.clave === "superposicion") {
      return false;
    }
    return true;
  });

  return (
    <div className={anioEscolarModalClasses.overlay}>
      <div
        className={anioEscolarModalClasses.content}
        role="dialog"
        aria-modal="true"
      >
        <div className={anioEscolarModalClasses.header}>
          <h2 className={anioEscolarModalClasses.title}>
            {modo === "crear" ? "Registrar año escolar" : "Editar año escolar"}
          </h2>
          <button
            type="button"
            className={anioEscolarModalClasses.closeButton}
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {listaErrores.length > 0 && (
          <div className={anioEscolarModalClasses.errorBox}>
            <ul className={anioEscolarModalClasses.errorList}>
              {listaErrores.map(({ clave, mensaje }) => (
                <li key={clave} className={anioEscolarModalClasses.errorItem}>
                  {mensaje}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            onSubmit();
          }}
          autoComplete="off"
        >
          <div className={anioEscolarFormClasses.grid}>
            <div className={anioEscolarFormClasses.fieldWrapper}>
              <label
                className={anioEscolarFormClasses.label}
                htmlFor="fecha_inicio"
              >
                Fecha de inicio
              </label>
              <input
                id="fecha_inicio"
                type="date"
                className={obtenerClaseCampo(errores, "fecha_inicio")}
                value={datos.fecha_inicio}
                onChange={(evento) =>
                  onCambiarCampo("fecha_inicio", evento.target.value)
                }
              />
              {errores?.fecha_inicio && (
                <p className={anioEscolarFormClasses.error}>
                  {errores.fecha_inicio}
                </p>
              )}
            </div>

            <div className={anioEscolarFormClasses.fieldWrapper}>
              <label
                className={anioEscolarFormClasses.label}
                htmlFor="fecha_fin"
              >
                Fecha de culminación
              </label>
              <input
                id="fecha_fin"
                type="date"
                className={obtenerClaseCampo(errores, "fecha_fin")}
                value={datos.fecha_fin}
                onChange={(evento) =>
                  onCambiarCampo("fecha_fin", evento.target.value)
                }
              />
              {errores?.fecha_fin && (
                <p className={anioEscolarFormClasses.error}>
                  {errores.fecha_fin}
                </p>
              )}
            </div>

            <div className={anioEscolarFormClasses.fieldWrapper}>
              <label
                className={anioEscolarFormClasses.label}
                htmlFor="fecha_limite_inscripcion"
              >
                Fecha límite de inscripción
              </label>
              <input
                id="fecha_limite_inscripcion"
                type="date"
                className={obtenerClaseCampo(
                  errores,
                  "fecha_limite_inscripcion"
                )}
                value={datos.fecha_limite_inscripcion}
                onChange={(evento) =>
                  onCambiarCampo(
                    "fecha_limite_inscripcion",
                    evento.target.value
                  )
                }
              />
              <p className={anioEscolarFormClasses.helper}>
                Debe mantenerse a ±7 días del inicio y nunca posterior a este.
              </p>
              {errores?.fecha_limite_inscripcion && (
                <p className={anioEscolarFormClasses.error}>
                  {errores.fecha_limite_inscripcion}
                </p>
              )}
            </div>
          </div>

          <section className={anioEscolarModalClasses.section}>
            <div className={anioEscolarModalClasses.sectionHeader}>
              <h3 className={anioEscolarModalClasses.sectionTitle}>
                Momentos académicos
              </h3>
              <p className={anioEscolarFormClasses.helper}>
                Ajusta las fechas sugeridas según el calendario académico.
              </p>
            </div>

            <div className={anioEscolarFormClasses.momentosGrid}>
              {(datos.momentos || []).map((momento) => {
                const claveMomento = `momento_${momento.orden}`;
                const errorMomento = errores?.[claveMomento];

                return (
                  <article
                    key={momento.orden}
                    className={anioEscolarFormClasses.momentoCard}
                  >
                    <h4 className={anioEscolarFormClasses.momentoTitle}>
                      {momento.nombre}
                    </h4>
                    <div className={anioEscolarFormClasses.fieldWrapper}>
                      <label className={anioEscolarFormClasses.label}>
                        Inicio del momento
                      </label>
                      <input
                        type="date"
                        className={obtenerClaseCampo(errores, claveMomento)}
                        value={momento.fecha_inicio}
                        onChange={(evento) =>
                          onCambiarMomento(
                            momento.orden,
                            "fecha_inicio",
                            evento.target.value
                          )
                        }
                      />
                    </div>
                    <div className={anioEscolarFormClasses.fieldWrapper}>
                      <label className={anioEscolarFormClasses.label}>
                        Fin del momento
                      </label>
                      <input
                        type="date"
                        className={obtenerClaseCampo(errores, claveMomento)}
                        value={momento.fecha_fin}
                        onChange={(evento) =>
                          onCambiarMomento(
                            momento.orden,
                            "fecha_fin",
                            evento.target.value
                          )
                        }
                      />
                    </div>
                    {errorMomento && (
                      <p className={anioEscolarFormClasses.error}>
                        {errorMomento}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {errores?.superposicion && (
              <p className={anioEscolarModalClasses.warning}>
                {errores.superposicion}
              </p>
            )}
          </section>

          <div className={anioEscolarFormClasses.actions}>
            <button
              type="button"
              className={anioEscolarFormClasses.secondaryButton}
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={anioEscolarFormClasses.primaryButton}
            >
              {modo === "crear" ? "Registrar" : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAnioEscolar;
