import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import CalendarioSeccionDetallado from "./CalendarioSeccionDetallado";
import {
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";
import { exportarHorarioSemanal } from "../../../utilidades/exportadorPDF";

const ModalCalendarioAula = ({
  abierto,
  alCerrar,
  seccion,
  bloquesConfig,
  onVerDetalle,
}) => {
  const [usarDatosEjemplo, setUsarDatosEjemplo] = useState(false);

  const handleExportar = () => {
    if (!seccion) return;
    const titulo = "Horario de Clases";
    const subtitulo = `Grado ${seccion.grado} - Sección ${seccion.seccion} (${seccion.anioEscolar})`;
    exportarHorarioSemanal(titulo, subtitulo, seccion.horarios);
  };

  const seccionConEjemplo =
    usarDatosEjemplo && seccion
      ? {
          ...seccion,
          horarios: (() => {
            const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
            const bloquesClase = ["03", "04", "05", "07", "08", "09"];
            const componentes = [
              "Matemáticas",
              "Lenguaje",
              "Ciencias",
              "Historia",
              "Geografía",
              "Inglés",
              "Arte",
              "Música",
              "Educación Física",
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
                  fk_aula: seccion.id_aula,
                  fk_momento: 1,
                  fk_componente:
                    ((bloqueIndex + diaIndex * bloquesClase.length) %
                      componentes.length) +
                    1,
                  fk_personal:
                    ((bloqueIndex + diaIndex * bloquesClase.length) % 10) + 1,
                  grupo: "completo",
                  dia_semana: dia,
                  hora_inicio: bloqueInfo.inicio,
                  hora_fin: bloqueInfo.fin,
                  nombre_componente:
                    componentes[
                      (bloqueIndex + diaIndex * bloquesClase.length) %
                        componentes.length
                    ],
                  grado: seccion.grado,
                  seccion: seccion.seccion,
                  nombre_momento: "Primer Trimestre",
                  estudiantes: [],
                });
              });
            });
            return horarios;
          })(),
        }
      : seccion;

  return (
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Calendario semanal del aula"
      size="full"
      maxWidthClass="max-w-[95vw]"
      bodyClassName="space-y-5"
    >
      <div className="flex justify-end items-center gap-4 mb-4">
        <button
          type="button"
          onClick={handleExportar}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/60"
        >
          <FaFilePdf />
          <span>Exportar a PDF</span>
        </button>
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
      {seccionConEjemplo ? (
        <CalendarioSeccionDetallado
          seccion={seccionConEjemplo}
          bloquesConfig={bloquesConfig}
          emptyMessage="Sin bloques programados para esta sección."
          onVerDetalle={onVerDetalle}
        />
      ) : null}
    </VentanaModal>
  );
};

export default ModalCalendarioAula;
