// Catálogo de ítems y sus encantamientos (nombres oficiales de
// Minecraft Bedrock, en español e inglés).
//
// Cada ítem tiene "versionesEs"/"versionesEn": un array de listas de
// encantamientos. La mayoría tiene 1 sola versión (un array con 1
// lista adentro); los que tienen 2 cargas distintas (ej. Pico con
// Fortuna o con Toque de Seda) tienen 2 listas, en el mismo orden en
// ambos idiomas. El botón de "cambiar versión" del popup recorre este
// array.
//
// Si querés agregar/quitar un ítem del juego, este es el único
// archivo que necesitás tocar.

const ITEMS_BASE = [
  {
    id: "casco",
    img: "/img/Casco.gif",
    tituloEs: "Casco",
    tituloEn: "Helmet",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III", "Respiración III", "Afinidad Acuática"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Protection IV", "Thorns III", "Respiration III", "Aqua Affinity"],
    ],
  },
  {
    id: "pechera",
    img: "/img/Peto.gif",
    tituloEs: "Pechera",
    tituloEn: "Chestplate",
    // "Peto" es el nombre oficial en el español de España (en
    // Latinoamérica se usa "Pechera", que es el que mostramos). Se
    // usa SOLO para que la búsqueda lo encuentre igual, no cambia lo
    // que se ve en pantalla.
    alias: ["Peto"],
    versionesEs: [["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III"]],
    versionesEn: [["Mending", "Unbreaking III", "Protection IV", "Thorns III"]],
  },
  {
    id: "pantalones",
    img: "/img/Legs.gif",
    tituloEs: "Pantalones",
    tituloEn: "Leggings",
    // "Perneras" es el nombre oficial en español de España.
    alias: ["Perneras"],
    versionesEs: [["Reparación", "Protección IV", "Irrompibilidad III", "Espinas III", "Sigilo Rápido III"]],
    versionesEn: [["Mending", "Protection IV", "Unbreaking III", "Thorns III", "Swift Sneak III"]],
  },
  {
    id: "botas",
    img: "/img/Botas.gif",
    tituloEs: "Botas",
    tituloEn: "Boots",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III", "Caída de Pluma IV", "Agilidad Acuática III"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Protection IV", "Thorns III", "Feather Falling IV", "Depth Strider III"],
    ],
  },
  {
    id: "espada",
    img: "/img/Espada.gif",
    tituloEs: "Espada",
    tituloEn: "Sword",
    versionesEs: [["Reparación", "Irrompibilidad III", "Filo V", "Aspecto Ígneo II", "Saqueo III"]],
    versionesEn: [["Mending", "Unbreaking III", "Sharpness V", "Fire Aspect II", "Looting III"]],
  },
  {
    id: "pico",
    img: "/img/Pico.gif",
    tituloEs: "Pico",
    tituloEn: "Pickaxe",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Eficiencia V", "Fortuna III"],
      ["Reparación", "Irrompibilidad III", "Eficiencia V", "Toque de Seda"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Efficiency V", "Fortune III"],
      ["Mending", "Unbreaking III", "Efficiency V", "Silk Touch"],
    ],
  },
  {
    id: "hacha",
    img: "/img/Hacha.gif",
    tituloEs: "Hacha",
    tituloEn: "Axe",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Fortuna III", "Eficiencia V"],
      ["Reparación", "Irrompibilidad III", "Castigo V", "Toque de Seda"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Fortune III", "Efficiency V"],
      ["Mending", "Unbreaking III", "Smite V", "Silk Touch"],
    ],
  },
  {
    id: "arco",
    img: "/img/Arco.gif",
    tituloEs: "Arco",
    tituloEn: "Bow",
    versionesEs: [
      ["Irrompibilidad III", "Poder V", "Fuego", "Retroceso II", "Infinidad"],
      ["Irrompibilidad III", "Poder V", "Fuego", "Retroceso II", "Reparación"],
    ],
    versionesEn: [
      ["Unbreaking III", "Power V", "Flame", "Punch II", "Infinity"],
      ["Unbreaking III", "Power V", "Flame", "Punch II", "Mending"],
    ],
  },
  {
    id: "ballesta",
    img: "/img/Ballesta.gif",
    tituloEs: "Ballesta",
    tituloEn: "Crossbow",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Carga Rápida III", "Perforación IV"],
      ["Reparación", "Irrompibilidad III", "Carga Rápida III", "Disparo Múltiple"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Quick Charge III", "Piercing IV"],
      ["Mending", "Unbreaking III", "Quick Charge III", "Multishot"],
    ],
  },
  {
    id: "tridente",
    img: "/img/Tridente.gif",
    tituloEs: "Tridente",
    tituloEn: "Trident",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Lealtad III", "Canalización", "Empalamiento V"],
      ["Reparación", "Irrompibilidad III", "Aguas Revueltas", "Empalamiento V"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Loyalty III", "Channeling", "Impaling V"],
      ["Mending", "Unbreaking III", "Riptide", "Impaling V"],
    ],
  },
  {
    id: "pala",
    img: "/img/Pala.gif",
    tituloEs: "Pala",
    tituloEn: "Shovel",
    versionesEs: [
      ["Reparación", "Irrompibilidad III", "Eficiencia V", "Toque de Seda"],
      ["Reparación", "Irrompibilidad III", "Eficiencia V", "Fortuna III"],
    ],
    versionesEn: [
      ["Mending", "Unbreaking III", "Efficiency V", "Silk Touch"],
      ["Mending", "Unbreaking III", "Efficiency V", "Fortune III"],
    ],
  },
  {
    id: "azada",
    img: "/img/Azada.gif",
    tituloEs: "Azada",
    tituloEn: "Hoe",
    versionesEs: [["Reparación", "Irrompibilidad III", "Eficiencia V", "Fortuna III"]],
    versionesEn: [["Mending", "Unbreaking III", "Efficiency V", "Fortune III"]],
  },
  {
    id: "mazo",
    img: "/img/Mazo.gif",
    tituloEs: "Mazo",
    tituloEn: "Mace",
    // "Maza" es el nombre oficial (según la wiki en español de
    // Minecraft); "Mazo" es una variante dialectal (Ecuador, México,
    // Venezuela) que es la que ya veníamos usando para mostrar.
    alias: ["Maza"],
    versionesEs: [["Reparación", "Irrompibilidad III", "Densidad V", "Ráfaga de Viento III", "Aspecto Ígneo II"]],
    versionesEn: [["Mending", "Unbreaking III", "Density V", "Wind Burst III", "Fire Aspect II"]],
  },
  {
    id: "tijeras",
    img: "/img/Tijeras.gif",
    tituloEs: "Tijeras",
    tituloEn: "Shears",
    versionesEs: [["Reparación", "Irrompibilidad III", "Eficiencia V"]],
    versionesEn: [["Mending", "Unbreaking III", "Efficiency V"]],
  },
  {
    id: "cana_pescar",
    img: "/img/Cana.gif",
    tituloEs: "Caña de Pescar",
    tituloEn: "Fishing Rod",
    versionesEs: [["Reparación", "Irrompibilidad III", "Suerte Marina III", "Atracción III"]],
    versionesEn: [["Mending", "Unbreaking III", "Luck of the Sea III", "Lure III"]],
  },
  {
    id: "cana_zanahoria",
    img: "/img/CanaCarrot.gif",
    tituloEs: "Caña con Zanahoria",
    tituloEn: "Carrot on a Stick",
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
  {
    id: "cana_hongo",
    img: "/img/CanaMushroom.png",
    tituloEs: "Caña con Hongo Distorsionado",
    tituloEn: "Warped Fungus on a Stick",
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
  {
    id: "mechero",
    img: "/img/Mechero.png",
    tituloEs: "Mechero",
    tituloEn: "Flint and Steel",
    // Nombres alternativos usados en distintas regiones/wikis en
    // español para el mismo ítem.
    alias: ["Yesquero", "Encendedor"],
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
  {
    id: "pincel",
    img: "/img/Pincel.png",
    tituloEs: "Pincel",
    tituloEn: "Brush",
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
  {
    id: "elitros",
    img: "/img/Elitros.png",
    tituloEs: "Élitros",
    tituloEn: "Elytra",
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
  {
    id: "escudo",
    img: "/img/Escudo.png",
    tituloEs: "Escudo",
    tituloEn: "Shield",
    versionesEs: [["Reparación", "Irrompibilidad III"]],
    versionesEn: [["Mending", "Unbreaking III"]],
  },
];

// Arma la lista de ítems "activa" para el idioma pedido: cada ítem
// queda con { id, img, titulo, versiones } listo para EnchantmentPanel
// (que elige qué versión mostrar) y para Hud/InventoryPopup (que solo
// usan id/img/titulo).
export function traducirItems(idioma) {
  const enIngles = idioma === "en";
  return ITEMS_BASE.map((item) => ({
    id: item.id,
    img: item.img,
    titulo: enIngles ? item.tituloEn : item.tituloEs,
    versiones: enIngles ? item.versionesEn : item.versionesEs,
  }));
}

export function traducirItemsPorId(idioma) {
  return Object.fromEntries(traducirItems(idioma).map((it) => [it.id, it]));
}

// Versión en español por defecto: la usan los hooks que solo
// necesitan los ids/orden de los ítems (no les importa el idioma),
// como useInventoryPopup.
export const ITEMS = traducirItems("es");
export const ITEMS_POR_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

// Se exporta tal cual (con tituloEs/tituloEn/alias juntos) para que
// app/utils/buscarItems.js pueda armar su índice de búsqueda sin
// depender de un idioma en particular — la búsqueda tiene que
// encontrar un ítem sin importar en qué idioma esté escrito.
export { ITEMS_BASE };
