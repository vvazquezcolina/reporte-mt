const API_KEY = "AnXLZrMk8lwuR3tDnrxr5x4c8lqRiWVCz67bwCpk";
const API_BASE_URL = "https://mandalatickets.com/api/ventas_agrupadas";

export interface SaleItem {
  producto: string;
  cantidad?: number; // Mantener por compatibilidad hacia atrás
  reservas?: number; // Nuevo campo de la API
  pax?: number; // Nuevo campo de la API (pasajeros/personas)
  precio: string;
  total: number;
}

export interface SalesData {
  fecha: string;
  sucursal: number;
  items: SaleItem[];
}

export async function fetchSalesData(
  fecha: string,
  sucursal: number
): Promise<SaleItem[]> {
  try {
    // Use Next.js API route to avoid CORS issues
    const url = `/api/sales?fecha=${fecha}&sucursal=${sucursal}`;
    const response = await fetch(url, {
      cache: "no-store", // Ensure fresh data on each request
    });

    if (!response.ok) {
      console.error(`Error fetching data for ${fecha} - ${sucursal}:`, response.statusText);
      return [];
    }

    const data: SaleItem[] = await response.json();
    return data || [];
  } catch (error) {
    console.error(`Error fetching sales data for ${fecha} - ${sucursal}:`, error);
    return [];
  }
}

export async function fetchAllSalesData(
  events: Array<{ date: string; name: string }>,
  sucursal: number
): Promise<SalesData[]> {
  // Fetch data for all events in parallel
  const promises = events.map(async (event) => {
    const items = await fetchSalesData(event.date, sucursal);
    return {
      fecha: event.date,
      sucursal,
      items,
    };
  });

  const results = await Promise.all(promises);
  
  // Sort by date and include all dates even if no sales
  return results.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// Generate all dates from current month onwards (starting from day 1 of current month)
export function generateAllDatesFromCurrentMonth(): Array<{ date: string; name: string }> {
  const dates: Array<{ date: string; name: string }> = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  
  // Generate dates for the next 12 months (1 year ahead)
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const year = currentYear + Math.floor((currentMonth + monthOffset) / 12);
    const month = (currentMonth + monthOffset) % 12;
    
    // Always start from day 1 of each month
    const firstDay = 1;
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    for (let day = firstDay; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dates.push({ date: dateStr, name: "" });
    }
  }
  
  return dates;
}

// Get all dates from current month onwards (no events needed)
export function getAllDatesFromCurrentMonth(): Array<{ date: string; name: string }> {
  return generateAllDatesFromCurrentMonth();
}

// Group dates by month
export function groupDatesByMonth(dates: Array<{ date: string; name: string }>): Array<{ monthKey: string; monthLabel: string; dates: Array<{ date: string; name: string }> }> {
  const grouped = new Map<string, Array<{ date: string; name: string }>>();
  
  dates.forEach((dateItem) => {
    const date = new Date(dateItem.date + "T00:00:00");
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(dateItem);
  });

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return Array.from(grouped.entries())
    .map(([monthKey, dates]) => {
      const [year, month] = monthKey.split("-");
      const monthIndex = parseInt(month) - 1;
      return {
        monthKey,
        monthLabel: `${months[monthIndex]} ${year}`,
        dates: dates.sort((a, b) => a.date.localeCompare(b.date)),
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

// Fetch sales data for a specific month
export async function fetchSalesDataByMonth(
  dates: Array<{ date: string; name: string }>,
  sucursal: number
): Promise<SalesData[]> {
  const promises = dates.map(async (dateItem) => {
    const items = await fetchSalesData(dateItem.date, sucursal);
    return {
      fecha: dateItem.date,
      sucursal,
      items,
    };
  });

  const results = await Promise.all(promises);
  return results.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

