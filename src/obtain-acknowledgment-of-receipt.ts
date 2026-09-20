import type { BrowserContext, Page } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { goToPageDdjjAndPayments } from './go-to-page-ddjj-and-payments.js';

interface Presentacion {
  estado: number;
  cuitcuil: string;
  formulario: string;
  periodo: string;
  transaccion: number;
  fechaPresentacion: string;
}

export async function obtainAcknowledgmentOfReceipt(context: BrowserContext, page: Page): Promise<string | null> {
  // Abrir el tile ya deja seteadas las cookies de sesión de seti.afip.gob.ar
  // (mismo patrón que con SIFERE), así que después de esto no hace falta
  // clickear "Presentaciones" ni "Consulta de DDJJ presentadas": pedimos la
  // lista y el PDF directo por la API.
  await goToPageDdjjAndPayments(context, page);

  const cuit = (await page.locator('#usernav .numeroCuit').innerText())
    .trim()
    .replace(/-/g, '')
    .replace(/[[\]]/g, '');

  const orden = encodeURIComponent(JSON.stringify({ valor: 'FECHA_PRESENTACION', tipo: 'desc' }));

  const listResponse = await context.request.get(
    `https://seti.afip.gob.ar/setiweb/api/presentaciones/?usuario=TODOS&contribuyente=${cuit}&formulario=&mes=-&anio=-&orden=${orden}&pagina=1&totalPagina=20&cantTotal=0`,
  );

  if (!listResponse.ok()) {
    throw new Error(`No se pudo obtener la lista de presentaciones: ${listResponse.status()}`);
  }

  const { data } = await listResponse.json();
  const resultados: Presentacion[] = data?.resultados ?? [];

  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - 1);

  const mesPasado = String(fecha.getMonth() + 1).padStart(2, '0');
  const anioPasado = fecha.getFullYear();
  const periodoBuscado = `${anioPasado}-${mesPasado}`;

  console.log(`Período a buscar: ${periodoBuscado}`);

  const presentacion = resultados.find((r) => r.periodo === periodoBuscado) ?? null;

  if (!presentacion) {
    console.log(`No se encontró una presentación para el período ${periodoBuscado}`);
    return null;
  }

  const headers = encodeURIComponent(JSON.stringify({ Accept: 'application/pdf' }));

  const ticketResponse = await context.request.get(
    `https://seti.afip.gob.ar/setiweb/api/presentaciones/${presentacion.transaccion}/ticket?formato=PDF&responseType=arraybuffer&headers=${headers}`,
  );

  if (!ticketResponse.ok()) {
    throw new Error(`No se pudo descargar el acuse de recibo: ${ticketResponse.status()}`);
  }

  const buffer = await ticketResponse.body();
  const pdfPath = join(tmpdir(), `acuse-de-recibo-${presentacion.transaccion}.pdf`);

  await writeFile(pdfPath, buffer);

  console.log(pdfPath);

  return pdfPath;
}
