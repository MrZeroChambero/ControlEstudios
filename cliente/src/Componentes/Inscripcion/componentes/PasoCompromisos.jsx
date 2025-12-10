import React from "react";
import { inscripcionFormClasses } from "../../EstilosCliente/EstilosClientes";

const documentosRequeridos = [
  {
    id: "foto_estudiante",
    etiqueta: "Foto tipo carnet del estudiante",
  },
  {
    id: "foto_representante",
    etiqueta: "Foto tipo carnet del representante",
  },
  {
    id: "cedula_estudiante",
    etiqueta: "Copia de la cédula escolar o partida de nacimiento",
  },
  {
    id: "cedula_representante",
    etiqueta: "Copia de la cédula de identidad del representante",
  },
];

export const PasoCompromisos = ({ datos, onToggle, errores = {} }) => (
  <section
    name="seccion-documentos-consignados"
    className={inscripcionFormClasses.section}
  >
    <h3 className={inscripcionFormClasses.sectionTitle}>
      Documentos consignados
    </h3>
    <p className="mb-4 text-sm text-slate-600">
      Marca los documentos y confirmaciones recibidos durante el proceso de
      inscripción. Puedes actualizarlos más tarde desde el módulo de
      estudiantes.
    </p>

    <ul className="space-y-4">
      {documentosRequeridos.map((documento) => (
        <li key={documento.id} className="flex items-start gap-3">
          <input
            type="checkbox"
            id={documento.id}
            checked={(datos[documento.id] ?? "no") === "si"}
            onChange={() => onToggle(documento.id)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={documento.id}
            className="text-sm leading-5 text-slate-800"
          >
            {documento.etiqueta}
          </label>
        </li>
      ))}
    </ul>

    {errores.documentos ? (
      <p className={`${inscripcionFormClasses.error} mt-4`}>
        {errores.documentos}
      </p>
    ) : null}
  </section>
);
