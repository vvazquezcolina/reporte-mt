"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { locations } from "@/data/events";
import {
  isAuthenticated,
  getCurrentUser,
  userHasVenueAccess,
  logout,
} from "@/lib/auth";
import {
  DateRangeType,
  DashboardFilters,
  fetchVenueSummary,
  VenueSummary,
  ProductBreakdown,
} from "@/lib/mobileDashboard";

export default function MobileDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("today");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>(
    { start: "", end: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VenueSummary | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login?redirect=%2Fmobile-dashboard");
    } else {
      setAuthenticated(true);
      setCurrentUser(getCurrentUser());
    }
  }, [router]);

  const availableLocations = locations.filter((location) => {
    if (!currentUser) return false;
    return userHasVenueAccess(location.id);
  });

  useEffect(() => {
    if (availableLocations.length > 0 && !selectedLocation) {
      setSelectedLocation(availableLocations[0].id);
    }
  }, [availableLocations, selectedLocation]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDateRangeTypeChange = (type: DateRangeType) => {
    setDateRangeType(type);
    if (type !== "range") {
      setCustomRange({ start: "", end: "" });
    }
  };

  const filters: DashboardFilters | null = useMemo(() => {
    if (!selectedLocation) {
      return null;
    }

    if (dateRangeType === "range") {
      if (!customRange.start || !customRange.end) {
        return null;
      }
      return {
        venueId: selectedLocation,
        rangeType: "range",
        startDate: customRange.start,
        endDate: customRange.end,
      };
    }

    return {
      venueId: selectedLocation,
      rangeType: dateRangeType,
    };
  }, [customRange.end, customRange.start, dateRangeType, selectedLocation]);

  useEffect(() => {
    let isActive = true;

    const loadSummary = async () => {
      if (!filters) {
        setSummary(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchVenueSummary(filters);
        if (isActive) {
          setSummary(result);
        }
      } catch (err) {
        console.error("Error loading venue summary", err);
        if (isActive) {
          setError("No pudimos cargar las métricas. Intenta de nuevo.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isActive = false;
    };
  }, [filters]);

  if (!authenticated) {
    return null;
  }

  return (
    <main className="mobile-dashboard">
      <div className="mobile-dashboard__header">
        <div>
          <h1 className="mobile-dashboard__title">Analytics Operativo</h1>
          <p className="mobile-dashboard__subtitle">
            Reservas en tiempo real para decisiones rápidas.
          </p>
        </div>
        <button className="mobile-dashboard__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <section className="mobile-dashboard__filters">
        <div className="mobile-dashboard__card">
          <label className="mobile-dashboard__label" htmlFor="location-select">
            Sede
          </label>
          <select
            id="location-select"
            value={selectedLocation ?? ""}
            onChange={(event) => setSelectedLocation(Number(event.target.value))}
            className="mobile-dashboard__select"
          >
            <option value="" disabled>
              Selecciona una sede
            </option>
            {availableLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mobile-dashboard__card">
          <span className="mobile-dashboard__label">Periodo</span>
          <div className="mobile-dashboard__pill-group">
            {(
              [
                { key: "today", label: "Hoy" },
                { key: "range", label: "Rango" },
                { key: "month", label: "Mes" },
              ] as const
            ).map((option) => {
              const isActive = dateRangeType === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleDateRangeTypeChange(option.key)}
                  className={`mobile-dashboard__pill ${
                    isActive ? "mobile-dashboard__pill--active" : ""
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {dateRangeType === "range" && (
          <div className="mobile-dashboard__card mobile-dashboard__range">
            <div className="mobile-dashboard__range-field">
              <label
                htmlFor="start-date"
                className="mobile-dashboard__label mobile-dashboard__label--small"
              >
                Desde
              </label>
              <input
                id="start-date"
                type="date"
                value={customRange.start}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, start: event.target.value }))
                }
                className="mobile-dashboard__input mobile-dashboard__date-input"
              />
            </div>
            <div className="mobile-dashboard__range-field">
              <label
                htmlFor="end-date"
                className="mobile-dashboard__label mobile-dashboard__label--small"
              >
                Hasta
              </label>
              <input
                id="end-date"
                type="date"
                value={customRange.end}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, end: event.target.value }))
                }
                className="mobile-dashboard__input mobile-dashboard__date-input"
                min={customRange.start || undefined}
              />
            </div>
          </div>
        )}
      </section>

      <section className="mobile-dashboard__stack">
        <SummaryCard
          loading={loading}
          error={error}
          summary={summary}
        />

        <ProductBreakdownCard summary={summary} loading={loading} />

        <TrendCard summary={summary} loading={loading} />

        <TableReservationsCard summary={summary} loading={loading} />
      </section>
      <style jsx>{`
        .mobile-dashboard {
          min-height: 100vh;
          padding: clamp(16px, 4vw, 24px);
          padding-top: calc(clamp(16px, 4vw, 24px) + env(safe-area-inset-top));
          padding-bottom: calc(clamp(16px, 4vw, 24px) + env(safe-area-inset-bottom));
          background: #000000;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 4.5vw, 26px);
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .mobile-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mobile-dashboard__title {
          font-size: clamp(20px, 5vw, 24px);
          font-weight: 600;
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        .mobile-dashboard__subtitle {
          margin: 6px 0 0;
          font-size: 13px;
          color: #b8b8b8;
          line-height: 1.4;
        }

        .mobile-dashboard__logout {
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #333;
          background: linear-gradient(135deg, #1a1a1a, #101010);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          transition: transform 0.15s ease, border-color 0.2s ease;
        }

        .mobile-dashboard__logout:active {
          transform: scale(0.96);
        }

        .mobile-dashboard__logout:hover {
          border-color: #444;
        }

        .mobile-dashboard__filters {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile-dashboard__card {
          background: #0f0f0f;
          border-radius: 18px;
          border: 1px solid #1f1f1f;
          padding: 16px;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
        }

        .mobile-dashboard__label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #f0f0f0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .mobile-dashboard__label--small {
          font-size: 12px;
          margin-bottom: 6px;
        }

        .mobile-dashboard__select,
        .mobile-dashboard__input {
          width: 100%;
          background: #111111;
          color: #ffffff;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .mobile-dashboard__select:focus,
        .mobile-dashboard__input:focus {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.22);
        }

        .mobile-dashboard__date-input {
          cursor: pointer;
          position: relative;
        }

        .mobile-dashboard__date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(1);
          opacity: 0.8;
          padding: 4px;
          margin-left: 4px;
        }

        .mobile-dashboard__date-input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }

        .mobile-dashboard__date-input::-webkit-datetime-edit-fields-wrapper {
          color: #ffffff;
        }

        .mobile-dashboard__date-input::-webkit-datetime-edit-text {
          color: #b3b3b3;
          padding: 0 4px;
        }

        .mobile-dashboard__date-input::-webkit-datetime-edit-month-field,
        .mobile-dashboard__date-input::-webkit-datetime-edit-day-field,
        .mobile-dashboard__date-input::-webkit-datetime-edit-year-field {
          color: #ffffff;
        }

        .mobile-dashboard__pill-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mobile-dashboard__pill {
          flex: 1 1 96px;
          min-width: 96px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid #2b2b2b;
          background: #0c0c0c;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.18s ease;
        }

        .mobile-dashboard__pill--active {
          border-color: #d4af37;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
          transform: translateY(-1px);
        }

        .mobile-dashboard__pill:active {
          transform: scale(0.96);
        }

        .mobile-dashboard__range {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .mobile-dashboard__range-field {
          display: flex;
          flex-direction: column;
        }

        .mobile-dashboard__stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .dashboard-card {
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .dashboard-card__title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .product-breakdown {
          gap: 16px;
        }

        .product-breakdown__header {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .product-breakdown__summary {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          margin-bottom: 12px;
        }

        .product-breakdown__summary-card {
          background: #121212;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .product-breakdown__summary-label {
          display: flex;
          gap: 6px;
        }

        .product-breakdown__summary-label .k {
          color: #b3b3b3;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .product-breakdown__summary-value {
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.01em;
        }

        .product-breakdown__summary-value.mxn {
          font-size: 22px;
        }

        .product-breakdown__table-wrapper {
          overflow-x: auto;
        }

        .product-breakdown__table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #121212;
          border: 1px solid #262626;
          border-radius: 12px;
          overflow: hidden;
          font-size: 12px;
        }

        .product-breakdown__table th,
        .product-breakdown__table td {
          padding: 12px 14px;
          border-bottom: 1px solid #262626;
        }

        .product-breakdown__table th {
          font-size: 12px;
          color: #9b9b9b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #141414;
          text-align: left;
        }

        .product-breakdown__table tr:last-child td {
          border-bottom: none;
        }

        .product-breakdown__table tfoot td {
          font-weight: 700;
          background: #141414;
        }

        .product-breakdown__table tbody td {
          color: #dddddd;
        }

        .product-breakdown__table tbody td.cat {
          color: #ffffff;
          font-weight: 600;
        }

        .product-breakdown__table tbody td.right {
          tab-size: 4;
        }

        .product-breakdown__table .right {
          text-align: right;
        }

        .product-breakdown__table .cat {
          font-weight: 600;
        }

        .pill {
          display: inline-block;
          padding: 0.18rem 0.5rem;
          border: 1px solid #262626;
          border-radius: 999px;
          color: #b3b3b3;
          font-size: 12px;
        }

        .pill--total {
          color: #ffffff;
          border-color: #444444;
        }

        .table-filter-group {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .table-filter-pill {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #333;
          background: transparent;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.18s ease;
        }

        .table-filter-pill--active {
          border-color: #d4af37;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.06));
          transform: translateY(-1px);
        }

        .table-filter-pill:active {
          transform: scale(0.95);
        }

        @media (min-width: 640px) {
          .mobile-dashboard {
            max-width: 640px;
            margin: 0 auto;
          }

          .mobile-dashboard__header {
            align-items: center;
          }
        }
      `}</style>
    </main>
  );
}

interface PlaceholderCardProps {
  title: string;
  children: React.ReactNode;
}

function PlaceholderCard({ title, children }: PlaceholderCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#0f0f0f",
        border: "1px solid #1f1f1f",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontSize: "11px",
            color: "#8c8c8c",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Próximamente
        </span>
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "#c2c2c2",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

interface SummaryCardProps {
  loading: boolean;
  error: string | null;
  summary: VenueSummary | null;
}

function SummaryCard({ loading, error, summary }: SummaryCardProps) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card__title">
        Resumen general
      </h2>

      {loading && <CardMessage>Calculando métricas...</CardMessage>}

      {!loading && error && <CardMessage>{error}</CardMessage>}

      {!loading && !error && !summary && (
        <CardMessage>Selecciona una sede y periodo para ver los datos.</CardMessage>
      )}

      {!loading && !error && summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
          }}
        >
          <MetricCard
            label="Reservas"
            value={summary.totalReservations.toString()}
            tooltip="Total de reservas confirmadas en el periodo seleccionado"
          />
          <MetricCard
            label="Personas"
            value={summary.totalGuests.toString()}
            tooltip="Total de personas estimadas según las reservas"
          />
          <MetricCard
            label="Ingresos"
            value={`$${summary.estimatedRevenue.toLocaleString("es-MX")}`}
            tooltip="Ingresos estimados por las reservas confirmadas"
          />
        </div>
      )}
    </div>
  );
}

interface TrendCardProps {
  summary: VenueSummary | null;
  loading: boolean;
}

function TrendCard({ summary, loading }: TrendCardProps) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card__title">
        Tendencia diaria
      </h2>

      {loading && <CardMessage>Cargando tendencia...</CardMessage>}

      {!loading && (!summary || summary.reservationsByDay.length === 0) && (
        <CardMessage>Sin datos suficientes para mostrar la tendencia.</CardMessage>
      )}

      {!loading && summary && summary.reservationsByDay.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {summary.reservationsByDay.map((day) => (
            <div
              key={day.date}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                backgroundColor: "#141414",
                borderRadius: "12px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {formatDateLabel(day.date)}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#a5a5a5",
                  }}
                >
                  {day.reservations} reservas · {day.guests} personas
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#d4af37",
                }}
              >
                ${day.revenue.toLocaleString("es-MX")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TableReservationsCardProps {
  summary: VenueSummary | null;
  loading: boolean;
}

interface ProductBreakdownCardProps {
  summary: VenueSummary | null;
  loading: boolean;
}

const PRODUCT_CONFIG = [
  { key: "cover", label: "Covers / General" },
  { key: "consumo", label: "Consumos" },
  { key: "paquete", label: "Paquetes" },
] as const;

function ProductBreakdownCard({ summary, loading }: ProductBreakdownCardProps) {
  const breakdown = summary?.productBreakdown;

  if (loading) {
    return (
      <div className="dashboard-card product-breakdown">
        <CardMessage>Calculando desglose...</CardMessage>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="dashboard-card product-breakdown">
        <CardMessage>Selecciona una sede y periodo para ver la mezcla de productos.</CardMessage>
      </div>
    );
  }

  const rows = PRODUCT_CONFIG.map(({ key, label }) => {
    const data = breakdown[key];
    const share = breakdown.total.revenue
      ? Math.round((data.revenue / breakdown.total.revenue) * 100)
      : 0;
    const ticket = data.guests > 0 ? data.revenue / data.guests : 0;
    return {
      key,
      label,
      reservations: data.reservations,
      guests: data.guests,
      revenue: data.revenue,
      share,
      ticket,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="dashboard-card product-breakdown">
      <header className="product-breakdown__header">
        <h2 className="dashboard-card__title">Desglose por categorías</h2>
      </header>

      <section className="product-breakdown__summary">
        <div className="product-breakdown__summary-card">
          <div className="product-breakdown__summary-label">
            <span className="k">Reservas:</span>
            <span className="product-breakdown__summary-value">
              {breakdown.total.reservations.toLocaleString("es-MX")}
            </span>
          </div>
        </div>
        <div className="product-breakdown__summary-card">
          <div className="product-breakdown__summary-label">
            <span className="k">Personas:</span>
            <span className="product-breakdown__summary-value">
              {breakdown.total.guests.toLocaleString("es-MX")}
            </span>
          </div>
        </div>
        <div className="product-breakdown__summary-card">
          <div className="product-breakdown__summary-label">
            <span className="k">Ingresos:</span>
            <span className="product-breakdown__summary-value mxn">
              {formatCurrency(breakdown.total.revenue)}
            </span>
          </div>
        </div>
      </section>

      <div className="product-breakdown__table-wrapper">
        <table className="product-breakdown__table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th className="right">% de ingresos</th>
              <th className="right">Reservas</th>
              <th className="right">Personas</th>
              <th className="right">Ingresos</th>
              <th className="right">Ticket / persona</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="cat">{row.label}</td>
                <td className="right">
                  <span className="pill">{row.share}%</span>
                </td>
                <td className="right">{row.reservations.toLocaleString("es-MX")}</td>
                <td className="right">{row.guests.toLocaleString("es-MX")}</td>
                <td className="right">{formatCurrency(row.revenue)}</td>
                <td className="right">{row.ticket ? formatCurrency(row.ticket) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="cat">Total</td>
              <td className="right">
                <span className="pill pill--total">100%</span>
              </td>
              <td className="right">{breakdown.total.reservations.toLocaleString("es-MX")}</td>
              <td className="right">{breakdown.total.guests.toLocaleString("es-MX")}</td>
              <td className="right">{formatCurrency(breakdown.total.revenue)}</td>
              <td className="right">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function TableReservationsCard({ summary, loading }: TableReservationsCardProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmada" | "pendiente" | "sentada"
  >("all");

  useEffect(() => {
    setStatusFilter("all");
  }, [summary?.venueId, summary?.tableReservations.length]);

  const filteredReservations = useMemo(() => {
    if (!summary) return [];
    if (statusFilter === "all") return summary.tableReservations;
    return summary.tableReservations.filter(
      (reservation) => reservation.status === statusFilter
    );
  }, [statusFilter, summary]);

  return (
    <div className="dashboard-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h2 className="dashboard-card__title">
          Reservas por mesa
        </h2>
        <span
          style={{
            fontSize: "11px",
            color: "#8c8c8c",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          En vivo
        </span>
      </div>

      {!loading && summary && summary.tableReservations.length > 0 && (
        <div className="table-filter-group">
          {(
            [
              { key: "all", label: "Todas" },
              { key: "confirmada", label: "Confirmadas" },
              { key: "pendiente", label: "Pendientes" },
              { key: "sentada", label: "Sentadas" },
            ] as const
          ).map((option) => {
            const isActive = statusFilter === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setStatusFilter(option.key)}
                className={`table-filter-pill ${
                  isActive ? "table-filter-pill--active" : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {loading && <CardMessage>Descargando reservas...</CardMessage>}

      {!loading && (!summary || summary.tableReservations.length === 0) && (
        <CardMessage>No hay reservas de mesa para el periodo seleccionado.</CardMessage>
      )}

      {!loading && summary && summary.tableReservations.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {filteredReservations.map((table) => (
            <div
              key={`${table.tableId}-${table.checkInTime}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "12px",
                borderRadius: "12px",
                backgroundColor: "#141414",
                border: "1px solid #1f1f1f",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {table.tableId}
                </span>
                <StatusPill status={table.status} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#b3b3b3",
                }}
              >
                <span>
                  {table.guests} personas · {table.area}
                </span>
                <span>Check-in {table.checkInTime}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                  fontSize: "12px",
                  color: "#cfcfcf",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{table.hostName}</span>
                  <a
                    href={`tel:${table.contactPhone.replace(/[^\d+]/g, "")}`}
                    style={{
                      color: "#d4af37",
                      textDecoration: "none",
                    }}
                  >
                    {table.contactPhone}
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                    textAlign: "right",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#a5a5a5" }}>
                    Mínimo consumo
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(table.minimumSpend)}
                  </span>
                </div>
              </div>
              {table.notes && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: "#1a1a1a",
                    color: "#bdbdbd",
                    fontSize: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {table.notes}
                </div>
              )}
            </div>
          ))}
          {filteredReservations.length === 0 && (
            <CardMessage>
              No hay reservas con el estado seleccionado. Cambia el filtro para ver más mesas.
            </CardMessage>
          )}
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  tooltip?: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#141414",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#b3b3b3",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface StatusPillProps {
  status: "confirmada" | "pendiente" | "sentada";
}

function StatusPill({ status }: StatusPillProps) {
  const statusConfig: Record<StatusPillProps["status"], { label: string; color: string; background: string }> = {
    confirmada: {
      label: "Confirmada",
      color: "#34d399",
      background: "rgba(52, 211, 153, 0.1)",
    },
    pendiente: {
      label: "Pendiente",
      color: "#fbbf24",
      background: "rgba(251, 191, 36, 0.1)",
    },
    sentada: {
      label: "Sentada",
      color: "#60a5fa",
      background: "rgba(96, 165, 250, 0.1)",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "999px",
        color: config.color,
        backgroundColor: config.background,
      }}
    >
      {config.label}
    </span>
  );
}

interface CardMessageProps {
  children: React.ReactNode;
}

function CardMessage({ children }: CardMessageProps) {
  return (
    <p
      style={{
        fontSize: "13px",
        color: "#c2c2c2",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}


