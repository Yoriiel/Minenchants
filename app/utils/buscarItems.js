// Utilidad de búsqueda de ítems: funciones puras, sin estado ni
// dependencias de React, para que las use CUALQUIER componente (el
// buscador del header y el del popup comparten exactamente esto).

import { ITEMS_BASE } from "../data/items";

// Saca tildes/diacríticos y pasa a minúsculas, para que "cana",
// "Caña" y "CAÑA" sean todos el mismo texto a los ojos de la
// búsqueda. NFD separa la letra de su tilde en 2 caracteres unicode
// distintos; el regex se queda solo con la letra.
export function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Índice de búsqueda: se arma UNA sola vez (no depende del idioma
// actual de la interfaz, por eso lee ITEMS_BASE directo) — cada
// entrada tiene el ítem base + todas las cadenas normalizadas contra
// las que se puede escribir para encontrarlo (título en español,
// título en inglés, y alias si tiene).
const INDICE_BUSQUEDA = ITEMS_BASE.map((item) => ({
  item,
  cadenas: [item.tituloEs, item.tituloEn, ...(item.alias ?? [])].map(normalizar),
}));

// Busca `consulta` contra el índice y devuelve los ítems que
// coinciden, en un orden de relevancia simple:
//   1º los que ALGUNA de sus cadenas EMPIEZA con la consulta
//   2º los que solo la CONTIENEN en algún lado
// Devuelve como mucho `limite` resultados. Cada resultado es
// { id, img, tituloEs, tituloEn, alias } (el ítem "base", en los 2
// idiomas — quien lo use elige qué título mostrar).
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

// Título a mostrar de un ítem "base" (de buscarItems) según el
// idioma actual de la interfaz — separado de traducirItems() porque
// acá no necesitamos las versiones/encantamientos, solo el nombre.
export function tituloSegunIdioma(item, idioma) {
  return idioma === "en" ? item.tituloEn : item.tituloEs;
}
