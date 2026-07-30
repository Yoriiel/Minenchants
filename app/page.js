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

const PARTICULAS_MOVIL = 55;

const PARTICULAS_MOVIL_SECCION2 = 20;

// Ancho máximo (px) considerado "móvil" para apagar las partículas
// del todo. AJUSTAR ACÁ si querés correr ese límite.
const ANCHO_MOVIL_PARTICULAS = 768;

export default function Home() {
  const particulasApiRef = useRef(null);
  const { particulasApagadas } = useConfiguracionContext();
  const { idioma } = useIdioma();

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

  const [mostrarToastDiamante, setMostrarToastDiamante] = useState(false);

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

  const manejarDiamanteEncontrado = (item) => {
    agregarItemSiNoExiste(item);
    setMostrarToastDiamante(true);
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

      <Hero particulasMovil={modoParticulasMovil} cantidadParticulasMovil={PARTICULAS_MOVIL} />

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