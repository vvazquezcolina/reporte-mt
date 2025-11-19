"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth";
import { users } from "@/data/users";

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login?redirect=%2Fadmin");
    } else {
      const user = getCurrentUser();
      // Solo permitir acceso si el usuario es "admin"
      if (user && user.username.toLowerCase() === "admin") {
        setAuthenticated(true);
        setCurrentUser(user);
      } else {
        // Si no es admin, redirigir a la página principal
        router.push("/");
      }
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleBack = () => {
    router.push("/");
  };

  if (!authenticated) {
    return null;
  }

  return (
    <main style={{ minHeight: "100vh", padding: "20px", backgroundColor: "#000000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", color: "#ffffff", margin: 0 }}>
            Panel de Administración
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {currentUser && (
              <span style={{ color: "#cccccc", fontSize: "14px" }}>
                Usuario: {currentUser.username}
              </span>
            )}
            <button
              onClick={handleBack}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#333",
                color: "#ffffff",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Volver
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#333",
                color: "#ffffff",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: "#1a1a1a",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #333",
          marginBottom: "30px",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#ffffff" }}>
            Instrucciones para Editar Usuarios
          </h2>
          <p style={{ color: "#cccccc", marginBottom: "15px", lineHeight: "1.6" }}>
            Para agregar, modificar o eliminar usuarios, edita manualmente el archivo:
          </p>
          <code style={{
            display: "block",
            padding: "15px",
            backgroundColor: "#000000",
            borderRadius: "4px",
            color: "#00ff00",
            marginBottom: "15px",
            fontSize: "14px",
            border: "1px solid #333",
          }}>
            data/users.ts
          </code>
          <p style={{ color: "#cccccc", lineHeight: "1.6" }}>
            Después de editar el archivo, haz commit y push a tu repositorio. Los cambios se reflejarán después del próximo deploy en Vercel.
          </p>
        </div>

        <div style={{
          backgroundColor: "#1a1a1a",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #333",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#ffffff" }}>
            Usuarios Registrados
          </h2>
          
          {users.length === 0 ? (
            <p style={{ color: "#cccccc" }}>No hay usuarios registrados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {users.map((user, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#000000",
                    padding: "20px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "5px" }}>
                        {user.username}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#999999", margin: 0 }}>
                        Contraseña: {user.password}
                      </p>
                    </div>
                    <div style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      backgroundColor: user.hasIncomeAccess ? "#003300" : "#330000",
                      color: user.hasIncomeAccess ? "#00ff00" : "#ff6666",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}>
                      {user.hasIncomeAccess ? "Acceso a Ingresos" : "Sin Acceso a Ingresos"}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#ffffff", fontSize: "14px" }}>Ciudades:</strong>
                    <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {user.cities.length === 0 ? (
                        <span style={{ color: "#999999", fontSize: "14px" }}>Ninguna</span>
                      ) : (
                        user.cities.map((city, cityIndex) => (
                          <span
                            key={cityIndex}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "#2a2a2a",
                              borderRadius: "4px",
                              color: "#ffffff",
                              fontSize: "12px",
                            }}
                          >
                            {city}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "14px" }}>Venue IDs:</strong>
                    <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {user.venueIds.length === 0 ? (
                        <span style={{ color: "#999999", fontSize: "14px" }}>Todos los venues</span>
                      ) : (
                        user.venueIds.map((venueId, venueIndex) => (
                          <span
                            key={venueIndex}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "#2a2a2a",
                              borderRadius: "4px",
                              color: "#ffffff",
                              fontSize: "12px",
                            }}
                          >
                            {venueId}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

