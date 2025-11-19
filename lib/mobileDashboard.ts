import { fetchSalesData, SaleItem } from "./api";
import { locations } from "@/data/events";

export interface TableReservation {
  tableId: string;
  guests: number;
  checkInTime: string;
  hostName: string;
  contactPhone: string;
  area: string;
  minimumSpend: number;
  notes?: string;
  status: "confirmada" | "pendiente" | "sentada";
}

export interface VenueSummary {
  venueId: number;
  venueName: string;
  totalReservations: number;
  totalGuests: number;
  estimatedRevenue: number;
  occupancyRate: number;
  productBreakdown: ProductBreakdown;
  reservationsByDay: Array<{
    date: string;
    reservations: number;
    guests: number;
    revenue: number;
  }>;
  tableReservations: TableReservation[];
}

export interface ProductBreakdownItem {
  productType: "cover" | "consumo" | "paquete";
  reservations: number;
  guests: number;
  revenue: number;
}

export interface ProductBreakdown {
  cover: ProductBreakdownItem;
  consumo: ProductBreakdownItem;
  paquete: ProductBreakdownItem;
  total: ProductBreakdownItem;
}

export type DateRangeType = "today" | "range" | "month";

export interface DashboardFilters {
  venueId: number;
  rangeType: DateRangeType;
  startDate?: string;
  endDate?: string;
}

// Helper para clasificar productos en categorías
function categorizeProduct(productName: string): "cover" | "consumo" | "paquete" {
  const name = productName.toLowerCase();
  
  // Paquetes: productos que incluyen "table", "dinner", "package", "paquete"
  if (name.includes("table") || name.includes("dinner") || name.includes("package") || name.includes("paquete")) {
    return "paquete";
  }
  
  // Consumos: productos que incluyen "consumo", "consumption", "bottle", "botella"
  if (name.includes("consumo") || name.includes("consumption") || name.includes("bottle") || name.includes("botella")) {
    return "consumo";
  }
  
  // Cover: todo lo demás (GENERAL ACCESS, covers, etc.)
  return "cover";
}

// Helper para calcular personas desde total y precio
function calculateGuests(item: SaleItem): number {
  // Usar pax directamente si está disponible
  if (item.pax !== undefined && item.pax > 0) {
    return item.pax;
  }
  
  // Fallback: calcular desde total y precio
  const precioNum = parseFloat(item.precio) || 0;
  if (precioNum > 0 && item.total > 0) {
    const calculated = item.total / precioNum;
    if (calculated > 0 && calculated <= 1000) {
      return Math.round(calculated);
    }
  }
  
  // Último fallback: usar cantidad o reservas
  return item.reservas ?? item.cantidad ?? 0;
}

// Helper para obtener el nombre del venue
function getVenueName(venueId: number): string {
  const location = locations.find((loc) => loc.id === venueId);
  return location?.name || `Sede ${venueId}`;
}

// Helper para generar fechas según el rango
function getDateRange(filters: DashboardFilters): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (filters.rangeType === "today") {
    const dateStr = today.toISOString().split("T")[0];
    return [dateStr];
  }
  
  if (filters.rangeType === "range" && filters.startDate && filters.endDate) {
    const dates: string[] = [];
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    
    return dates;
  }
  
  if (filters.rangeType === "month") {
    const dates: string[] = [];
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    
    return dates;
  }
  
  return [];
}

export async function fetchVenueSummary(filters: DashboardFilters): Promise<VenueSummary> {
  const dates = getDateRange(filters);
  
  if (dates.length === 0) {
    throw new Error("No se pudo determinar el rango de fechas");
  }
  
  // Obtener datos de todas las fechas
  const allSalesData: Array<{ fecha: string; items: SaleItem[] }> = [];
  
  for (const fecha of dates) {
    const items = await fetchSalesData(fecha, filters.venueId);
    allSalesData.push({ fecha, items });
  }
  
  // Procesar datos por categoría
  const coverItems: SaleItem[] = [];
  const consumoItems: SaleItem[] = [];
  const paqueteItems: SaleItem[] = [];
  
  allSalesData.forEach(({ items }) => {
    items.forEach((item) => {
      const category = categorizeProduct(item.producto);
      if (category === "cover") {
        coverItems.push(item);
      } else if (category === "consumo") {
        consumoItems.push(item);
      } else {
        paqueteItems.push(item);
      }
    });
  });
  
  // Calcular métricas por categoría
  const calculateCategoryMetrics = (items: SaleItem[]) => {
    const reservations = items.reduce((sum, item) => sum + (item.reservas ?? item.cantidad ?? 0), 0);
    const guests = items.reduce((sum, item) => sum + calculateGuests(item), 0);
    const revenue = items.reduce((sum, item) => sum + item.total, 0);
    return { reservations, guests, revenue };
  };
  
  const coverMetrics = calculateCategoryMetrics(coverItems);
  const consumoMetrics = calculateCategoryMetrics(consumoItems);
  const paqueteMetrics = calculateCategoryMetrics(paqueteItems);
  
  const totalReservations = coverMetrics.reservations + consumoMetrics.reservations + paqueteMetrics.reservations;
  const totalGuests = coverMetrics.guests + consumoMetrics.guests + paqueteMetrics.guests;
  const totalRevenue = coverMetrics.revenue + consumoMetrics.revenue + paqueteMetrics.revenue;
  
  // Procesar datos por día
  const reservationsByDayMap = new Map<string, { reservations: number; guests: number; revenue: number }>();
  
  allSalesData.forEach(({ fecha, items }) => {
    if (!reservationsByDayMap.has(fecha)) {
      reservationsByDayMap.set(fecha, { reservations: 0, guests: 0, revenue: 0 });
    }
    
    const dayData = reservationsByDayMap.get(fecha)!;
    items.forEach((item) => {
      dayData.reservations += (item.reservas ?? item.cantidad ?? 0);
      dayData.guests += calculateGuests(item);
      dayData.revenue += item.total;
    });
  });
  
  const reservationsByDay = Array.from(reservationsByDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const productBreakdown: ProductBreakdown = {
    cover: {
      productType: "cover",
      reservations: coverMetrics.reservations,
      guests: coverMetrics.guests,
      revenue: coverMetrics.revenue,
    },
    consumo: {
      productType: "consumo",
      reservations: consumoMetrics.reservations,
      guests: consumoMetrics.guests,
      revenue: consumoMetrics.revenue,
    },
    paquete: {
      productType: "paquete",
      reservations: paqueteMetrics.reservations,
      guests: paqueteMetrics.guests,
      revenue: paqueteMetrics.revenue,
    },
    total: {
      productType: "cover",
      reservations: totalReservations,
      guests: totalGuests,
      revenue: totalRevenue,
    },
  };
  
  return {
    venueId: filters.venueId,
    venueName: getVenueName(filters.venueId),
    totalReservations,
    totalGuests,
    estimatedRevenue: totalRevenue,
    occupancyRate: 0, // No disponible desde la API actual
    productBreakdown,
    reservationsByDay,
    tableReservations: [], // No disponible desde la API actual - requiere endpoint específico
  };
}


