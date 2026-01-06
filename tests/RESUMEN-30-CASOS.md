# Resumen de 30 Casos Aleatorios - Datos Sample

## Información General

- **Rango de fechas**: 16 de diciembre 2025 - 6 de enero 2026
- **Total de casos**: 30
- **Sucursales**: Solo en Cancún, Playa del Carmen, Puerto Vallarta, Cabos, Tulum y Madrid

## Cómo ver los datos completos

Los datos completos en formato JSON están disponibles en:
- `tests/sample-data-30-casos.json`

Para generar nuevos datos aleatorios, ejecuta:
```bash
npx tsx tests/generate-sample-data-json.ts > tests/sample-data-30-casos.json
```

Para ver los datos en formato legible, ejecuta:
```bash
npx tsx tests/generate-sample-data.ts
```

## Estructura de cada caso

Cada caso incluye:
- **caso**: Número del caso (1-30)
- **fecha**: Fecha en formato YYYY-MM-DD
- **sucursal**: 
  - id: ID de la sucursal
  - nombre: Nombre de la sucursal
  - ciudad: Ciudad donde se encuentra
- **items**: Array de productos vendidos con:
  - producto: Nombre del producto
  - precio: Precio unitario
  - reservas: Número de reservas
  - personas: Número de personas
  - total: Total de ingresos para ese producto
- **totales**: Totales agregados:
  - reservas: Total de reservas
  - personas: Total de personas
  - ingresos: Total de ingresos

## Validaciones

Los datos generados cumplen con:
- ✓ No contienen "N/A" en los nombres de productos
- ✓ No tienen repeticiones innecesarias de palabras
- ✓ Fechas válidas en el rango especificado
- ✓ Sucursales válidas del sistema
- ✓ Datos numéricos consistentes (total = precio × reservas)

## Notas

- Los datos son completamente aleatorios y se generan cada vez que ejecutas el script
- Los precios están en formato MXN (pesos mexicanos)
- Las fechas están distribuidas aleatoriamente entre el 16 de diciembre y 6 de enero
- Cada caso puede tener entre 1 y 5 items diferentes
