import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  contenidosModalClasses,
  contenidosFormClasses,
  neutralButtonBase,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";

const buildComponentList = (areas) => {
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

export const DocenteTitularModal = ({
  isOpen,
  onClose,
  onSubmit,
  docentes,
  areas,
  aula,
}) => {
  const [formState, setFormState] = useState({
    id_personal: "",
    componentes: new Set(),
  });
  const [errores, setErrores] = useState({});
  const componentes = useMemo(() => buildComponentList(areas), [areas]);

  useEffect(() => {
    if (!isOpen) {
      setFormState({ id_personal: "", componentes: new Set() });
      setErrores({});
      return;
    }

    const idDocente = aula?.docente?.id_personal
      ? String(aula.docente.id_personal)
      : "";

    const componentesAsignados = new Set(
      aula?.componentes_docente?.map((componenteId) => Number(componenteId)) ??
        []
    );

    setFormState({ id_personal: idDocente, componentes: componentesAsignados });
    setErrores({});
  }, [aula, isOpen]);

  if (!isOpen) {
    return null;
  }

  const manejarSeleccionDocente = (evento) => {
    setFormState((prev) => ({
      ...prev,
      id_personal: evento.target.value,
    }));
  };

  const alternarComponente = (componenteId) => {
    setFormState((prev) => {
      const nuevo = new Set(prev.componentes);
      if (nuevo.has(componenteId)) {
        nuevo.delete(componenteId);
      } else {
        nuevo.add(componenteId);
      }
      return { ...prev, componentes: nuevo };
    });
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setErrores({});

    try {
      await onSubmit({
        id_personal: formState.id_personal
          ? parseInt(formState.id_personal, 10)
          : null,
        componentes: Array.from(formState.componentes),
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

  const docenteSeleccionado = formState.id_personal
    ? parseInt(formState.id_personal, 10)
    : null;

  const docenteActualId = aula?.docente?.id_personal ?? null;

  return (
    <div className={contenidosModalClasses.overlay}>
      <form
        onSubmit={manejarSubmit}
        className={`${contenidosModalClasses.content} max-h-[90vh] w-full max-w-4xl overflow-y-auto`}
      >
        <div className={contenidosModalClasses.header}>
          <div>
            <h2 className={contenidosModalClasses.title}>
              {aula?.docente
                ? "Actualizar docente titular"
                : "Asignar docente titular"}
            </h2>
            <p className={contenidosFormClasses.helper}>
              Seleccione el docente titular y los componentes que impartira en
              esta aula.
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

        <div className="space-y-6">
          <div className={contenidosFormClasses.fieldWrapper}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="docente-select"
            >
              Docente titular
            </label>
            <select
              id="docente-select"
              className={contenidosFormClasses.select}
              value={formState.id_personal}
              onChange={manejarSeleccionDocente}
            >
              <option value="">Seleccione un docente</option>
              {docentes.map((docente) => {
                const ocupaOtraAula =
                  docente.ocupado && docente.id_personal !== docenteActualId;
                const descripcionAdicional = docente.aula
                  ? ` Actualmente en ${docente.aula.grado || ""}-${
                      docente.aula.seccion || ""
                    }`
                  : "";
                return (
                  <option
                    key={docente.id_personal}
                    value={docente.id_personal}
                    disabled={ocupaOtraAula}
                  >
                    {docente.nombre_completo}{" "}
                    {docente.cedula ? `(${docente.cedula})` : ""}
                    {ocupaOtraAula ? " - Ocupado" : descripcionAdicional}
                  </option>
                );
              })}
            </select>
            {errores?.id_personal && (
              <p className={helperTextBase}>{errores.id_personal.join(" ")}</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Componentes asignados al docente
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {componentes.map((componente) => {
                const marcado = formState.componentes.has(componente.id);
                return (
                  <label
                    key={`${componente.id}-${componente.areaId}`}
                    className="flex items-start gap-3 rounded-2xl border border-transparent bg-white p-3 shadow-sm transition hover:border-blue-200"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={marcado}
                      onChange={() => alternarComponente(componente.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {componente.nombre}
                      </span>
                      <span className="text-xs text-slate-500">
                        {componente.areaNombre}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            {errores?.componentes && (
              <p className={`${helperTextBase} mt-3`}>
                {errores.componentes.join(" ")}
              </p>
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
            disabled={!docenteSeleccionado || formState.componentes.size === 0}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

DocenteTitularModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  docentes: PropTypes.arrayOf(
    PropTypes.shape({
      id_personal: PropTypes.number.isRequired,
      nombre_completo: PropTypes.string.isRequired,
      cedula: PropTypes.string,
      ocupado: PropTypes.bool,
      aula: PropTypes.shape({
        aula_id: PropTypes.number,
        grado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        seccion: PropTypes.string,
      }),
    })
  ),
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      componentes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          nombre: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  aula: PropTypes.shape({
    docente: PropTypes.shape({
      id_personal: PropTypes.number,
    }),
    componentes_docente: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
  }),
};
