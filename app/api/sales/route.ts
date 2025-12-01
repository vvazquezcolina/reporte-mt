import { NextRequest, NextResponse } from "next/server";
import { convertOldIdToNew } from "@/data/venue-id-mapping";

const API_KEY = "AnXLZrMk8lwuR3tDnrxr5x4c8lqRiWVCz67bwCpk";
const API_BASE_URL = "https://grupomandala.com.mx/reservaciones/api/ventas_agrupadas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fecha = searchParams.get("fecha");
  const sucursal = searchParams.get("sucursal");

  if (!fecha || !sucursal) {
    return NextResponse.json(
      { error: "fecha and sucursal are required" },
      { status: 400 }
    );
  }

  try {
    // Convertir ID antiguo a nuevo row_id de la tabla SQL
    const oldId = parseInt(sucursal);
    const disco = convertOldIdToNew(oldId);
    
    const url = `${API_BASE_URL}/X-API-KEY/${API_KEY}?fecha=${fecha}&disco=${disco}`;
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch sales data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Normalize data: ensure numeric fields are numbers (new API returns them as strings)
    const normalizedData = Array.isArray(data) 
      ? data.map((item: any) => ({
          ...item,
          total: typeof item.total === 'string' ? parseFloat(item.total) || 0 : (typeof item.total === 'number' ? item.total : 0),
          reservas: typeof item.reservas === 'string' ? parseInt(item.reservas) || 0 : (typeof item.reservas === 'number' ? item.reservas : (item.cantidad || 0)),
          pax: typeof item.pax === 'string' ? parseInt(item.pax) || 0 : (typeof item.pax === 'number' ? item.pax : 0),
          cantidad: typeof item.cantidad === 'string' ? parseInt(item.cantidad) || 0 : (typeof item.cantidad === 'number' ? item.cantidad : 0),
        }))
      : data;
    
    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


