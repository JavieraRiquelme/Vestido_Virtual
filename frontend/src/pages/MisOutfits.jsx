// MisOutfits.jsx — Galería de outfits guardados
// Isidora — Sprint 3
//
// Muestra todos los outfits guardados del usuario con opción de eliminar.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOutfitsUsuario, eliminarOutfit } from "../services/outfits";
import "./MisOutfits.css";

// Usuario hardcodeado hasta que Javiera integre la auth (Sprint 3)
const USUARIO_ID_TEMP = 1;

const OCASION_LABEL = { 1: "Universidad", 2: "Trabajo", 3: "Casual" };
const CLIMA_EMOJI   = { frio: "🥶", templado: "🌤️", calor: "☀️" };

export default function MisOutfits() {
  const navigate = useNavigate();

  const [outfits,   setOutfits]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    cargarOutfits();
  }, []);

  const cargarOutfits = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getOutfitsUsuario(USUARIO_ID_TEMP);
      setOutfits(data);
    } catch (e) {
      setError("No se pudieron cargar los outfits.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (outfitId) => {
    setEliminando(outfitId);
    try {
      await eliminarOutfit(outfitId);
      setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
    } catch (e) {
      setError("No se pudo eliminar el outfit.");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="mis-outfits">
      <div className="mis-outfits__header">
        <h1 className="mis-outfits__titulo">Mis Outfits</h1>
        <button
          className="mis-outfits__btn-nuevo"
          onClick={() => navigate("/recomendaciones")}
        >
          + Nuevo
        </button>
      </div>

      {cargando && (
        <div className="mis-outfits__cargando">
          <span className="mis-outfits__spinner">🐙</span>
          <p>Closy está buscando tus outfits...</p>
        </div>
      )}

      {error && <p className="mis-outfits__error">{error}</p>}

      {!cargando && outfits.length === 0 && (
        <div className="mis-outfits__vacio">
          <span className="mis-outfits__vacio-emoji">👗</span>
          <p>Aún no tienes outfits guardados.</p>
          <p>¡Pídele a Closy que te arme uno!</p>
          <button
            className="mis-outfits__btn-crear"
            onClick={() => navigate("/recomendaciones")}
          >
            Crear mi primer outfit
          </button>
        </div>
      )}

      <div className="mis-outfits__grid">
        {outfits.map((outfit) => (
          <div key={outfit.id} className="mis-outfits__card">
            {/* Ícono de clima */}
            <div className="mis-outfits__card-clima">
              {CLIMA_EMOJI[outfit.ideal_clima] || "🌡️"}
            </div>

            <div className="mis-outfits__card-info">
              <h3 className="mis-outfits__card-nombre">{outfit.nombre}</h3>
              <div className="mis-outfits__card-tags">
                {outfit.ocasion_id && (
                  <span className="mis-outfits__tag mis-outfits__tag--ocasion">
                    {OCASION_LABEL[outfit.ocasion_id] || "Ocasión"}
                  </span>
                )}
                {outfit.ideal_clima && (
                  <span className="mis-outfits__tag mis-outfits__tag--clima">
                    {outfit.ideal_clima}
                  </span>
                )}
              </div>
              {outfit.created_at && (
                <p className="mis-outfits__card-fecha">
                  {new Date(outfit.created_at).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <button
              className="mis-outfits__btn-eliminar"
              onClick={() => handleEliminar(outfit.id)}
              disabled={eliminando === outfit.id}
              aria-label="Eliminar outfit"
            >
              {eliminando === outfit.id ? "..." : "🗑️"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
