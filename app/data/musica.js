// Lista de pistas de música de fondo (carpeta public/music).
// El orden acá define el orden de los botones "pista anterior" / "pista
// siguiente" (se recorren de forma secuencial). Al terminar una pista se
// elige la siguiente al azar entre TODAS las de esta lista, sin repetir
// la que recién terminó.

export const PISTAS = [
  "/music/1-01. Key.mp3",
  "/music/1-02. Door.mp3",
  "/music/1-03. Subwoofer Lullaby.mp3",
  "/music/1-05. Living Mice.mp3",
  "/music/1-06. Moog City.mp3",
  "/music/1-07. Haggstrom.mp3",
  "/music/1-08. Minecraft.mp3",
  "/music/1-11. Mice on Venus.mp3",
  "/music/1-13. Wet Hands.mp3",
  "/music/1-18. Sweden.mp3",
  "/music/1-21. Danny.mp3",
  "/music/2-06. Moog City 2.mp3",
  "/music/2-09. Mutation.mp3",
  "/music/2-13. Aria Math.mp3",
  "/music/2-17. Beginning 2.mp3",
];

// Pista con la que arranca la web.
export const PISTA_INICIAL = "/music/1-05. Living Mice.mp3";