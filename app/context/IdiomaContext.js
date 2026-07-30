"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { TEXTOS } from "../data/textos";

const STORAGE_KEY = "minenchants-idioma-v1";
const IDIOMA_POR_DEFECTO = "en";

function cargarGuardado() {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    return guardado === "es" || guardado === "en" ? guardado : null;
  } catch {
    return null;
  }
}

function guardar(idioma) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, idioma);
  } catch {
    // LocalStorage no disponible: el idioma sigue funcionando en memoria.
  }
}

const IdiomaContext = createContext(null);

export function IdiomaProvider({ children }) {
  const [idioma, setIdiomaState] = useState(IDIOMA_POR_DEFECTO);

  // Cargar preferencia guardada después del montaje.
  useLayoutEffect(() => {
    const guardado = cargarGuardado();
    if (guardado) setIdiomaState(guardado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener sincronizado el atributo lang del <html> (accesibilidad/SEO).
  useLayoutEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = idioma;
    }
  }, [idioma]);

  const setIdioma = (nuevoIdioma) => {
    setIdiomaState(nuevoIdioma);
    guardar(nuevoIdioma);
  };

  // Traduce una clave del diccionario de textos (ver app/data/textos.js).
  const t = (clave) =>
    TEXTOS[idioma]?.[clave] ?? TEXTOS[IDIOMA_POR_DEFECTO][clave] ?? clave;

  return (
    <IdiomaContext.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  const contexto = useContext(IdiomaContext);
  if (!contexto) {
    throw new Error("useIdioma debe usarse dentro de <IdiomaProvider>");
  }
  return contexto;
}