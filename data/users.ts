export type City = "Cancún" | "Tulum" | "Vallarta" | "Cabos" | "Playa del Carmen" | "Madrid" | "CDMX" | "FNSM" | "GDL" | "MTY";

export interface User {
  username: string;
  password: string;
  cities: City[];
  venueIds: number[];
  hasIncomeAccess: boolean;
}

export const users: User[] = [
  // Lógica de permisos:
  // - cities: Si el usuario tiene acceso a una ciudad, automáticamente tiene acceso a TODOS los venues de esa ciudad
  // - venueIds: Array vacío [] = acceso a TODOS los venues. Si tiene IDs específicos, solo tiene acceso a esos venues
  // - hasIncomeAccess: true = puede ver la columna TOTAL, false = no puede ver ingresos
  
  // Usuario administrador
  {
    username: "admin",
    password: "admin2024",
    cities: ["Cancún", "Tulum", "Vallarta", "Cabos", "Playa del Carmen", "Madrid"],
    venueIds: [], // Array vacío = acceso a todos los venues
    hasIncomeAccess: true,
  },
  
  // CARLOSC - Admin, acceso a todos los venues
  {
    username: "carlosc",
    password: "carloscastro2025",
    cities: ["Cancún", "Tulum", "Vallarta", "Cabos", "Playa del Carmen", "Madrid"],
    venueIds: [], // Array vacío = acceso a todos los venues
    hasIncomeAccess: true,
  },
  
  // RENNYS - Admin, acceso a todos los venues
  {
    username: "rennys",
    password: "rennys2025",
    cities: ["Cancún", "Tulum", "Vallarta", "Cabos", "Playa del Carmen", "Madrid"],
    venueIds: [], // Array vacío = acceso a todos los venues
    hasIncomeAccess: true,
  },
  
  // ADIIB - Tulum, todos los venues
  {
    username: "adib",
    password: "adib2025",
    cities: ["Tulum"],
    venueIds: [], // Todos los venues de Tulum
    hasIncomeAccess: true,
  },
  
  // COKE - Madrid, todos los venues
  {
    username: "coke",
    password: "coke2025",
    cities: ["Madrid"],
    venueIds: [], // Todos los venues de Madrid
    hasIncomeAccess: true,
  },
  
  // ISMAEL REYNOSO - Cancún, todos los venues
  {
    username: "ismael reynoso",
    password: "ismael2025",
    cities: ["Cancún"],
    venueIds: [], // Todos los venues de Cancún
    hasIncomeAccess: true,
  },
  
  // ROBERTO - Cancún, todos los venues
  {
    username: "roberto",
    password: "roberto2025",
    cities: ["Cancún"],
    venueIds: [], // Todos los venues de Cancún
    hasIncomeAccess: true,
  },
  
  // ELIZABETH - Cabos, todos los venues
  {
    username: "eli",
    password: "eli2025",
    cities: ["Cabos"],
    venueIds: [], // Todos los venues de Cabos
    hasIncomeAccess: true,
  },
  
  // DANIEL ORTEGA - Cancún, solo MB DAY (ID: 3)
  {
    username: "daniel ortega",
    password: "daniel2025",
    cities: [], // No acceso por ciudad, solo por venue específico
    venueIds: [3], // Solo MB DAY
    hasIncomeAccess: true,
  },
  
  // EVARISTO - Cancún, MANDALA (ID: 1), LA VAQUITA (ID: 9), MB NIGHT (ID: 4) y RAKATA (ID: 32)
  {
    username: "evaristo",
    password: "evaristo2025",
    cities: [], // No acceso por ciudad, solo por venues específicos
    venueIds: [1, 9, 4, 32], // MANDALA, LA VAQUITA, MB NIGHT y RAKATA de Cancún
    hasIncomeAccess: true,
  },
  
  // MERTENS - Cancún, solo MANDALA (ID: 1)
  {
    username: "mertens",
    password: "mertens2025",
    cities: [], // No acceso por ciudad, solo por venue específico
    venueIds: [1], // Solo MANDALA de Cancún
    hasIncomeAccess: true,
  },
  
  // LESTER - Tulum, solo Vagalume Tulum (ID: 38)
  {
    username: "lester",
    password: "lester2025",
    cities: [], // No acceso por ciudad, solo por venue específico
    venueIds: [38], // Solo Vagalume Tulum
    hasIncomeAccess: true,
  },
  
  // ESTRELLA - Tulum, solo Vagalume Tulum (ID: 38)
  {
    username: "estrella",
    password: "estrella2025",
    cities: [], // No acceso por ciudad, solo por venue específico
    venueIds: [38], // Solo Vagalume Tulum
    hasIncomeAccess: true,
  },
  
  // SERGE - Tulum, Madrid y Mita Sounds Vallarta (ID: 33)
  {
    username: "serge",
    password: "sergio2025",
    cities: ["Tulum", "Madrid"], // Acceso a todos los venues de Tulum y Madrid
    venueIds: [33], // Mita Sounds Vallarta
    hasIncomeAccess: true,
  },
  
  // GEO AGUILAR - Cancún, solo Rakata (ID: 32)
  {
    username: "geoaguilar",
    password: "GeoA2025",
    cities: [], // No acceso por ciudad, solo por venue específico
    venueIds: [32], // Solo Rakata de Cancún
    hasIncomeAccess: true,
  },
];

export function validateUser(username: string, password: string): User | null {
  // Comparación case-insensitive del username
  const normalizedUsername = username.toLowerCase().trim();
  const user = users.find(
    (u) => u.username.toLowerCase() === normalizedUsername && u.password === password
  );
  return user || null;
}

export function checkCityAccess(user: User, city: City): boolean {
  return user.cities.includes(city);
}

export function checkVenueAccess(user: User, venueId: number): boolean {
  // Si el usuario tiene acceso a todos los venues (array vacío), tiene acceso total
  if (user.venueIds.length === 0) {
    return true;
  }
  
  // Si el venue está específicamente en su lista, tiene acceso
  if (user.venueIds.includes(venueId)) {
    return true;
  }
  
  // Verificar si el usuario tiene acceso a la ciudad del venue
  // Esto se hará en lib/auth.ts usando el mapeo de ciudades
  return false;
}

export function checkIncomeAccess(user: User): boolean {
  return user.hasIncomeAccess;
}

