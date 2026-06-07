// SelectorClima.jsx — Componente reutilizable para seleccionar condiciones del clima
// Isidora — Sprint 2

import { useState } from "react";

const CONDICIONES = [
  { id: "lloviendo",   label: "Está lloviendo", emoji: "🌧️" },
  { id: "corre_viento", label: "Corre viento",   emoji: "💨" },
  { id: "sol_fuerte",  label: "Sol fuerte",      emoji: "☀️" },
  { id: "nublado",     label: "Nublado",         emoji: "☁️" },
];

/**
 * SelectorClima
 * Props:
 *   seleccionadas (string[]) — condiciones activas
 *   onChange (fn)            — callback cuando cambia la selección
 */
export default function SelectorClima({ seleccionadas = [], onChange }) {
  const toggle = (id) => {
    const nuevas = seleccionadas.includes(id)
      ? seleccionadas.filter((c) => c !== id)
      : [...seleccionadas, id];
    onChange(nuevas);
  };

  return (
    <div className="selector-clima">
      <p className="selector-clima__label">Condiciones del clima</p>
      <div className="selector-clima__grid">
        {CONDICIONES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`selector-clima__btn${seleccionadas.includes(c.id) ? " selector-clima__btn--activo" : ""}`}
            onClick={() => toggle(c.id)}
          >
            <span className="selector-clima__emoji">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
