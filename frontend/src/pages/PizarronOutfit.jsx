import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { esDemoMode, getUsuarioId } from "../utils/auth"
import { MOCK_PRENDAS } from "../utils/mockData"
import { guardarOutfit } from "../services/outfits"
import "./PizarronOutfit.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const SHAPES = [
  { id: "libre",      label: "Sin recorte",   clip: null },
  { id: "cuadrado",   label: "Cuadrado",      clip: "inset(0 round 4px)" },
  { id: "redondeado", label: "Redondeado",    clip: "inset(0 round 20px)" },
  { id: "circulo",    label: "Círculo",       clip: "circle(50%)" },
  { id: "diamante",   label: "Diamante",      clip: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" },
]

const FONDOS = [
  {
    id: "puntos",
    label: "Puntos",
    style: { backgroundColor: "#fff", backgroundImage: "radial-gradient(circle,#c8b6e2 1.2px,transparent 1.2px)", backgroundSize: "22px 22px" },
  },
  {
    id: "blanco",
    label: "Blanco",
    style: { backgroundColor: "#fff" },
  },
  {
    id: "cuadricula",
    label: "Cuadrícula",
    style: { backgroundColor: "#fff", backgroundImage: "linear-gradient(rgba(200,182,226,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(200,182,226,.4) 1px,transparent 1px)", backgroundSize: "22px 22px" },
  },
  {
    id: "lineas",
    label: "Líneas",
    style: { backgroundColor: "#fff", backgroundImage: "repeating-linear-gradient(transparent,transparent 21px,rgba(200,182,226,.6) 21px,rgba(200,182,226,.6) 22px)" },
  },
  {
    id: "lavanda",
    label: "Lavanda",
    style: { backgroundColor: "#f3eaff" },
  },
  {
    id: "noche",
    label: "Noche",
    style: { backgroundColor: "#1a0a2e", backgroundImage: "radial-gradient(circle,#4a2080 1px,transparent 1px)", backgroundSize: "22px 22px" },
  },
]

export default function PizarronOutfit() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const canvasRef = useRef(null)
  const nextId    = useRef(1)
  const histRef   = useRef([[]])
  const histIdx   = useRef(0)

  const mkItem = useCallback((prenda, x, y) => ({
    id: nextId.current++,
    prenda, x, y,
    size: 150,
    shape: "libre",
    rotation: 0,
    zIndex: nextId.current,
  }), [])

  const [items,          setItems]          = useState([])
  const [outfitPrendas,  setOutfitPrendas]  = useState([])
  const [closetItems,    setClosetItems]    = useState([])
  const [selected,       setSelected]       = useState(null)
  const [dragging,       setDragging]       = useState(null)
  const [resizing,       setResizing]       = useState(null)
  const [rotating,       setRotating]       = useState(null)
  const [sheetMode,      setSheetMode]      = useState(null)  // null | "prendas" | "fondo"
  const [fondo,          setFondo]          = useState("puntos")
  const [exporting,      setExporting]      = useState(false)
  const [saveModal,      setSaveModal]      = useState(false)
  const [saveNombre,     setSaveNombre]     = useState("")
  const [saveOcasion,    setSaveOcasion]    = useState(3)
  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState(null)
  const [saveOk,         setSaveOk]         = useState(false)

  // ── Historia ────────────────────────────────────────────────────
  const saveHist = useCallback((its) => {
    const trimmed = histRef.current.slice(0, histIdx.current + 1)
    histRef.current = [...trimmed, its.map(i => ({ ...i }))]
    histIdx.current = histRef.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (histIdx.current <= 0) return
    histIdx.current -= 1
    setItems(histRef.current[histIdx.current].map(i => ({ ...i })))
    setSelected(null)
  }, [])

  // ── Init desde state de navegación ──────────────────────────────
  useEffect(() => {
    const { prendas } = location.state ?? {}
    if (!prendas?.length) return
    setOutfitPrendas(prendas)
    const cols = Math.min(prendas.length, 3)
    const init = prendas.map((p, i) =>
      mkItem(p, 32 + (i % cols) * 175, 36 + Math.floor(i / cols) * 175)
    )
    setItems(init)
    saveHist(init)
  }, []) // eslint-disable-line

  // ── Closet ──────────────────────────────────────────────────────
  useEffect(() => {
    if (esDemoMode()) { setClosetItems(MOCK_PRENDAS); return }
    fetch(`${API}/prendas/usuario/${getUsuarioId()}`)
      .then(r => r.json()).then(setClosetItems).catch(() => {})
  }, [])

  // ── Teclado ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo() }
      if ((e.key === "Delete" || e.key === "Backspace") && selected && e.target === document.body) {
        e.preventDefault()
        setItems(prev => { const n = prev.filter(i => i.id !== selected); saveHist(n); return n })
        setSelected(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, undo, saveHist])

  // ── Drag / resize / rotate globales ─────────────────────────────
  useEffect(() => {
    if (!dragging && !resizing && !rotating) return
    const xy = e => ({ x: e.touches?.[0]?.clientX ?? e.clientX, y: e.touches?.[0]?.clientY ?? e.clientY })

    const onMove = e => {
      const { x, y } = xy(e)
      if (dragging) {
        setItems(prev => prev.map(item =>
          item.id === dragging.id
            ? { ...item, x: item.x + x - dragging.lastX, y: item.y + y - dragging.lastY }
            : item
        ))
        setDragging(d => ({ ...d, lastX: x, lastY: y }))
      }
      if (resizing) {
        const r = canvasRef.current?.getBoundingClientRect()
        if (!r) return
        setItems(prev => prev.map(item => {
          if (item.id !== resizing.id) return item
          return { ...item, size: Math.max(60, Math.max(x - r.left - item.x, y - r.top - item.y)) }
        }))
      }
      if (rotating) {
        const r = canvasRef.current?.getBoundingClientRect()
        if (!r) return
        setItems(prev => prev.map(item => {
          if (item.id !== rotating.id) return item
          const cx = r.left + item.x + item.size / 2
          const cy = r.top  + item.y + item.size / 2
          const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI)
          return { ...item, rotation: rotating.itemAngle + (angle - rotating.startAngle) }
        }))
      }
    }

    const onUp = () => {
      setItems(prev => { saveHist(prev); return prev })
      setDragging(null); setResizing(null); setRotating(null)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend",  onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup",   onUp)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend",  onUp)
    }
  }, [dragging, resizing, rotating, saveHist])

  const startDrag = (e, id) => {
    e.preventDefault(); e.stopPropagation()
    const x = e.touches?.[0]?.clientX ?? e.clientX
    const y = e.touches?.[0]?.clientY ?? e.clientY
    setSelected(id)
    setDragging({ id, lastX: x, lastY: y })
    setItems(prev => {
      const maxZ = Math.max(...prev.map(i => i.zIndex), 0)
      return prev.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i)
    })
  }

  const startResize = (e, id) => { e.preventDefault(); e.stopPropagation(); setResizing({ id }) }

  const startRotate = (e, id) => {
    e.preventDefault(); e.stopPropagation()
    const r = canvasRef.current?.getBoundingClientRect()
    const item = items.find(i => i.id === id)
    if (!r || !item) return
    const cx = r.left + item.x + item.size / 2
    const cy = r.top  + item.y + item.size / 2
    const cx2 = e.touches?.[0]?.clientX ?? e.clientX
    const cy2 = e.touches?.[0]?.clientY ?? e.clientY
    setRotating({ id, startAngle: Math.atan2(cy2 - cy, cx2 - cx) * (180 / Math.PI), itemAngle: item.rotation ?? 0 })
  }

  const cambiarForma = forma => {
    if (!selected) return
    setItems(prev => { const n = prev.map(i => i.id === selected ? { ...i, shape: forma } : i); saveHist(n); return n })
  }

  const eliminar = () => {
    if (!selected) return
    setItems(prev => { const n = prev.filter(i => i.id !== selected); saveHist(n); return n })
    setSelected(null)
  }

  const duplicar = () => {
    const item = items.find(i => i.id === selected)
    if (!item) return
    const n = { ...item, id: nextId.current++, x: item.x + 24, y: item.y + 24, zIndex: nextId.current }
    setItems(prev => { const arr = [...prev, n]; saveHist(arr); return arr })
    setSelected(n.id)
  }

  const agregar = prenda => {
    const n = mkItem(prenda, 50 + Math.random() * 80, 50 + Math.random() * 60)
    setItems(prev => { const arr = [...prev, n]; saveHist(arr); return arr })
    setSheetMode(null)
  }

  // ── Exportar como PNG ────────────────────────────────────────────
  const exportarImagen = async () => {
    if (exporting) return
    setSelected(null)
    setExporting(true)
    await new Promise(r => setTimeout(r, 80))
    try {
      const { default: html2canvas } = await import("html2canvas")
      const snap = await html2canvas(canvasRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        logging: false,
      })
      const link = document.createElement("a")
      link.download = "outfit-closy.png"
      link.href = snap.toDataURL("image/png")
      link.click()
    } catch {
      // falla silenciosamente
    } finally {
      setExporting(false)
    }
  }

  const handleGuardarOutfit = async () => {
    if (!saveNombre.trim()) return
    if (items.length === 0) { setSaveError("Agrega al menos una prenda al pizarrón."); return }
    if (esDemoMode()) { setSaveOk(true); return }
    setSaving(true); setSaveError(null)
    try {
      const prendaIds = [...new Set(items.map(i => i.prenda.id))]
      await guardarOutfit(getUsuarioId(), saveNombre.trim(), saveOcasion, null, prendaIds)
      setSaveOk(true)
    } catch {
      setSaveError("No se pudo guardar el outfit.")
    } finally {
      setSaving(false)
    }
  }

  const selItem   = items.find(i => i.id === selected)
  const fondoActual = FONDOS.find(f => f.id === fondo) ?? FONDOS[0]
  const allPrendas = [
    ...outfitPrendas,
    ...closetItems.filter(c => !outfitPrendas.find(o => o.id === c.id)),
  ]

  return (
    <div className={`piz${sheetMode ? " piz--sheet" : ""}`}>

      {/* ── Header ── */}
      <div className="piz__header">
        <button className="piz__volver" onClick={() => navigate(-1)}>← Volver</button>
        <span className="piz__titulo">Pizarrón</span>
        <div className="piz__header-btns">
          <button className="piz__save-btn" onClick={() => { setSaveModal(true); setSaveOk(false); setSaveError(null) }}>
            Guardar outfit
          </button>
          <button className="piz__export-btn" onClick={exportarImagen} disabled={exporting}>
            {exporting ? "Exportando…" : "↓ Imagen"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="piz__body">

        {/* Panel izquierdo (≥ 640px) */}
        <aside className="piz__panel">

          <div className="piz__sec">
            <p className="piz__sec-title">Prendas del outfit</p>
            {outfitPrendas.length === 0
              ? <p className="piz__sec-empty">Usa el botón de abajo</p>
              : outfitPrendas.map(p => (
                  <button key={p.id} className="piz__prenda-row" onClick={() => agregar(p)}>
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} />
                      : <div className="piz__prenda-ph">👕</div>
                    }
                    <span>{p.nombre}</span>
                  </button>
                ))
            }
            <button className="piz__closet-btn" onClick={() => setSheetMode("prendas")}>
              + Desde closet
            </button>
          </div>

          <div className="piz__sec">
            <p className="piz__sec-title">Recorte</p>
            {SHAPES.map(s => (
              <button
                key={s.id}
                className={`piz__shape-row${selItem?.shape === s.id ? " piz__shape-row--act" : ""}`}
                onClick={() => cambiarForma(s.id)}
                disabled={!selected}
              >
                <span className={`piz__ico piz__ico--${s.id}`} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="piz__sec">
            <p className="piz__sec-title">Fondo</p>
            <div className="piz__fondo-grid">
              {FONDOS.map(f => (
                <button
                  key={f.id}
                  className={`piz__fondo-btn${fondo === f.id ? " piz__fondo-btn--act" : ""}`}
                  onClick={() => setFondo(f.id)}
                  title={f.label}
                  style={f.style}
                />
              ))}
            </div>
          </div>

          <div className="piz__sec">
            <p className="piz__sec-title">Acciones</p>
            <button className="piz__act-btn"                onClick={duplicar} disabled={!selected}>Duplicar</button>
            <button className="piz__act-btn"                onClick={undo}>Deshacer</button>
            <button className="piz__act-btn piz__act-btn--del" onClick={eliminar} disabled={!selected}>Eliminar</button>
          </div>
        </aside>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="piz__canvas"
          style={fondoActual.style}
          onMouseDown={e => { if (e.target === canvasRef.current) setSelected(null) }}
        >
          {items.length === 0 && (
            <div className="piz__empty">
              <p>Haz clic en una prenda del panel para comenzar</p>
            </div>
          )}

          {items.map(item => {
            const shape = SHAPES.find(s => s.id === item.shape)
            const isSel = item.id === selected
            const clip  = shape?.clip ? { clipPath: shape.clip } : {}

            return (
              <div
                key={item.id}
                className={`piz__item${isSel ? " piz__item--sel" : ""}`}
                style={{
                  left: item.x, top: item.y, width: item.size,
                  transform: `rotate(${item.rotation ?? 0}deg)`,
                  transformOrigin: "center center",
                  zIndex: item.zIndex,
                }}
                onMouseDown={e => startDrag(e, item.id)}
                onTouchStart={e => startDrag(e, item.id)}
              >
                {isSel && (
                  <div
                    className="piz__rot"
                    onMouseDown={e => startRotate(e, item.id)}
                    onTouchStart={e => startRotate(e, item.id)}
                  />
                )}
                <div className="piz__img-wrap" style={{ height: item.size }}>
                  {item.prenda.imagen_url
                    ? <img src={item.prenda.imagen_url} alt={item.prenda.nombre} className="piz__img" style={clip} draggable={false} />
                    : <div className="piz__img-ph" style={clip}>👕</div>
                  }
                  {isSel && (
                    <div
                      className="piz__resize"
                      onMouseDown={e => startResize(e, item.id)}
                      onTouchStart={e => startResize(e, item.id)}
                    />
                  )}
                </div>
                <p className="piz__nombre">{item.prenda.nombre}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Barra mobile (< 640px) ── */}
      <div className="piz__mbar">
        <button className="piz__madd" onClick={() => setSheetMode("prendas")}>+ Prendas</button>
        <button className="piz__madd piz__madd--sec" onClick={() => setSheetMode("fondo")}>Fondo</button>
        <div className="piz__mshapes">
          {SHAPES.map(s => (
            <button
              key={s.id}
              className={`piz__mbtn${selItem?.shape === s.id ? " piz__mbtn--act" : ""}`}
              onClick={() => cambiarForma(s.id)}
              disabled={!selected}
              title={s.label}
            >
              <span className={`piz__ico piz__ico--${s.id}`} />
            </button>
          ))}
        </div>
        <button className="piz__micon"                onClick={duplicar} disabled={!selected} title="Duplicar">⧉</button>
        <button className="piz__micon"                onClick={undo}                          title="Deshacer">↩</button>
        <button className="piz__micon piz__micon--del" onClick={eliminar} disabled={!selected} title="Eliminar">✕</button>
      </div>

      {/* ── Sheet overlay ── */}
      {sheetMode && (
        <div className="piz__overlay" onClick={() => setSheetMode(null)}>
          <div className="piz__sheet" onClick={e => e.stopPropagation()}>
            <div className="piz__sheet-head">
              <span>{sheetMode === "prendas" ? "Agregar prenda" : "Fondo del canvas"}</span>
              <button onClick={() => setSheetMode(null)}>✕</button>
            </div>

            {sheetMode === "prendas" && (
              <div className="piz__sheet-grid">
                {allPrendas.length === 0 && <p className="piz__sheet-vacio">No hay prendas en tu closet</p>}
                {allPrendas.map(p => (
                  <button key={p.id} className="piz__sheet-item" onClick={() => agregar(p)}>
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} />
                      : <div className="piz__sheet-ph">👕</div>
                    }
                    <span>{p.nombre}</span>
                  </button>
                ))}
              </div>
            )}

            {sheetMode === "fondo" && (
              <div className="piz__sheet-fondos">
                {FONDOS.map(f => (
                  <button
                    key={f.id}
                    className={`piz__sheet-fondo${fondo === f.id ? " piz__sheet-fondo--act" : ""}`}
                    style={f.style}
                    onClick={() => { setFondo(f.id); setSheetMode(null) }}
                  >
                    <span className={f.id === "noche" ? "piz__fondo-label--light" : ""}>{f.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

      {/* ── Modal guardar outfit ── */}
      {saveModal && (
        <div className="piz__modal-overlay" onClick={() => setSaveModal(false)}>
          <div className="piz__modal" onClick={e => e.stopPropagation()}>
            <div className="piz__modal-head">
              <span>Guardar outfit</span>
              <button onClick={() => setSaveModal(false)}>✕</button>
            </div>

            {saveOk ? (
              <div className="piz__modal-ok">
                <p>¡Outfit guardado!</p>
                <button onClick={() => { setSaveModal(false); navigate("/mis-outfits") }}>
                  Ver mis outfits
                </button>
              </div>
            ) : (
              <>
                <label className="piz__modal-label">Nombre del outfit</label>
                <input
                  className="piz__modal-input"
                  placeholder="ej: Look de lunes"
                  value={saveNombre}
                  onChange={e => setSaveNombre(e.target.value)}
                  autoFocus
                />
                <label className="piz__modal-label">Ocasión</label>
                <select
                  className="piz__modal-input"
                  value={saveOcasion}
                  onChange={e => setSaveOcasion(Number(e.target.value))}
                >
                  <option value={1}>Universidad</option>
                  <option value={2}>Trabajo</option>
                  <option value={3}>Casual</option>
                  <option value={4}>Fiesta</option>
                  <option value={5}>Deporte</option>
                  <option value={6}>Cita</option>
                </select>
                {saveError && <p className="piz__modal-error">{saveError}</p>}
                <button
                  className="piz__modal-guardar"
                  onClick={handleGuardarOutfit}
                  disabled={saving || !saveNombre.trim()}
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
