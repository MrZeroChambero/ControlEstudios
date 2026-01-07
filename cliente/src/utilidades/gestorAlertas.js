import Swal from "sweetalert2";

const esperar = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

let instalado = false;

export const instalarGestorAlertas = (SwalInstance = Swal, esperaMs = 5000) => {
  if (instalado) {
    return SwalInstance;
  }

  if (!SwalInstance || typeof SwalInstance.fire !== "function") {
    console.warn(
      "No se pudo instalar el gestor de alertas: instancia inválida."
    );
    return SwalInstance;
  }

  instalado = true;
  const cola = [];
  let procesando = false;
  const originalFire = SwalInstance.fire.bind(SwalInstance);

  const procesarCola = async () => {
    if (procesando) return;
    procesando = true;

    while (cola.length > 0) {
      const { args, resolve, reject } = cola.shift();
      try {
        const resultado = await originalFire(...args);
        resolve(resultado);
      } catch (error) {
        reject(error);
      }
    }

    procesando = false;
  };

  SwalInstance.fire = (...args) =>
    new Promise((resolve, reject) => {
      cola.push({ args, resolve, reject });
      if (!procesando) {
        // Solo iniciar el procesamiento si no está en curso
        procesarCola();
      }
    });

  return SwalInstance;
};

export default instalarGestorAlertas;
