"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import { useBloqueoScroll } from "./useBloqueoScroll";

// Casillero 0..26: grid principal (3 filas x 9 columnas).
// Casillero 27..27+casillasHotbar-1: fila de abajo, la MISMA que la
// barra HUD real (casilla i del HUD === casillero HOTBAR_INICIO + i).
const TOTAL_GRID_PRINCIPAL = 27;
const COLUMNAS_GRID = 9;
const FILAS_GRID = TOTAL_GRID_PRINCIPAL / COLUMNAS_GRID;

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

// Devuelve los casilleros (0..total-1) que NO están en `ocupados`,
// en orden AL AZAR (shuffle Fisher-Yates). La usan tanto la posición
// inicial de los ítems de relleno como el "completado" de ítems
// nuevos que aparezcan en el catálogo después de que el usuario ya
// tenía cosas guardadas en localStorage.
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

// Estado inicial (DETERMINÍSTICO — corre en servidor Y cliente, ver
// nota grande más abajo sobre hidratación, así que NUNCA puede usar
// Math.random() acá):
//   - Ítems REALES (encantables): cada uno cae en la fila de abajo,
//     en el mismo orden en que aparece en el catálogo (ITEMS) —
//     exactamente lo mismo que ya se ve hoy en la barra HUD real.
//   - Ítems de RELLENO (decorativos): caen en orden, en los
//     casilleros libres que van quedando del grid principal (arriba).
//     Este orden es solo un valor de arranque "seguro" para que
//     servidor y cliente coincidan — el desorden real al azar que se
//     ve la primera vez se arma aparte, ya en el cliente, con
//     `barajarPosicionesRelleno` (ver el useLayoutEffect del hook).
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

// Reparte AL AZAR (shuffle Fisher-Yates) los casilleros que hoy
// ocupan los ítems de RELLENO entre ellos mismos, dejando intactos
// los casilleros de los ítems reales. Se usa SOLO del lado del
// cliente (dentro de useLayoutEffect, nunca en el useState inicial),
// la primera vez que se abre el popup y no hay nada todavía guardado
// en localStorage — así el desorden inicial es al azar, pero sin
// arriesgar un mismatch de hidratación servidor/cliente.
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

    // Tomamos del guardado SOLO las entradas válidas (casillero
    // numérico, dentro de rango, sin chocar con otra ya tomada). Los
    // ítems que falten en el guardado (por ejemplo, los de relleno la
    // primera vez que se carga esta actualización, o cualquier ítem
    // nuevo que se agregue al catálogo más adelante) NO invalidan
    // todo el guardado: se completan más abajo con un casillero libre
    // al azar, sin tocar la posición de lo que el usuario ya tenía
    // acomodado.
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

    // Si nada de lo guardado sirvió (ej. viene de un formato viejo
    // totalmente distinto), mejor arrancar de cero con la posición
    // inicial normal en vez de devolver un objeto vacío/incompleto.
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

// Primer casillero libre recorriendo de ABAJO hacia ARRIBA y, dentro
// de cada fila, de izquierda a derecha: primero la fila de hotbar/HUD
// (izq. a der.), después la fila más baja del grid de arriba, y así
// subiendo. Se usa para el atajo de Ctrl+click que saca un ítem de la
// casilla principal.
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
export function useInventoryPopup(items, casillasHotbar, itemsRelleno = []) {
  const [abierto, setAbierto] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [principalUltimaPosicion, setPrincipalUltimaPosicion] = useState(null);

  // Los ítems de relleno son solo decorativos: nunca pueden terminar
  // en la casilla principal. Este Set se recalcula en cada render
  // (es una lista chica, no hace falta memoizarlo) y lo usan tanto
  // `moverItem` acá abajo como el propio consumidor del hook si
  // necesita esRelleno(id) para algo más (ver Hud.js).
  const idsRelleno = new Set(itemsRelleno.map((it) => it.id));
  const esRelleno = (id) => idsRelleno.has(id);

  // OJO: este inicializador de useState corre tanto en el servidor
  // como en el cliente (durante la hidratación). Antes acá mismo se
  // leía localStorage — pero en el servidor `window` no existe, así
  // que el servidor SIEMPRE devolvía el orden por defecto del
  // catálogo, mientras que en el cliente (si había algo guardado)
  // se devolvía un orden distinto. Eso es un mismatch de hidratación:
  // React arranca reconciliando un HTML de servidor con un árbol de
  // cliente que no coincide, y con <img> (los GIFs) a veces no logra
  // "limpiar" bien la diferencia y deja un nodo viejo pegado en el
  // DOM — esa era la causa real de los ítems duplicados en la HUD.
  //
  // Ahora el primer render (servidor Y cliente) usa siempre el orden
  // por defecto, así los dos coinciden. Lo guardado en localStorage
  // se aplica después, ya montados en el cliente (ver useLayoutEffect
  // más abajo), que es una actualización 100% del lado del cliente y
  // no un choque servidor/cliente. Por la misma razón, acá los ítems
  // de relleno arrancan en orden (NO al azar todavía) — el desorden
  // real se arma dentro del useLayoutEffect, que es 100% cliente.
  const [posiciones, setPosiciones] = useState(() =>
    generarPosicionesIniciales(items, casillasHotbar, itemsRelleno)
  );

  // Aplica lo guardado en localStorage apenas se monta en el cliente.
  // useLayoutEffect (en vez de useEffect) para que corra antes de que
  // el navegador pinte el primer frame, y así no se alcance a ver un
  // parpadeo del orden por defecto antes de saltar al guardado.
  useLayoutEffect(() => {
    const itemsTodos = [...items, ...itemsRelleno];
    const guardadas = cargarPosicionesGuardadas(itemsTodos, casillasHotbar);
    if (guardadas) {
      setPosiciones(guardadas);
    } else {
      // Nada guardado todavía (primera visita): recién ACÁ, ya en el
      // cliente, barajamos al azar los ítems de relleno entre los
      // casilleros libres que les tocaron. A partir de este momento
      // queda persistido, así que cualquier movimiento futuro del
      // usuario (sobre relleno o sobre ítems reales) se guarda igual
      // que siempre.
      const inicial = generarPosicionesIniciales(items, casillasHotbar, itemsRelleno);
      const conRellenoAlAzar = barajarPosicionesRelleno(inicial, itemsRelleno);
      setPosiciones(conRellenoAlAzar);
      guardarPosiciones(conRellenoAlAzar);
    }
    // Solo nos interesa correr esto una vez, al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Los ítems de relleno son solo decorativos y NUNCA pueden entrar
    // a la casilla principal: ni directo (destino === "principal" con
    // el ítem de relleno viniendo de `origen`), ni por un intercambio
    // donde la principal "libera" su ítem hacia una casilla que hoy
    // ocupa un relleno (origen === "principal" y el de `destino` es
    // relleno). En ambos casos, simplemente no hacemos nada.
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

  // Primer casillero libre buscando desde la fila de abajo (hotbar)
  // hacia arriba, izquierda a derecha en cada fila. Lo usa el
  // Ctrl+click cuando el ítem que se mueve está en la casilla
  // principal (no tiene "destino natural" como sí lo tiene un ítem
  // que ya estaba en un casillero real).
  const siguienteCasilleroDesdeAbajo = () =>
    primerCasilleroLibreDesdeAbajo(posiciones, casillasHotbar);

  return {
    popup: abierto ? { principal } : null,
    abrirPopup,
    cerrarPopup,
    idEnOrigen,
    moverItem,
    posiciones,
    siguienteCasilleroDesdeAbajo,
    esRelleno,
  };
}