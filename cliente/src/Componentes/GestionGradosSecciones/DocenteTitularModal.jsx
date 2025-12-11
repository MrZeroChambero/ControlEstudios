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
  });
  const [errores, setErrores] = useState({});
  const componentes = useMemo(() => buildComponentList(areas), [areas]);
  const componentesDocenteAula = useMemo(
    () => componentes.filter((item) => item.es_docente_aula),
    [componentes]
  );
  const componentesDocenteAulaIds = useMemo(() => {
    const ids = componentesDocenteAula.map((item) => item.id);
    return Array.from(new Set(ids));
  }, [componentesDocenteAula]);
  const componentesAsignadosDocente = useMemo(() => {
    const lista = aula?.componentes_docente ?? [];
    return new Set(lista.map((id) => Number(id)));
  }, [aula]);

  useEffect(() => {
    if (!isOpen) {
      setFormState({ id_personal: "" });
      setErrores({});
      return;
    }

    const idDocente = aula?.docente?.id_personal
      ? String(aula.docente.id_personal)
      : "";

    setFormState({ id_personal: idDocente });
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

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setErrores({});

    try {
      await onSubmit({
        id_personal: formState.id_personal
          ? parseInt(formState.id_personal, 10)
          : null,
        componentes: componentesDocenteAulaIds.map((id) => Number(id)),
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
              Selecciona el docente titular. Los componentes marcados como
              "Docente de aula" se asignan automaticamente al guardar.
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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Componentes a cargo del docente de aula
              </p>
              <p className="text-xs text-slate-500">
                Se asignan automaticamente segun la especialidad configurada.
              </p>
            </div>

            {componentesDocenteAula.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {componentesDocenteAula.map((componente) => (
                  <div
                    key={`${componente.id}-${componente.areaId}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span className="block text-sm font-semibold text-slate-800 break-words">
                      {componente.nombre}
                    </span>
                    <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      {componente.areaNombre}
                    </span>
                    <span
                      className={`mt-3 inline-flex w-max items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        componentesAsignadosDocente.has(Number(componente.id))
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {componentesAsignadosDocente.has(Number(componente.id))
                        ? "Asignado"
                        : "Se asignara al guardar"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${helperTextBase} mt-3 text-amber-600`}>
                No hay componentes configurados con especialidad de docente de
                aula. Revise el catalogo de componentes antes de continuar.
              </p>
            )}

            {errores?.componentes && (
              <p className={`${helperTextBase} mt-3 text-rose-600`}>
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
            disabled={
              !docenteSeleccionado || componentesDocenteAulaIds.length === 0
            }
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
          requiere_especialista: PropTypes.bool,
          es_docente_aula: PropTypes.bool,
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
