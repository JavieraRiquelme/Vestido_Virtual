// outfits.js — Funciones para comunicarse con el backend de outfits y sugerencias
// Isidora — Sprint 2

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Solicita una sugerencia de outfit al asistente Closy.
 * @param {{ usuario_id, ocasion, ciudad_origen?, ciudad_destino?, temperatura?, condiciones? }} params
 */
export async function pedirSugerencia(params) {
  const res = await fetch(`${BASE_URL}/sugerencias/sugerir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al pedir sugerencia");
  }
  return res.json();
}

/**
 * Guarda un outfit en la base de datos.
 * @param {number} usuarioId
 * @param {string} nombre
 * @param {number} ocasionId
 * @param {string} idealClima
 * @param {number[]} prendaIds
 */
export async function guardarOutfit(usuarioId, nombre, ocasionId, idealClima, prendaIds) {
  const res = await fetch(`${BASE_URL}/sugerencias/guardar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: usuarioId,
      nombre,
      ocasion_id: ocasionId,
      ideal_clima: idealClima,
      prenda_ids: prendaIds,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al guardar outfit");
  }
  return res.json();
}

/**
 * Obtiene todos los outfits guardados de un usuario.
 * @param {number} usuarioId
 */
export async function getOutfitsUsuario(usuarioId) {
  const res = await fetch(`${BASE_URL}/outfits/usuario/${usuarioId}`);
  if (!res.ok) throw new Error("Error al obtener outfits");
  return res.json();
}

/**
 * Elimina un outfit por id.
 * @param {number} outfitId
 */
export async function eliminarOutfit(outfitId) {
  const res = await fetch(`${BASE_URL}/outfits/${outfitId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar outfit");
  return res.json();
}

/**
 * Obtiene las prendas del usuario.
 * @param {number} usuarioId
 */
export async function getPrendasUsuario(usuarioId) {
  const res = await fetch(`${BASE_URL}/prendas/usuario/${usuarioId}`);
  if (!res.ok) throw new Error("Error al obtener prendas");
  return res.json();
}
