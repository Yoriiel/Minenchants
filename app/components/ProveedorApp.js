"use client";

import { ConfiguracionProvider } from "../context/ConfiguracionContext";

export default function ProveedorApp({ children }) {
  return <ConfiguracionProvider>{children}</ConfiguracionProvider>;
}