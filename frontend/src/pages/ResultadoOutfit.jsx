// ResultadoOutfit.jsx — Pantalla de resultado de la recomendación
// Isidora — Sprint 3
//
// Muestra el outfit sugerido por Closy con sus prendas,
// y permite guardarlo o pedir otro.

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { guardarOutfit } from "../services/outfits";
import { getUsuarioId } from "../utils/auth";
import "./ResultadoOutfit.css";

const OCASION_ID_MAP = { universidad: 1, trabajo: 2, casual: 3 };

const CATEGORIA_NOMBRE = {
  1: "Parte de arriba (manga larga)",
  2: "Parte de arriba (manga corta)",
  3: "Parte de abajo (largo)",
  4: "Parte de abajo (corto)",
  5: "Zapatos",
  6: "Accesorio",
};


export default function ResultadoOutfit() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [guardando, setGuardando] = useState(false);
  const [guardado,  setGuardado]  = useState(false);
  const [error, setError]         = useState(null);

  if (!state?.prendas) {
    return (
      <div className="resultado__vacio">
        <p>No hay outfit para mostrar. Vuelve a la pantalla anterior.</p>
        <button onClick={() => navigate("/recomendaciones")}>Volver</button>
      </div>
    );
  }

  const { prendas, mensaje, nivelClima, ocasion, temperatura, condiciones } = state;

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const nombre     = `Outfit ${ocasion} – ${temperatura}°C`;
      const ocasionId  = OCASION_ID_MAP[ocasion] ?? 1;
      const prendaIds  = prendas.map((p) => p.id);
      await guardarOutfit(getUsuarioId(), nombre, ocasionId, nivelClima, prendaIds);
      setGuardado(true);
    } catch (e) {
      setError(e.message || "No se pudo guardar el outfit.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearOtro = () => {
    navigate("/recomendaciones");
  };

  return (
    <div className="resultado">
      {/* Closy + mensaje */}
      <div className="resultado__header">
        <img src="/logo.png" alt="Closy" className="resultado__closy" />
        <div className="resultado__burbuja">
          <p>{mensaje || "¡Para lo que harás hoy, te recomiendo este outfit!"}</p>
        </div>
      </div>

      {/* Prendas del outfit */}
      <section className="resultado__prendas">
        {prendas.length === 0 ? (
          <div className="resultado__sin-prendas">
            <p>No hay prendas disponibles para este clima.</p>
            <p>Sube más ropa en tu closet y vuelve a intentarlo.</p>
          </div>
        ) : (
          <div className="resultado__grid">
            {prendas.map((prenda) => (
              <div key={prenda.id} className="resultado__prenda-card">
                {prenda.imagen_url ? (
                  <img
                    src={prenda.imagen_url}
                    alt={prenda.nombre}
                    className="resultado__prenda-img"
                  />
                ) : (
                  <div className="resultado__prenda-placeholder" />
                )}
                <p className="resultado__prenda-nombre">{prenda.nombre}</p>
                <p className="resultado__prenda-categoria">
                  {CATEGORIA_NOMBRE[prenda.categoria_id] || "Prenda"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Error */}
      {error && <p className="resultado__error">{error}</p>}

      {/* Botones */}
      <div className="resultado__botones">
        {!guardado ? (
          <button
            className="resultado__btn resultado__btn--guardar"
            onClick={handleGuardar}
            disabled={guardando || prendas.length === 0}
          >
            {guardando ? "Guardando..." : "Guardar diseño"}
          </button>
        ) : (
          <div className="resultado__guardado">
            <span>✅</span> ¡Outfit guardado en tu closet!
          </div>
        )}

        <button
          className="resultado__btn resultado__btn--pizarron"
          onClick={() => navigate("/pizarron", { state: { prendas } })}
          disabled={prendas.length === 0}
        >
          Editar en pizarrón
        </button>

        <button
          className="resultado__btn resultado__btn--otro"
          onClick={handleCrearOtro}
        >
          Crear otro
        </button>
      </div>
    </div>
  );
}
