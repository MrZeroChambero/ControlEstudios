import React from "react";
import {
  inscripcionFormClasses,
  pasoCompromisosClasses,
} from "../inscripcionEstilos";

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
    <p className={pasoCompromisosClasses.description}>
      Marca los documentos y confirmaciones recibidos durante el proceso de
      inscripción. Puedes actualizarlos más tarde desde el módulo de
      estudiantes.
    </p>

    <ul className={pasoCompromisosClasses.list}>
      {documentosRequeridos.map((documento) => (
        <li key={documento.id} className={pasoCompromisosClasses.item}>
          <input
            type="checkbox"
            id={documento.id}
            checked={(datos[documento.id] ?? "no") === "si"}
            onChange={() => onToggle(documento.id)}
            className={pasoCompromisosClasses.checkbox}
          />
          <label
            htmlFor={documento.id}
            className={pasoCompromisosClasses.label}
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
