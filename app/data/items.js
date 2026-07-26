// Catálogo de ítems y sus encantamientos.
// Si querés agregar/quitar un ítem del juego, este es el único
// archivo que necesitás tocar.

export const ITEMS = [
  {
    id: "casco",
    titulo: "Casco",
    img: "/img/Casco.gif",
    encantamientos: [
      "Reparación",
      "Irrompibilidad III",
      "Protección IV",
      "Espinas III",
      "Respiración III",
      "Afinidad Acuática",
    ],
  },
  {
    id: "pechera",
    titulo: "Pechera",
    img: "/img/Peto.gif",
    encantamientos: ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III"],
  },
  {
    id: "pantalones",
    titulo: "Pantalones",
    img: "/img/Legs.gif",
    encantamientos: ["Reparación", "Irrompibilidad III", "Protección IV", "Espinas III"],
  },
  {
    id: "botas",
    titulo: "Botas",
    img: "/img/Botas.gif",
    encantamientos: [
      "Reparación",
      "Irrompibilidad III",
      "Protección IV",
      "Espinas III",
      "Caída de Pluma IV",
      "Agilidad Acuática III",
    ],
  },
  {
    id: "espada",
    titulo: "Espada",
    img: "/img/Espada.gif",
    encantamientos: ["Reparación", "Irrompibilidad III", "Aspecto Ígneo II", "Botín III", "Filo V"],
  },
  {
    id: "pico",
    titulo: "Pico",
    img: "/img/Pico.gif",
    encantamientos: ["Reparación", "Irrompibilidad III", "Eficiencia V", "Fortuna III"],
  },
  {
    id: "hacha",
    titulo: "Hacha",
    img: "/img/Hacha.gif",
    encantamientos: ["Reparación", "Irrompibilidad III", "Fortuna III", "Eficiencia V"],
  },
  {
    id: "arco",
    titulo: "Arco",
    img: "/img/Arco.gif",
    encantamientos: ["Infinidad", "Irrompibilidad III", "Poder V", "Retroceso II", "Fuego"],
  },
];

export const ITEMS_POR_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
