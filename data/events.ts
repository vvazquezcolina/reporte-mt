export interface Event {
  date: string; // Format: YYYY-MM-DD
  name: string;
}

export interface Location {
  id: number;
  name: string;
  events: Event[];
}

const createLocation = (id: number, name: string, events: Event[] = []): Location => ({
  id,
  name,
  events,
});

const cancunLocations: Location[] = [
  createLocation(1, "Mandala Cancún"),
  createLocation(2, "The City Cancún"),
  createLocation(3, "MB Day Cancún"),
  createLocation(4, "MB Night Cancún"),
  createLocation(6, "D'Cave Cancún"),
  createLocation(7, "Sr. Frogs Cancún"),
  createLocation(9, "La Vaquita Cancún"),
  createLocation(22, "Abolengo Cancún"),
  createLocation(32, "Rakata Cancún"),
  createLocation(53, "HOF Cancún"),
  createLocation(92, "Reset Cancún"),
];

const playaLocations: Location[] = [
  createLocation(10, "Mandala Playa del Carmen"),
  createLocation(12, "La Vaquita Playa del Carmen"),
  createLocation(13, "Abolengo Playa del Carmen"),
  createLocation(29, "Santito Playa del Carmen"),
  createLocation(30, "Rakata Playa del Carmen"),
];

const vallartaLocations: Location[] = [
  createLocation(14, "Mandala Vallarta"),
  createLocation(15, "La Santa Vallarta"),
  createLocation(16, "La Vaquita Vallarta"),
  createLocation(17, "Sky Vallarta"),
  createLocation(24, "Sr. Frogs Vallarta"),
  createLocation(25, "Biblioteca Vallarta"),
  createLocation(27, "Chicabal Vallarta"),
  createLocation(33, "Mita Sounds Vallarta"),
  createLocation(34, "Majahuitas Vallarta"),
  createLocation(39, "Rakata Vallarta"),
  createLocation(40, "Dorothy Vallarta"),
];

const caboLocations: Location[] = [
  createLocation(18, "Mandala Cabos"),
  createLocation(20, "La Vaquita Cabos"),
];

const madridLocations: Location[] = [
  createLocation(55, "Houdinni Madrid"),
  createLocation(56, "Sala de Despecho Madrid"),
];

const cdmxLocations: Location[] = [
  createLocation(50, "Riviera Polanco CDMX"),
  createLocation(57, "Bagatelle CDMX"),
];

const fnsmLocations: Location[] = [
  createLocation(43, "Dorothy FNSM"),
  createLocation(44, "La Santa FNSM"),
  createLocation(45, "Mallet FNSM"),
  createLocation(46, "Rakata FNSM"),
];

const gdlLocations: Location[] = [
  createLocation(35, "Nadim GDL"),
  createLocation(42, "Dorothy GDL"),
  createLocation(52, "Spade GDL"),
  createLocation(54, "Sra Tanaka GDL"),
];

const mtyLocations: Location[] = [
  createLocation(47, "BYU MTY"),
  createLocation(48, "Rakata MTY"),
  createLocation(49, "Cosmo MTY"),
];

const tulumLocations: Location[] = [
  createLocation(36, "TehMplo Tulum"),
  createLocation(37, "Bonbonniere Tulum", [
    // November 2025
    { date: "2025-11-06", name: "Cuevas" },
    { date: "2025-11-07", name: "Xandro" },
    { date: "2025-11-08", name: "Cuevas" },
    { date: "2025-11-09", name: "REBIRTH" },
    { date: "2025-11-13", name: "Xandro" },
    { date: "2025-11-14", name: "Xandro" },
    { date: "2025-11-15", name: "Xandro" },
    { date: "2025-11-16", name: "Ancestral Soul" },
    { date: "2025-11-20", name: "Mr Belt & Wezol" },
    { date: "2025-11-21", name: "Xandro" },
    { date: "2025-11-22", name: "Benja" },
    { date: "2025-11-23", name: "Ancestral Soul" },
    { date: "2025-11-27", name: "Cameron Jack" },
    { date: "2025-11-28", name: "Lazare" },
    { date: "2025-11-29", name: "Cuevas" },
    { date: "2025-11-30", name: "Ancestral Soul" },
    // December 2025
    { date: "2025-12-04", name: "Levi" },
    { date: "2025-12-05", name: "Victor ALC" },
    { date: "2025-12-27", name: "DJ MAG" },
    { date: "2025-12-29", name: "Planet B - Nic Fanciulli" },
    { date: "2025-12-31", name: "New Year's Eve 2026" },
    // 2026
    { date: "2026-01-14", name: "Magic Carpet" },
  ]),
  createLocation(38, "Vagalume Tulum", [
    // November 2025
    { date: "2025-11-05", name: "Vagalume Residents" },
    { date: "2025-11-06", name: "Vagalume Sessions" },
    { date: "2025-11-07", name: "Vagalume Presents" },
    { date: "2025-11-08", name: "Disorder" },
    { date: "2025-11-09", name: "Sundaze x TLT" },
    { date: "2025-11-11", name: "Vagalume Residents" },
    { date: "2025-11-12", name: "Rythmia" },
    { date: "2025-11-13", name: "Vagalume Sessions" },
    { date: "2025-11-14", name: "Ten Ibiza" },
    { date: "2025-11-15", name: "Disorder" },
    { date: "2025-11-16", name: "Sundaze x TLT" },
    { date: "2025-11-18", name: "Vagalume Residents" },
    { date: "2025-11-19", name: "Dominik" },
    { date: "2025-11-20", name: "GALA IBIZA @ VAGALUME" },
    { date: "2025-11-21", name: "Vagalume Presents" },
    { date: "2025-11-22", name: "Skybar" },
    { date: "2025-11-23", name: "Sundaze x TLT" },
    { date: "2025-11-25", name: "Vagalume Residents" },
    { date: "2025-11-26", name: "Laga Records" },
    { date: "2025-11-27", name: "Vagalume Sessions" },
    { date: "2025-11-28", name: "Pendulum" },
    { date: "2025-11-29", name: "Disorder" },
    { date: "2025-11-30", name: "Sundaze x TLT" },
    // December 2025
    { date: "2025-12-06", name: "Sinner" },
    { date: "2025-12-07", name: "Elysium" },
    { date: "2025-12-11", name: "GALA IBIZA @ VAGALUME" },
    { date: "2025-12-13", name: "Sinner" },
    { date: "2025-12-14", name: "Elysium" },
    { date: "2025-12-18", name: "Pendulum" },
    { date: "2025-12-20", name: "Sinner" },
    { date: "2025-12-21", name: "Elysium" },
    { date: "2025-12-27", name: "Sinner" },
    { date: "2025-12-28", name: "Elysium" },
    { date: "2025-12-31", name: "NYE 2026" },
    // 2026
    { date: "2026-01-15", name: "Pendulum" },
    { date: "2026-01-17", name: "COCOON x SINNER" },
    { date: "2026-01-18", name: "SOMETHINGNU" },
    { date: "2026-01-22", name: "GALA IBIZA @ VAGALUME" },
    { date: "2026-02-05", name: "GALA IBIZA @ VAGALUME" },
    { date: "2026-02-12", name: "Pendulum" },
    { date: "2026-03-19", name: "GALA IBIZA @ VAGALUME" },
    { date: "2026-03-26", name: "Pendulum" },
    { date: "2026-04-09", name: "Pendulum" },
    { date: "2026-04-16", name: "GALA IBIZA @ VAGALUME" },
    { date: "2026-05-07", name: "Pendulum" },
    { date: "2026-06-11", name: "Pendulum" },
  ]),
  createLocation(41, "Bagatelle Tulum", [
    { date: "2026-01-02", name: "Cloone" },
    { date: "2026-01-05", name: "Dombresky" },
    { date: "2026-01-08", name: "MONOLINK" },
  ]),
  createLocation(51, "TehMplo F&F Tulum"),
];

// IDs de venues que no se están utilizando y deben estar ocultos
const HIDDEN_VENUE_IDS: number[] = [
  2,  // The City Cancún
  13, // Abolengo Playa del Carmen
  17, // Sky Vallarta
  22, // Abolengo Cancún
  25, // Biblioteca Vallarta
  30, // Rakata Playa del Carmen
  34, // Majahuitas Vallarta
  36, // TehMplo Tulum
  40, // Dorothy Vallarta
  51, // TehMplo F&F Tulum
];

export const locations: Location[] = [
  ...cancunLocations,
  ...playaLocations,
  ...vallartaLocations,
  ...caboLocations,
  ...madridLocations,
  ...cdmxLocations,
  ...fnsmLocations,
  ...gdlLocations,
  ...mtyLocations,
  ...tulumLocations,
].filter((location) => !HIDDEN_VENUE_IDS.includes(location.id));


