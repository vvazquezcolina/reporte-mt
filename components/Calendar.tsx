"use client";

import { useState, useEffect, useRef } from "react";

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

export default function Calendar({ value, onChange, disabled = false }: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Inicializar mes actual basado en la fecha seleccionada
  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    } else {
      setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    }
  }, [value]);

  const formatDate = (date: string): string => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  // Días vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div ref={calendarRef} style={{ position: "relative", display: "inline-block" }}>
      <input
        type="text"
        value={value ? formatDate(value) : ""}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        readOnly
        disabled={disabled}
        placeholder="Selecciona una fecha"
        style={{
          padding: "clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)",
          fontSize: "clamp(14px, 3vw, 16px)",
          border: "1px solid #555",
          borderRadius: "4px",
          width: "100%",
          minWidth: "200px",
          maxWidth: "100%",
          backgroundColor: disabled ? "#0f0f0f" : "#1a1a1a",
          color: "#ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          boxSizing: "border-box",
        }}
      />

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "8px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #555",
            borderRadius: "8px",
            padding: "clamp(16px, 3vw, 20px)",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            minWidth: "280px",
            maxWidth: "100vw",
          }}
        >
          {/* Header del calendario */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => navigateMonth("prev")}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #555",
                color: "#ffffff",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#333";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ‹
            </button>
            <h3
              style={{
                color: "#ffffff",
                fontSize: "clamp(16px, 3vw, 18px)",
                fontWeight: "600",
                margin: 0,
              }}
            >
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth("next")}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #555",
                color: "#ffffff",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#333";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ›
            </button>
          </div>

          {/* Días de la semana */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#888",
                  padding: "8px 4px",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
            }}
          >
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth() + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  style={{
                    padding: "clamp(8px, 1.5vw, 10px)",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    aspectRatio: "1",
                    border: isSelected ? "2px solid #4a9eff" : "1px solid #333",
                    borderRadius: "4px",
                    backgroundColor: isSelected
                      ? "#4a9eff"
                      : isToday
                      ? "#333"
                      : "transparent",
                    color: isSelected ? "#ffffff" : "#ffffff",
                    cursor: "pointer",
                    fontWeight: isToday ? "600" : "normal",
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "#333";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isToday ? "#333" : "transparent";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


