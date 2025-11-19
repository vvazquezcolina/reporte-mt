import { NextRequest, NextResponse } from "next/server";

const API_KEY = "AnXLZrMk8lwuR3tDnrxr5x4c8lqRiWVCz67bwCpk";
const API_BASE_URL = "https://mandalatickets.com/api/ventas_agrupadas";

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
    const url = `${API_BASE_URL}/X-API-KEY/${API_KEY}?fecha=${fecha}&sucursal=${sucursal}`;
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
    
    // Normalize data: ensure total is a number (API returns it as string)
    const normalizedData = Array.isArray(data) 
      ? data.map((item: any) => ({
          ...item,
          total: typeof item.total === 'string' ? parseFloat(item.total) || 0 : item.total,
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


