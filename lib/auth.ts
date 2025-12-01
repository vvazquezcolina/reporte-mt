"use client";

import { validateUser, User, checkIncomeAccess } from "@/data/users";
import { getCityByVenueId, getVenueIdsByCity } from "@/data/cities";
import { City } from "@/data/users";

const STORAGE_KEY = "mt_user_session";

export function login(username: string, password: string): User | null {
  const user = validateUser(username, password);
  
  if (user) {
    // Guardar usuario en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  }
  
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  const session = localStorage.getItem(STORAGE_KEY);
  return session !== null;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  const session = localStorage.getItem(STORAGE_KEY);
  if (!session) {
    return null;
  }
  
  try {
    return JSON.parse(session) as User;
  } catch {
    return null;
  }
}

export function userHasVenueAccess(venueId: number): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  // PRIMERO: Verificar si el usuario tiene acceso por ciudad
  // Si tiene ciudades definidas, solo tiene acceso a venues de esas ciudades
  if (user.cities.length > 0) {
    const city = getCityByVenueId(venueId);
    if (city && user.cities.includes(city)) {
      // Si tiene acceso a la ciudad, verificar que el venue pertenece a esa ciudad
      const cityVenueIds = getVenueIdsByCity(city);
      if (cityVenueIds.includes(venueId)) {
        // Si además tiene venueIds específicos, verificar que el venue esté en la lista
        if (user.venueIds.length > 0) {
          return user.venueIds.includes(venueId);
        }
        // Si venueIds está vacío, tiene acceso a todos los venues de esa ciudad
        return true;
      }
    }
    // Si el venue no pertenece a ninguna de sus ciudades, no tiene acceso
    return false;
  }
  
  // SEGUNDO: Si NO tiene ciudades definidas, verificar por venueIds
  // Si el usuario tiene venueIds específicos, solo tiene acceso a esos venues
  if (user.venueIds.length > 0) {
    return user.venueIds.includes(venueId);
  }
  
  // Si no tiene ciudades NI venueIds específicos, tiene acceso total (solo para admin)
  // Esto solo debería pasar si el usuario no tiene restricciones
  return true;
}

export function userHasIncomeAccess(): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  return checkIncomeAccess(user);
}

export function userCanAccessDate(date: string): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  // Si el usuario no tiene restricción de fechas, puede acceder a cualquier fecha
  if (!user.allowedDates || user.allowedDates.length === 0) {
    return true;
  }
  
  // Verificar si la fecha está en la lista de fechas permitidas
  return user.allowedDates.includes(date);
}

export function getUserAllowedDates(): string[] {
  const user = getCurrentUser();
  if (!user || !user.allowedDates || user.allowedDates.length === 0) {
    return []; // Sin restricciones = array vacío
  }
  
  return user.allowedDates;
}

export function hasDateRestrictions(): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  return !!(user.allowedDates && user.allowedDates.length > 0);
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
