import jsPDF from "jspdf";
import "jspdf-autotable";
import { diasSemanaEtiquetas, diasSemanaOrdenados } from "../Componentes/Horarios/utilidadesHorarios";
import { BLOQUES_HORARIO_BASE } from "../Componentes/Horarios/config/bloquesHorario";

// Función auxiliar para configurar el documento
const configurarDocumento = (doc, titulo, subtitulo) => {
  // Aquí se podría añadir un logo
  // doc.addImage(logo, 'PNG', 10, 10, 30, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, doc.internal.pageSize.getWidth() / 2, 20, {
    align: "center",
  });

  if (subtitulo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitulo, doc.internal.pageSize.getWidth() / 2, 28, {
      align: "center",
    });
  }
};

/**
 * Exporta un horario semanal a PDF.
 * @param {string} titulo - Título principal del documento.
 * @param {string} subtitulo - Subtítulo (ej. nombre del aula o docente).
 * @param {Array} bloques - Array de bloques de horario a renderizar.
 */
export const exportarHorarioSemanal = (titulo, subtitulo, bloques) => {
  const doc = new jsPDF({ orientation: "landscape" });
  configurarDocumento(doc, titulo, subtitulo);

  const head = [
    [
      "Hora",
      ...diasSemanaOrdenados.map((dia) => diasSemanaEtiquetas[dia]),
    ],
  ];

  // Agrupar bloques por día y hora de inicio para fácil acceso
  const bloquesPorDiaYHora = diasSemanaOrdenados.reduce((acc, dia) => {
    acc[dia] = {};
    return acc;
  }, {});

  bloques.forEach(b => {
    if(!bloquesPorDiaYHora[b.dia_semana]) bloquesPorDiaYHora[b.dia_semana] = {};
    const horaKey = b.hora_inicio_texto || new Date(b.hora_inicio).toTimeString().slice(0,5); // Usar un formato de hora consistente
    if(!bloquesPorDiaYHora[b.dia_semana][horaKey]) bloquesPorDiaYHora[b.dia_semana][horaKey] = [];
    bloquesPorDiaYHora[b.dia_semana][horaKey].push(b);
  });

  const body = BLOQUES_HORARIO_BASE.map((bloqueBase) => {
    const fila = [`${bloqueBase.inicio} - ${bloqueBase.fin}`];
    diasSemanaOrdenados.forEach((dia) => {
        // Esta lógica es simplificada. Un bloque puede tener múltiples entradas en la misma celda
        // si hay subgrupos, etc.
        const bloquesCelda = bloques.filter(b => b.dia_semana === dia && b.hora_inicio_texto === bloqueBase.inicio);
        const contenidoCelda = bloquesCelda.map(b => {
            let texto = b.nombre_componente;
            if(b.grupo === 'subgrupo'){
                texto += ` (Subgrupo: ${b.estudiantes.length} est.)`;
            }
            return texto;
        }).join('\n');
      fila.push(contenidoCelda);
    });
    return fila;
  });

  doc.autoTable({
    head: head,
    body: body,
    startY: 35,
    theme: "grid",
    headStyles: {
      fillColor: [22, 160, 133], // Un color verde azulado
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 3,
      fontSize: 8,
      valign: 'middle',
      halign: 'center'
    },
  });

  doc.save(`${titulo.replace(/ /g, "_")}_${subtitulo.replace(/ /g, "_")}.pdf`);
};


/**
 * Exporta una lista de estudiantes de un subgrupo a PDF.
 * @param {object} infoSubgrupo - Información del subgrupo.
 * @param {string} infoSubgrupo.componente - Nombre del componente.
 * @param {string} infoSubgrupo.aula - Nombre del aula.
 * @param {Array} infoSubgrupo.estudiantes - Array de objetos de estudiantes.
 */
export const exportarListadoSubgrupo = (infoSubgrupo) => {
  const { componente, aula, estudiantes } = infoSubgrupo;
  const doc = new jsPDF();
  const titulo = `Listado de Subgrupo - ${componente}`;
  configurarDocumento(doc, titulo, aula);

  const head = [["Cédula Escolar", "Apellidos y Nombres"]];
  const body = estudiantes.map(e => [
      e.cedula_escolar || 'N/A',
      `${e.primer_apellido}, ${e.primer_nombre}`
    ]);

  doc.autoTable({
    head: head,
    body: body,
    startY: 35,
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185], // Un color azul
      textColor: 255,
      fontStyle: "bold",
    },
  });

  doc.save(`Listado_Subgrupo_${componente.replace(/ /g, "_")}.pdf`);
};
