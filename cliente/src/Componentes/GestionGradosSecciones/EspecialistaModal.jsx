import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  contenidosModalClasses,
  contenidosFormClasses,
  neutralButtonBase,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";

const flattenComponents = (areas) => {
  const resultado = [];
  areas.forEach((area) => {
    area.componentes.forEach((componente) => {
      resultado.push({
        areaId: area.id,
        areaNombre: area.nombre,
        ...componente,
      });
    });
  });
  return resultado;
};

export const EspecialistaModal = ({
  isOpen,
  onClose,
  onSubmit,
  especialistas,
  areas,
  aula,
  componenteSeleccionado,
}) => {
  const componentes = useMemo(() => flattenComponents(areas), [areas]);
  const componentesEspecialistas = useMemo(
    () => componentes.filter((item) => item.requiere_especialista),
    [componentes]
  );
  const opcionesComponentes = useMemo(() => {
    if (!componentesEspecialistas.length) {
      return [];
    }

    if (componenteSeleccionado?.id) {
      const coincidencia = componentesEspecialistas.find(
        (item) => item.id === componenteSeleccionado.id
      );
      return coincidencia ? [coincidencia] : componentesEspecialistas;
    }

    return componentesEspecialistas;
  }, [componenteSeleccionado?.id, componentesEspecialistas]);
  const [formState, setFormState] = useState({
    id_personal: "",
    id_componente: "",
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormState({ id_personal: "", id_componente: "" });
      setErrores({});
      return;
    }

    const componentePrevio = componenteSeleccionado ?? null;
    const asignacionPrev = componentePrevio
      ? aula?.especialistas?.find(
          (item) => item.componente?.id === componentePrevio.id
        )
      : null;

    setFormState({
      id_personal: asignacionPrev?.personal?.id_personal
        ? String(asignacionPrev.personal.id_personal)
        : "",
      id_componente: componentePrevio?.id
        ? String(componentePrevio.id)
        : asignacionPrev?.componente?.id
        ? String(asignacionPrev.componente.id)
        : "",
    });
    setErrores({});
  }, [aula, componenteSeleccionado, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!formState.id_componente && opcionesComponentes.length === 1) {
      setFormState((prev) => ({
        ...prev,
        id_componente: String(opcionesComponentes[0].id),
      }));
    }
  }, [formState.id_componente, isOpen, opcionesComponentes]);

  if (!isOpen) {
    return null;
  }

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setErrores({});

    try {
      await onSubmit({
        id_personal: formState.id_personal
          ? parseInt(formState.id_personal, 10)
          : null,
        componentes: formState.id_componente
          ? [parseInt(formState.id_componente, 10)]
          : [],
      });
      onClose();
    } catch (error) {
      if (error?.validation) {
        setErrores(error.validation);
        return;
      }
      setErrores({
        generales: [error.message ?? "Ocurrio un error inesperado."],
      });
    }
  };

  return (
    <div className={contenidosModalClasses.overlay}>
      <form
        onSubmit={manejarSubmit}
        className={`${contenidosModalClasses.content} max-h-[80vh] w-full max-w-3xl overflow-y-auto`}
      >
        <div className={contenidosModalClasses.header}>
          <div>
            <h2 className={contenidosModalClasses.title}>
              {componenteSeleccionado
                ? `Asignar especialista a ${componenteSeleccionado.nombre}`
                : "Asignar especialista"}
            </h2>
            <p className={contenidosFormClasses.helper}>
              Asigna un especialista solo a los componentes que lo requieren.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={contenidosModalClasses.closeButton}
            aria-label="Cerrar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className={contenidosFormClasses.fieldWrapper}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="componente-select"
            >
              Componente de aprendizaje
            </label>
            <select
              id="componente-select"
              name="id_componente"
              className={contenidosFormClasses.select}
              value={formState.id_componente}
              onChange={manejarCambio}
              disabled={
                opcionesComponentes.length === 0 ||
                opcionesComponentes.length === 1
              }
            >
              <option value="">Seleccione un componente</option>
              {opcionesComponentes.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.nombre} — {componente.areaNombre}
                </option>
              ))}
            </select>
            {errores?.componentes && (
              <p className={helperTextBase}>{errores.componentes.join(" ")}</p>
            )}
            {opcionesComponentes.length === 0 && !errores?.componentes && (
              <p className={`${helperTextBase} mt-2 text-amber-600`}>
                No hay componentes configurados que requieran especialista.
              </p>
            )}
          </div>

          {formState.id_componente ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
              {(() => {
                const componenteActivo = opcionesComponentes.find(
                  (item) => String(item.id) === formState.id_componente
                );

                if (!componenteActivo) {
                  return (
                    <p className={`${helperTextBase} text-amber-600`}>
                      Selecciona un componente para ver los detalles.
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {componenteActivo.nombre}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Area: {componenteActivo.areaNombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      Este componente requiere la asignacion de un especialista
                      para completar la cobertura del aula.
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : null}

          <div className={contenidosFormClasses.fieldWrapper}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="especialista-select"
            >
              Especialista asignado
            </label>
            <select
              id="especialista-select"
              name="id_personal"
              className={contenidosFormClasses.select}
              value={formState.id_personal}
              onChange={manejarCambio}
            >
              <option value="">Seleccione un especialista</option>
              {especialistas.map((especialista) => (
                <option
                  key={especialista.id_personal}
                  value={especialista.id_personal}
                >
                  {especialista.nombre_completo}
                  {especialista.cedula ? ` (${especialista.cedula})` : ""}
                </option>
              ))}
            </select>
            {errores?.id_personal && (
              <p className={helperTextBase}>{errores.id_personal.join(" ")}</p>
            )}
          </div>
        </div>

        {errores?.generales && (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
            {errores.generales.join(" ")}
          </div>
        )}

        <div className={`${contenidosFormClasses.actions} mt-6`}>
          <button
            type="button"
            onClick={onClose}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={contenidosFormClasses.primaryButton}
            disabled={!formState.id_componente || !formState.id_personal}
          >
            Guardar asignacion
          </button>
        </div>
      </form>
    </div>
  );
};

EspecialistaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  especialistas: PropTypes.arrayOf(
    PropTypes.shape({
      id_personal: PropTypes.number.isRequired,
      nombre_completo: PropTypes.string.isRequired,
      cedula: PropTypes.string,
    })
  ),
  areas: PropTypes.array,
  aula: PropTypes.shape({
    especialistas: PropTypes.array,
  }),
  componenteSeleccionado: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
  }),
};
