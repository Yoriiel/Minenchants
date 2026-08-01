"use client";

import { useEffect, useRef, useState } from "react";
import { PISTAS, PISTA_INICIAL } from "../data/musica";

const STORAGE_KEY = "minenchants-musica-v1";
const VOLUMEN_POR_DEFECTO = 50;
const INDICE_INICIAL = Math.max(0, PISTAS.indexOf(PISTA_INICIAL));

// Pausa entre una pista y la siguiente cuando termina sola (5 minutos).
const PAUSA_ENTRE_PISTAS_MS = 5 * 60 * 1000;

function cargarGuardado() {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    return {
      activo: datos.activo === undefined ? true : Boolean(datos.activo),
      volumen: typeof datos.volumen === "number" ? datos.volumen : VOLUMEN_POR_DEFECTO,
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
    // LocalStorage no disponible: la preferencia sigue funcionando en memoria.
  }
}

// Elige una pista al azar entre todas, evitando repetir la que se acaba de terminar (índice actual).
function elegirPistaAleatoria(indiceActual) {
  if (PISTAS.length <= 1) return 0;
  let indice;
  do {
    indice = Math.floor(Math.random() * PISTAS.length);
  } while (indice === indiceActual);
  return indice;
}

export function useMusicPlayer() {
  const audioRef = useRef(null);
  const activoRef = useRef(true);
  const indiceRef = useRef(INDICE_INICIAL);
  const timeoutEsperaRef = useRef(null);

  const [indicePista, setIndicePista] = useState(INDICE_INICIAL);
  const [activo, setActivoState] = useState(true);
  const [volumen, setVolumenState] = useState(VOLUMEN_POR_DEFECTO);

  activoRef.current = activo;
  indiceRef.current = indicePista;

  // Cancela la espera pendiente (si hay una pista programada para arrancar después de la pausa de 5 minutos).
  const limpiarEspera = () => {
    if (timeoutEsperaRef.current) {
      window.clearTimeout(timeoutEsperaRef.current);
      timeoutEsperaRef.current = null;
    }
  };

  // Programa la siguiente pista (aleatoria, sin repetir la actual) después de la pausa de PAUSA_ENTRE_PISTAS_MS.
  const programarSiguientePista = () => {
    limpiarEspera();
    timeoutEsperaRef.current = window.setTimeout(() => {
      timeoutEsperaRef.current = null;
      setIndicePista(elegirPistaAleatoria(indiceRef.current));
    }, PAUSA_ENTRE_PISTAS_MS);
  };

  // Cargar preferencias guardadas (activo/volumen) después del montaje.
  useEffect(() => {
    const guardado = cargarGuardado();
    if (guardado) {
      setActivoState(guardado.activo);
      setVolumenState(guardado.volumen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crear el elemento <audio> una sola vez. Al terminar una pista, se programa la siguiente después de la pausa (ver programarSiguientePista).
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = VOLUMEN_POR_DEFECTO / 100;
    audioRef.current = audio;

    const alTerminar = () => {
      if (activoRef.current) programarSiguientePista();
    };
    audio.addEventListener("ended", alTerminar);

    return () => {
      audio.removeEventListener("ended", alTerminar);
      limpiarEspera();
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambio de pista: solo actualiza el src (no se dispara con otros cambios de estado, así no reinicia la pista al pausar/reanudar).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = encodeURI(PISTAS[indicePista]);
    if (activoRef.current) {
      audio.play().catch(() => {
        // El navegador bloqueó el autoplay: se reintenta en la próxima interacción del usuario (ver efecto de abajo).
      });
    }
  }, [indicePista]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (activo) {
      if (audio.ended) {
        if (!timeoutEsperaRef.current) programarSiguientePista();
      } else {
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
      limpiarEspera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  // Si el navegador bloqueó el autoplay inicial, se reintenta apenas el usuario interactúa por primera vez con la página.
  useEffect(() => {
    if (!activo) return;
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    const reintentar = () => {
      audio.play().catch(() => {});
    };
    document.addEventListener("pointerdown", reintentar, { once: true });
    document.addEventListener("keydown", reintentar, { once: true });
    return () => {
      document.removeEventListener("pointerdown", reintentar);
      document.removeEventListener("keydown", reintentar);
    };
  }, [activo, indicePista]);

  // Volumen.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.min(1, Math.max(0, volumen / 100));
  }, [volumen]);

  const alternarActivo = () => {
    setActivoState((valorPrevio) => {
      const nuevoValor = !valorPrevio;
      guardar({ activo: nuevoValor, volumen });
      return nuevoValor;
    });
  };

  const cambiarVolumen = (nuevoVolumen) => {
    setVolumenState(nuevoVolumen);
    guardar({ activo, volumen: nuevoVolumen });
  };

  // Cambiar de pista manualmente salta cualquier pausa pendiente.
  const pistaSiguiente = () => {
    limpiarEspera();
    setIndicePista((i) => (i + 1) % PISTAS.length);
  };

  const pistaAnterior = () => {
    limpiarEspera();
    setIndicePista((i) => (i - 1 + PISTAS.length) % PISTAS.length);
  };

  return {
    activo,
    volumen,
    alternarActivo,
    cambiarVolumen,
    pistaSiguiente,
    pistaAnterior,
  };
}