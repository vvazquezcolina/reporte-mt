/**
 * Tests aleatorios para diferentes sucursales y fechas
 * Genera datos de prueba entre el 16 de diciembre y 6 de enero
 */

import { SalesData, SaleItem } from "@/lib/api";
import { venueIdToCity } from "@/data/cities";

// Sucursales disponibles solo en las ciudades especificadas
// Cancún, Playa del Carmen, Puerto Vallarta, Cabos, Tulum y Madrid
const ALL_VENUE_IDS = [
  1, 2, 3, 4, 6, 7, 9, 22, 32, 53, // Cancún
  36, 37, 38, 41, 51, // Tulum
  14, 15, 16, 17, 24, 25, 27, 33, 34, 39, 40, // Vallarta (Puerto Vallarta)
  18, 20, // Cabos
  10, 12, 13, 29, 30, // Playa del Carmen
  55, 56, // Madrid
];

// Generar fechas aleatorias entre el 16 de diciembre 2025 y 6 de enero 2026
function generateRandomDates(year: number = 2025, count: number = 10): string[] {
  const dates: string[] = [];
  const startDate = new Date(year, 11, 16); // 16 de diciembre (mes 11 = diciembre)
  const endDate = new Date(year + 1, 0, 6); // 6 de enero del año siguiente (mes 0 = enero)
  
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < count; i++) {
    const randomDays = Math.floor(Math.random() * (daysDiff + 1));
    const randomDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
    
    const yearStr = randomDate.getFullYear();
    const monthStr = String(randomDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(randomDate.getDate()).padStart(2, "0");
    
    dates.push(`${yearStr}-${monthStr}-${dayStr}`);
  }
  
  // Eliminar duplicados y ordenar
  return [...new Set(dates)].sort();
}

// Generar datos de venta aleatorios
function generateRandomSaleItem(index: number): SaleItem {
  const products = [
    "GENERAL ACCESS",
    "VIP ACCESS",
    "BRONZE TABLE",
    "SILVER TABLE",
    "GOLD TABLE",
    "PLATINUM TABLE",
    "NYE GENERAL ACCESS",
    "NYE VIP ACCESS",
    "NYE BRONZE",
    "NYE SILVER",
    "NYE GOLD",
    "NYE PLATINUM",
    "DINNER TABLE EXPERIENCE",
    "FAMILY STYLE DINNER",
    "COVER",
    "CONSUMO",
  ];
  
  const product = products[Math.floor(Math.random() * products.length)];
  const reservas = Math.floor(Math.random() * 50) + 1;
  const precio = (Math.random() * 5000 + 500).toFixed(2);
  const pax = reservas * (Math.floor(Math.random() * 4) + 1);
  const total = parseFloat(precio) * reservas;
  
  return {
    producto: product,
    reservas,
    pax,
    precio,
    total,
    cantidad: reservas,
  };
}

// Generar datos de prueba aleatorios
export function generateRandomTestData(
  numTests: number = 20,
  year: number = 2025
): SalesData[] {
  const testData: SalesData[] = [];
  const dates = generateRandomDates(year, numTests);
  
  for (let i = 0; i < numTests; i++) {
    const venueId = ALL_VENUE_IDS[Math.floor(Math.random() * ALL_VENUE_IDS.length)];
    const fecha = dates[Math.floor(Math.random() * dates.length)];
    const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items por fecha
    
    const items: SaleItem[] = [];
    for (let j = 0; j < numItems; j++) {
      items.push(generateRandomSaleItem(j));
    }
    
    testData.push({
      fecha,
      sucursal: venueId,
      items,
    });
  }
  
  return testData;
}

// Función para validar que no hay "N/A" en los datos
export function validateNoNA(data: SalesData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  data.forEach((salesData, index) => {
    salesData.items.forEach((item, itemIndex) => {
      if (item.producto && (item.producto.includes("N/A") || item.producto.includes("n/a"))) {
        errors.push(
          `Test ${index}: Item ${itemIndex} contiene "N/A": "${item.producto}"`
        );
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Función para validar que no hay repeticiones innecesarias de nombres
export function validateNoRepetitions(data: SalesData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  data.forEach((salesData, index) => {
    salesData.items.forEach((item, itemIndex) => {
      if (!item.producto) return;
      
      const words = item.producto.split(/\s+/);
      const lowerWords = words.map(w => w.toLowerCase());
      
      // Verificar repeticiones consecutivas
      for (let i = 1; i < words.length; i++) {
        if (lowerWords[i] === lowerWords[i - 1] && words[i].length > 2) {
          errors.push(
            `Test ${index}: Item ${itemIndex} tiene palabra repetida: "${item.producto}"`
          );
          break;
        }
      }
      
      // Verificar repetición de frases completas
      if (words.length >= 4) {
        const half = Math.floor(words.length / 2);
        const firstHalf = lowerWords.slice(0, half).join(" ");
        const secondHalf = lowerWords.slice(half, half * 2).join(" ");
        
        if (firstHalf === secondHalf && firstHalf.length > 3) {
          errors.push(
            `Test ${index}: Item ${itemIndex} tiene frase repetida: "${item.producto}"`
          );
        }
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Ejecutar tests
// Para ejecutar: npx ts-node tests/random-sales-data.test.ts
if (typeof require !== 'undefined' && require.main === module) {
  console.log("Generando datos de prueba aleatorios...\n");
  
  const testData = generateRandomTestData(30, 2025);
  
  console.log(`Generados ${testData.length} tests aleatorios`);
  console.log(`Fechas: 16 de diciembre 2025 - 6 de enero 2026`);
  console.log(`Ciudades: Cancún, Playa del Carmen, Puerto Vallarta, Cabos, Tulum y Madrid\n`);
  console.log("Distribución por sucursal:");
  const venueCounts: Record<number, number> = {};
  testData.forEach(data => {
    venueCounts[data.sucursal] = (venueCounts[data.sucursal] || 0) + 1;
  });
  Object.entries(venueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([venue, count]) => {
      const city = venueIdToCity[parseInt(venue)] || "Unknown";
      console.log(`  Venue ${venue} (${city}): ${count} tests`);
    });
  
  console.log("\nDistribución por fecha:");
  const dateCounts: Record<string, number> = {};
  testData.forEach(data => {
    dateCounts[data.fecha] = (dateCounts[data.fecha] || 0) + 1;
  });
  Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count} tests`);
    });
  
  // Validar que no hay "N/A"
  console.log("\nValidando que no hay 'N/A'...");
  const naValidation = validateNoNA(testData);
  if (naValidation.valid) {
    console.log("✓ No se encontraron 'N/A' en los datos");
  } else {
    console.log("✗ Se encontraron 'N/A':");
    naValidation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Validar que no hay repeticiones
  console.log("\nValidando que no hay repeticiones innecesarias...");
  const repetitionValidation = validateNoRepetitions(testData);
  if (repetitionValidation.valid) {
    console.log("✓ No se encontraron repeticiones innecesarias");
  } else {
    console.log("✗ Se encontraron repeticiones:");
    repetitionValidation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log("\n✓ Tests completados");
}
