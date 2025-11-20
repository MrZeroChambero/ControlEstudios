import React from "react";

export const EstudianteViewModal = ({ isOpen, onClose, estudiante }) => {
  if (!isOpen || !estudiante) return null;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-2 text-blue-600 border-b pb-1">
        {title}
      </h3>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-2 mb-2">
      <div className="text-gray-700 font-semibold">{label}</div>
      <div className="col-span-2 text-gray-900">{value ?? "-"}</div>
    </div>
  );

  const persona = estudiante?.persona || estudiante; // fallback si ya viene plano
  const docs = estudiante?.documentos || [];
  const alergias = estudiante?.alergias || [];
  const condiciones = estudiante?.condiciones_salud || [];
  const vacunas = estudiante?.vacunas || [];
  const consultas = estudiante?.consultas_medicas || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalle del Estudiante</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <Section title="Datos de Persona">
          <Row
            label="Nombre"
            value={`${persona.primer_nombre} ${persona.segundo_nombre || ""} ${
              persona.primer_apellido
            } ${persona.segundo_apellido || ""}`}
          />
          <Row label="Cédula" value={persona.cedula} />
          <Row label="Fecha de nacimiento" value={persona.fecha_nacimiento} />
          <Row label="Género" value={persona.genero} />
          <Row label="Estado" value={persona.estado} />
        </Section>

        <Section title="Datos del Estudiante">
          <Row label="Cédula escolar" value={estudiante.cedula_escolar} />
          <Row label="Fecha ingreso" value={estudiante.fecha_ingreso_escuela} />
          <Row label="Vive con padres" value={estudiante.vive_con_padres} />
          <Row label="Orden nacimiento" value={estudiante.orden_nacimiento} />
          <Row label="Semanas gestación" value={estudiante.tiempo_gestacion} />
          <Row label="Embarazo deseado" value={estudiante.embarazo_deseado} />
          <Row label="Tipo parto" value={estudiante.tipo_parto} />
          <Row
            label="Control esfínteres"
            value={estudiante.control_esfinteres}
          />
          <Row label="Control embarazo" value={estudiante.control_embarazo} />
          <Row
            label="Estado estudiante"
            value={estudiante.estado_estudiante || estudiante.estado}
          />
        </Section>

        <Section title="Documentos Académicos">
          {docs.length === 0 && (
            <div className="text-gray-500">Sin documentos.</div>
          )}
          {docs.map((d) => (
            <div
              key={
                d.id_documento || `${d.tipo_documento}-${d.id || Math.random()}`
              }
              className="border rounded p-3 mb-2"
            >
              <div className="font-semibold">{d.tipo_documento}</div>
              <div className="text-sm">
                Entregado: {d.entregado ? "Sí" : "No"}
              </div>
              {d.observaciones && (
                <div className="text-sm">Obs.: {d.observaciones}</div>
              )}
            </div>
          ))}
        </Section>

        <Section title="Alergias">
          {alergias.length === 0 && (
            <div className="text-gray-500">Sin alergias registradas.</div>
          )}
          {alergias.map((a) => (
            <div
              key={a.id_lista_alergia || a.id}
              className="border rounded p-3 mb-2"
            >
              <div className="font-semibold">
                {a.nombre_alergia || a.nombre}
              </div>
              {a.observaciones && (
                <div className="text-sm">Obs.: {a.observaciones}</div>
              )}
            </div>
          ))}
        </Section>

        <Section title="Condiciones de Salud / Patologías">
          {condiciones.length === 0 && (
            <div className="text-gray-500">Sin condiciones registradas.</div>
          )}
          {condiciones.map((c) => (
            <div
              key={c.id_condicion || c.id}
              className="border rounded p-3 mb-2"
            >
              <div className="font-semibold">
                {c.nombre_patologia || c.patologia}
              </div>
              {c.tratamiento && (
                <div className="text-sm">Tratamiento: {c.tratamiento}</div>
              )}
              {c.estado && <div className="text-sm">Estado: {c.estado}</div>}
              {c.observaciones && (
                <div className="text-sm">Obs.: {c.observaciones}</div>
              )}
            </div>
          ))}
        </Section>

        <Section title="Vacunas">
          {vacunas.length === 0 && (
            <div className="text-gray-500">Sin vacunas registradas.</div>
          )}
          {vacunas.map((v) => (
            <div
              key={v.id_vacuna_estudiante || v.id}
              className="border rounded p-3 mb-2"
            >
              <div className="font-semibold">{v.nombre_vacuna || v.nombre}</div>
              {v.fecha_aplicacion && (
                <div className="text-sm">Fecha: {v.fecha_aplicacion}</div>
              )}
              {typeof v.refuerzos !== "undefined" && (
                <div className="text-sm">Refuerzos: {v.refuerzos}</div>
              )}
            </div>
          ))}
        </Section>

        <Section title="Consultas Médicas">
          {consultas.length === 0 && (
            <div className="text-gray-500">Sin consultas registradas.</div>
          )}
          {consultas.map((cm) => (
            <div
              key={cm.id_consulta || cm.id}
              className="border rounded p-3 mb-2"
            >
              <div className="font-semibold">{cm.tipo_consulta}</div>
              {cm.fecha && <div className="text-sm">Fecha: {cm.fecha}</div>}
              {cm.descripcion && (
                <div className="text-sm">Descripción: {cm.descripcion}</div>
              )}
              {cm.tratamiento && (
                <div className="text-sm">Tratamiento: {cm.tratamiento}</div>
              )}
            </div>
          ))}
        </Section>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
