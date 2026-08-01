
import { ITEMS_BASE } from "../data/items";

// Saca tildes/diacríticos y pasa a minúsculas, para que "cana", "Caña" y "CAÑA" sean todos el mismo texto a los ojos de la búsqueda.
export function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const INDICE_BUSQUEDA = ITEMS_BASE.map((item) => ({
  item,
  cadenas: [item.tituloEs, item.tituloEn, ...(item.alias ?? [])].map(normalizar),
}));

export function buscarItems(consulta, limite = 6) {
  const consultaNormalizada = normalizar(consulta);
  if (!consultaNormalizada) return [];

  const empiezaCon = [];
  const contiene = [];

  for (const { item, cadenas } of INDICE_BUSQUEDA) {
    const coincideAlEmpezar = cadenas.some((c) => c.startsWith(consultaNormalizada));
    if (coincideAlEmpezar) {
      empiezaCon.push(item);
      continue;
    }
    const coincideEnAlgunLado = cadenas.some((c) => c.includes(consultaNormalizada));
    if (coincideEnAlgunLado) contiene.push(item);
  }

  return [...empiezaCon, ...contiene].slice(0, limite);
}

export function tituloSegunIdioma(item, idioma) {
  return idioma === "en" ? item.tituloEn : item.tituloEs;
}
