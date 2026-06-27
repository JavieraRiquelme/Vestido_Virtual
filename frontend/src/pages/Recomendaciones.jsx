// Recomendaciones.jsx — Tab III "¡Indica a Closy!"
// Isidora — Sprint 2 & 3 | Clima real por ciudad — Sprint 4

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { pedirSugerencia } from "../services/outfits";
import { esDemoMode, getUsuarioId } from "../utils/auth";
import { MOCK_SUGERENCIA, MOCK_PRENDAS } from "../utils/mockData";
import "./Recomendaciones.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ESTILOS = [
  { id: "minimalista", label: "Minimalista" },
  { id: "colorido",    label: "Colorido"    },
  { id: "comfy",       label: "Comfy"       },
  { id: "formal",      label: "Formal"      },
  { id: "streetwear",  label: "Streetwear"  },
  { id: "boho",        label: "Boho"        },
];

const OCASIONES = [
  {
    id: "universidad", label: "Universidad",
    patron: {
      backgroundColor: "#3b82f6",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.18) 8px, rgba(255,255,255,0.18) 9px)",
      borderColor: "#2563eb", color: "#fff",
    },
  },
  {
    id: "trabajo", label: "Trabajo",
    patron: {
      backgroundColor: "#4338ca",
      backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.14) 10px, rgba(255,255,255,0.14) 11px)",
      borderColor: "#3730a3", color: "#fff",
    },
  },
  {
    id: "casual", label: "Casual",
    patron: {
      backgroundColor: "#d97706",
      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.24) 1.5px, transparent 1.5px)",
      backgroundSize: "10px 10px",
      borderColor: "#b45309", color: "#fff",
    },
  },
  {
    id: "fiesta", label: "Fiesta",
    patron: {
      backgroundColor: "#db2777",
      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.15) 5px, rgba(255,255,255,0.15) 6px), repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(255,255,255,0.10) 5px, rgba(255,255,255,0.10) 6px)",
      borderColor: "#be185d", color: "#fff",
    },
  },
  {
    id: "deporte", label: "Deporte",
    patron: {
      backgroundColor: "#059669",
      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.16) 6px, rgba(255,255,255,0.16) 8px)",
      borderColor: "#047857", color: "#fff",
    },
  },
  {
    id: "cita", label: "Cita",
    patron: {
      backgroundColor: "#e11d48",
      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.13) 8px, rgba(255,255,255,0.13) 9px), repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.13) 8px, rgba(255,255,255,0.13) 9px)",
      borderColor: "#be123c", color: "#fff",
    },
  },
];

const MOCK_CLIMA = {
  santiago: { ciudad: "Santiago", temperatura: 18, descripcion: "cielo despejado", categoria: "templado" },
  viña:     { ciudad: "Viña del Mar", temperatura: 14, descripcion: "nublado", categoria: "frio" },
};

const MOCK_SUGERENCIAS = [
  { nombre: "Santiago",     pais: "CL", estado: "Región Metropolitana", lat: -33.45, lon: -70.67 },
  { nombre: "Viña del Mar", pais: "CL", estado: "Valparaíso",           lat: -33.02, lon: -71.55 },
  { nombre: "Concepción",   pais: "CL", estado: "Biobío",               lat: -36.82, lon: -73.05 },
]

function useBuscarClima() {
  const [inputCiudad, setInputCiudad]   = useState("");
  const [clima, setClima]               = useState(null);
  const [buscando, setBuscando]         = useState(false);
  const [errorCiudad, setErrorCiudad]   = useState(null);
  const [sugerencias, setSugerencias]   = useState([]);
  const debounceRef                     = useRef(null);
  const suppressRef                     = useRef(false);

  useEffect(() => {
    if (suppressRef.current) { suppressRef.current = false; return; }
    const q = inputCiudad.trim();
    if (q.length < 2 || clima) { setSugerencias([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (esDemoMode()) {
        setSugerencias(MOCK_SUGERENCIAS.filter(s =>
          s.nombre.toLowerCase().startsWith(q.toLowerCase())
        ));
        return;
      }
      try {
        const res = await fetch(`${API}/clima/autocomplete?q=${encodeURIComponent(q)}`);
        if (res.ok) setSugerencias(await res.json());
      } catch { /* silencioso */ }
    }, 300);
  }, [inputCiudad]);

  async function seleccionarSugerencia(sug) {
    suppressRef.current = true;
    setSugerencias([]);
    setInputCiudad(sug.nombre);
    setErrorCiudad(null);
    setBuscando(true);

    if (esDemoMode()) {
      await new Promise((r) => setTimeout(r, 400));
      const mock = Object.entries(MOCK_CLIMA).find(([k]) => sug.nombre.toLowerCase().includes(k));
      setClima(mock ? mock[1] : { ciudad: sug.nombre, temperatura: 18, descripcion: "despejado", categoria: "templado" });
      setBuscando(false);
      return;
    }

    try {
      const res = await fetch(`${API}/clima/ciudad?q=${encodeURIComponent(sug.nombre)}`);
      if (!res.ok) throw new Error();
      setClima(await res.json());
    } catch {
      setErrorCiudad("No se pudo obtener el clima.");
    } finally {
      setBuscando(false);
    }
  }

  async function usarUbicacion() {
    if (!navigator.geolocation) { setErrorCiudad("Tu navegador no soporta geolocalización."); return; }
    setErrorCiudad(null);
    setBuscando(true);
    setSugerencias([]);

    if (esDemoMode()) {
      await new Promise((r) => setTimeout(r, 700));
      setClima(MOCK_CLIMA.santiago);
      setInputCiudad("Santiago");
      setBuscando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`${API}/clima/gps?lat=${coords.latitude}&lon=${coords.longitude}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setClima(data);
          setInputCiudad(data.ciudad);
        } catch {
          setErrorCiudad("No se pudo obtener el clima de tu ubicación.");
        } finally {
          setBuscando(false);
        }
      },
      () => { setErrorCiudad("Permiso de ubicación denegado."); setBuscando(false); }
    );
  }

  function limpiar() { setClima(null); setSugerencias([]); }

  return { inputCiudad, setInputCiudad, clima, buscando, errorCiudad, sugerencias, seleccionarSugerencia, usarUbicacion, limpiar };
}

function ClimaResultado({ clima }) {
  const emoji = clima.temperatura <= 10 ? "🥶" : clima.temperatura <= 18 ? "🌤️" : "☀️";
  return (
    <div className="recomendaciones__clima-resultado">
      <span className="recomendaciones__clima-emoji">{emoji}</span>
      <div>
        <p className="recomendaciones__clima-ciudad">{clima.ciudad}</p>
        <p className="recomendaciones__clima-detalle">
          {clima.temperatura}°C · {clima.descripcion}
        </p>
      </div>
    </div>
  );
}

function BuscadorCiudad({ label, hook }) {
  return (
    <div className="recomendaciones__buscador">
      <p className="recomendaciones__buscador-label">{label}</p>
      <div className="recomendaciones__ciudad-wrap">
        <div className="recomendaciones__ciudad-row">
          <input
            className="recomendaciones__ciudad-input"
            type="text"
            placeholder="ej: Ñuñoa, Concepción..."
            value={hook.inputCiudad}
            onChange={(e) => { hook.setInputCiudad(e.target.value); hook.limpiar(); }}
            autoComplete="off"
          />
          <button
            className="recomendaciones__ciudad-btn recomendaciones__ciudad-btn--gps"
            onClick={hook.usarUbicacion}
            disabled={hook.buscando}
            title="Usar mi ubicación"
          >
            {hook.buscando ? "..." : "📍"}
          </button>
        </div>

        {hook.sugerencias.length > 0 && (
          <ul className="recomendaciones__dropdown">
            {hook.sugerencias.map((s, i) => (
              <li
                key={i}
                className="recomendaciones__dropdown-item"
                onMouseDown={() => hook.seleccionarSugerencia(s)}
              >
                <span className="recomendaciones__dropdown-nombre">{s.nombre}</span>
                <span className="recomendaciones__dropdown-meta">
                  {s.estado ? `${s.estado}, ` : ""}{s.pais}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hook.errorCiudad && <p className="recomendaciones__ciudad-error">{hook.errorCiudad}</p>}
      {hook.clima && <ClimaResultado clima={hook.clima} />}
    </div>
  );
}

export default function Recomendaciones() {
  const navigate = useNavigate();
  const origen   = useBuscarClima();
  const destino  = useBuscarClima();

  const [ocasion,      setOcasion]      = useState(null);
  const [estilo,       setEstilo]       = useState(null);
  const [prendaFija,   setPrendaFija]   = useState(null);
  const [prendas,      setPrendas]      = useState([]);
  const [temperatura,  setTemperatura]  = useState(20);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (esDemoMode()) { setPrendas(MOCK_PRENDAS); return; }
    fetch(`${API}/prendas/usuario/${getUsuarioId()}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setPrendas)
      .catch(() => {});
  }, []);

  const handleArmarOutfit = async () => {
    if (!ocasion) {
      setError("Selecciona qué harás hoy antes de continuar.");
      return;
    }
    setError(null);
    setCargando(true);

    if (esDemoMode()) {
      await new Promise((r) => setTimeout(r, 800));
      navigate("/resultado-outfit", {
        state: {
          prendas:    MOCK_SUGERENCIA.prendas,
          mensaje:    MOCK_SUGERENCIA.mensaje,
          nivelClima: MOCK_SUGERENCIA.nivel_clima,
          ocasion,
        },
      });
      setCargando(false);
      return;
    }

    try {
      const resultado = await pedirSugerencia({
        usuario_id:     getUsuarioId(),
        ocasion,
        ciudad_origen:  origen.clima?.ciudad  || null,
        ciudad_destino: destino.clima?.ciudad || null,
        temperatura,
        prenda_fija_id: prendaFija?.id        || null,
        estilo:         estilo                || null,
      });
      navigate("/resultado-outfit", {
        state: {
          prendas:     resultado.prendas,
          mensaje:     resultado.mensaje,
          nivelClima:  resultado.nivel_clima,
          ocasion,
          temperatura: origen.clima?.temperatura ?? destino.clima?.temperatura ?? temperatura,
        },
      });
    } catch (e) {
      setError(e.message || "Hubo un error al generar el outfit. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recomendaciones">

      <div className="recomendaciones__header">
        <h1 className="recomendaciones__titulo">¿Qué nos ponemos?</h1>
        <p className="recomendaciones__subtitulo">Cuéntale a Closy lo que necesitas</p>
      </div>

      {/* Ciudades + Temperatura */}
      <section className="recomendaciones__card">
        <p className="recomendaciones__pregunta">¿Dónde estarás hoy?</p>
        <BuscadorCiudad label="Desde dónde sales" hook={origen} />
        <div className="recomendaciones__ciudad-separador" />
        <BuscadorCiudad label="A dónde vas" hook={destino} />

        <div className="recomendaciones__ciudad-separador" />
        <div className="recomendaciones__slider-wrap">
          <div className="recomendaciones__slider-header">
            <span className="recomendaciones__buscador-label">
              {origen.clima || destino.clima ? "Temperatura real detectada" : "O ajusta la temperatura manualmente"}
            </span>
            <span className="recomendaciones__slider-valor" style={{
              color: temperatura <= 10 ? "#3b82f6" : temperatura <= 20 ? "#8b5cf6" : "#f97316"
            }}>
              {origen.clima || destino.clima
                ? `${Math.round(origen.clima?.temperatura ?? destino.clima?.temperatura)}°C`
                : `${temperatura}°C`}
            </span>
          </div>
          <input
            className="recomendaciones__slider"
            type="range"
            min={-5}
            max={40}
            step={1}
            value={origen.clima || destino.clima
              ? Math.round(origen.clima?.temperatura ?? destino.clima?.temperatura)
              : temperatura}
            onChange={(e) => setTemperatura(Number(e.target.value))}
            disabled={!!(origen.clima || destino.clima)}
          />
          <div className="recomendaciones__slider-labels">
            <span>Frío</span>
            <span>Templado</span>
            <span>Calor</span>
          </div>
        </div>
      </section>

      {/* Ocasión */}
      <section className="recomendaciones__card">
        <p className="recomendaciones__pregunta">¿Qué harás?</p>
        <div className="recomendaciones__ocasiones">
          {OCASIONES.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`recomendaciones__ocasion-btn${ocasion === o.id ? " recomendaciones__ocasion-btn--activo" : ""}`}
              style={ocasion === o.id ? o.patron : {}}
              onClick={() => setOcasion(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* Estilo + Prenda fija en una sola card */}
      <section className="recomendaciones__card">
        <p className="recomendaciones__pregunta">Afina tu look</p>

        <p className="recomendaciones__hint">Estilo</p>
        <div className="recomendaciones__estilos">
          {ESTILOS.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`recomendaciones__estilo-chip${estilo === e.id ? " recomendaciones__estilo-chip--activo" : ""}`}
              onClick={() => setEstilo(estilo === e.id ? null : e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>

        {prendas.length > 0 && (
          <>
            <p className="recomendaciones__hint" style={{ marginTop: 16 }}>Prenda que quieres usar sí o sí</p>
            <div className="recomendaciones__prendas-scroll">
              {prendas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`recomendaciones__prenda-chip${prendaFija?.id === p.id ? " recomendaciones__prenda-chip--activo" : ""}`}
                  onClick={() => setPrendaFija(prendaFija?.id === p.id ? null : p)}
                >
                  {p.color && (
                    <span
                      className="recomendaciones__prenda-color"
                      style={{ background: p.color }}
                    />
                  )}
                  {p.nombre}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {error && <p className="recomendaciones__error">{error}</p>}

      <div className="recomendaciones__botones">
        <button
          className="recomendaciones__btn recomendaciones__btn--principal"
          onClick={handleArmarOutfit}
          disabled={cargando}
        >
          {cargando ? "Generando outfit..." : "Armar outfit"}
        </button>
        <button
          className="recomendaciones__btn recomendaciones__btn--secundario"
          onClick={() => navigate("/crear-outfit")}
          disabled={cargando}
        >
          Crear outfit manual
        </button>
      </div>
    </div>
  );
}
