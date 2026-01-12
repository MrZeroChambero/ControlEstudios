import React from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import {
  horariosFormClasses,
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";
import {
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
  diasSemanaOpciones,
  formatearDocente,
} from "../utilidadesHorarios";

const ModalFormularioHorario = ({
  abierto,
  alCerrar,
  formulario,
  catalogos,
  errores,
  catalogosCargando,
  guardando,
  momentosDisponibles,
  componentesDisponibles,
  personalDisponible,
  estudiantesDisponibles,
  calendarioPorDia,
  cargandoHorariosAula,
  onCambio,
  onCambioEstudiantes,
  onBlurHora,
  onSubmit,
  onVerDetalle,
  onEliminar,
}) => (
  <VentanaModal
    isOpen={abierto}
    onClose={alCerrar}
    title="Registrar horario"
    size="lg"
    bodyClassName="space-y-6"
  >
    <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
      {errores.general ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {errores.general}
        </div>
      ) : null}

      <div className={horariosFormClasses.grid}>
        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="fk_aula">
            Aula / Sección
          </label>
          <select
            id="fk_aula"
            name="fk_aula"
            value={formulario.fk_aula}
            onChange={onCambio}
            className={
              errores.fk_aula
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
            disabled={catalogosCargando}
          >
            <option value="">Seleccione un aula</option>
            {catalogos.aulas.map((aula) => (
              <option key={aula.id} value={aula.id}>
                {`Grado ${aula.grado ?? ""} - Sección ${aula.seccion ?? ""}`}
              </option>
            ))}
          </select>
          {errores.fk_aula ? (
            <p className={horariosFormClasses.error}>{errores.fk_aula}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Selecciona el aula para cargar los componentes y docentes
              asignados.
            </p>
          )}
        </div>

        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="fk_momento">
            Momento académico
          </label>
          <select
            id="fk_momento"
            name="fk_momento"
            value={formulario.fk_momento}
            onChange={onCambio}
            className={
              errores.fk_momento
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
            disabled={catalogosCargando || catalogos.aulas.length === 0}
          >
            <option value="">Seleccione un momento</option>
            {momentosDisponibles.map((momento) => (
              <option key={momento.id} value={momento.id}>
                {`Momento ${momento.codigo} — Año ${momento.anio_escolar}`}
              </option>
            ))}
          </select>
          {errores.fk_momento ? (
            <p className={horariosFormClasses.error}>{errores.fk_momento}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Debe pertenecer al mismo año escolar del aula seleccionada.
            </p>
          )}
        </div>
      </div>

      <div className={horariosFormClasses.grid}>
        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="fk_componente">
            Componente de aprendizaje
          </label>
          <select
            id="fk_componente"
            name="fk_componente"
            value={formulario.fk_componente}
            onChange={onCambio}
            className={
              errores.fk_componente
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
            disabled={
              catalogosCargando ||
              !formulario.fk_aula ||
              componentesDisponibles.length === 0
            }
          >
            <option value="">Seleccione un componente</option>
            {componentesDisponibles.map((componente) => (
              <option key={componente.id} value={componente.id}>
                {componente.especialista === "si"
                  ? `${componente.nombre} — Especialista`
                  : componente.nombre}
              </option>
            ))}
          </select>
          {errores.fk_componente ? (
            <p className={horariosFormClasses.error}>{errores.fk_componente}</p>
          ) : componentesDisponibles.length === 0 && formulario.fk_aula ? (
            <p className={horariosFormClasses.helper}>
              El aula seleccionada aún no tiene componentes asignados.
            </p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Solo se muestran los componentes asignados a este aula.
            </p>
          )}
        </div>

        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="fk_personal">
            Docente asignado
          </label>
          <select
            id="fk_personal"
            name="fk_personal"
            value={formulario.fk_personal}
            onChange={onCambio}
            className={
              errores.fk_personal
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
            disabled={
              catalogosCargando ||
              !formulario.fk_aula ||
              personalDisponible.length === 0
            }
          >
            <option value="">Seleccione un docente</option>
            {personalDisponible.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {`${docente.nombre} — ${docente.funcion}`}
              </option>
            ))}
          </select>
          {errores.fk_personal ? (
            <p className={horariosFormClasses.error}>{errores.fk_personal}</p>
          ) : personalDisponible.length === 0 && formulario.fk_aula ? (
            <p className={horariosFormClasses.helper}>
              El aula no tiene personal asociado al momento indicado.
            </p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Solo se listan los docentes con asignación vigente para este aula.
            </p>
          )}
        </div>
      </div>

      <div className={horariosFormClasses.grid}>
        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="dia_semana">
            Día de la semana
          </label>
          <select
            id="dia_semana"
            name="dia_semana"
            value={formulario.dia_semana}
            onChange={onCambio}
            className={
              errores.dia_semana
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
          >
            <option value="">Seleccione un día</option>
            {diasSemanaOpciones.map((dia) => (
              <option key={dia.valor} value={dia.valor}>
                {dia.etiqueta}
              </option>
            ))}
          </select>
          {errores.dia_semana ? (
            <p className={horariosFormClasses.error}>{errores.dia_semana}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              El horario será válido únicamente para el día seleccionado.
            </p>
          )}
        </div>

        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="grupo">
            Modalidad del bloque
          </label>
          <select
            id="grupo"
            name="grupo"
            value={formulario.grupo}
            onChange={onCambio}
            className={
              errores.grupo
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            required
          >
            <option value="completo">Grupo completo</option>
            <option value="subgrupo">Subgrupo</option>
          </select>
          {errores.grupo ? (
            <p className={horariosFormClasses.error}>{errores.grupo}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Los horarios grupales solo pueden crearse con cuentas de
              dirección.
            </p>
          )}
        </div>
      </div>

      <div className={horariosFormClasses.grid}>
        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="hora_inicio">
            Hora de inicio
          </label>
          <input
            type="text"
            id="hora_inicio"
            name="hora_inicio"
            value={formulario.hora_inicio}
            onChange={onCambio}
            onBlur={onBlurHora}
            className={
              errores.hora_inicio || errores.horario || errores.duracion
                ? horariosFormClasses.inputInvalid
                : horariosFormClasses.input
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="hh:mm"
            maxLength={5}
            required
          />
          {errores.hora_inicio ? (
            <p className={horariosFormClasses.error}>{errores.hora_inicio}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Formato HH:MM. Ingresa horas desde las 07:00 hasta las 12:00 m.
            </p>
          )}
        </div>

        <div className={horariosFormClasses.fieldWrapper}>
          <label className={horariosFormClasses.label} htmlFor="hora_fin">
            Hora de finalización
          </label>
          <input
            type="text"
            id="hora_fin"
            name="hora_fin"
            value={formulario.hora_fin}
            onChange={onCambio}
            onBlur={onBlurHora}
            className={
              errores.hora_fin || errores.horario || errores.duracion
                ? horariosFormClasses.inputInvalid
                : horariosFormClasses.input
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="hh:mm"
            maxLength={5}
            required
          />
          {errores.hora_fin ? (
            <p className={horariosFormClasses.error}>{errores.hora_fin}</p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Finaliza antes del mediodía. Ejemplo válido: 08:20 a 08:40.
            </p>
          )}
        </div>
      </div>

      {errores.horario ? (
        <p className={horariosFormClasses.error}>{errores.horario}</p>
      ) : null}
      {errores.duracion ? (
        <p className={horariosFormClasses.error}>{errores.duracion}</p>
      ) : !errores.horario ? (
        <p className={horariosFormClasses.helper}>
          Los bloques deben durar entre 20 y 40 minutos y concluir antes de las
          12:00 m.
        </p>
      ) : null}

      {formulario.grupo === "subgrupo" ? (
        <div className={horariosFormClasses.group}>
          <label className={horariosFormClasses.label} htmlFor="estudiantes">
            Estudiantes asignados
          </label>
          <select
            id="estudiantes"
            name="estudiantes"
            multiple
            value={formulario.estudiantes}
            onChange={onCambioEstudiantes}
            className={
              errores.estudiantes
                ? horariosFormClasses.selectInvalid
                : horariosFormClasses.select
            }
            disabled={estudiantesDisponibles.length === 0}
          >
            {estudiantesDisponibles.map((estudiante) => (
              <option key={estudiante.id} value={estudiante.id}>
                {`${estudiante.nombre} — ${estudiante.cedula_escolar}`}
              </option>
            ))}
          </select>
          {errores.estudiantes ? (
            <p className={horariosFormClasses.error}>{errores.estudiantes}</p>
          ) : estudiantesDisponibles.length === 0 ? (
            <p className={horariosFormClasses.helper}>
              No se encontraron estudiantes activos para el aula seleccionada.
            </p>
          ) : (
            <p className={horariosFormClasses.helper}>
              Mantén presionada la tecla Ctrl o Shift para seleccionar múltiples
              estudiantes.
            </p>
          )}
        </div>
      ) : null}

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Agenda semanal del aula
            </h3>
            <p className="text-xs text-slate-500">
              Visualiza los bloques registrados de lunes a viernes.
            </p>
          </div>
        </div>

        {!formulario.fk_aula ? (
          <p className="text-sm text-slate-500">
            Selecciona un aula para visualizar su cronograma semanal.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            {diasSemanaOrdenados.map((dia) => (
              <div
                key={dia}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-700">
                  {diasSemanaEtiquetas[dia]}
                </p>
                {(() => {
                  const bloquesDia = calendarioPorDia[dia] ?? [];
                  const mostrandoSkeleton = cargandoHorariosAula;
                  return (
                    <div className="mt-3 space-y-2">
                      {mostrandoSkeleton ? (
                        <div
                          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                          aria-hidden="true"
                        />
                      ) : bloquesDia.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          Sin bloques registrados.
                        </p>
                      ) : (
                        bloquesDia.map((bloque, indice) => (
                          <div
                            key={`${dia}-${
                              bloque.id_horario ?? bloque.id_temporal ?? indice
                            }`}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wide">
                              {`${bloque.hora_inicio_texto} - ${bloque.hora_fin_texto}`}
                            </p>
                            <p className="text-sm font-semibold">
                              {bloque.nombre_componente ?? "Componente"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatearDocente(bloque) ||
                                "Docente sin definir"}
                            </p>
                            <p className="text-[11px] text-slate-500 capitalize">
                              Modalidad: {bloque.grupo}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
                                onClick={() => onVerDetalle(bloque)}
                                title="Ver detalle"
                              >
                                <FaEye className={horariosIconClasses.base} />
                              </button>
                              <button
                                type="button"
                                className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
                                onClick={() => onEliminar(bloque)}
                                title="Eliminar"
                              >
                                <FaTrash className={horariosIconClasses.base} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={horariosFormClasses.actions}>
        <button
          type="button"
          className={horariosFormClasses.ghostButton}
          onClick={alCerrar}
          disabled={guardando}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={horariosFormClasses.primaryButton}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Registrar horario"}
        </button>
      </div>
    </form>
  </VentanaModal>
);

export default ModalFormularioHorario;
