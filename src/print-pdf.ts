import { copyFile, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { getCarpetaDestino } from './carpeta-destino.js';

export async function printPdf(pdfPath: string, nombrePersona: string): Promise<void> {
  console.log(`Imprimiendo PDF: ${pdfPath}`);

  const carpetaDestino = getCarpetaDestino(nombrePersona);

  await mkdir(carpetaDestino, { recursive: true });

  const nombreArchivo = extname(pdfPath) ? basename(pdfPath) : `${basename(pdfPath)}.pdf`;
  const destino = join(carpetaDestino, nombreArchivo);

  await copyFile(pdfPath, destino);

  console.log(`PDF guardado en: ${destino}`);
}
