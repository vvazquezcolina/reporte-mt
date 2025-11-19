"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams?.get("redirect") || "/";

  useEffect(() => {
    // Si ya está autenticado, redirigir a la página principal
    if (isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = login(username, password);
    
    if (user) {
      router.push(redirectTo);
    } else {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#000000",
      padding: "clamp(16px, 4vw, 20px)"
    }}>
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "clamp(24px, 6vw, 40px)",
        borderRadius: "8px",
        border: "1px solid #333",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h1 style={{
          fontSize: "clamp(20px, 5vw, 24px)",
          fontWeight: "600",
          marginBottom: "clamp(24px, 5vw, 30px)",
          color: "#ffffff",
          textAlign: "center"
        }}>
          Iniciar Sesión
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "clamp(13px, 2.5vw, 14px)",
                fontWeight: "500",
                color: "#ffffff",
              }}
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "clamp(10px, 2vw, 12px)",
                fontSize: "clamp(14px, 3vw, 16px)",
                border: "1px solid #555",
                borderRadius: "4px",
                backgroundColor: "#000000",
                color: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "clamp(24px, 5vw, 30px)" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "clamp(13px, 2.5vw, 14px)",
                fontWeight: "500",
                color: "#ffffff",
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "clamp(10px, 2vw, 12px)",
                fontSize: "clamp(14px, 3vw, 16px)",
                border: "1px solid #555",
                borderRadius: "4px",
                backgroundColor: "#000000",
                color: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#330000",
                border: "1px solid #cc0000",
                borderRadius: "4px",
                color: "#ff6666",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "clamp(10px, 2vw, 12px)",
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: "600",
              backgroundColor: loading ? "#555" : "#0066cc",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#0052a3";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#0066cc";
              }
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#000000",
        padding: "20px"
      }}>
        <div style={{ color: "#ffffff" }}>Cargando...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}


