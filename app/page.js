"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Particles from "./components/Particles";
import Hero from "./components/Hero";
import Hud from "./components/Hud";
import InventoryPopup from "./components/InventoryPopup";
import DragGhost from "./components/DragGhost";
import GiroDispositivo from "./components/GiroDispositivo";
import VueloItem from "./components/VueloItem";
import DiamanteEncontradoToast from "./components/DiamanteEncontradoToast";

import { ITEMS, traducirItemsPorId } from "./data/items";
import { RELLENO_ITEMS, RELLENO_ITEMS_POR_ID } from "./data/rellenoItems";
import { CLAVE_DIAMANTE_ENCONTRADO, ITEM_DIAMANTE_SECRETO } from "./data/easterEggDiamante";
import { useInventoryPopup } from "./hooks/useInventoryPopup";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useOrientacionMovil } from "./hooks/useOrientacionMovil";
import { useMoverPorToque } from "./hooks/useMoverPorToque";
import { useEsMovil } from "./hooks/useEsMovil";
import { useEsTactil } from "./hooks/useEsTactil";
import { useTeclaE } from "./hooks/useTeclaE";
import { useBloquearSeleccionTotal } from "./hooks/useBloquearSeleccionTotal";
import { useConfiguracionContext } from "./context/ConfiguracionContext";
import { useIdioma } from "./context/IdiomaContext";

gsap.registerPlugin(ScrollTrigger);

const CASILLAS_HOTBAR = 9;
const PARTICULAS_NORMAL = 65;

// Cantidad de partículas del header en la versión MÓVIL (pantallas
// angostas): bastante menos que en escritorio (PARTICULAS_NORMAL) por
// rendimiento, ya que son dispositivos con menos CPU/GPU disponible.
// AJUSTAR ACÁ para subir o bajar esa cantidad.
const PARTICULAS_MOVIL = 55;

// Cantidad de partículas de la sección 2 (HUD) en móvil. Un poco menos
// que las del header (PARTICULAS_MOVIL) porque en móvil ya hay DOS
// canvas de partículas simulándose al mismo tiempo (header + sección
// 2) y conviene repartir el presupuesto de CPU entre ambos. AJUSTAR
// ACÁ para subir o bajar esa cantidad.
const PARTICULAS_MOVIL_SECCION2 = 20;

// Ancho máximo (px) considerado "móvil" para apagar las partículas
// del todo. AJUSTAR ACÁ si querés correr ese límite.
const ANCHO_MOVIL_PARTICULAS = 768;

export default function Home() {
  const particulasApiRef = useRef(null);
  const { particulasApagadas } = useConfiguracionContext();
  const { idioma } = useIdioma();

  // Catálogo de ítems en el idioma actual (títulos y encantamientos).
  // Se recalcula solo cuando cambia el idioma, no en cada render.
  // Los ítems de RELLENO (y el diamante del easter egg) no tienen
  // traducción (son solo decorativos, ver rellenoItems.js /
  // easterEggDiamante.js) así que se agregan tal cual, ya mezclados
  // en el mismo objeto — así cualquier componente (Hud,
  // InventoryPopup) puede resolver CUALQUIER id, sea real, de
  // relleno o el diamante, de la misma forma: itemsPorId[id].
  const itemsPorId = useMemo(
    () => ({
      ...traducirItemsPorId(idioma),
      ...RELLENO_ITEMS_POR_ID,
      [ITEM_DIAMANTE_SECRETO.id]: ITEM_DIAMANTE_SECRETO,
    }),
    [idioma]
  );

  const {
    popup,
    abrirPopup,
    cerrarPopup,
    idEnOrigen,
    moverItem,
    posiciones,
    siguienteCasilleroDesdeAbajo,
    esRelleno,
    agregarItemSiNoExiste,
  } = useInventoryPopup(ITEMS, CASILLAS_HOTBAR, RELLENO_ITEMS);

  // Easter egg del diamante escondido (ver EasterEggDiamante.js /
  // DiamanteEncontradoToast.js). `mostrarToastDiamante` controla
  // únicamente el cartel de éxito — el propio ítem, una vez agregado
  // a `posiciones` (vía agregarItemSiNoExiste), queda visible en el
  // popup/HUD para siempre, sin depender de este estado.
  const [mostrarToastDiamante, setMostrarToastDiamante] = useState(false);

  // Si el usuario YA había encontrado el diamante en una visita
  // anterior, lo reponemos en el inventario apenas se monta — sin
  // mostrar el cartel de éxito de nuevo (eso es solo para la primera
  // vez). useLayoutEffect (en vez de useEffect) para que corra antes
  // de pintar el primer frame, igual que el resto de la carga de
  // posiciones dentro de useInventoryPopup — y, como se declara
  // DESPUÉS de useInventoryPopup(...) más arriba, React lo corre
  // recién una vez que el propio hook ya terminó de hidratar
  // `posiciones`, así que agregarItemSiNoExiste nunca pisa nada.
  useLayoutEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_DIAMANTE_ENCONTRADO) === "true") {
        agregarItemSiNoExiste(ITEM_DIAMANTE_SECRETO);
      }
    } catch {
      // Sin LocalStorage disponible, no hay nada que restaurar.
    }
    // Solo nos interesa revisar esto una vez, al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se dispara la primera vez que el usuario encuentra el diamante
  // (click en EasterEggDiamante, dentro de Hud): lo suma de verdad al
  // inventario Y muestra el cartel de éxito.
  const manejarDiamanteEncontrado = (item) => {
    agregarItemSiNoExiste(item);
    setMostrarToastDiamante(true);
  };
  // Acción de éxito COMPARTIDA por los 2 buscadores (header y popup,
  // Partes 3 y 4): scrollea a la Sección 2 y deja el ítem encontrado
  // listo en la casilla principal, reusando el mismo `abrirPopup` que
  // ya usa Hud.js.
  //
  // OJO con un caso que `abrirPopup` no contempla por sí solo: si el
  // buscador de ADENTRO del popup (la lupa) se usa mientras ya hay
  // otro ítem en la principal, `abrirPopup` pisaría ese `principal`
  // directo — el ítem viejo se perdería (no vuelve a ningún
  // casillero). Por eso, si ya hay algo ahí, primero lo sacamos a la
  // primera casilla libre (mismo camino que ya usa el atajo de
  // Ctrl+click/doble click para sacar el ítem de la principal).
  const manejarBusquedaExitosa = (item) => {
    document.getElementById("seccion-marcadores")?.scrollIntoView({ behavior: "smooth" });

    if (popup?.principal) {
      const destino = siguienteCasilleroDesdeAbajo();
      if (destino !== null) moverItem("principal", destino);
    }

    abrirPopup(item);
  };

  const { avisoVisto } = useTeclaE({
    popupAbierto: Boolean(popup),
    abrirPopup,
    cerrarPopup,
  });

  const { seleccionado, vuelos, ocultosVuelo, alTocarCasilla, moverConAnimacion, limpiarSeleccion } =
    useMoverPorToque({
      idEnOrigen,
      moverItem,
      popupAbierto: Boolean(popup),
      esRelleno,
    });

  const { arrastre, iniciarArrastre, fantasmaRef, ultimaPosRef } = useDragAndDrop({
    idEnOrigen,
    moverItem,
    onTap: alTocarCasilla,
  });

  const necesitaGirar = useOrientacionMovil();

  useBloquearSeleccionTotal();

  // Ancho de pantalla "móvil" (independiente de la orientación).
  const esMovil = useEsMovil(ANCHO_MOVIL_PARTICULAS);

  // Dispositivo táctil (pointer: coarse) sin importar el ancho
  const esTactil = useEsTactil();

  const esDispositivoMovil = esMovil === true || esTactil === true;
  const esDispositivoEscritorio = esMovil === false && esTactil === false;

  const modoParticulasMovil = esDispositivoMovil && !particulasApagadas;
  const modoParticulasEscritorio = esDispositivoEscritorio && !particulasApagadas;

  useEffect(() => {
    const api = particulasApiRef.current;
    if (!api) return; // no hay partículas montadas (estamos en móvil)
    api.setPausado(Boolean(popup));
  }, [popup]);

  return (
    <>
      {modoParticulasEscritorio && (
        <Particles
          ref={particulasApiRef}
          className="canvas-particulas"
          cantidadBase={PARTICULAS_NORMAL}
        />
      )}

      <Hero
        particulasMovil={modoParticulasMovil}
        cantidadParticulasMovil={PARTICULAS_MOVIL}
        onBuscarSeleccion={manejarBusquedaExitosa}
      />

      <Hud
        itemsPorId={itemsPorId}
        posiciones={posiciones}
        casillasHotbar={CASILLAS_HOTBAR}
        popupAbierto={Boolean(popup)}
        mostrarAviso={!avisoVisto && esDispositivoEscritorio}
        onSelectItem={abrirPopup}
        onDiamanteEncontrado={manejarDiamanteEncontrado}
        particulasMovil={modoParticulasMovil}
        cantidadParticulasMovil={PARTICULAS_MOVIL_SECCION2}
      />

      {popup && (
        <InventoryPopup
          itemsPorId={itemsPorId}
          idEnOrigen={idEnOrigen}
          moverConAnimacion={moverConAnimacion}
          siguienteCasilleroDesdeAbajo={siguienteCasilleroDesdeAbajo}
          arrastre={arrastre}
          iniciarArrastre={iniciarArrastre}
          ocultosVuelo={ocultosVuelo}
          seleccionado={seleccionado}
          limpiarSeleccion={limpiarSeleccion}
          casillasHotbar={CASILLAS_HOTBAR}
          onClose={cerrarPopup}
          onBuscarSeleccion={manejarBusquedaExitosa}
        />
      )}

      {arrastre && (
        <DragGhost
          ref={fantasmaRef}
          item={itemsPorId[arrastre.id]}
          posicionInicial={ultimaPosRef.current}
        />
      )}

      {vuelos.map((v) => (
        <VueloItem key={v.key} item={itemsPorId[v.id]} from={v.from} to={v.to} />
      ))}

      {necesitaGirar && <GiroDispositivo />}

      {mostrarToastDiamante && (
        <DiamanteEncontradoToast onCerrar={() => setMostrarToastDiamante(false)} />
      )}
    </>
  );
}