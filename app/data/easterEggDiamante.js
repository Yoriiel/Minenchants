// Ítem del easter egg escondido (Parte 2: el diamante asomando en el
// borde de la Sección 2). Vive en su propio archivo, separado de
// rellenoItems.js, porque conceptualmente es otra cosa (un ítem que
// se GANA con una acción del usuario, no un relleno que ya está ahí
// desde el arranque) — aunque, por decisión del usuario, se comporta
// exactamente igual que un ítem de relleno una vez que entra al
// inventario: se puede mover libremente por el popup, pero nunca
// puede ir a la casilla principal, y en la barra HUD real solo abre
// el popup vacío al tocarlo (ver `relleno: true` más abajo, que es
// el mismo flag que usa Hud.js / useInventoryPopup.js para decidir
// eso).
//
// IMPORTANTE: a diferencia de RELLENO_ITEMS (que se le pasan a
// useInventoryPopup desde el arranque), este ítem NO se pasa ahí.
// Se agrega en caliente, en medio de la sesión (o al cargar, si el
// usuario ya lo había encontrado antes), con el método nuevo
// `agregarItemSiNoExiste` que se suma al hook en la Parte 4.

export const ITEM_DIAMANTE_SECRETO = {
  id: "easter_egg_diamante",
  img: "/img/Diamond.png",
  titulo: "Diamante",
  relleno: true,
};

// Clave de LocalStorage para recordar que el usuario YA encontró el
// diamante — separada de "minenchants-posiciones-inventario-v2"
// (esa es la de dónde vive cada ítem) porque acá lo único que nos
// importa es un true/false: "¿ya lo encontró alguna vez?". Así, si el
// día de mañana el diamante desaparece de las posiciones guardadas
// por el motivo que sea, este flag aparte permite reponerlo sin
// hacerle pasar de nuevo por la sorpresa del easter egg.
export const CLAVE_DIAMANTE_ENCONTRADO = "minenchants-diamante-encontrado";
