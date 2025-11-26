import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  solicitarAnios,
  crearAnio,
  aperturarAnio,
} from "../../api/anioEscolarService";
import AnioEscolarForm from "./AnioEscolarForm";
import AnioEscolarTable from "./AnioEscolarTable";
import MomentsEditor from "./MomentsEditor";
import GestionApertura from "./GestionApertura";

export default function AnioEscolar() {
  const [anios, setAnios] = useState([]);
  const [createdMomentosIds, setCreatedMomentosIds] = useState([]);
  const [createdAnioId, setCreatedAnioId] = useState(null);
  const [gestionId, setGestionId] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    await solicitarAnios(setAnios, Swal);
  };

  const handleCrear = async (payload) => {
    const res = await crearAnio(payload, Swal);
    if (res && res.back === true) {
      Swal.fire("OK", res.message || "Año creado", "success");
      await cargar();
      // si el backend devolvió IDs de momentos los almacenamos para edición
      const data = res.data || res;
      if (data && data.momentos) {
        setCreatedMomentosIds(data.momentos);
        if (data.id_anio) setCreatedAnioId(data.id_anio);
        if (data.id_anio === undefined && data.id) setCreatedAnioId(data.id);
      }
      return data;
    }
    Swal.fire("Error", res.message || "No se creó el año", "error");
    return null;
  };

  const handleAperturar = async (id) => {
    const res = await aperturarAnio(id, Swal);
    if (res && res.back === true) {
      Swal.fire("OK", res.message || "Año aperturado", "success");
      cargar();
    } else {
      Swal.fire("Error", res.message || "No se pudo aperturar", "error");
    }
  };

  const abrirGestion = (id) => {
    setGestionId(id);
  };

  const cerrarGestion = () => {
    setGestionId(null);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Gestión de Años Escolares</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <AnioEscolarForm onCrear={handleCrear} />
        </div>
        <div>
          <AnioEscolarTable
            anios={anios}
            onAperturar={handleAperturar}
            onGestion={abrirGestion}
            onRefresh={cargar}
          />
          {createdMomentosIds && createdMomentosIds.length > 0 && (
            <div className="mt-4">
              <MomentsEditor
                idAnio={createdAnioId}
                initialMomentosIds={createdMomentosIds}
                onSaved={() => {
                  setCreatedMomentosIds([]);
                  setCreatedAnioId(null);
                  cargar();
                }}
              />
            </div>
          )}
          {gestionId && (
            <div className="mt-4">
              <GestionApertura
                idAnio={gestionId}
                onClose={cerrarGestion}
                onRefrescar={cargar}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
