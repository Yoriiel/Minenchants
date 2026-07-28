
const ITEMS_BASE = [
  {
    id: "casco",
    img: "/img/Casco.gif",
    tituloEs: "Casco",
    tituloEn: "Helmet",
    encantamientosEs: [
      "Reparación",
      "Irrompibilidad III",
      "Protección IV",
      "Espinas III",
      "Respiración III",
      "Afinidad Acuática",
    ],
    encantamientosEn: [
      "Mending",
      "Unbreaking III",
      "Protection IV",
      "Thorns III",
      "Respiration III",
      "Aqua Affinity",
    ],
  },
  {
    id: "pechera",
    img: "/img/Peto.gif",
    tituloEs: "Pechera",
    tituloEn: "Chestplate",
    encantamientosEs: ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III"],
    encantamientosEn: ["Mending", "Unbreaking III", "Protection IV", "Thorns III"],
  },
  {
    id: "pantalones",
    img: "/img/Legs.gif",
    tituloEs: "Pantalones",
    tituloEn: "Leggings",
    encantamientosEs: ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III"],
    encantamientosEn: ["Mending", "Unbreaking III", "Protection IV", "Thorns III"],
  },
  {
    id: "botas",
    img: "/img/Botas.gif",
    tituloEs: "Botas",
    tituloEn: "Boots",
    encantamientosEs: [
      "Reparación",
      "Irrompibilidad III",
      "Protección IV",
      "Espinas III",
      "Caída de Pluma IV",
      "Agilidad Acuática III",
    ],
    encantamientosEn: [
      "Mending",
      "Unbreaking III",
      "Protection IV",
      "Thorns III",
      "Feather Falling IV",
      "Depth Strider III",
    ],
  },
  {
    id: "espada",
    img: "/img/Espada.gif",
    tituloEs: "Espada",
    tituloEn: "Sword",
    encantamientosEs: ["Reparación", "Irrompibilidad III", "Aspecto Ígneo II", "Botín III", "Filo V"],
    encantamientosEn: ["Mending", "Unbreaking III", "Fire Aspect II", "Looting III", "Sharpness V"],
  },
  {
    id: "pico",
    img: "/img/Pico.gif",
    tituloEs: "Pico",
    tituloEn: "Pickaxe",
    encantamientosEs: ["Reparación", "Irrompibilidad III", "Eficiencia V", "Fortuna III"],
    encantamientosEn: ["Mending", "Unbreaking III", "Efficiency V", "Fortune III"],
  },
  {
    id: "hacha",
    img: "/img/Hacha.gif",
    tituloEs: "Hacha",
    tituloEn: "Axe",
    encantamientosEs: ["Reparación", "Irrompibilidad III", "Fortuna III", "Eficiencia V"],
    encantamientosEn: ["Mending", "Unbreaking III", "Fortune III", "Efficiency V"],
  },
  {
    id: "arco",
    img: "/img/Arco.gif",
    tituloEs: "Arco",
    tituloEn: "Bow",
    encantamientosEs: ["Infinidad", "Irrompibilidad III", "Poder V", "Retroceso II", "Fuego"],
    encantamientosEn: ["Infinity", "Unbreaking III", "Power V", "Punch II", "Flame"],
  },
];

// Arma la lista de ítems "activa" para el idioma pedido: cada ítem
// queda con { id, img, titulo, encantamientos } listo para usar tal
// cual lo consumían Hud/InventoryPopup/EnchantmentPanel antes.
export function traducirItems(idioma) {
  const enIngles = idioma === "en";
  return ITEMS_BASE.map((item) => ({
    id: item.id,
    img: item.img,
    titulo: enIngles ? item.tituloEn : item.tituloEs,
    encantamientos: enIngles ? item.encantamientosEn : item.encantamientosEs,
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