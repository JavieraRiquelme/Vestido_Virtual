# Vestido_Virtual
Proyecto inicial

### Esquema Base de datos tentativo

Prendas: 
- id: PK
- nombre
- categoria
- color
- talla
- imagen

Outfits:
- id: PK
- categoría
- id_prenda_1: FK
- id_prenda_2: FK
- id_prenda_3: FK

Clima:
- id: PK
- ciudad
- temperatura
- descripción
- fecha

