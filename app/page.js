"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Particles from "./components/Particles";
import Hero from "./components/Hero";
import Hud from "./components/Hud";
import InventoryPopup from "./components/InventoryPopup";
import DragGhost from "./components/DragGhost";
import GiroDispositivo from "./components/GiroDispositivo";
import VueloItem from "./components/VueloItem";

import { ITEMS, ITEMS_POR_ID } from "./data/items";
import { useInventoryPopup } from "./hooks/useInventoryPopup";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useOrientacionMovil } from "./hooks/useOrientacionMovil";
import { useMoverPorToque } from "./hooks/useMoverPorToque";
import { useEsMovil } from "./hooks/useEsMovil";
import { useTeclaE } from "./hooks/useTeclaE";

gsap.registerPlugin(ScrollTrigger);

const CASILLAS_HOTBAR = 9;
const PARTICULAS_NORMAL = 40;

// Ancho máximo (px) considerado "móvil" para apagar las partículas
// del todo. AJUSTAR ACÁ si querés correr ese límite.
const ANCHO_MOVIL_PARTICULAS = 768;

// Cuántos pasos da la reaparición gradual de partículas al cerrar el
// popup, y cuánto se espera entre paso y paso: más pasos/ms = más
// lenta y suave. AJUSTAR ACÁ la velocidad del "desvanecimiento
// inverso".
const PASOS_REAPARICION_PARTICULAS = 15;
const MS_ENTRE_PASOS_REAPARICION = 40;

export default function Home() {
  const particulasApiRef = useRef(null);
  const popupEstabaAbiertoRef = useRef(false);

  const { popup, abrirPopup, cerrarPopup, idEnOrigen, moverItem, posiciones, siguienteCasilleroDesdeAbajo } =
    useInventoryPopup(ITEMS, CASILLAS_HOTBAR);

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
    });

  const { arrastre, iniciarArrastre, fantasmaRef, ultimaPosRef } = useDragAndDrop({
    idEnOrigen,
    moverItem,
    onTap: alTocarCasilla,
  });

  const necesitaGirar = useOrientacionMovil();

  // Ancho de pantalla "móvil" (independiente de la orientación): ahí
  // no montamos <Particles /> para nada, ni siquiera apagadas.
  const esMovil = useEsMovil(ANCHO_MOVIL_PARTICULAS);

  // Al abrir el popup (en PC, donde SÍ hay partículas montadas): las
  // apagamos de una para no gastar CPU mientras se usa la mesa de
  // encantamientos. Al cerrarlo: no las prendemos todas de golpe,
  // las vamos trayendo de a poco (efecto contrario a un fundido).
  useEffect(() => {
    const api = particulasApiRef.current;
    if (!api) return; // no hay partículas montadas (estamos en móvil)

    const abierto = Boolean(popup);
    const estabaAbierto = popupEstabaAbiertoRef.current;
    popupEstabaAbiertoRef.current = abierto;
    if (abierto === estabaAbierto) return; // sin cambio real

    let cancelado = false;
    let idIntervalo = null;

    if (abierto) {
      api.setCantidad(0);
    } else {
      let actual = 0;
      const paso = Math.max(1, Math.ceil(PARTICULAS_NORMAL / PASOS_REAPARICION_PARTICULAS));
      idIntervalo = window.setInterval(() => {
        if (cancelado) return;
        actual += paso;
        if (actual >= PARTICULAS_NORMAL) {
          api.setCantidad(PARTICULAS_NORMAL);
          clearInterval(idIntervalo);
        } else {
          api.setCantidad(actual);
        }
      }, MS_ENTRE_PASOS_REAPARICION);
    }

    return () => {
      cancelado = true;
      if (idIntervalo) clearInterval(idIntervalo);
    };
  }, [popup]);

  return (
    <>
      {esMovil === false && (
        <Particles
          ref={particulasApiRef}
          className="canvas-particulas"
          cantidadBase={PARTICULAS_NORMAL}
        />
      )}

      <Hero />

      <Hud
        itemsPorId={ITEMS_POR_ID}
        posiciones={posiciones}
        casillasHotbar={CASILLAS_HOTBAR}
        popupAbierto={Boolean(popup)}
        mostrarAviso={!avisoVisto && esMovil === false}
        onSelectItem={abrirPopup}
      />

      {popup && (
        <InventoryPopup
          itemsPorId={ITEMS_POR_ID}
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
        />
      )}

      {arrastre && (
        <DragGhost
          ref={fantasmaRef}
          item={ITEMS_POR_ID[arrastre.id]}
          posicionInicial={ultimaPosRef.current}
        />
      )}

      {vuelos.map((v) => (
        <VueloItem key={v.key} item={ITEMS_POR_ID[v.id]} from={v.from} to={v.to} />
      ))}

      {necesitaGirar && <GiroDispositivo />}
    </>
  );
}