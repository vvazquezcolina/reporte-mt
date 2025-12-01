"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { locations } from "@/data/events";
import { fetchSalesData, SalesData } from "@/lib/api";
import SalesTable from "@/components/SalesTable";
import Calendar from "@/components/Calendar";
import { isAuthenticated, getCurrentUser, userHasVenueAccess, userHasIncomeAccess, userCanAccessDate, getUserAllowedDates, hasDateRestrictions, logout } from "@/lib/auth";
import { getCityByVenueId } from "@/data/cities";

type DateRangeType = "day" | "week" | "month" | "custom";

export default function Home() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("day");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        const user = getCurrentUser();
        if (user) {
          setAuthenticated(true);
          setCurrentUser(user);
        } else {
          router.push("/login");
        }
      }
    };
    
    checkAuth();
  }, [router]);

  // Filtrar locations según permisos del usuario
  const availableLocations = useMemo(() => {
    if (!currentUser) return [];
    return locations.filter((location) => {
      // Si el usuario tiene acceso a todos los venues (array vacío) o tiene acceso a este venue específico
      return userHasVenueAccess(location.id);
    });
  }, [currentUser]);

  // Agrupar locations por ciudad
  const locationsByCity = useMemo(() => {
    const grouped = new Map<string, Array<{ id: number; name: string }>>();
    
    availableLocations.forEach((location) => {
      const city = getCityByVenueId(location.id);
      if (city) {
        if (!grouped.has(city)) {
          grouped.set(city, []);
        }
        grouped.get(city)!.push({ id: location.id, name: location.name });
      }
    });

    // Ordenar ciudades alfabéticamente
    const sortedCities = Array.from(grouped.keys()).sort();
    
    return sortedCities.map((city) => ({
      city,
      locations: grouped.get(city)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [availableLocations]);

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para obtener todas las fechas de la semana actual
  const getWeekDates = (): string[] => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Ir al domingo
    
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  // Función para obtener todas las fechas del mes actual
  const getMonthDates = (): string[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dates: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      dates.push(`${year}-${monthStr}-${dayStr}`);
    }
    return dates;
  };

  // Función para obtener todas las fechas entre dos fechas (inclusive)
  const getDatesBetween = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    
    // Asegurar que start sea antes que end
    if (start > end) {
      return [];
    }
    
    const current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Función para cargar datos según el tipo de rango
  const loadDataByRange = async (rangeType: DateRangeType, customDate?: string, locationId?: number) => {
    const locationToUse = locationId ?? selectedLocation;
    
    if (!locationToUse) {
      setError("Por favor, selecciona una ubicación primero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let dates: string[] = [];

      switch (rangeType) {
        case "day":
          dates = [customDate || getTodayDate()];
          break;
        case "week":
          dates = getWeekDates();
          break;
        case "month":
          dates = getMonthDates();
          break;
        case "custom":
          if (customStartDate && customEndDate) {
            dates = getDatesBetween(customStartDate, customEndDate);
            if (dates.length === 0) {
              setError("La fecha de inicio debe ser anterior a la fecha de fin");
              setLoading(false);
              return;
            }
          } else if (customDate) {
            dates = [customDate];
          } else {
            dates = [];
            setError("Por favor, selecciona un rango de fechas");
            setLoading(false);
            return;
          }
          break;
      }

      // Filtrar fechas permitidas según restricciones del usuario
      const allowedDates = dates.filter(date => userCanAccessDate(date));
      const blockedDates = dates.filter(date => !userCanAccessDate(date));

      // Si hay fechas bloqueadas, mostrar advertencia
      if (blockedDates.length > 0) {
        const blockedDatesFormatted = blockedDates.map(date => {
          const d = new Date(date + "T00:00:00");
          return d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
        }).join(", ");
        setError(`No tienes acceso a las siguientes fechas: ${blockedDatesFormatted}. Solo puedes acceder a las fechas permitidas para tu usuario.`);
      }

      // Si no hay fechas permitidas, no cargar nada
      if (allowedDates.length === 0) {
        setError("No tienes acceso a ninguna de las fechas seleccionadas.");
        setLoading(false);
        return;
      }

      // Cargar datos solo para las fechas permitidas
      const promises = allowedDates.map(async (date) => {
        const items = await fetchSalesData(date, locationToUse);
        return {
          fecha: date,
          sucursal: locationToUse,
          items,
        };
      });

      const results = await Promise.all(promises);
      setSalesData(results.sort((a, b) => a.fecha.localeCompare(b.fecha)));
    } catch (err) {
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (locationId: number) => {
    setSelectedLocation(locationId);
    setSalesData([]);
    setSelectedDate("");
    setCustomStartDate("");
    setCustomEndDate("");
    setDateRangeType("day");
    setError(null);
    
    // Si el usuario tiene restricciones de fechas, cargar todas las fechas permitidas
    if (locationId && hasDateRestrictions()) {
      const allowedDates = getUserAllowedDates();
      if (allowedDates.length > 0) {
        setLoading(true);
        setError(null);
        try {
          const promises = allowedDates.map(async (date) => {
            const items = await fetchSalesData(date, locationId);
            return {
              fecha: date,
              sucursal: locationId,
              items,
            };
          });
          const results = await Promise.all(promises);
          setSalesData(results.sort((a, b) => a.fecha.localeCompare(b.fecha)));
        } catch (err) {
          setError("Error al cargar los datos. Por favor, intenta de nuevo.");
          console.error(err);
        } finally {
          setLoading(false);
        }
        return;
      }
    }
    
    // Cargar automáticamente las reservas del día actual (si no tiene restricciones)
    // Pasamos locationId directamente para evitar problema de estado asíncrono
    if (locationId) {
      await loadDataByRange("day", undefined, locationId);
    }
  };

  const handleDateRangeChange = async (rangeType: DateRangeType) => {
    setDateRangeType(rangeType);
    setSelectedDate("");
    setCustomStartDate("");
    setCustomEndDate("");
    if (rangeType !== "custom") {
      await loadDataByRange(rangeType);
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setDateRangeType("custom");
    await loadDataByRange("custom", date);
  };

  // Cargar datos cuando cambien las fechas del rango personalizado
  useEffect(() => {
    if (dateRangeType === "custom" && customStartDate && customEndDate && selectedLocation) {
      if (customStartDate <= customEndDate) {
        setError(null);
        loadDataByRange("custom").catch((err) => {
          console.error("Error loading custom range:", err);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStartDate, customEndDate, dateRangeType, selectedLocation]);

  const selectedLocationData = availableLocations.find(
    (loc) => loc.id === selectedLocation
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!authenticated) {
    return (
      <main style={{ minHeight: "100vh", padding: "20px", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ffffff", fontSize: "16px" }}>Cargando...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(12px, 3vw, 20px)", backgroundColor: "#000000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap",
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          gap: "16px",
          marginBottom: "clamp(20px, 4vw, 30px)" 
        }}>
          <h1 style={{ 
            fontSize: "clamp(20px, 5vw, 32px)", 
            color: "#ffffff", 
            margin: 0,
            lineHeight: 1.2
          }}>
            Reportes de Ventas - Mandala Tickets
          </h1>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px",
            flexWrap: "wrap"
          }}>
            {currentUser && (
              <span style={{ 
                color: "#cccccc", 
                fontSize: "clamp(12px, 2.5vw, 14px)",
                whiteSpace: "nowrap"
              }}>
                Usuario: {currentUser.username}
              </span>
            )}
            {currentUser && currentUser.username.toLowerCase() === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                style={{
                  padding: "8px 16px",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  backgroundColor: "#333",
                  color: "#ffffff",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Administración
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                fontSize: "clamp(12px, 2.5vw, 14px)",
                backgroundColor: "#333",
                color: "#ffffff",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "clamp(20px, 4vw, 30px)", display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 20px)" }}>
          <div>
            <label
              htmlFor="location-select"
              style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "clamp(14px, 3vw, 16px)",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Selecciona una ubicación:
            </label>
            <select
              id="location-select"
              className="location-select"
              value={selectedLocation || ""}
              onChange={(e) => handleLocationChange(Number(e.target.value))}
              style={{
                padding: "10px 15px",
                fontSize: "clamp(14px, 3vw, 16px)",
                border: "1px solid #555",
                borderRadius: "4px",
                width: "100%",
                maxWidth: "100%",
                backgroundColor: "#1a1a1a",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="">-- Selecciona una ubicación --</option>
              {locationsByCity.map(({ city, locations: cityLocations }) => (
                <optgroup key={city} label={city}>
                  {cityLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <style jsx>{`
              .location-select optgroup {
                background-color: #2a2a2a;
                color: #ffffff;
                font-weight: 600;
                font-size: 14px;
                padding: 5px;
              }
              .location-select option {
                background-color: #1a1a1a;
                color: #ffffff;
                padding: 8px 20px;
              }
              .location-select option:checked {
                background-color: #0066cc;
              }
            `}</style>
          </div>

          {selectedLocation && (
            <div>
              {hasDateRestrictions() ? (
                // Usuario con restricciones de fechas: mostrar solo fechas permitidas
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    Fechas disponibles:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "15px" }}>
                    {getUserAllowedDates()
                      .sort((a, b) => a.localeCompare(b))
                      .map((date) => {
                        const dateObj = new Date(date + "T00:00:00");
                        const formattedDate = dateObj.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                        return (
                          <div
                            key={date}
                            style={{
                              padding: "clamp(12px, 2vw, 16px) clamp(20px, 3vw, 24px)",
                              backgroundColor: "#2a2a2a",
                              border: "1px solid #555",
                              borderRadius: "8px",
                              color: "#ffffff",
                              fontSize: "clamp(14px, 2.5vw, 16px)",
                              fontWeight: "500",
                              minWidth: "140px",
                              textAlign: "center",
                            }}
                          >
                            {formattedDate}
                          </div>
                        );
                      })}
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#1a3a1a",
                      border: "1px solid #2a5a2a",
                      borderRadius: "4px",
                      marginBottom: "15px",
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      color: "#90ee90",
                    }}
                  >
                    ℹ️ Solo tienes acceso a estas fechas. Los datos se cargarán automáticamente.
                  </div>
                </div>
              ) : (
                // Usuario sin restricciones: mostrar selectores normales
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    Selecciona un rango de fechas:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "15px" }}>
                <button
                  onClick={() => handleDateRangeChange("day")}
                  style={{
                    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    backgroundColor: dateRangeType === "day" ? "#4a9eff" : "#333",
                    color: "#ffffff",
                    border: dateRangeType === "day" ? "2px solid #4a9eff" : "1px solid #555",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: dateRangeType === "day" ? "600" : "normal",
                    whiteSpace: "nowrap",
                    flex: "1 1 auto",
                    minWidth: "120px",
                  }}
                  onMouseOver={(e) => {
                    if (dateRangeType !== "day") {
                      e.currentTarget.style.backgroundColor = "#444";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (dateRangeType !== "day") {
                      e.currentTarget.style.backgroundColor = "#333";
                    }
                  }}
                >
                  Reservas del día
                </button>
                <button
                  onClick={() => handleDateRangeChange("week")}
                  style={{
                    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    backgroundColor: dateRangeType === "week" ? "#4a9eff" : "#333",
                    color: "#ffffff",
                    border: dateRangeType === "week" ? "2px solid #4a9eff" : "1px solid #555",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: dateRangeType === "week" ? "600" : "normal",
                    whiteSpace: "nowrap",
                    flex: "1 1 auto",
                    minWidth: "120px",
                  }}
                  onMouseOver={(e) => {
                    if (dateRangeType !== "week") {
                      e.currentTarget.style.backgroundColor = "#444";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (dateRangeType !== "week") {
                      e.currentTarget.style.backgroundColor = "#333";
                    }
                  }}
                >
                  Reservas de la semana
                </button>
                <button
                  onClick={() => handleDateRangeChange("month")}
                  style={{
                    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    backgroundColor: dateRangeType === "month" ? "#4a9eff" : "#333",
                    color: "#ffffff",
                    border: dateRangeType === "month" ? "2px solid #4a9eff" : "1px solid #555",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: dateRangeType === "month" ? "600" : "normal",
                    whiteSpace: "nowrap",
                    flex: "1 1 auto",
                    minWidth: "120px",
                  }}
                  onMouseOver={(e) => {
                    if (dateRangeType !== "month") {
                      e.currentTarget.style.backgroundColor = "#444";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (dateRangeType !== "month") {
                      e.currentTarget.style.backgroundColor = "#333";
                    }
                  }}
                >
                  Reservas del mes
                </button>
                <button
                  onClick={() => {
                    setDateRangeType("custom");
                    setSelectedDate("");
                  }}
                  style={{
                    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    backgroundColor: dateRangeType === "custom" ? "#4a9eff" : "#333",
                    color: "#ffffff",
                    border: dateRangeType === "custom" ? "2px solid #4a9eff" : "1px solid #555",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: dateRangeType === "custom" ? "600" : "normal",
                    whiteSpace: "nowrap",
                    flex: "1 1 auto",
                    minWidth: "120px",
                  }}
                  onMouseOver={(e) => {
                    if (dateRangeType !== "custom") {
                      e.currentTarget.style.backgroundColor = "#444";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (dateRangeType !== "custom") {
                      e.currentTarget.style.backgroundColor = "#333";
                    }
                  }}
                >
                  Otro rango personalizado
                </button>
              </div>
              {dateRangeType === "custom" && (
                <div style={{ marginTop: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontSize: "clamp(13px, 2.5vw, 14px)",
                      fontWeight: "500",
                      color: "#cccccc",
                    }}
                  >
                    Selecciona un rango de fechas:
                  </label>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "clamp(12px, 2.5vw, 13px)",
                          fontWeight: "500",
                          color: "#cccccc",
                        }}
                      >
                        Fecha inicio:
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => {
                          const start = e.target.value;
                          setCustomStartDate(start);
                          if (start && customEndDate && start > customEndDate) {
                            setError("La fecha de inicio debe ser anterior a la fecha de fin");
                          } else {
                            setError(null);
                          }
                        }}
                        disabled={!selectedLocation}
                        max={customEndDate || undefined}
                        className="date-input"
                        style={{
                          padding: "clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          border: "1px solid #555",
                          borderRadius: "4px",
                          width: "100%",
                          maxWidth: "100%",
                          backgroundColor: !selectedLocation ? "#0f0f0f" : "#1a1a1a",
                          color: "#ffffff",
                          cursor: !selectedLocation ? "not-allowed" : "pointer",
                          opacity: !selectedLocation ? 0.6 : 1,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "clamp(12px, 2.5vw, 13px)",
                          fontWeight: "500",
                          color: "#cccccc",
                        }}
                      >
                        Fecha fin:
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => {
                          const end = e.target.value;
                          setCustomEndDate(end);
                          if (customStartDate && end && customStartDate > end) {
                            setError("La fecha de fin debe ser posterior a la fecha de inicio");
                          } else {
                            setError(null);
                          }
                        }}
                        disabled={!selectedLocation}
                        min={customStartDate || undefined}
                        className="date-input"
                        style={{
                          padding: "clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)",
                          fontSize: "clamp(14px, 3vw, 16px)",
                          border: "1px solid #555",
                          borderRadius: "4px",
                          width: "100%",
                          maxWidth: "100%",
                          backgroundColor: !selectedLocation ? "#0f0f0f" : "#1a1a1a",
                          color: "#ffffff",
                          cursor: !selectedLocation ? "not-allowed" : "pointer",
                          opacity: !selectedLocation ? 0.6 : 1,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <style jsx>{`
                    .date-input::-webkit-calendar-picker-indicator {
                      cursor: pointer;
                      filter: invert(1);
                      opacity: 0.8;
                      padding: 4px;
                      margin-left: 4px;
                    }
                    .date-input::-webkit-calendar-picker-indicator:hover {
                      opacity: 1;
                    }
                    .date-input::-webkit-datetime-edit-fields-wrapper {
                      color: #ffffff;
                    }
                    .date-input::-webkit-datetime-edit-text {
                      color: #b3b3b3;
                      padding: 0 4px;
                    }
                    .date-input::-webkit-datetime-edit-month-field,
                    .date-input::-webkit-datetime-edit-day-field,
                    .date-input::-webkit-datetime-edit-year-field {
                      color: #ffffff;
                    }
                    .date-input::-moz-placeholder {
                      color: #888;
                    }
                  `}</style>
                </div>
              )}
                </>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{
              padding: "60px 40px",
              textAlign: "center",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              color: "#ffffff",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: "1px solid #333",
              margin: "20px 0",
            }}
          >
            <div style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #333",
              borderTop: "4px solid #ffffff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}></div>
            <div style={{ marginTop: "10px" }}>Cargando información...</div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#330000",
              border: "1px solid #cc0000",
              borderRadius: "4px",
              color: "#ff6666",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && selectedLocationData && salesData.length > 0 && (
          <SalesTable 
            data={salesData} 
            locationName={selectedLocationData.name}
            hasIncomeAccess={userHasIncomeAccess()}
          />
        )}

        {!loading && !error && selectedLocation && salesData.length === 0 && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              fontSize: "16px",
              color: "#cccccc",
              backgroundColor: "#1a1a1a",
              borderRadius: "4px",
            }}
          >
            No hay datos disponibles para la fecha seleccionada.
          </div>
        )}
      </div>
    </main>
  );
}

