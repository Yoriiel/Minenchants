"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Particles from "./components/Particles";
import Hero from "./components/Hero";
import Hud from "./components/Hud";
import InventoryPopup from "./components/InventoryPopup";
import DragGhost from "./components/DragGhost";
import GiroDispositivo from "./components/GiroDispositivo";

import { ITEMS, ITEMS_POR_ID } from "./data/items";
import { useInventoryPopup } from "./hooks/useInventoryPopup";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useOrientacionMovil } from "./hooks/useOrientacionMovil";

gsap.registerPlugin(ScrollTrigger);

const CASILLAS_HOTBAR = 8;
const PARTICULAS_NORMAL = 40;

export default function Home() {
  const particulasApiRef = useRef(null);

  const { popup, abrirPopup, cerrarPopup, idEnOrigen, moverItem } =
    useInventoryPopup(ITEMS);

  const { arrastre, iniciarArrastre, fantasmaRef, ultimaPosRef } = useDragAndDrop({
    idEnOrigen,
    moverItem,
  });

  const necesitaGirar = useOrientacionMovil();

  return (
    <>
      <Particles
        ref={particulasApiRef}
        className="canvas-particulas"
        cantidadBase={PARTICULAS_NORMAL}
      />

      <Hero />

      <Hud items={ITEMS} casillasHotbar={CASILLAS_HOTBAR} onSelectItem={abrirPopup} />

      {popup && (
        <InventoryPopup
          popup={popup}
          itemsPorId={ITEMS_POR_ID}
          idEnOrigen={idEnOrigen}
          arrastre={arrastre}
          iniciarArrastre={iniciarArrastre}
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

      {popup && necesitaGirar && <GiroDispositivo />}
    </>
  );
}

//FIN
