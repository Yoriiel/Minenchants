"use client";

import { useEffect, useState } from "react";

// Casillero 0..26: grid principal (3 filas x 9 columnas).
// Casillero 27..27+casillasHotbar-1: fila de abajo, la MISMA que la
// barra HUD real (casilla i del HUD === casillero HOTBAR_INICIO + i).
const TOTAL_GRID_PRINCIPAL = 27;

// Bumpeamos la key de guardado: el formato de abajo es incompatible
// con el de la versión vieja (antes se guardaba un índice 0..35 por
// ítem elegido al azar; ahora el estado inicial es determinístico y
// además vive en un objeto con forma distinta).
const STORAGE_KEY = "minenchants-posiciones-inventario-v2";

function hotbarInicio() {
  return TOTAL_GRID_PRINCIPAL;
}

function totalCasillas(casillasHotbar) {
  return TOTAL_GRID_PRINCIPAL + casillasHotbar;
}

// Estado inicial: cada ítem cae en la fila de abajo, en el mismo
// orden en que aparece en el catálogo (ITEMS) — exactamente lo mismo
// que ya se ve hoy en la barra HUD real. El grid principal (arriba)
// arranca vacío.
function generarPosicionesIniciales(items, casillasHotbar) {
  const inicio = hotbarInicio();
  const posiciones = {};
  let siguienteCasilleroArriba = 0;
  items.forEach((item, idx) => {
    if (idx < casillasHotbar) {
      posiciones[item.id] = inicio + idx;
    } else {
      // Más ítems que casillas de hotbar (no pasa hoy, pero por si
      // el catálogo crece): los que sobran van al grid de arriba.
      posiciones[item.id] = siguienteCasilleroArriba;
      siguienteCasilleroArriba++;
    }
  });
  return posiciones;
}

function cargarPosicionesGuardadas(items, casillasHotbar) {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;
    const posiciones = JSON.parse(guardado);

    // Validamos que sea un objeto { idItem: numeroDeCasillero } con
    // valores dentro del rango válido y sin dos ítems compartiendo
    // casillero (por las dudas, si algo externo tocó el LocalStorage).
    const total = totalCasillas(casillasHotbar);
    const vistos = new Set();
    for (const item of items) {
      const casillero = posiciones[item.id];
      if (typeof casillero !== "number" || casillero < 0 || casillero >= total) return null;
      if (vistos.has(casillero)) return null;
      vistos.add(casillero);
    }
    return posiciones;
  } catch {
    return null;
  }
}

function guardarPosiciones(posiciones) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posiciones));
  } catch {
    // Si LocalStorage no está disponible (modo privado, cuota llena,
    // etc.) simplemente no persistimos; el popup sigue funcionando.
  }
}

// Primer casillero libre (no ocupado por ningún ítem en `posiciones`),
// recorriendo primero la fila de abajo/HUD y después el grid de arriba.
// Se usa como respaldo si al cerrar el popup el casillero "de origen"
// del ítem principal ya fue ocupado por otra cosa mientras tanto.
function primerCasilleroLibre(posiciones, casillasHotbar) {
  const ocupados = new Set(Object.values(posiciones));
  const total = totalCasillas(casillasHotbar);
  for (let i = 0; i < total; i++) {
    if (!ocupados.has(i)) return i;
  }
  return null; // no debería pasar: siempre hay más casilleros que ítems
}

/**
 * Maneja la apertura/cierre del popup de la mesa de encantamientos y
 * en qué casillero está cada ítem.
 *
 * Modelo de datos (todo en un solo lugar, sin duplicados):
 *   - `posiciones`: { [idItem]: numeroDeCasillero } — la ÚNICA fuente
 *     de verdad de dónde vive cada ítem cuando está en un casillero
 *     real (0..26 grid de arriba, 27.. fila de abajo == barra HUD).
 *     Se persiste en LocalStorage.
 *   - `principal`: id del ítem que está en la casilla bajo el libro,
 *     o null. Mientras un ítem está ahí, se lo saca de `posiciones`
 *     (no tiene casillero real) — igual que el "cursor" que sostiene
 *     un ítem en Minecraft. Así es IMPOSIBLE que dos ítems compartan
 *     casillero: el que está en la principal, por definición, no
 *     ocupa ninguno.
 *   - `principalUltimaPosicion`: el casillero real que ocupaba el
 *     ítem que está actualmente en la principal, justo antes de
 *     entrar ahí. Se usa para devolverlo a ese lugar al cerrar el
 *     popup (Parte 4).
 */
export function useInventoryPopup(items, casillasHotbar) {
  const [abierto, setAbierto] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [principalUltimaPosicion, setPrincipalUltimaPosicion] = useState(null);

  const [posiciones, setPosiciones] = useState(() => {
    const guardadas = cargarPosicionesGuardadas(items, casillasHotbar);
    if (guardadas) return guardadas;
    const iniciales = generarPosicionesIniciales(items, casillasHotbar);
    guardarPosiciones(iniciales);
    return iniciales;
  });

  // Ítem que ocupa un casillero real dado (o null si está vacío).
  const idEnCasillero = (casillero) => {
    for (const idItem in posiciones) {
      if (posiciones[idItem] === casillero) return idItem;
    }
    return null;
  };

  const idEnOrigen = (origen) => {
    if (!abierto) return null;
    return origen === "principal" ? principal : idEnCasillero(origen);
  };

  const abrirPopup = (item = null) => {
    setPrincipalUltimaPosicion(item ? posiciones[item.id] ?? null : null);
    setPrincipal(item ? item.id : null);
    if (item) {
      setPosiciones((prev) => {
        if (!(item.id in prev)) return prev;
        const siguiente = { ...prev };
        delete siguiente[item.id];
        return siguiente;
      });
    }
    setAbierto(true);
  };

  const cerrarPopup = () => {
    if (principal) {
      setPosiciones((prev) => {
        const ocupado = Object.values(prev).includes(principalUltimaPosicion);
        const destino =
          principalUltimaPosicion !== null && !ocupado
            ? principalUltimaPosicion
            : primerCasilleroLibre(prev, casillasHotbar);

        if (destino === null) return prev; // no debería ocurrir
        const siguiente = { ...prev, [principal]: destino };
        guardarPosiciones(siguiente);
        return siguiente;
      });
    }
    setPrincipal(null);
    setPrincipalUltimaPosicion(null);
    setAbierto(false);
  };

  // Bloquea el scroll de la página y permite cerrar con Escape
  // mientras el popup está abierto.
  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrarPopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // Mueve el ítem que está en `origen` hacia `destino` (usado por el
  // drag & drop y por el "toque"). Si `destino` ya tiene otro ítem,
  // ambos intercambian de lugar. Esto funciona igual sin importar si
  // origen/destino son casilleros del grid de arriba, de la fila de
  // abajo (HUD), o la casilla principal — ya no hay restricción para
  // cruzar entre filas.
  const moverItem = (origen, destino) => {
    if (origen === destino) return;

    const idOrigen = origen === "principal" ? principal : idEnCasillero(origen);
    if (!idOrigen) return;
    const idDestino = destino === "principal" ? principal : idEnCasillero(destino);

    if (origen === "principal" && destino === "principal") return; // no debería pasar

    if (origen === "principal") {
      // El ítem que estaba en la principal pasa a ocupar `destino`.
      // Si `destino` tenía algo, eso pasa a ser lo nuevo en la principal.
      setPrincipal(idDestino ?? null);
      setPrincipalUltimaPosicion(idDestino ? destino : null);
      setPosiciones((prev) => {
        const siguiente = { ...prev, [idOrigen]: destino };
        if (idDestino) delete siguiente[idDestino];
        guardarPosiciones(siguiente);
        return siguiente;
      });
      return;
    }

    if (destino === "principal") {
      // El ítem de `origen` pasa a la principal; si ya había algo ahí,
      // ese algo ocupa el casillero que `origen` deja libre.
      setPrincipal(idOrigen);
      setPrincipalUltimaPosicion(origen);
      setPosiciones((prev) => {
        const siguiente = { ...prev };
        delete siguiente[idOrigen];
        if (idDestino) siguiente[idDestino] = origen;
        guardarPosiciones(siguiente);
        return siguiente;
      });
      return;
    }

    // Caso simple: swap entre dos casilleros reales (arriba y/o abajo).
    setPosiciones((prev) => {
      const siguiente = { ...prev, [idOrigen]: destino };
      if (idDestino) siguiente[idDestino] = origen;
      guardarPosiciones(siguiente);
      return siguiente;
    });
  };

  return {
    popup: abierto ? { principal } : null,
    abrirPopup,
    cerrarPopup,
    idEnOrigen,
    moverItem,
    posiciones,
  };
}