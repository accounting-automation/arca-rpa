import { join } from 'node:path';

const CARPETA_BASE = '/home/jb-user/Descargas/PDFs - contables';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function getCarpetaDestino(nombrePersona: string): string {
  const hoy = new Date();
  const mes = MESES[hoy.getMonth()];
  const anio = hoy.getFullYear();

  const nombreCarpeta = `${nombrePersona} - ${mes} ${anio}`.replace(/[\\/:*?"<>|]/g, '');

  return join(CARPETA_BASE, nombreCarpeta);
}
