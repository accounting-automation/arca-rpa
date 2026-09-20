import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCarpetaDestino } from './carpeta-destino.js';

const bufferLineas: string[] = [];
let archivoLog: string | null = null;

const logOriginal = console.log.bind(console);
const errorOriginal = console.error.bind(console);

function formatearArgumentos(args: unknown[]): string {
  return args
    .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)))
    .join(' ');
}

function registrarLinea(linea: string): void {
  if (archivoLog) {
    void appendFile(archivoLog, `${linea}\n`);
  } else {
    bufferLineas.push(linea);
  }
}

console.log = (...args: unknown[]) => {
  logOriginal(...args);
  registrarLinea(formatearArgumentos(args));
};

console.error = (...args: unknown[]) => {
  errorOriginal(...args);
  registrarLinea(formatearArgumentos(args));
};

// Hasta que se conoce el nombre de la persona (recién después del login) no
// sabemos en qué carpeta guardar el log, así que todo lo que se imprime
// antes queda en memoria y se vuelca acá apenas la carpeta está lista.
export async function activarLogEnCarpeta(nombrePersona: string): Promise<void> {
  const carpetaDestino = getCarpetaDestino(nombrePersona);

  await mkdir(carpetaDestino, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  archivoLog = join(carpetaDestino, `log-ejecucion-${timestamp}.txt`);

  const contenidoInicial = bufferLineas.length > 0 ? `${bufferLineas.join('\n')}\n` : '';

  await writeFile(archivoLog, contenidoInicial);

  bufferLineas.length = 0;
}
