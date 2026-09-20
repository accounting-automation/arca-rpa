import { join } from 'node:path';

const CARPETA_BASE = '/home/jb-user/Descargas/PDFs - contables';

export function getCarpetaDestino(nombrePersona: string): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();

  const nombreCarpeta = `${nombrePersona} - ${mes}-${anio}`.replace(/[\\/:*?"<>|]/g, '');

  return join(CARPETA_BASE, nombreCarpeta);
}
