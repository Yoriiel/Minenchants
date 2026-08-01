"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import { useBloqueoScroll } from "./useBloqueoScroll";

const TOTAL_GRID_PRINCIPAL = 27;
const COLUMNAS_GRID = 9;
const FILAS_GRID = TOTAL_GRID_PRINCIPAL / COLUMNAS_GRID;
const STORAGE_KEY = "minenchants-posiciones-inventario-v2";

function hotbarInicio() {
  return TOTAL_GRID_PRINCIPAL;
}

function totalCasillas(casillasHotbar) {
  return TOTAL_GRID_PRINCIPAL + casillasHotbar;
}

function casillerosLibresBarajados(ocupados, total) {
  const libres = [];
  for (let i = 0; i < total; i++) {
    if (!ocupados.has(i)) libres.push(i);
  }
  for (let i = libres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [libres[i], libres[j]] = [libres[j], libres[i]];
  }
  return libres;
}

function generarPosicionesIniciales(itemsReales, casillasHotbar, itemsRelleno = []) {
  const inicio = hotbarInicio();
  const posiciones = {};
  let siguienteCasilleroArriba = 0;
  itemsReales.forEach((item, idx) => {
    if (idx < casillasHotbar) {
      posiciones[item.id] = inicio + idx;
    } else {
      // Más ítems que casillas de hotbar (no pasa hoy, pero por si
      // el catálogo crece): los que sobran van al grid de arriba.
      posiciones[item.id] = siguienteCasilleroArriba;
      siguienteCasilleroArriba++;
    }
  });

  const total = totalCasillas(casillasHotbar);
  itemsRelleno.forEach((item) => {
    while (posiciones[item.id] === undefined) {
      const candidato = siguienteCasilleroArriba;
      siguienteCasilleroArriba++;
      const ocupado = Object.values(posiciones).includes(candidato);
      if (!ocupado && candidato < total) posiciones[item.id] = candidato;
      if (candidato >= total) break; // no debería pasar
    }
  });

  return posiciones;
}

function barajarPosicionesRelleno(posiciones, itemsRelleno) {
  const casilleros = itemsRelleno
    .map((item) => posiciones[item.id])
    .filter((c) => typeof c === "number");

  const barajados = [...casilleros];
  for (let i = barajados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [barajados[i], barajados[j]] = [barajados[j], barajados[i]];
  }

  const siguiente = { ...posiciones };
  itemsRelleno.forEach((item, idx) => {
    if (idx < barajados.length) siguiente[item.id] = barajados[idx];
  });
  return siguiente;
}

// `itemsTodos` = ítems reales + de relleno juntos (ver más abajo,
// donde se arma esa lista una sola vez dentro del hook).
function cargarPosicionesGuardadas(itemsTodos, casillasHotbar) {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;
    const posiciones = JSON.parse(guardado);
    if (typeof posiciones !== "object" || posiciones === null) return null;

    const total = totalCasillas(casillasHotbar);
    const vistos = new Set();
    const resultado = {};
    for (const item of itemsTodos) {
      const casillero = posiciones[item.id];
      if (
        typeof casillero === "number" &&
        casillero >= 0 &&
        casillero < total &&
        !vistos.has(casillero)
      ) {
        resultado[item.id] = casillero;
        vistos.add(casillero);
      }
    }

    if (Object.keys(resultado).length === 0) return null;

    const faltantes = itemsTodos.filter((item) => !(item.id in resultado));
    if (faltantes.length > 0) {
      const libres = casillerosLibresBarajados(vistos, total);
      faltantes.forEach((item, idx) => {
        if (idx < libres.length) resultado[item.id] = libres[idx];
      });
    }

    return resultado;
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

function primerCasilleroLibre(posiciones, casillasHotbar) {
  const ocupados = new Set(Object.values(posiciones));
  const total = totalCasillas(casillasHotbar);
  for (let i = 0; i < total; i++) {
    if (!ocupados.has(i)) return i;
  }
  return null; // no debería pasar: siempre hay más casilleros que ítems
}

function primerCasilleroLibreDesdeAbajo(posiciones, casillasHotbar) {
  const ocupados = new Set(Object.values(posiciones));
  const inicio = hotbarInicio();

  for (let i = 0; i < casillasHotbar; i++) {
    const casillero = inicio + i;
    if (!ocupados.has(casillero)) return casillero;
  }

  for (let fila = FILAS_GRID - 1; fila >= 0; fila--) {
    for (let col = 0; col < COLUMNAS_GRID; col++) {
      const casillero = fila * COLUMNAS_GRID + col;
      if (!ocupados.has(casillero)) return casillero;
    }
  }

  return null; // no debería pasar: siempre hay más casilleros que ítems
}

export function useInventoryPopup(items, casillasHotbar, itemsRelleno = []) {
  const [abierto, setAbierto] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [principalUltimaPosicion, setPrincipalUltimaPosicion] = useState(null);
  const idsRelleno = new Set(itemsRelleno.map((it) => it.id));
  const [idsRellenoDinamicos, setIdsRellenoDinamicos] = useState(() => new Set());
  const esRelleno = (id) => idsRelleno.has(id) || idsRellenoDinamicos.has(id);
  const [posiciones, setPosiciones] = useState(() =>
    generarPosicionesIniciales(items, casillasHotbar, itemsRelleno)
  );

  useLayoutEffect(() => {
    const itemsTodos = [...items, ...itemsRelleno];
    const guardadas = cargarPosicionesGuardadas(itemsTodos, casillasHotbar);
    if (guardadas) {
      setPosiciones(guardadas);
    } else {
      const inicial = generarPosicionesIniciales(items, casillasHotbar, itemsRelleno);
      const conRellenoAlAzar = barajarPosicionesRelleno(inicial, itemsRelleno);
      setPosiciones(conRellenoAlAzar);
      guardarPosiciones(conRellenoAlAzar);
    }
  }, []);

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

  // Bloquea el scroll de la página mientras el popup está abierto.
  useBloqueoScroll(abierto);

  // Permite cerrar el popup con Escape.
  useEffect(() => {
    if (!abierto) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrarPopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // Mueve el ítem que está en `origen` hacia `destino`
  const moverItem = (origen, destino) => {
    if (origen === destino) return;

    const idOrigen = origen === "principal" ? principal : idEnCasillero(origen);
    if (!idOrigen) return;
    const idDestino = destino === "principal" ? principal : idEnCasillero(destino);

    if (origen === "principal" && destino === "principal") return; // no debería pasar

    if (destino === "principal" && esRelleno(idOrigen)) return;
    if (origen === "principal" && idDestino && esRelleno(idDestino)) return;

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

  const siguienteCasilleroDesdeAbajo = () =>
    primerCasilleroLibreDesdeAbajo(posiciones, casillasHotbar);

  const agregarItemSiNoExiste = (item) => {
    setPosiciones((prev) => {
      if (item.id in prev) return prev;
      const destino = primerCasilleroLibre(prev, casillasHotbar);
      if (destino === null) return prev; // no debería pasar
      const siguiente = { ...prev, [item.id]: destino };
      guardarPosiciones(siguiente);
      return siguiente;
    });

    if (item.relleno) {
      setIdsRellenoDinamicos((prev) => {
        if (prev.has(item.id)) return prev;
        const siguiente = new Set(prev);
        siguiente.add(item.id);
        return siguiente;
      });
    }
  };

  return {
    popup: abierto ? { principal } : null,
    abrirPopup,
    cerrarPopup,
    idEnOrigen,
    moverItem,
    posiciones,
    siguienteCasilleroDesdeAbajo,
    esRelleno,
    agregarItemSiNoExiste,
  };
}