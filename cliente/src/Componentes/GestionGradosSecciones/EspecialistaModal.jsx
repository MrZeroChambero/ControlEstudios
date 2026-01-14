import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  contenidosFormClasses,
  neutralButtonBase,
  helperTextBase,
  typePillBase,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

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

const tipoDocenteTokens = {
  aula: "bg-blue-100 text-blue-700",
  especialista: "bg-purple-100 text-purple-700",
  cultura: "bg-amber-100 text-amber-700",
};

const normalizarCodigoTipoDocente = (valor) => {
  const texto = String(valor ?? "")
    .toLowerCase()
    .trim();

  if (!texto || texto === "no") {
    return "aula";
  }

  if (texto.includes("cultur")) {
    return "cultura";
  }

  if (texto.includes("especial")) {
    return "especialista";
  }

  if (texto.includes("aula")) {
    return "aula";
  }

  return "especialista";
};

const obtenerMetaTipoDocente = (componente) => {
  const codigo = componente?.tipo_docente
    ? String(componente.tipo_docente)
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
    pillClass: tipoDocenteTokens[codigo] || tipoDocenteTokens.especialista,
  };
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
  const componentesPorId = useMemo(() => {
    const mapa = new Map();
    componentesEspecialistas.forEach((item) => {
      mapa.set(String(item.id), item);
    });
    return mapa;
  }, [componentesEspecialistas]);
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

  const componenteActivo = useMemo(() => {
    if (!formState.id_componente) {
      return null;
    }
    return componentesPorId.get(String(formState.id_componente)) ?? null;
  }, [componentesPorId, formState.id_componente]);

  const especialistasTipados = useMemo(
    () =>
      especialistas.map((item) => ({
        ...item,
        tipo_docente: normalizarCodigoTipoDocente(item.funcion),
      })),
    [especialistas]
  );

  const especialistasFiltrados = useMemo(() => {
    if (!componenteActivo) {
      return especialistasTipados;
    }

    const tipoEsperado =
      componenteActivo.tipo_docente === "cultura" ? "cultura" : "especialista";
    return especialistasTipados.filter(
      (item) => item.tipo_docente === tipoEsperado
    );
  }, [componenteActivo, especialistasTipados]);

  useEffect(() => {
    if (!isOpen || !formState.id_personal) {
      return;
    }

    const sigueVigente = especialistasFiltrados.some(
      (item) => String(item.id_personal) === formState.id_personal
    );

    if (!sigueVigente) {
      setFormState((prev) => ({ ...prev, id_personal: "" }));
    }
  }, [especialistasFiltrados, formState.id_personal, isOpen]);

  const opcionesEspecialistas = useMemo(() => {
    if (!componenteActivo) {
      return especialistasTipados;
    }
    if (especialistasFiltrados.length) {
      return especialistasFiltrados;
    }
    return [];
  }, [componenteActivo, especialistasFiltrados, especialistasTipados]);

  const sinEspecialistasDisponibles =
    Boolean(componenteActivo) && opcionesEspecialistas.length === 0;

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
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        componenteSeleccionado
          ? `Asignar especialista a ${componenteSeleccionado.nombre}`
          : "Asignar especialista"
      }
      subtitle="Asigna un especialista solo a los componentes que lo requieren."
      size="lg"
      contentClassName="max-w-3xl"
    >
      <form onSubmit={manejarSubmit} className="space-y-4" autoComplete="off">
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
            {componenteActivo ? (
              <div className="space-y-3">
                {(() => {
                  const meta = obtenerMetaTipoDocente(componenteActivo);
                  return (
                    <span
                      className={`${typePillBase} ${meta.pillClass} inline-flex`}
                    >
                      {meta.etiqueta}
                    </span>
                  );
                })()}
                <p className="text-sm font-semibold text-slate-700">
                  {componenteActivo.nombre}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Area: {componenteActivo.areaNombre}
                </p>
                <p className="text-xs text-slate-500">
                  {componenteActivo.tipo_docente === "cultura"
                    ? "Este componente solo puede ser impartido por docentes de cultura."
                    : "Este componente requiere un docente especialista asignado."}
                </p>
              </div>
            ) : (
              <p className={`${helperTextBase} text-amber-600`}>
                Selecciona un componente para ver los detalles.
              </p>
            )}
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
            disabled={sinEspecialistasDisponibles}
          >
            <option value="">Seleccione un especialista</option>
            {opcionesEspecialistas.map((especialista) => (
              <option
                key={especialista.id_personal}
                value={especialista.id_personal}
              >
                {especialista.nombre_completo}
                {especialista.cedula ? ` (${especialista.cedula})` : ""}
                {especialista.tipo_docente === "cultura"
                  ? " — Cultura"
                  : " — Especialista"}
              </option>
            ))}
          </select>
          {errores?.id_personal && (
            <p className={helperTextBase}>{errores.id_personal.join(" ")}</p>
          )}
          {sinEspecialistasDisponibles && !errores?.id_personal && (
            <p className={`${helperTextBase} mt-2 text-amber-600`}>
              No hay especialistas disponibles para el tipo seleccionado.
            </p>
          )}
        </div>

        {errores?.generales && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
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
    </VentanaModal>
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
      funcion: PropTypes.string,
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
