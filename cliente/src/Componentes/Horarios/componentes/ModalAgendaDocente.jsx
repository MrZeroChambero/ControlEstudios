import React, { useMemo, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import TablaHorarioSemanal from "./TablaHorarioSemanal";
import TablaDocentesSeccion from "./TablaDocentesSeccion";
import { filtrarBloquesClase } from "../config/bloquesHorario";
import { agendaDocenteClases } from "./horariosEstilos";
import {
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";

/**
 * @typedef {import("react").ReactNode} ReactNode
 */

const formatearEtiquetaSeccion = (grado, seccion) => {
  const gradoTexto =
    typeof grado === "number" || typeof grado === "string"
      ? String(grado).trim()
      : "";
  const seccionTexto =
    typeof seccion === "number" || typeof seccion === "string"
      ? String(seccion).trim().toUpperCase()
      : "";

  if (!gradoTexto && !seccionTexto) {
    return null;
  }

  if (!gradoTexto || !seccionTexto) {
    return `${gradoTexto || "?"}"${seccionTexto || "?"}`;
  }

  return `${gradoTexto}"${seccionTexto}"`;
};

/**
 * @param {Record<string, any>} bloque
 * @returns {ReactNode}
 */
const renderContenidoDocente = (bloque) => {
  const etiquetaSeccion = formatearEtiquetaSeccion(
    bloque?.grado,
    bloque?.seccion
  );

  return (
    <>
      <p className="text-sm font-semibold text-slate-800">
        {bloque?.nombre_componente ?? "Sin componente"}
      </p>
      {etiquetaSeccion ? (
        <p className="mt-1 text-xs font-semibold text-slate-600">
          {`Sección: ${etiquetaSeccion}`}
        </p>
      ) : null}
    </>
  );
};

const ModalAgendaDocente = ({
  abierto,
  alCerrar,
  docente,
  bloquesConfig,
  onVerDetalle,
  onEliminar,
}) => {
  const [usarDatosEjemplo, setUsarDatosEjemplo] = useState(false);
  const [tipoDocente, setTipoDocente] = useState("aula"); // 'aula' o 'especialista'

  const renderAcciones = useMemo(() => {
    return (bloque) => (
      <div className="flex gap-2">
        <button
          type="button"
          className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
          onClick={() => onVerDetalle && onVerDetalle(bloque)}
          title="Ver detalle"
        >
          <FaEye className={horariosIconClasses.base} />
        </button>
        <button
          type="button"
          className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
          onClick={() => onEliminar && onEliminar(bloque)}
          title="Eliminar"
        >
          <FaTrash className={horariosIconClasses.base} />
        </button>
      </div>
    );
  }, [onVerDetalle, onEliminar]);

  const docenteConEjemplo = useMemo(
    () =>
      usarDatosEjemplo && docente
        ? {
            ...docente,
            funcion:
              tipoDocente === "especialista" ? "Especialista" : "Docente",
            horarios: (() => {
              const dias = [
                "lunes",
                "martes",
                "miercoles",
                "jueves",
                "viernes",
              ];
              const bloquesClase = ["03", "04", "05", "07", "08", "09"];
              const componentes =
                tipoDocente === "especialista"
                  ? [
                      "Educación Física",
                      "Arte",
                      "Música",
                      "Deportes",
                      "Expresión Corporal",
                      "Natación",
                      "Danza",
                    ]
                  : [
                      "Matemáticas",
                      "Lenguaje",
                      "Ciencias",
                      "Historia",
                      "Geografía",
                      "Inglés",
                      "Computación",
                    ];
              let idCounter = 1;
              const horarios = [];
              dias.forEach((dia, diaIndex) => {
                bloquesClase.forEach((bloque, bloqueIndex) => {
                  const bloqueInfo = {
                    "03": { inicio: 7.67, fin: 8.33 },
                    "04": { inicio: 8.33, fin: 9.0 },
                    "05": { inicio: 9.0, fin: 9.67 },
                    "07": { inicio: 10.0, fin: 10.67 },
                    "08": { inicio: 10.67, fin: 11.33 },
                    "09": { inicio: 11.33, fin: 12.0 },
                  }[bloque];
                  horarios.push({
                    id_horario: idCounter++,
                    fk_aula: diaIndex + 1,
                    fk_momento: 1,
                    fk_componente:
                      ((bloqueIndex + diaIndex * bloquesClase.length) %
                        componentes.length) +
                      1,
                    fk_personal: docente.id_personal,
                    grupo: "completo",
                    dia_semana: dia,
                    hora_inicio: bloqueInfo.inicio,
                    hora_fin: bloqueInfo.fin,
                    nombre_componente:
                      componentes[
                        (bloqueIndex + diaIndex * bloquesClase.length) %
                          componentes.length
                      ],
                    grado: Math.floor(diaIndex / 2) + 1,
                    seccion: String.fromCharCode(65 + (diaIndex % 2)), // A o B
                    nombre_momento: "Primer Trimestre",
                    estudiantes: [],
                  });
                });
              });
              return horarios;
            })(),
          }
        : docente,
    [usarDatosEjemplo, docente, tipoDocente]
  );

  const esEspecialista = docenteConEjemplo?.funcion
    ?.toLowerCase()
    .includes("especialista");

  const bloquesConfigFiltrados = useMemo(() => bloquesConfig, [bloquesConfig]);

  const horariosFiltrados = useMemo(
    () =>
      docenteConEjemplo?.horarios
        ? filtrarBloquesClase(docenteConEjemplo.horarios, bloquesConfig)
        : [],
    [docenteConEjemplo, bloquesConfig]
  );

  return (
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Agenda semanal del docente"
      size="xl"
      bodyClassName="space-y-5"
    >
      <div className="flex justify-end gap-2 mb-4">
        <select
          value={tipoDocente}
          onChange={(e) => setTipoDocente(e.target.value)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="aula">Docente de Aula</option>
          <option value="especialista">Especialista</option>
        </select>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 ${
            usarDatosEjemplo
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-300/60"
              : "bg-green-600 hover:bg-green-700 focus:ring-green-300/60"
          }`}
          onClick={() => setUsarDatosEjemplo(!usarDatosEjemplo)}
        >
          {usarDatosEjemplo
            ? "Desactivar datos de ejemplo"
            : "Activar datos de ejemplo"}
        </button>
      </div>
      {docenteConEjemplo ? (
        <>
          <div className={agendaDocenteClases.tarjetaInformacion}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className={agendaDocenteClases.elementoInformacion}>
                <span className={agendaDocenteClases.etiquetaInformacion}>
                  Docente:
                </span>
                <span>{docenteConEjemplo.nombre}</span>
              </div>
              <div className={agendaDocenteClases.elementoInformacion}>
                <span className={agendaDocenteClases.etiquetaInformacion}>
                  Función:
                </span>
                <span>{docenteConEjemplo.funcion}</span>
              </div>
              <div className={agendaDocenteClases.elementoInformacion}>
                <span className={agendaDocenteClases.etiquetaInformacion}>
                  Componentes:
                </span>
                <span>{docenteConEjemplo.componentesTexto}</span>
              </div>
              <div className={agendaDocenteClases.elementoInformacion}>
                <span className={agendaDocenteClases.etiquetaInformacion}>
                  Momentos:
                </span>
                <span>{docenteConEjemplo.momentosTexto}</span>
              </div>
            </div>
          </div>
          <TablaHorarioSemanal
            bloques={horariosFiltrados}
            bloquesConfig={bloquesConfigFiltrados}
            esEspecialista={esEspecialista}
            emptyMessage="Sin clases registradas para este docente."
            renderAcciones={renderAcciones || undefined}
            renderContenidoBloque={renderContenidoDocente}
          />
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">
              Componentes impartidos
            </h4>
            <TablaDocentesSeccion
              bloques={horariosFiltrados}
              bloquesConfig={bloquesConfig}
            />
          </section>
        </>
      ) : null}
    </VentanaModal>
  );
};

export default ModalAgendaDocente;
