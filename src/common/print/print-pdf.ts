import { copyFile, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { getCarpetaDestino } from './carpeta-destino.js';

export async function printPdf(
  pdfPath: string,
  nombrePersona: string,
  nombreDescriptivo?: string,
): Promise<void> {

  const carpetaDestino = getCarpetaDestino(nombrePersona);

  await mkdir(carpetaDestino, { recursive: true });

  const nombreBase = nombreDescriptivo ?? basename(pdfPath);
  const nombreArchivo = extname(nombreBase) ? nombreBase : `${nombreBase}.pdf`;
  const destino = join(carpetaDestino, nombreArchivo);

  await copyFile(pdfPath, destino);

  console.log(`PDF guardado en: ${destino}`);
}
