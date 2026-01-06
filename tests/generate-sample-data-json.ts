/**
 * Generador de datos sample aleatorios en formato JSON
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

const VENUES: Array<{ id: number; name: string; city: string }> = [
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
  { id: 36, name: "TehMplo Tulum", city: "Tulum" },
  { id: 37, name: "Bonbonniere Tulum", city: "Tulum" },
  { id: 38, name: "Vagalume Tulum", city: "Tulum" },
  { id: 41, name: "Bagatelle Tulum", city: "Tulum" },
  { id: 51, name: "TehMplo F&F Tulum", city: "Tulum" },
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
  { id: 18, name: "Mandala Cabos", city: "Cabos" },
  { id: 20, name: "La Vaquita Cabos", city: "Cabos" },
  { id: 10, name: "Mandala Playa", city: "Playa del Carmen" },
  { id: 12, name: "La Vaquita Playa", city: "Playa del Carmen" },
  { id: 13, name: "Abolengo Playa", city: "Playa del Carmen" },
  { id: 29, name: "Santito Playa", city: "Playa del Carmen" },
  { id: 30, name: "Rakata Playa", city: "Playa del Carmen" },
  { id: 55, name: "Houdinni Madrid", city: "Madrid" },
  { id: 56, name: "Sala de Despecho Madrid", city: "Madrid" },
  { id: 50, name: "Riviera Polanco CDMX", city: "CDMX" },
  { id: 57, name: "Bagatelle CDMX", city: "CDMX" },
  { id: 43, name: "Dorothy FNSM", city: "FNSM" },
  { id: 44, name: "La Santa FNSM", city: "FNSM" },
  { id: 45, name: "Mallet FNSM", city: "FNSM" },
  { id: 46, name: "Rakata FNSM", city: "FNSM" },
  { id: 35, name: "Nadim GDL", city: "GDL" },
  { id: 42, name: "Dorothy GDL", city: "GDL" },
  { id: 52, name: "Spade GDL", city: "GDL" },
  { id: 54, name: "Sra Tanaka GDL", city: "GDL" },
  { id: 47, name: "BYU MTY", city: "MTY" },
  { id: 48, name: "Rakata MTY", city: "MTY" },
  { id: 49, name: "Cosmo MTY", city: "MTY" },
];

function generateRandomDates(year: number = 2025, count: number = 10): string[] {
  const dates: string[] = [];
  const startDate = new Date(year, 11, 16);
  const endDate = new Date(year + 1, 0, 6);
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

function generateRandomSaleItem(): SaleItem {
  const products = [
    "GENERAL ACCESS", "VIP ACCESS", "BRONZE TABLE", "SILVER TABLE", "GOLD TABLE",
    "PLATINUM TABLE", "NYE GENERAL ACCESS", "NYE VIP ACCESS", "NYE BRONZE",
    "NYE SILVER", "NYE GOLD", "NYE PLATINUM", "DINNER TABLE EXPERIENCE",
    "FAMILY STYLE DINNER", "COVER", "CONSUMO",
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

function generateRandomTestData(numTests: number = 30, year: number = 2025): SalesData[] {
  const testData: SalesData[] = [];
  const dates = generateRandomDates(year, numTests);
  
  for (let i = 0; i < numTests; i++) {
    const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
    const fecha = dates[Math.floor(Math.random() * dates.length)];
    const numItems = Math.floor(Math.random() * 5) + 1;
    
    const items: SaleItem[] = [];
    for (let j = 0; j < numItems; j++) {
      items.push(generateRandomSaleItem());
    }
    
    testData.push({
      fecha,
      sucursal: venue.id,
      items,
    });
  }
  
  return testData;
}

// Generar y exportar
const testData = generateRandomTestData(30, 2025);

// Agregar información de venue a cada caso
const enrichedData = testData.map((data, index) => {
  const venue = VENUES.find(v => v.id === data.sucursal);
  const totalReservas = data.items.reduce((sum, item) => sum + item.reservas, 0);
  const totalPax = data.items.reduce((sum, item) => sum + item.pax, 0);
  const totalIngresos = data.items.reduce((sum, item) => sum + item.total, 0);
  
  return {
    caso: index + 1,
    fecha: data.fecha,
    sucursal: {
      id: data.sucursal,
      nombre: venue?.name || `Venue ${data.sucursal}`,
      ciudad: venue?.city || "Unknown",
    },
    items: data.items.map(item => ({
      producto: item.producto,
      precio: parseFloat(item.precio),
      reservas: item.reservas,
      personas: item.pax,
      total: item.total,
    })),
    totales: {
      reservas: totalReservas,
      personas: totalPax,
      ingresos: totalIngresos,
    },
  };
});

console.log(JSON.stringify(enrichedData, null, 2));
