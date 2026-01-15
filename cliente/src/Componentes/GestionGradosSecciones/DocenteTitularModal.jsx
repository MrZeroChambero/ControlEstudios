import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { docenteTitularModalClasses } from "./gestionDocentesEstilos";

const tipoDocenteTokens = {
  aula: "bg-blue-100 text-blue-700",
  especialista: "bg-purple-100 text-purple-700",
  cultura: "bg-amber-100 text-amber-700",
};

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

const obtenerMetaTipoDocente = (componente) => {
  const codigo = componente?.tipo_docente
    ? String(componente.tipo_docente)
    : componente?.es_docente_aula
    ? "aula"
    : componente?.es_cultura
    ? "cultura"
    : componente?.requiere_especialista
    ? "especialista"
    : "aula";

  const etiqueta = componente?.especialista
    ? componente.especialista
    : codigo === "cultura"
    ? "Docente de cultura"
    : codigo === "especialista"
    ? "Docente especialista"
    : "Docente de aula";

  return {
    codigo,
    etiqueta,
    pillClass: tipoDocenteTokens[codigo] || tipoDocenteTokens.aula,
  };
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
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        aula?.docente ? "Actualizar docente titular" : "Asignar docente titular"
      }
      subtitle={`Selecciona el docente titular. Los componentes marcados como "Docente de aula" se asignan automaticamente al guardar.`}
      size="xl"
      contentClassName="max-w-4xl"
    >
      <form
        onSubmit={manejarSubmit}
        className={docenteTitularModalClasses.form}
        autoComplete="off"
      >
        <div className={docenteTitularModalClasses.docenteSelect.wrapper}>
          <label
            className={docenteTitularModalClasses.docenteSelect.label}
            htmlFor="docente-select"
          >
            Docente titular
          </label>
          <select
            id="docente-select"
            className={docenteTitularModalClasses.docenteSelect.select}
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
            <p className={docenteTitularModalClasses.docenteSelect.helper}>
              {errores.id_personal.join(" ")}
            </p>
          )}
        </div>

        <div className={docenteTitularModalClasses.componentesCard.wrapper}>
          <div
            className={
              docenteTitularModalClasses.componentesCard.header.container
            }
          >
            <p
              className={
                docenteTitularModalClasses.componentesCard.header.title
              }
            >
              Componentes a cargo del docente de aula
            </p>
            <p
              className={
                docenteTitularModalClasses.componentesCard.header.helper
              }
            >
              Se asignan automaticamente segun la especialidad configurada.
            </p>
          </div>

          {componentesDocenteAula.length ? (
            <div className={docenteTitularModalClasses.componentesCard.list}>
              {componentesDocenteAula.map((componente) => (
                <div
                  key={`${componente.id}-${componente.areaId}`}
                  className={docenteTitularModalClasses.componentesCard.item}
                >
                  {(() => {
                    const meta = obtenerMetaTipoDocente(componente);
                    return (
                      <span
                        className={`${docenteTitularModalClasses.componentesCard.typePillBase} ${meta.pillClass} mb-2 w-max`}
                      >
                        {meta.etiqueta}
                      </span>
                    );
                  })()}
                  <span
                    className={
                      docenteTitularModalClasses.componentesCard.componentName
                    }
                  >
                    {componente.nombre}
                  </span>
                  <span
                    className={
                      docenteTitularModalClasses.componentesCard.areaLabel
                    }
                  >
                    {componente.areaNombre}
                  </span>
                  <span
                    className={`${
                      docenteTitularModalClasses.componentesCard.statusPillBase
                    } ${
                      componentesAsignadosDocente.has(Number(componente.id))
                        ? docenteTitularModalClasses.componentesCard
                            .statusVariants.assigned
                        : docenteTitularModalClasses.componentesCard
                            .statusVariants.pending
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
            <p
              className={docenteTitularModalClasses.componentesCard.emptyHelper}
            >
              No hay componentes configurados con especialidad de docente de
              aula. Revise el catalogo de componentes antes de continuar.
            </p>
          )}

          {errores?.componentes && (
            <p
              className={docenteTitularModalClasses.componentesCard.errorHelper}
            >
              {errores.componentes.join(" ")}
            </p>
          )}
        </div>

        {errores?.generales && (
          <div className={docenteTitularModalClasses.errorBanner}>
            {errores.generales.join(" ")}
          </div>
        )}

        <div className={docenteTitularModalClasses.actions.wrapper}>
          <button
            type="button"
            onClick={onClose}
            className={docenteTitularModalClasses.actions.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={docenteTitularModalClasses.actions.submitButton}
            disabled={
              !docenteSeleccionado || componentesDocenteAulaIds.length === 0
            }
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </VentanaModal>
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
          tipo_docente: PropTypes.string,
          es_cultura: PropTypes.bool,
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
