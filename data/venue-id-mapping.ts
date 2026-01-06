// Mapeo de IDs antiguos a nuevos row_id de la tabla antromex_sucursales
// Solo incluye los venues que están actualmente en uso (no los nuevos)
export const oldIdToNewId: Record<number, number> = {
  // Cancún
  1: 1,   // Mandala Cancún -> row_id 1
  2: 2,   // The City Cancún -> row_id 2 (oculto)
  3: 3,   // MB Day Cancún -> row_id 3
  4: 4,   // MB Night Cancún -> row_id 4
  6: 6,   // D'Cave Cancún -> row_id 6
  7: 7,   // Sr. Frogs Cancún -> row_id 7
  9: 9,   // La Vaquita Cancún -> row_id 9
  22: 27, // Abolengo Cancún -> row_id 27 (ABOLENGO VALLARTA en SQL - usar el más cercano disponible)
  32: 8,  // Rakata Cancún -> row_id 8
  53: 21, // HOF Cancún -> row_id 21
  92: 92, // Reset Cancún -> row_id 92
  
  // Playa del Carmen
  10: 11, // Mandala Playa -> row_id 11
  12: 12, // La Vaquita Playa -> row_id 12
  13: 10, // Abolengo Playa -> row_id 10 (ABOLENGO PLAYA en SQL)
  29: 16, // Santito Playa -> row_id 16
  30: 35, // Rakata Playa -> row_id 35 (oculto)
  
  // Vallarta
  14: 14, // Mandala Vallarta -> row_id 14
  15: 28, // La Santa Vallarta -> row_id 28
  16: 29, // La Vaquita Vallarta -> row_id 29
  17: 30, // Sky Vallarta -> row_id 30 (SKY MANDALA VALLARTA en SQL, oculto)
  24: 32, // Sr. Frogs Vallarta -> row_id 32
  25: 31, // Biblioteca Vallarta -> row_id 31 (BIBLIOTECA VALLARTA en SQL, oculto)
  27: 36, // Chicabal Vallarta -> row_id 36
  33: 51, // Mita Sounds Vallarta -> row_id 51
  34: 52, // Majahuitas Vallarta -> row_id 52 (MAJAHUITAS VALLARTA en SQL, oculto)
  39: 56, // Rakata Vallarta -> row_id 56
  40: 38, // Dorothy Vallarta -> row_id 38 (oculto)
  
  // Cabos
  18: 23, // Mandala Cabos -> row_id 23
  20: 26, // La Vaquita Cabos -> row_id 26
  
  // Tulum
  36: 55, // TehMplo Tulum -> row_id 55 (oculto)
  37: 39, // Bonbonniere Tulum -> row_id 39
  38: 41, // Vagalume Tulum -> row_id 41
  41: 37, // Bagatelle Tulum -> row_id 37
  51: 55, // TehMplo F&F Tulum -> row_id 55 (oculto, mismo que 36)
  
  // Madrid
  55: 89, // Houdinni Madrid -> row_id 89
  56: 90, // Sala de Despecho Madrid -> row_id 90
  
  // CDMX
  50: 78, // Riviera Polanco CDMX -> row_id 78
  57: 57, // Bagatelle CDMX -> row_id 57
  
  // FNSM
  43: 43, // Dorothy FNSM -> row_id 43
  44: 44, // La Santa FNSM -> row_id 44
  45: 45, // Mallet FNSM -> row_id 45
  46: 46, // Rakata FNSM -> row_id 46
  
  // GDL
  35: 54, // Nadim GDL -> row_id 54
  42: 42, // Dorothy GDL -> row_id 42
  52: 85, // Spade GDL -> row_id 85
  54: 54, // Sra Tanaka GDL -> row_id 54 (NADIM GDL en SQL - mantener mismo ID ya que no hay Sra Tanaka en SQL)
  
  // MTY
  47: 69, // BYU MTY -> row_id 69
  48: 70, // Rakata MTY -> row_id 70
  49: 71, // Cosmo MTY -> row_id 71
};

// Mapeo inverso: nuevo ID -> ID antiguo (para compatibilidad)
export const newIdToOldId: Record<number, number> = Object.fromEntries(
  Object.entries(oldIdToNewId).map(([old, newId]) => [newId, parseInt(old)])
);

// Función para convertir ID antiguo a nuevo
export function convertOldIdToNew(oldId: number): number {
  return oldIdToNewId[oldId] ?? oldId;
}

// Función para convertir ID nuevo a antiguo
export function convertNewIdToOld(newId: number): number {
  return newIdToOldId[newId] ?? newId;
}

