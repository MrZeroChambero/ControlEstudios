import React from "react";
import { loginAlertClasses } from "./loginEstilos";

export const IntentosSeguridad = ({
  mensaje,
  titulo = "Intentos recientes",
}) => {
  if (!mensaje) {
    return null;
  }

  return (
    <section className={loginAlertClasses.attemptInfo}>
      <p className={loginAlertClasses.title}>{titulo}</p>
      <p className={loginAlertClasses.body}>{mensaje}</p>
    </section>
  );
};
