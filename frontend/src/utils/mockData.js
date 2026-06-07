export const MOCK_PRENDAS = [
  { id: 1, usuario_id: 0, categoria_id: 2, nombre: "Polera blanca", color: "blanco", ideal_clima: "cálido", imagen_url: null, created_at: "2024-03-10T12:00:00" },
  { id: 2, usuario_id: 0, categoria_id: 1, nombre: "Sweater gris", color: "gris", ideal_clima: "frío", imagen_url: null, created_at: "2024-03-11T10:00:00" },
  { id: 3, usuario_id: 0, categoria_id: 4, nombre: "Jeans azules", color: "azul", ideal_clima: "templado", imagen_url: null, created_at: "2024-03-12T09:00:00" },
  { id: 4, usuario_id: 0, categoria_id: 5, nombre: "Zapatillas blancas", color: "blanco", ideal_clima: null, imagen_url: null, created_at: "2024-03-13T08:00:00" },
  { id: 5, usuario_id: 0, categoria_id: 6, nombre: "Bolsa tote", color: "negro", ideal_clima: null, imagen_url: null, created_at: "2024-03-14T11:00:00" },
  { id: 6, usuario_id: 0, categoria_id: 3, nombre: "Falda midi beige", color: "beige", ideal_clima: "cálido", imagen_url: null, created_at: "2024-03-15T14:00:00" },
]

export const MOCK_OUTFITS = [
  {
    id: 1,
    usuario_id: 0,
    ocasion_id: 1,
    nombre: "Look universidad lunes",
    ideal_clima: "templado",
    rating: null,
    created_at: "2024-03-15T10:00:00",
  },
  {
    id: 2,
    usuario_id: 0,
    ocasion_id: 3,
    nombre: "Casual fin de semana",
    ideal_clima: "calor",
    rating: null,
    created_at: "2024-03-16T14:30:00",
  },
  {
    id: 3,
    usuario_id: 0,
    ocasion_id: 2,
    nombre: "Reunión de trabajo",
    ideal_clima: "frio",
    rating: null,
    created_at: "2024-03-17T08:00:00",
  },
]

export const MOCK_OUTFIT_PRENDAS = {
  1: [
    { id: 2, nombre: "Sweater gris",       color: "gris",   categoria_id: 1, ideal_clima: "frío",     imagen_url: null },
    { id: 3, nombre: "Jeans azules",        color: "azul",   categoria_id: 4, ideal_clima: "templado", imagen_url: null },
    { id: 4, nombre: "Zapatillas blancas",  color: "blanco", categoria_id: 5, ideal_clima: null,       imagen_url: null },
  ],
  2: [
    { id: 1, nombre: "Polera blanca",       color: "blanco", categoria_id: 2, ideal_clima: "cálido",   imagen_url: null },
    { id: 6, nombre: "Falda midi beige",    color: "beige",  categoria_id: 3, ideal_clima: "cálido",   imagen_url: null },
    { id: 4, nombre: "Zapatillas blancas",  color: "blanco", categoria_id: 5, ideal_clima: null,       imagen_url: null },
  ],
  3: [
    { id: 2, nombre: "Sweater gris",        color: "gris",   categoria_id: 1, ideal_clima: "frío",     imagen_url: null },
    { id: 3, nombre: "Jeans azules",        color: "azul",   categoria_id: 4, ideal_clima: "templado", imagen_url: null },
    { id: 5, nombre: "Bolsa tote",          color: "negro",  categoria_id: 6, ideal_clima: null,       imagen_url: null },
  ],
}

export const MOCK_SUGERENCIA = {
  mensaje:
    "Para un día templado en la universidad te sugiero una combinación cómoda y fresca. El sweater gris es perfecto para las mañanas y puedes sacártelo en la tarde.",
  nivel_clima: "templado",
  prendas: [
    { id: 2, nombre: "Sweater gris",      color: "gris",   rol: "top",     imagen_url: null },
    { id: 3, nombre: "Jeans azules",      color: "azul",   rol: "bottom",  imagen_url: null },
    { id: 4, nombre: "Zapatillas blancas", color: "blanco", rol: "zapatos", imagen_url: null },
  ],
}
