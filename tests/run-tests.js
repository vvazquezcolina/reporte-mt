/**
 * Script simple para ejecutar los tests de datos aleatorios
 * Ejecutar con: node tests/run-tests.js
 */

// Simular el módulo de tests
const fs = require('fs');
const path = require('path');

// Leer y ejecutar el archivo de tests
const testFile = path.join(__dirname, 'random-sales-data.test.ts');

console.log('Para ejecutar los tests, usa uno de los siguientes comandos:');
console.log('1. npx ts-node tests/random-sales-data.test.ts');
console.log('2. npm run test:random (si ts-node está instalado)');
console.log('\nLos tests generan datos aleatorios para diferentes sucursales');
console.log('y fechas entre el 16 de diciembre y 6 de enero.');
