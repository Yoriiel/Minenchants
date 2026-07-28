"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "minenchants-configuracion-v1";

function cargarGuardado() {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    return {
      particulasApagadas: Boolean(datos.particulasApagadas),
      animacionesApagadas: Boolean(datos.animacionesApagadas),
    };
  } catch {
    return null;
  }
}

function guardar(config) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // LocalStorage no disponible: la configuracion sigue funcionando en memoria.
  }
}

const ConfiguracionContext = createContext(null);

export function ConfiguracionProvider({ children }) {
  const [particulasApagadas, setParticulasApagadasState] = useState(false);
  const [animacionesApagadas, setAnimacionesApagadasState] = useState(false);

  useLayoutEffect(() => {
    const guardado = cargarGuardado();
    if (guardado) {
      setParticulasApagadasState(guardado.particulasApagadas);
      setAnimacionesApagadasState(guardado.animacionesApagadas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setParticulasApagadas = (valor) => {
    setParticulasApagadasState(valor);
    guardar({ particulasApagadas: valor, animacionesApagadas });
  };

  const setAnimacionesApagadas = (valor) => {
    setAnimacionesApagadasState(valor);
    guardar({ particulasApagadas, animacionesApagadas: valor });
  };

  return (
    <ConfiguracionContext.Provider
      value={{
        particulasApagadas,
        animacionesApagadas,
        setParticulasApagadas,
        setAnimacionesApagadas,
      }}
    >
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracionContext() {
  const contexto = useContext(ConfiguracionContext);
  if (!contexto) {
    throw new Error(
      "useConfiguracionContext debe usarse dentro de <ConfiguracionProvider>"
    );
  }
  return contexto;
}