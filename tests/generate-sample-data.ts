/**
 * Generador de datos sample aleatorios para diferentes sucursales y fechas
 * Genera datos entre el 16 de diciembre y 6 de enero
 */

interface SaleItem {
  producto: string;
  reservas: number;
  pax: number;
  precio: string;
  total: number;
  cantidad: number;
}

interface SalesData {
  fecha: string;
  sucursal: number;
  items: SaleItem[];
}

// Sucursales disponibles solo en las ciudades especificadas
// Cancún, Playa del Carmen, Puerto Vallarta, Cabos, Tulum y Madrid
const VENUES: Array<{ id: number; name: string; city: string }> = [
  // Cancún
  { id: 1, name: "Mandala Cancún", city: "Cancún" },
  { id: 2, name: "The City Cancún", city: "Cancún" },
  { id: 3, name: "MB Day Cancún", city: "Cancún" },
  { id: 4, name: "MB Night Cancún", city: "Cancún" },
  { id: 6, name: "D'Cave Cancún", city: "Cancún" },
  { id: 7, name: "Sr. Frogs Cancún", city: "Cancún" },
  { id: 9, name: "La Vaquita Cancún", city: "Cancún" },
  { id: 22, name: "Abolengo Cancún", city: "Cancún" },
  { id: 32, name: "Rakata Cancún", city: "Cancún" },
  { id: 53, name: "HOF Cancún", city: "Cancún" },
  // Tulum
  { id: 36, name: "TehMplo Tulum", city: "Tulum" },
  { id: 37, name: "Bonbonniere Tulum", city: "Tulum" },
  { id: 38, name: "Vagalume Tulum", city: "Tulum" },
  { id: 41, name: "Bagatelle Tulum", city: "Tulum" },
  { id: 51, name: "TehMplo F&F Tulum", city: "Tulum" },
  // Vallarta (Puerto Vallarta)
  { id: 14, name: "Mandala Vallarta", city: "Vallarta" },
  { id: 15, name: "La Santa Vallarta", city: "Vallarta" },
  { id: 16, name: "La Vaquita Vallarta", city: "Vallarta" },
  { id: 17, name: "Sky Vallarta", city: "Vallarta" },
  { id: 24, name: "Sr. Frogs Vallarta", city: "Vallarta" },
  { id: 25, name: "Biblioteca Vallarta", city: "Vallarta" },
  { id: 27, name: "Chicabal Vallarta", city: "Vallarta" },
  { id: 33, name: "Mita Sounds Vallarta", city: "Vallarta" },
  { id: 34, name: "Majahuitas Vallarta", city: "Vallarta" },
  { id: 39, name: "Rakata Vallarta", city: "Vallarta" },
  { id: 40, name: "Dorothy Vallarta", city: "Vallarta" },
  // Cabos
  { id: 18, name: "Mandala Cabos", city: "Cabos" },
  { id: 20, name: "La Vaquita Cabos", city: "Cabos" },
  // Playa del Carmen
  { id: 10, name: "Mandala Playa", city: "Playa del Carmen" },
  { id: 12, name: "La Vaquita Playa", city: "Playa del Carmen" },
  { id: 13, name: "Abolengo Playa", city: "Playa del Carmen" },
  { id: 29, name: "Santito Playa", city: "Playa del Carmen" },
  { id: 30, name: "Rakata Playa", city: "Playa del Carmen" },
  // Madrid
  { id: 55, name: "Houdinni Madrid", city: "Madrid" },
  { id: 56, name: "Sala de Despecho Madrid", city: "Madrid" },
];

// Generar fechas aleatorias entre el 16 de diciembre y 6 de enero
function generateRandomDates(year: number = 2024, count: number = 10): string[] {
  const dates: string[] = [];
  const startDate = new Date(year, 11, 16); // 16 de diciembre
  const endDate = new Date(year + 1, 0, 6); // 6 de enero
  
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
    total: Math.round(total * 100) / 100,
    cantidad: reservas,
  };
}

// Generar datos de prueba aleatorios
function generateRandomTestData(numTests: number = 30, year: number = 2025): SalesData[] {
  const testData: SalesData[] = [];
  const dates = generateRandomDates(year, numTests);
  
  for (let i = 0; i < numTests; i++) {
    const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
    const fecha = dates[Math.floor(Math.random() * dates.length)];
    const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items por fecha
    
    const items: SaleItem[] = [];
    for (let j = 0; j < numItems; j++) {
      items.push(generateRandomSaleItem(j));
    }
    
    testData.push({
      fecha,
      sucursal: venue.id,
      items,
    });
  }
  
  return testData;
}

// Función para limpiar nombres (simulando la función del componente)
function cleanProductName(name: string): string {
  if (!name) return "COVER";
  
  let cleaned = name.trim();
  cleaned = cleaned.replace(/\s*N\s*\/?\s*A\s*/gi, " ");
  cleaned = cleaned.replace(/\s*NA\s*/gi, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  const words = cleaned.split(/\s+/);
  const deduplicatedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      deduplicatedWords.push(words[i]);
    }
  }
  cleaned = deduplicatedWords.join(" ");
  
  return cleaned || "COVER";
}

// Mostrar resultados
function displayResults(testData: SalesData[]) {
  console.log("=".repeat(80));
  console.log("DATOS SAMPLE ALEATORIOS - 30 CASOS");
  console.log("Fechas: 16 de diciembre 2025 - 6 de enero 2026");
  console.log("Ciudades: Cancún, Playa del Carmen, Puerto Vallarta, Cabos, Tulum y Madrid");
  console.log("=".repeat(80));
  console.log();
  
  // Agrupar por sucursal
  const venueGroups = new Map<number, SalesData[]>();
  testData.forEach(data => {
    if (!venueGroups.has(data.sucursal)) {
      venueGroups.set(data.sucursal, []);
    }
    venueGroups.get(data.sucursal)!.push(data);
  });
  
  // Mostrar cada caso
  let caseNumber = 1;
  Array.from(venueGroups.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([venueId, dataArray]) => {
      const venue = VENUES.find(v => v.id === venueId);
      const venueName = venue ? `${venue.name} (${venue.city})` : `Venue ${venueId}`;
      
      dataArray.forEach(data => {
        console.log(`\nCaso ${caseNumber}: ${venueName}`);
        console.log(`Fecha: ${data.fecha}`);
        console.log(`Sucursal ID: ${data.sucursal}`);
        console.log(`Items: ${data.items.length}`);
        console.log("-".repeat(80));
        
        let totalReservas = 0;
        let totalPax = 0;
        let totalIngresos = 0;
        
        data.items.forEach((item, idx) => {
          const cleanedProduct = cleanProductName(item.producto);
          totalReservas += item.reservas;
          totalPax += item.pax;
          totalIngresos += item.total;
          
          console.log(`  ${idx + 1}. Producto: ${cleanedProduct}`);
          console.log(`     Original: ${item.producto}`);
          console.log(`     Precio: $${parseFloat(item.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          console.log(`     Reservas: ${item.reservas}`);
          console.log(`     Personas: ${item.pax}`);
          console.log(`     Total: $${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        });
        
        console.log("-".repeat(80));
        console.log(`  TOTALES:`);
        console.log(`  Reservas: ${totalReservas}`);
        console.log(`  Personas: ${totalPax}`);
        console.log(`  Ingresos: $${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        
        caseNumber++;
      });
    });
  
  // Resumen estadístico
  console.log("\n" + "=".repeat(80));
  console.log("RESUMEN ESTADÍSTICO");
  console.log("=".repeat(80));
  
  const venueCounts: Record<number, number> = {};
  testData.forEach(data => {
    venueCounts[data.sucursal] = (venueCounts[data.sucursal] || 0) + 1;
  });
  
  console.log("\nDistribución por sucursal:");
  Object.entries(venueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([venueId, count]) => {
      const venue = VENUES.find(v => v.id === parseInt(venueId));
      const venueName = venue ? `${venue.name} (${venue.city})` : `Venue ${venueId}`;
      console.log(`  ${venueName}: ${count} casos`);
    });
  
  console.log("\nDistribución por fecha:");
  const dateCounts: Record<string, number> = {};
  testData.forEach(data => {
    dateCounts[data.fecha] = (dateCounts[data.fecha] || 0) + 1;
  });
  Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count} casos`);
    });
  
  // Validaciones
  console.log("\n" + "=".repeat(80));
  console.log("VALIDACIONES");
  console.log("=".repeat(80));
  
  let hasNA = false;
  let hasRepetitions = false;
  const naErrors: string[] = [];
  const repetitionErrors: string[] = [];
  
  testData.forEach((data, index) => {
    data.items.forEach((item, itemIndex) => {
      if (item.producto && (item.producto.includes("N/A") || item.producto.includes("n/a"))) {
        hasNA = true;
        naErrors.push(`Caso ${index + 1}, Item ${itemIndex + 1}: "${item.producto}"`);
      }
      
      const words = item.producto.split(/\s+/);
      for (let i = 1; i < words.length; i++) {
        if (words[i].toLowerCase() === words[i - 1].toLowerCase() && words[i].length > 2) {
          hasRepetitions = true;
          repetitionErrors.push(`Caso ${index + 1}, Item ${itemIndex + 1}: "${item.producto}"`);
          break;
        }
      }
    });
  });
  
  console.log("\n✓ Validación de 'N/A':");
  if (!hasNA) {
    console.log("  ✓ No se encontraron 'N/A' en los datos");
  } else {
    console.log("  ✗ Se encontraron 'N/A':");
    naErrors.forEach(error => console.log(`    - ${error}`));
  }
  
  console.log("\n✓ Validación de repeticiones:");
  if (!hasRepetitions) {
    console.log("  ✓ No se encontraron repeticiones innecesarias");
  } else {
    console.log("  ✗ Se encontraron repeticiones:");
    repetitionErrors.forEach(error => console.log(`    - ${error}`));
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("✓ Generación completada");
  console.log("=".repeat(80));
}

// Ejecutar
const testData = generateRandomTestData(30, 2025);
displayResults(testData);
