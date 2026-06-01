// Recomendaciones.jsx — Tab III "¡Indica a Closy!"
// Isidora — Sprint 2 & 3
//
// Pantalla principal del asistente virtual.
// El usuario indica temperatura, condiciones del clima y qué hará hoy,
// luego puede pedir que Closy le arme un outfit o crear el suyo propio.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectorClima from "../components/SelectorClima";
import { pedirSugerencia } from "../services/outfits";
import "./Recomendaciones.css";

const OCASIONES = [
  { id: "universidad", label: "Universidad", emoji: "🎓" },
  { id: "trabajo",     label: "Trabajo",     emoji: "💼" },
  { id: "casual",      label: "Casual",      emoji: "🛍️" },
];

// Usuario hardcodeado hasta que Javiera integre la auth (Sprint 3)
const USUARIO_ID_TEMP = 1;

export default function Recomendaciones() {
  const navigate = useNavigate();

  const [temperatura, setTemperatura]   = useState(23);
  const [condiciones, setCondiciones]   = useState([]);
  const [ocasion, setOcasion]           = useState(null);
  const [cargando, setCargando]         = useState(false);
  const [error, setError]               = useState(null);

  // Determina el emoji del termómetro según temperatura
  const emojiTermometro = temperatura <= 10 ? "🥶" : temperatura <= 18 ? "🌤️" : "☀️";

  const handleArmarOutfit = async () => {
    if (!ocasion) {
      setError("Selecciona qué harás hoy antes de continuar.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      const resultado = await pedirSugerencia(
        USUARIO_ID_TEMP,
        temperatura,
        condiciones,
        ocasion
      );
      // Navega a la pantalla de resultado pasando los datos
      navigate("/resultado-outfit", {
        state: {
          prendas:     resultado.prendas,
          mensaje:     resultado.mensaje,
          nivelClima:  resultado.nivel_clima,
          ocasion,
          temperatura,
          condiciones,
        },
      });
    } catch (e) {
      setError(e.message || "Hubo un error al generar el outfit. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const handleCrearPropio = () => {
    navigate("/crear-outfit", {
      state: { temperatura, condiciones, ocasion },
    });
  };

  return (
    <div className="recomendaciones">
      {/* Título */}
      <h1 className="recomendaciones__titulo">¡Indica a Closy!</h1>

      {/* Bloque temperatura */}
      <section className="recomendaciones__card">
        <p className="recomendaciones__card-label">— TEMPERATURA ACTUAL</p>
        <p className="recomendaciones__card-sublabel">Ingresa la temperatura</p>

        <div className="recomendaciones__temp-row">
          <span className="recomendaciones__temp-emoji">{emojiTermometro}</span>
          <input
            className="recomendaciones__temp-input"
            type="number"
            value={temperatura}
            min={-10}
            max={45}
            onChange={(e) => setTemperatura(Number(e.target.value))}
          />
          <span className="recomendaciones__temp-unidad">°C</span>
        </div>

        {/* Barra de temperatura */}
        <div className="recomendaciones__barra-wrap">
          <input
            className="recomendaciones__barra"
            type="range"
            min={-10}
            max={45}
            value={temperatura}
            onChange={(e) => setTemperatura(Number(e.target.value))}
          />
          <div className="recomendaciones__barra-labels">
            <span>-10° Frío</span>
            <span>18° Templado</span>
            <span>45° Calor</span>
          </div>
        </div>
      </section>

      {/* Bloque condiciones del clima */}
      <section className="recomendaciones__card">
        <SelectorClima seleccionadas={condiciones} onChange={setCondiciones} />
      </section>

      {/* Bloque ¿qué harás hoy? */}
      <section className="recomendaciones__card">
        <p className="recomendaciones__card-label">— ¿QUÉ HARÁS HOY?</p>
        <div className="recomendaciones__ocasiones">
          {OCASIONES.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`recomendaciones__ocasion-btn${ocasion === o.id ? " recomendaciones__ocasion-btn--activo" : ""}`}
              onClick={() => setOcasion(o.id)}
            >
              <span className="recomendaciones__ocasion-emoji">{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && <p className="recomendaciones__error">{error}</p>}

      {/* Closy mascota + botones */}
      <div className="recomendaciones__acciones">
        <div className="recomendaciones__closy">
          <span className="recomendaciones__closy-mascota" role="img" aria-label="Closy">🐙</span>
        </div>
        <div className="recomendaciones__botones">
          <button
            className="recomendaciones__btn recomendaciones__btn--principal"
            onClick={handleArmarOutfit}
            disabled={cargando}
          >
            {cargando ? "Generando..." : "Armar outfit"}
          </button>
          <button
            className="recomendaciones__btn recomendaciones__btn--secundario"
            onClick={handleCrearPropio}
            disabled={cargando}
          >
            Crea tu propio outfit
          </button>
        </div>
      </div>
    </div>
  );
}
