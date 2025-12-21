import { City } from "./users";

// Mapeo de ciudades a venue IDs basado en SUCURSALES MT.csv
export const cityToVenueIds: Record<City, number[]> = {
  "Cancún": [1, 2, 3, 4, 6, 7, 9, 22, 32, 53, 92], // CANCUN
  "Tulum": [36, 37, 38, 41, 51], // TULUM
  "Vallarta": [14, 15, 16, 17, 24, 25, 27, 33, 34, 39, 40], // PVR
  "Cabos": [18, 20], // CABO
  "Playa del Carmen": [10, 12, 13, 29, 30], // PDC
  "Madrid": [55, 56], // MADRID
  "CDMX": [50, 57], // CDMX
  "FNSM": [43, 44, 45, 46], // Feria Nacional de San Marcos
  "GDL": [35, 42, 52, 54], // Guadalajara
  "MTY": [47, 48, 49], // Monterrey
};

// Mapeo de venue IDs a ciudades (para lookup inverso)
export const venueIdToCity: Record<number, City> = {
  // Cancún
  1: "Cancún", // MANDALA
  2: "Cancún", // THE CITY
  3: "Cancún", // MB DAY
  4: "Cancún", // MB NIGHT
  6: "Cancún", // D'CAVE
  7: "Cancún", // SR FROGS
  9: "Cancún", // LA VAQUITA
  22: "Cancún", // ABOLENGO
  32: "Cancún", // RAKATA
  53: "Cancún", // HOF
  92: "Cancún", // RESET
  
  // Tulum
  36: "Tulum", // TEHMPLO
  37: "Tulum", // BONBONNIERE
  38: "Tulum", // VAGALUME
  41: "Tulum", // BAGATELLE
  51: "Tulum", // TEHMPLO F&F
  
  // Vallarta (PVR)
  14: "Vallarta", // MANDALA
  15: "Vallarta", // LA SANTA
  16: "Vallarta", // LA VAQUITA
  17: "Vallarta", // SKY
  24: "Vallarta", // SR FROGS
  25: "Vallarta", // BIBLIOTECA
  27: "Vallarta", // CHICABAL
  33: "Vallarta", // MITA SOUNDS
  34: "Vallarta", // MAJAHUITAS
  39: "Vallarta", // RAKATA
  40: "Vallarta", // DOROTHY
  
  // Cabos
  18: "Cabos", // MANDALA
  20: "Cabos", // LA VAQUITA
  
  // Playa del Carmen (PDC)
  10: "Playa del Carmen", // MANDALA
  12: "Playa del Carmen", // LA VAQUITA
  13: "Playa del Carmen", // ABOLENGO
  29: "Playa del Carmen", // SANTITO
  30: "Playa del Carmen", // RAKATA
  
  // Madrid
  55: "Madrid", // HOUDINNI
  56: "Madrid", // SALA DE DESPECHO

  // CDMX
  50: "CDMX", // RIVIERA POLANCO
  57: "CDMX", // BAGATELLE CDMX

  // FNSM (Aguascalientes)
  43: "FNSM", // DOROTHY
  44: "FNSM", // LA SANTA
  45: "FNSM", // MALLET
  46: "FNSM", // RAKATA

  // Guadalajara (GDL)
  35: "GDL", // NADIM
  42: "GDL", // DOROTHY
  52: "GDL", // SPADE
  54: "GDL", // SRA TANAKA

  // Monterrey (MTY)
  47: "MTY", // BYU
  48: "MTY", // RAKATA
  49: "MTY", // COSMO
};

// Función helper para obtener la ciudad de un venue ID
export function getCityByVenueId(venueId: number): City | null {
  return venueIdToCity[venueId] || null;
}

// Función helper para obtener todos los venue IDs de una ciudad
export function getVenueIdsByCity(city: City): number[] {
  return cityToVenueIds[city] || [];
}

