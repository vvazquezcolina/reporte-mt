"use client";

import { useMemo } from "react";
import React from "react";
import { SalesData, SaleItem } from "@/lib/api";
import { getCityByVenueId } from "@/data/cities";
import { City } from "@/data/users";

interface SalesTableProps {
  data: SalesData[];
  locationName: string;
  hasIncomeAccess: boolean;
}

interface TableRow {
  fecha: string;
  producto: string;
  precio: string;
  reservas: number; // Number of reservations
  personas: number; // Number of people (calculated from total / precio)
  total: number;
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  rows: TableRow[];
  uniqueDates: Set<string>;
  uniqueDatesCount: number;
}

// Función para limpiar nombres de productos
function cleanProductName(name: string): string {
  if (!name) return "COVER";
  
  let cleaned = name.trim();
  
  // Eliminar información de precio entre paréntesis: (23,000.00) o ($23,000.00)
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, "");
  
  // Eliminar "N/A" de manera más robusta (al inicio, al final, en medio, con o sin espacios)
  // También eliminar variantes como "N A", "NA", etc.
  cleaned = cleaned.replace(/\s*N\s*\/?\s*A\s*/gi, " ");
  cleaned = cleaned.replace(/\s*NA\s*/gi, " ");
  
  // Eliminar espacios múltiples y reemplazar por uno solo
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  // Detectar y eliminar repeticiones de palabras consecutivas
  // Caso 1: Palabras consecutivas idénticas (ej: "SILVER SILVER" -> "SILVER")
  const words = cleaned.split(/\s+/);
  const deduplicatedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    // Si la palabra actual es diferente a la anterior, o es la primera, agregarla
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      deduplicatedWords.push(words[i]);
    }
  }
  cleaned = deduplicatedWords.join(" ");
  
  // Caso 2: Repetición exacta de frases completas (ej: "NYE BRONZE NYE BRONZE" -> "NYE BRONZE")
  const cleanedWords = cleaned.split(/\s+/);
  if (cleanedWords.length >= 2) {
    // Buscar repetición desde el inicio
    for (let i = 1; i <= Math.floor(cleanedWords.length / 2); i++) {
      const firstPart = cleanedWords.slice(0, i).join(" ").toLowerCase();
      const secondPart = cleanedWords.slice(i, i * 2).join(" ").toLowerCase();
      
      // Si la primera parte se repite exactamente en la segunda parte
      if (firstPart === secondPart && firstPart.length > 0) {
        cleaned = cleanedWords.slice(0, i).join(" ");
        break;
      }
    }
  }
  
  // Caso 3: Repetición parcial o truncada (ej: "NYE Dinner Table Experience NYE Dinner Table Expe")
  const finalWords = cleaned.split(/\s+/);
  if (finalWords.length >= 4) {
    // Buscar si hay una repetición parcial al final
    for (let checkLength = 2; checkLength <= Math.floor(finalWords.length / 2); checkLength++) {
      const startWords = finalWords.slice(0, checkLength).join(" ").toLowerCase();
      const endWords = finalWords.slice(-checkLength).join(" ").toLowerCase();
      
      // Si las últimas palabras coinciden con las primeras, puede ser una repetición
      if (startWords === endWords || 
          (startWords.length > 5 && endWords.startsWith(startWords.substring(0, Math.min(startWords.length - 2, startWords.length))))) {
        // Verificar si hay más palabras en medio que no se repiten
        const middleWords = finalWords.slice(checkLength, -checkLength);
        if (middleWords.length > 0) {
          // Hay palabras en medio, mantener todo excepto la repetición final
          cleaned = finalWords.slice(0, -checkLength).join(" ");
        } else {
          // No hay palabras en medio, es una repetición completa
          cleaned = finalWords.slice(0, checkLength).join(" ");
        }
        break;
      }
    }
  }
  
  // Caso 4: Eliminar repeticiones de nombres de venues o palabras comunes al inicio/final
  // Ejemplo: "VAGALUME GENERAL ACCESS VAGALUME" -> "GENERAL ACCESS"
  const commonVenueWords = ["vagalume", "bagatelle", "bonbonniere", "mandala", "rakata", "abolengo"];
  const finalWords2 = cleaned.split(/\s+/);
  if (finalWords2.length >= 3) {
    const firstWord = finalWords2[0].toLowerCase();
    const lastWord = finalWords2[finalWords2.length - 1].toLowerCase();
    
    // Si la primera y última palabra son iguales y son nombres de venues comunes
    if (firstWord === lastWord && commonVenueWords.includes(firstWord)) {
      cleaned = finalWords2.slice(1, -1).join(" ");
    }
  }
  
  // Caso 5: Eliminar repeticiones de palabras clave comunes (NYE, GA, VIP, etc.)
  const keywords = ["nye", "ga", "vip", "bronze", "silver", "gold", "platinum", "table", "access", "dinner", "experience"];
  const finalWords3 = cleaned.split(/\s+/);
  const seenKeywords = new Set<string>();
  const filteredWords: string[] = [];
  
  for (const word of finalWords3) {
    const lowerWord = word.toLowerCase();
    // Si es una palabra clave y ya la hemos visto, no agregarla de nuevo
    if (keywords.includes(lowerWord) && seenKeywords.has(lowerWord)) {
      continue;
    }
    if (keywords.includes(lowerWord)) {
      seenKeywords.add(lowerWord);
    }
    filteredWords.push(word);
  }
  
  // Solo aplicar este filtro si no elimina demasiadas palabras importantes
  if (filteredWords.length >= Math.ceil(finalWords3.length * 0.6)) {
    cleaned = filteredWords.join(" ");
  }
  
  // Limpiar espacios al inicio y final nuevamente
  cleaned = cleaned.trim();
  
  // Eliminar espacios múltiples finales
  cleaned = cleaned.replace(/\s+/g, " ");
  
  return cleaned || "COVER";
}

// Función para renombrar GENERAL ACCESS para Vagalume Tulum según precio
function renameGeneralAccessForVagalume(items: SaleItem[], sucursal: number): SaleItem[] {
  // Solo aplicar a Vagalume Tulum (ID: 38)
  if (sucursal !== 38) {
    return items;
  }

  // Separar items GENERAL ACCESS, NYE GA, NYE consumo y demás
  const generalAccessItems: SaleItem[] = [];
  const nyeGAItems: SaleItem[] = [];
  const nyeDinnerItems: SaleItem[] = [];
  const nyeFamilyStyleItems: SaleItem[] = [];
  const otherItems: SaleItem[] = [];

  items.forEach((item) => {
    const productoName = item.producto?.toUpperCase() || "";
    const isNYE = productoName.includes("NYE");
    const isGeneralAccess = productoName.includes("GENERAL ACCESS");
    const isGeneralAdmission = productoName.includes("GENERAL ADMISSION");
    const isDinnerTable = productoName.includes("DINNER TABLE EXPERIENCE");
    const isFamilyStyle = productoName.includes("FAMILY STYLE DINNER");
    
    if (isNYE && (isGeneralAccess || isGeneralAdmission)) {
      nyeGAItems.push(item);
    } else if (isNYE && isDinnerTable) {
      nyeDinnerItems.push(item);
    } else if (isNYE && isFamilyStyle) {
      nyeFamilyStyleItems.push(item);
    } else if (isGeneralAccess) {
      generalAccessItems.push(item);
    } else {
      otherItems.push(item);
    }
  });

  // Si no hay items especiales, retornar sin cambios
  if (generalAccessItems.length === 0 && nyeGAItems.length === 0 && 
      nyeDinnerItems.length === 0 && nyeFamilyStyleItems.length === 0) {
    return items;
  }

  // Procesar items GENERAL ACCESS normales
  let processedGAItems: SaleItem[] = [];
  if (generalAccessItems.length > 0) {
    const uniquePrices = Array.from(
      new Set(generalAccessItems.map(item => parseFloat(item.precio) || 0))
    ).sort((a, b) => a - b);

    const priceToNameMap = new Map<number, string>();
    uniquePrices.forEach((price, index) => {
      if (index === 0) {
        priceToNameMap.set(price, "GA - Early Bird");
      } else if (index === 1) {
        priceToNameMap.set(price, "GA - First Release");
      } else if (index === 2) {
        priceToNameMap.set(price, "GA - Second Release");
      } else {
        priceToNameMap.set(price, "GA - Last Release");
      }
    });

    const renamedGAItems = generalAccessItems.map((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      return { ...item, producto: newName };
    });

    // Agrupar items GENERAL ACCESS con mismo nombre y precio
    const groupedGAItems = new Map<string, SaleItem>();
    renamedGAItems.forEach((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      const key = `${newName}_${precio}`;
      
      if (groupedGAItems.has(key)) {
        const existing = groupedGAItems.get(key)!;
        const reservas = (existing.reservas ?? existing.cantidad ?? 0) + (item.reservas ?? item.cantidad ?? 0);
        const pax = (existing.pax ?? 0) + (item.pax ?? 0);
        const total = (existing.total ?? 0) + (item.total ?? 0);
        
        groupedGAItems.set(key, {
          ...existing,
          reservas,
          pax,
          total,
          cantidad: reservas,
        });
      } else {
        groupedGAItems.set(key, {
          ...item,
          producto: newName,
          reservas: item.reservas ?? item.cantidad ?? 0,
          pax: item.pax ?? 0,
          total: item.total ?? 0,
          cantidad: item.reservas ?? item.cantidad ?? 0,
        });
      }
    });
    processedGAItems = Array.from(groupedGAItems.values());
  }

  // Procesar items NYE GA
  let processedNYEGAItems: SaleItem[] = [];
  if (nyeGAItems.length > 0) {
    const uniquePrices = Array.from(
      new Set(nyeGAItems.map(item => parseFloat(item.precio) || 0))
    ).sort((a, b) => a - b);

    const priceToNameMap = new Map<number, string>();
    uniquePrices.forEach((price, index) => {
      if (index === 0) {
        priceToNameMap.set(price, "NYE - GA - Early Bird");
      } else if (index === 1) {
        priceToNameMap.set(price, "NYE - GA - First Release");
      } else if (index === 2) {
        priceToNameMap.set(price, "NYE - GA - Second Release");
      } else {
        priceToNameMap.set(price, "NYE - GA - Final Release");
      }
    });

    const renamedNYEGAItems = nyeGAItems.map((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      return { ...item, producto: newName };
    });

    // Agrupar items NYE GA con mismo nombre y precio
    const groupedNYEGAItems = new Map<string, SaleItem>();
    renamedNYEGAItems.forEach((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      const key = `${newName}_${precio}`;
      
      if (groupedNYEGAItems.has(key)) {
        const existing = groupedNYEGAItems.get(key)!;
        const reservas = (existing.reservas ?? existing.cantidad ?? 0) + (item.reservas ?? item.cantidad ?? 0);
        const pax = (existing.pax ?? 0) + (item.pax ?? 0);
        const total = (existing.total ?? 0) + (item.total ?? 0);
        
        groupedNYEGAItems.set(key, {
          ...existing,
          reservas,
          pax,
          total,
          cantidad: reservas,
        });
      } else {
        groupedNYEGAItems.set(key, {
          ...item,
          producto: newName,
          reservas: item.reservas ?? item.cantidad ?? 0,
          pax: item.pax ?? 0,
          total: item.total ?? 0,
          cantidad: item.reservas ?? item.cantidad ?? 0,
        });
      }
    });
    processedNYEGAItems = Array.from(groupedNYEGAItems.values());
  }

  // Función helper para procesar productos NYE de consumo
  const processNYEConsumption = (items: SaleItem[], baseName: string): SaleItem[] => {
    if (items.length === 0) return [];
    
    const uniquePrices = Array.from(
      new Set(items.map(item => parseFloat(item.precio) || 0))
    ).sort((a, b) => a - b);

    const priceToNameMap = new Map<number, string>();
    uniquePrices.forEach((price, index) => {
      if (index === 0) {
        priceToNameMap.set(price, `${baseName} - Early Bird`);
      } else if (index === 1) {
        priceToNameMap.set(price, `${baseName} - First Release`);
      } else if (index === 2) {
        priceToNameMap.set(price, `${baseName} - Second Release`);
      } else {
        priceToNameMap.set(price, `${baseName} - Third Release`);
      }
    });

    const renamedItems = items.map((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      return { ...item, producto: newName };
    });

    // Agrupar items con mismo nombre y precio
    const groupedItems = new Map<string, SaleItem>();
    renamedItems.forEach((item) => {
      const precio = parseFloat(item.precio) || 0;
      const newName = priceToNameMap.get(precio) || item.producto;
      const key = `${newName}_${precio}`;
      
      if (groupedItems.has(key)) {
        const existing = groupedItems.get(key)!;
        const reservas = (existing.reservas ?? existing.cantidad ?? 0) + (item.reservas ?? item.cantidad ?? 0);
        const pax = (existing.pax ?? 0) + (item.pax ?? 0);
        const total = (existing.total ?? 0) + (item.total ?? 0);
        
        groupedItems.set(key, {
          ...existing,
          reservas,
          pax,
          total,
          cantidad: reservas,
        });
      } else {
        groupedItems.set(key, {
          ...item,
          producto: newName,
          reservas: item.reservas ?? item.cantidad ?? 0,
          pax: item.pax ?? 0,
          total: item.total ?? 0,
          cantidad: item.reservas ?? item.cantidad ?? 0,
        });
      }
    });
    return Array.from(groupedItems.values());
  };

  // Procesar items NYE Dinner Table Experience
  const processedNYEDinnerItems = processNYEConsumption(nyeDinnerItems, "NYE Dinner Experience");

  // Procesar items NYE Family Style Dinner
  const processedNYEFamilyStyleItems = processNYEConsumption(nyeFamilyStyleItems, "NYE Family Style");

  // Combinar todos los items procesados con los demás
  return [...processedGAItems, ...processedNYEGAItems, ...processedNYEDinnerItems, ...processedNYEFamilyStyleItems, ...otherItems];
}

export default function SalesTable({ data, locationName, hasIncomeAccess }: SalesTableProps) {
  // Si no tiene acceso a ingresos, mostrar mensaje
  if (!hasIncomeAccess) {
    return (
      <div className="container">
        <div style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #333",
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "10px",
            color: "#ffffff",
          }}>
            Acceso Restringido
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#cccccc",
          }}>
            No tienes permiso para ver los ingresos de esta ubicación.
          </p>
        </div>
      </div>
    );
  }

  // Determinar la ciudad del venue para formateo correcto
  const venueCity: City | null = useMemo(() => {
    if (data.length > 0 && data[0].sucursal) {
      return getCityByVenueId(data[0].sucursal);
    }
    return null;
  }, [data]);

  // Determinar si es EUR (Europa) o MXN (México y resto)
  const isEUR = venueCity === "Madrid";

  // Transform data into table rows and group by month and date
  const sortedMonthGroups = useMemo(() => {
    const monthGroups = new Map<string, { 
      monthKey: string; 
      monthLabel: string; 
      dateGroups: Map<string, { fecha: string; rows: TableRow[]; totals: { reservas: number; personas: number; total: number } }>; 
      uniqueDates: Set<string> 
    }>();
  
    data.forEach((salesData) => {
    const date = new Date(salesData.fecha + "T00:00:00");
    const formattedDate = formatDate(date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, {
        monthKey,
        monthLabel,
        dateGroups: new Map(),
        uniqueDates: new Set<string>(),
      });
    }
    
    const monthGroup = monthGroups.get(monthKey)!;
    
    // Track unique dates
    monthGroup.uniqueDates.add(salesData.fecha);
    
    // Get or create date group
    if (!monthGroup.dateGroups.has(salesData.fecha)) {
      monthGroup.dateGroups.set(salesData.fecha, {
        fecha: formattedDate,
        rows: [],
        totals: { reservas: 0, personas: 0, total: 0 },
      });
    }
    
    const dateGroup = monthGroup.dateGroups.get(salesData.fecha)!;
    
    // Debug: Log para Rakata (ID: 32)
    if (salesData.sucursal === 32) {
      console.log(`[Rakata Debug] Fecha: ${salesData.fecha}, Items recibidos: ${salesData.items.length}`, salesData.items);
    }
    
    if (salesData.items.length === 0) {
        const coverRow = {
          fecha: formattedDate,
          producto: "COVER",
          precio: isEUR ? "€0,00" : "$0.00",
          reservas: 0,
          personas: 0,
          total: 0,
        };
        dateGroup.rows.push(coverRow);
    } else {
      // Incluir todos los items que tengan datos relevantes
      // Mostrar todos los productos que vengan de la API (menos restrictivo)
      const validItems = salesData.items.filter((item) => {
        // Excluir solo si no tiene producto definido
        if (!item.producto || item.producto.trim() === "") {
          return false;
        }
        
        // Filtro especial para Bagatelle Tulum (ID: 41): excluir productos "CONSUMO" con precio = 0
        if (salesData.sucursal === 41) {
          const productoName = item.producto.trim().toUpperCase();
          const precioAmount = parseFloat(item.precio) || 0;
          
          if (productoName === "CONSUMO" && precioAmount === 0) {
            return false;
          }
        }
        
        // Filtro especial para Vagalume Tulum (ID: 38): excluir productos "CONSUMO" con precio = 0
        if (salesData.sucursal === 38) {
          const productoName = item.producto.trim().toUpperCase();
          const precioAmount = parseFloat(item.precio) || 0;
          
          if (productoName === "CONSUMO" && precioAmount === 0) {
            return false;
          }
        }
        
        // Incluir si tiene algún dato: reservas, cantidad, pax, precio o total
        const reservasCount = item.reservas ?? item.cantidad ?? 0;
        const paxCount = item.pax ?? 0;
        const totalAmount = item.total ?? 0;
        const precioAmount = parseFloat(item.precio) || 0;
        
        // Incluir si tiene al menos un dato numérico o es GENERAL ACCESS
        // También incluir si tiene precio aunque otros campos sean 0 (puede ser producto configurado)
        const isGeneralAccess = item.producto === "GENERAL ACCESS - Night event";
        const hasAnyData = reservasCount > 0 || paxCount > 0 || totalAmount > 0 || precioAmount > 0;
        
        // Debug para Rakata
        if (salesData.sucursal === 32 && !hasAnyData && !isGeneralAccess) {
          console.log(`[Rakata Debug] Item filtrado:`, item);
        }
        
        return isGeneralAccess || hasAnyData;
      });
      
      // Debug para Rakata: mostrar cuántos items válidos hay
      if (salesData.sucursal === 32) {
        console.log(`[Rakata Debug] Fecha: ${salesData.fecha}, Items totales: ${salesData.items.length}, Items válidos: ${validItems.length}`);
      }

      // Renombrar GENERAL ACCESS para Vagalume Tulum según precio
      const processedItems = renameGeneralAccessForVagalume(validItems, salesData.sucursal);

      if (processedItems.length === 0) {
        const coverRow = {
          fecha: formattedDate,
          producto: "COVER",
          precio: isEUR ? "€0,00" : "$0.00",
          reservas: 0,
          personas: 0,
          total: 0,
        };
        dateGroup.rows.push(coverRow);
      } else {
        // Agrupar items por producto y precio para evitar duplicados
        const groupedItems = new Map<string, {
          producto: string;
          precio: string;
          reservas: number;
          personas: number;
          total: number;
        }>();
        
        processedItems.forEach((item) => {
          // Usar reservas y pax directamente de la API, con fallback a cantidad y cálculo si no existen
          let reservas = item.reservas ?? item.cantidad ?? 0;
          let personas = item.pax ?? 0;
          
          // Fallback: si no viene pax, calcularlo del total y precio
          if (personas === 0 && item.total > 0) {
            const precioNum = parseFloat(item.precio) || 0;
            if (precioNum > 0) {
              const calculatedPersonas = item.total / precioNum;
              if (calculatedPersonas > 0 && calculatedPersonas <= 1000) {
                personas = Math.round(calculatedPersonas);
              }
            }
          }
          
          // Crear clave única basada en producto limpio y precio
          const cleanedProduct = cleanProductName(item.producto || "COVER");
          const precioKey = parseFloat(item.precio) || 0;
          const key = `${cleanedProduct}_${precioKey.toFixed(2)}`;
          
          if (groupedItems.has(key)) {
            // Si ya existe, sumar los valores
            const existing = groupedItems.get(key)!;
            existing.reservas += reservas;
            existing.personas += personas;
            existing.total += item.total;
          } else {
            // Crear nuevo item agrupado
            groupedItems.set(key, {
              producto: cleanedProduct,
              precio: formatPrice(item.precio, isEUR),
              reservas,
              personas,
              total: item.total,
            });
          }
        });
        
        // Convertir el Map a array y agregar las filas
        Array.from(groupedItems.values()).forEach((groupedItem) => {
          const row = {
            fecha: formattedDate,
            producto: groupedItem.producto,
            precio: groupedItem.precio,
            reservas: groupedItem.reservas,
            personas: groupedItem.personas,
            total: groupedItem.total,
          };
          
          dateGroup.rows.push(row);
          
          // Acumular totales por fecha
          dateGroup.totals.reservas += groupedItem.reservas;
          dateGroup.totals.personas += groupedItem.personas;
          dateGroup.totals.total += groupedItem.total;
        });
      }
    }
    });

    // Convert to array and sort by month key
    return Array.from(monthGroups.values())
      .map(monthGroup => {
        // Convert date groups to sorted array
        const sortedDateGroups = Array.from(monthGroup.dateGroups.values())
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .map(dateGroup => ({
            ...dateGroup,
            // Ordenar las filas alfabéticamente por nombre de producto dentro de cada fecha
            rows: dateGroup.rows.sort((a, b) => {
              const productA = a.producto.toLowerCase();
              const productB = b.producto.toLowerCase();
              return productA.localeCompare(productB, 'es', { sensitivity: 'base' });
            }),
          }));
        
        return {
          ...monthGroup,
          uniqueDatesCount: monthGroup.uniqueDates.size,
          dateGroups: sortedDateGroups,
        };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [data, isEUR]);

  // Calculate totals across all data
  const totals = useMemo(() => {
    let totalReservas = 0;
    let totalPersonas = 0;
    let totalIngresos = 0;

    sortedMonthGroups.forEach((monthGroup) => {
      monthGroup.dateGroups.forEach((dateGroup) => {
        totalReservas += dateGroup.totals.reservas;
        totalPersonas += dateGroup.totals.personas;
        totalIngresos += dateGroup.totals.total;
      });
    });

    return {
      reservas: totalReservas,
      personas: totalPersonas,
      ingresos: totalIngresos,
    };
  }, [sortedMonthGroups]);


  const handleExportPDF = async () => {
    try {
      // Importación dinámica de jsPDF y jspdf-autotable para evitar problemas en SSR
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      
      // jsPDF v3.x exporta la clase jsPDF como named export 'jsPDF' o como 'default'
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      if (!jsPDF || typeof jsPDF !== "function") {
        throw new Error("No se pudo importar jsPDF correctamente");
      }
      
      // Registrar el plugin autoTable en jsPDF usando applyPlugin
      // jspdf-autotable v5+ exporta applyPlugin que registra el plugin en el prototipo
      if (autoTableModule.applyPlugin) {
        autoTableModule.applyPlugin(jsPDF);
      } else if (autoTableModule.default) {
        // Fallback: verificar si default es applyPlugin o necesita otro método
        const defaultExport = autoTableModule.default as any;
        if (typeof defaultExport === "function") {
          // Si es una función, podría ser applyPlugin o autoTable
          // applyPlugin toma un argumento (jsPDF constructor)
          // autoTable toma 2 argumentos (doc, options)
          // Intentar como applyPlugin primero
          try {
            defaultExport(jsPDF);
          } catch (e) {
            // Si falla, el plugin podría ya estar registrado
            console.warn("No se pudo aplicar autoTable plugin:", e);
          }
        }
      }
      
      // Crear instancia de jsPDF usando formato v3 (objeto de opciones)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      const today = new Date();
      const dateStr = today.toLocaleDateString("es-MX");
      
      // Título del reporte
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Resumen de Ventas - ${locationName}`, 14, 15);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado el: ${dateStr}`, 14, 22);
      
      // Preparar datos para la tabla
      const tableData: (string | number)[][] = [];
      let currentRowIndex = 0;
      const monthRowIndices: number[] = [];
      const totalRowIndex: number[] = [];
      
      sortedMonthGroups.forEach((monthGroup) => {
        // Agregar fila de encabezado del mes
        tableData.push([
          monthGroup.monthLabel,
          "",
          "",
          "",
          "",
          ""
        ]);
        monthRowIndices.push(currentRowIndex);
        currentRowIndex++;
        
        // Agregar filas del mes agrupadas por fecha
        monthGroup.dateGroups.forEach((dateGroup) => {
          // Agregar filas de productos de esta fecha
          dateGroup.rows.forEach((row) => {
            // Asegurar que el nombre del producto esté limpio (sin N/A ni repeticiones)
            const cleanProduct = cleanProductName(row.producto || "COVER");
            tableData.push([
              row.fecha,
              cleanProduct || "-",
              row.precio,
              formatNumber(row.reservas, isEUR),
              formatNumber(row.personas, isEUR),
              formatCurrency(row.total, isEUR)
            ]);
            currentRowIndex++;
          });
          
          // Agregar fila de total por fecha
          tableData.push([
            `Total ${dateGroup.fecha}`,
            "",
            "",
            formatNumber(dateGroup.totals.reservas, isEUR),
            formatNumber(dateGroup.totals.personas, isEUR),
            formatCurrency(dateGroup.totals.total, isEUR)
          ]);
          monthRowIndices.push(currentRowIndex); // Marcar como fila especial para estilos
          currentRowIndex++;
        });
      });
      
      // Agregar fila de totales
      tableData.push([
        "TOTAL",
        "",
        "",
        formatNumber(totals.reservas, isEUR),
        formatNumber(totals.personas, isEUR),
        formatCurrency(totals.ingresos, isEUR)
      ]);
      totalRowIndex.push(currentRowIndex);
      
      // Verificar que autoTable esté disponible en el documento
      // Después de aplicar el plugin, autoTable debería estar disponible en todas las instancias
      if (!(doc as any).autoTable) {
        // Si aún no está disponible, intentar registrarlo de nuevo
        if (autoTableModule.applyPlugin) {
          autoTableModule.applyPlugin(jsPDF);
        }
        
        // Verificar una vez más
        if (!(doc as any).autoTable) {
          throw new Error("autoTable no está disponible después de registrar el plugin. Verifica que jspdf-autotable esté instalado correctamente.");
        }
      }
      
      (doc as any).autoTable({
        head: [["FECHA", "PRODUCTO", "PRECIO", "RESERVAS", "PERSONAS", "TOTAL"]],
        body: tableData,
        startY: 28,
        theme: "striped",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [26, 26, 26],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 35, halign: "left" }, // FECHA
          1: { cellWidth: 70, halign: "left" }, // PRODUCTO
          2: { cellWidth: 35, halign: "right" }, // PRECIO
          3: { cellWidth: 30, halign: "right" }, // RESERVAS
          4: { cellWidth: 30, halign: "right" }, // PERSONAS
          5: { cellWidth: 40, halign: "right" }, // TOTAL
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didParseCell: (hookData: any) => {
          // Estilos especiales para filas de meses y totales
          const rowIdx = hookData.row.index;
          
          if (monthRowIndices.includes(rowIdx)) {
            // Es una fila de mes
            hookData.cell.styles.fillColor = [42, 42, 42];
            hookData.cell.styles.textColor = [255, 255, 255];
            hookData.cell.styles.fontStyle = "bold";
          } else if (totalRowIndex.includes(rowIdx)) {
            // Es la fila de totales
            hookData.cell.styles.fillColor = [42, 42, 42];
            hookData.cell.styles.textColor = [255, 255, 255];
            hookData.cell.styles.fontStyle = "bold";
          }
        },
      });
      
      // Nombre del archivo
      const fileName = `Reporte_${locationName.replace(/\s+/g, "_")}_${dateStr.replace(/\//g, "_")}.pdf`;
      doc.save(fileName);
    } catch (error: any) {
      console.error("Error al generar PDF:", error);
      const errorMessage = error?.message || "Error desconocido";
      console.error("Detalles del error:", {
        message: errorMessage,
        stack: error?.stack,
        error
      });
      alert(`Error al generar el PDF: ${errorMessage}. Revisa la consola para más detalles.`);
    }
  };

  return (
    <div className="container">
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        alignItems: "center", 
        marginBottom: "clamp(16px, 3vw, 20px)",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <button
          onClick={handleExportPDF}
          style={{
            padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
            fontSize: "clamp(12px, 2.5vw, 14px)",
            backgroundColor: "#0066cc",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "background-color 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#0052a3";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#0066cc";
          }}
        >
          📄 Exportar a PDF
        </button>
      </div>
      <div className="sales-table-wrapper">
        <table className="sales-table">
        <thead>
          <tr>
            <th className="fecha-header">FECHA</th>
            <th>PRODUCTO</th>
            <th>PRECIO</th>
            <th>RESERVAS</th>
            <th>PERSONAS</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sortedMonthGroups.map((monthGroup) => {
            return (
              <React.Fragment key={monthGroup.monthKey}>
                <tr className="month-header">
                  <td colSpan={6} className="month-header-cell">
                    <span className="month-label">{monthGroup.monthLabel}</span>
                    <span className="month-count">({monthGroup.uniqueDatesCount} fechas)</span>
                  </td>
                </tr>
                {monthGroup.dateGroups.map((dateGroup, dateIndex) => (
                  <React.Fragment key={`${monthGroup.monthKey}-${dateGroup.fecha}`}>
                    {dateGroup.rows.map((row, rowIndex) => (
                      <tr key={`${monthGroup.monthKey}-${dateGroup.fecha}-${rowIndex}`}>
                        <td className="fecha-cell">{row.fecha}</td>
                        <td>{row.producto || "-"}</td>
                        <td className="number-cell">{row.precio}</td>
                        <td className="number-cell">{formatNumber(row.reservas, isEUR)}</td>
                        <td className="number-cell">{formatNumber(row.personas, isEUR)}</td>
                        <td className="number-cell">{formatCurrency(row.total, isEUR)}</td>
                      </tr>
                    ))}
                    {/* Total por fecha */}
                    <tr className="date-total-row">
                      <td colSpan={2} className="date-total-label-cell">
                        <strong>Total {dateGroup.fecha}</strong>
                      </td>
                      <td className="number-cell"></td>
                      <td className="number-cell date-total-value">
                        <strong>{formatNumber(dateGroup.totals.reservas, isEUR)}</strong>
                      </td>
                      <td className="number-cell date-total-value">
                        <strong>{formatNumber(dateGroup.totals.personas, isEUR)}</strong>
                      </td>
                      <td className="number-cell date-total-value">
                        <strong>{formatCurrency(dateGroup.totals.total, isEUR)}</strong>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
          {/* Total row */}
          <tr className="total-row">
            <td colSpan={3} className="total-label-cell">
              <strong>TOTAL</strong>
            </td>
            <td className="number-cell total-value">
              <strong>{formatNumber(totals.reservas, isEUR)}</strong>
            </td>
            <td className="number-cell total-value">
              <strong>{formatNumber(totals.personas, isEUR)}</strong>
            </td>
            <td className="number-cell total-value">
              <strong>{formatCurrency(totals.ingresos, isEUR)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <style jsx>{`
        .container {
          padding: clamp(12px, 3vw, 20px);
          max-width: 1200px;
          margin: 0 auto;
          background-color: #000000;
        }
        .title {
          font-size: clamp(18px, 4vw, 24px);
          font-weight: bold;
          margin-bottom: clamp(16px, 3vw, 20px);
          color: #ffffff;
        }
        .sales-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 clamp(-12px, -3vw, -20px);
          padding: 0 clamp(12px, 3vw, 20px);
        }
        .sales-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: clamp(12px, 2.5vw, 14px);
          background-color: #000000;
        }
        thead tr {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        thead th {
          padding: clamp(8px, 2vw, 12px);
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          border: 1px solid #333;
          color: #ffffff;
          white-space: nowrap;
        }
        .fecha-header {
          background-color: #2a2a2a;
          border-bottom: 2px solid #d4af37;
        }
        tbody tr {
          border-bottom: 1px solid #333;
          background-color: #000000;
        }
        tbody tr:hover {
          background-color: #1a1a1a;
        }
        tbody td {
          padding: clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px);
          border: 1px solid #333;
          color: #ffffff;
        }
        .fecha-cell {
          font-weight: 500;
          color: #ffffff;
        }
        .number-cell {
          text-align: right;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
        }
        .month-header {
          background-color: #1a1a1a;
        }
        .month-header-cell {
          padding: clamp(10px, 2vw, 12px);
          font-weight: 600;
          font-size: clamp(13px, 2.5vw, 15px);
          color: #ffffff;
          border: 1px solid #333;
        }
        .month-label {
          font-weight: 600;
          color: #ffffff;
        }
        .month-count {
          margin-left: 8px;
          font-weight: 400;
          color: #cccccc;
          font-size: 13px;
        }
        .date-total-row {
          background-color: #2a2a2a;
          border-top: 1px solid #555;
        }
        .date-total-row:hover {
          background-color: #2a2a2a;
        }
        .date-total-label-cell {
          text-align: right;
          padding: clamp(10px, 2vw, 12px) clamp(8px, 2vw, 12px);
          font-weight: 600;
          color: #ffffff;
          font-size: clamp(13px, 2.5vw, 14px);
        }
        .date-total-value {
          font-weight: 600;
          color: #ffffff;
        }
        .total-row {
          background-color: #1a1a1a;
          border-top: 2px solid #d4af37;
        }
        .total-row:hover {
          background-color: #1a1a1a;
        }
        .total-label-cell {
          text-align: right;
          padding: clamp(12px, 2vw, 14px) clamp(8px, 2vw, 12px);
          font-size: clamp(13px, 2.5vw, 15px);
        }
        .total-value {
          font-size: clamp(13px, 2.5vw, 15px);
          padding: clamp(12px, 2vw, 14px) clamp(8px, 2vw, 12px);
        }
      `}</style>
    </div>
  );
}

function formatDate(date: Date): string {
  const months = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

function formatPrice(precio: string, isEUR: boolean = false): string {
  const num = parseFloat(precio);
  if (isNaN(num) || !isFinite(num)) return isEUR ? "€0,00" : "$0.00";
  
  if (isEUR) {
    // Formato EUR: €1.234,56 (punto para miles, coma para decimales)
    const formatted = num.toFixed(2).replace(".", ",");
    const parts = formatted.split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `€${parts.join(",")}`;
  } else {
    // Formato MXN: $1,234.56 (coma para miles, punto para decimales)
    try {
      return `$${num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch {
      // Fallback si toLocaleString no está disponible
      const formatted = num.toFixed(2);
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `$${parts.join(".")}`;
    }
  }
}

function formatCurrency(amount: number, isEUR: boolean = false): string {
  if (!isFinite(amount) || isNaN(amount)) {
    return isEUR ? "€0,00" : "$0.00";
  }
  
  if (isEUR) {
    // Formato EUR: €1.234,56 (punto para miles, coma para decimales)
    const formatted = amount.toFixed(2).replace(".", ",");
    const parts = formatted.split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `€${parts.join(",")}`;
  } else {
    // Formato MXN: $1,234.56 (coma para miles, punto para decimales)
    try {
      return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch {
      // Fallback si toLocaleString no está disponible
      const formatted = amount.toFixed(2);
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `$${parts.join(".")}`;
    }
  }
}

function formatNumber(num: number, isEUR: boolean = false): string {
  if (!isFinite(num) || isNaN(num)) return "0";
  
  if (isEUR) {
    // Formato EUR: 1.234 (punto para miles)
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    // Formato MXN: 1,234 (coma para miles)
    try {
      return num.toLocaleString("es-MX");
    } catch {
      // Fallback si toLocaleString no está disponible
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}

