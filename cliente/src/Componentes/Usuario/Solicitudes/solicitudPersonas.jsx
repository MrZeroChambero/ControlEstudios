import axios from "axios";
import Swal from "sweetalert2";
export const solicitudPersonas = async ({ setPersonas }) => {
  const URL = "http://localhost:8080/controlestudios/servidor/personas";
  try {
    const response = await axios.get(URL, { withCredentials: true });
    //console.log("se soliciton los datos de personas");
    const data = response.data.data;
    if (response.data.back === undefined) {
      Swal.fire("Error", "No se pudieron cargar las personas.", "error");
      setPersonas([]);
      return;
    }
    setPersonas(data);
    // console.log("se cargaron los datos de personas");
    //console.log(response.data.data);
  } catch (error) {
    console.error("Error al obtener personas:", error);
    Swal.fire("Error", "No se pudieron cargar las personas.", "error");
  }
};
