// agregar/quitar un ítem de relleno, este es el único
// archivo que hay que tocar (y poner la imagen en
// /public/img/relleno/).

export const RELLENO_ITEMS = [
  //{ id: "relleno_manzana", img: "/img/relleno/Apple.png", titulo: "Manzana", relleno: true },
  { id: "relleno_flecha", img: "/img/relleno/Arrow.png", titulo: "Flecha", relleno: true },
  { id: "relleno_botella_xp", img: "/img/relleno/BotellaXP.gif", titulo: "Botella de Experiencia", relleno: true },
  { id: "relleno_pan", img: "/img/relleno/Bread.png", titulo: "Pan", relleno: true },
  { id: "relleno_galleta", img: "/img/relleno/Cookie.png", titulo: "Galleta", relleno: true },
  { id: "relleno_cubo_agua", img: "/img/relleno/CuboAgua.png", titulo: "Cubo de Agua", relleno: true },
  //{ id: "relleno_cubo_lava", img: "/img/relleno/CuboLava.png", titulo: "Cubo de Lava", relleno: true },
  { id: "relleno_cuerda", img: "/img/relleno/Cuerda.png", titulo: "Cuerda", relleno: true },
  { id: "relleno_ender_pearl", img: "/img/relleno/EnderPearl.png", titulo: "Perla de Ender", relleno: true },
  //{ id: "relleno_huevo", img: "/img/relleno/Huevo.png", titulo: "Huevo", relleno: true },
  { id: "relleno_manzana_op", img: "/img/relleno/ManzanaOP.gif", titulo: "Manzana Encantada", relleno: true },
  //{ id: "relleno_mesa_craft", img: "/img/relleno/MesaCraft.png", titulo: "Mesa de Crafteo", relleno: true },
  //{ id: "relleno_disco_pigstep", img: "/img/relleno/Pigstep.png", titulo: "Disco de Música", relleno: true },
  //{ id: "relleno_pollo", img: "/img/relleno/Pollo.png", titulo: "Pollo", relleno: true },
  { id: "relleno_zanahoria", img: "/img/relleno/Zanahoria.png", titulo: "Zanahoria", relleno: true },
];

export const RELLENO_ITEMS_POR_ID = Object.fromEntries(
  RELLENO_ITEMS.map((it) => [it.id, it])
);

// Set con los ids, para chequear rápido "¿esto es relleno?" desde
// useInventoryPopup / useDragAndDrop / useMoverPorToque sin recorrer
// el array cada vez.
export const IDS_RELLENO = new Set(RELLENO_ITEMS.map((it) => it.id));
