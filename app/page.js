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
import { useEsTactil } from "./hooks/useEsTactil";
import { useTeclaE } from "./hooks/useTeclaE";
import { useBloquearSeleccionTotal } from "./hooks/useBloquearSeleccionTotal";

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

  useBloquearSeleccionTotal();

  // Ancho de pantalla "móvil" (independiente de la orientación). En
  // escritorio (esMovil === false) montamos el canvas de partículas
  // "grande" (fixed, cubre header + sección 2, ver más abajo). En
  // móvil (esMovil === true) NO montamos ese, pero Hero sí monta su
  // propio canvas de partículas más chico, acotado solo al header
  // (ver prop `particulasMovil` de Hero).
  const esMovil = useEsMovil(ANCHO_MOVIL_PARTICULAS);

  // Dispositivo táctil (pointer: coarse) sin importar el ancho: una
  // tablet en horizontal puede medir más que ANCHO_MOVIL_PARTICULAS
  // y aun así seguir siendo táctil. Sin esto, esas tablets caían en
  // la rama "escritorio" de acá abajo (esMovil === false) y las
  // partículas de Hero/Hud (PARTICULAS_MOVIL / PARTICULAS_MOVIL_SECCION2)
  // quedaban montadas en 0 dispositivos: por eso al tocar esos
  // números "no subían ni bajaban" en tablet.
  const esTactil = useEsTactil();

  // 👈 ACÁ es donde se decide, en JS, si usamos el modo "partículas
  // chicas de Hero/Hud" (móvil o tablet) o el modo "canvas grande de
  // escritorio": basta con que se cumpla CUALQUIERA de los dos
  // criterios (ancho angosto O dispositivo táctil).
  const modoParticulasMovil = esMovil === true || esTactil === true;
  const modoParticulasEscritorio = esMovil === false && esTactil === false;

  // Al abrir el popup (en PC, donde SÍ hay partículas montadas): las
  // pausamos in situ — dejan de moverse pero siguen dibujadas donde
  // estaban, no se ocultan — para no gastar CPU en la física mientras
  // se usa la mesa de encantamientos. Al cerrarlo, se despausan y
  // retoman el movimiento desde ahí mismo: sin ningún efecto de
  // "reaparición".
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

      <Hero particulasMovil={modoParticulasMovil} cantidadParticulasMovil={PARTICULAS_MOVIL} />

      <Hud
        itemsPorId={ITEMS_POR_ID}
        posiciones={posiciones}
        casillasHotbar={CASILLAS_HOTBAR}
        popupAbierto={Boolean(popup)}
        mostrarAviso={!avisoVisto && modoParticulasEscritorio}
        onSelectItem={abrirPopup}
        particulasMovil={modoParticulasMovil}
        cantidadParticulasMovil={PARTICULAS_MOVIL_SECCION2}
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