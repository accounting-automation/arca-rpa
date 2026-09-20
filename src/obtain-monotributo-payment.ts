import type { BrowserContext, Page } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { goToPageDdjjAndPayments } from './go-to-page-ddjj-and-payments.js';

interface Vep {
  estado: number;
  nroVep: number;
  cuit: string;
  importe: number;
  descripcion: string;
  fechaDePago: string;
}

export async function obtainMonotributoPayment(context: BrowserContext, page: Page): Promise<string | null> {
  // Abrir el tile de DDJJ y Pagos ya deja la sesión de seti.afip.gob.ar
  // seteada (misma app que "Consulta de DDJJ presentadas"), así que no hace
  // falta clickear "Consulta de VEP" ni "Aplicar": vamos directo a la API.
  await goToPageDdjjAndPayments(context, page);

  const cuit = (await page.locator('#usernav .numeroCuit').innerText())
    .trim()
    .replace(/-/g, '')
    .replace(/[[\]]/g, '');

  const orden = encodeURIComponent(JSON.stringify({ valor: 'vepId', tipo: 'desc' }));

  const listResponse = await context.request.get(
    `https://seti.afip.gob.ar/setiweb/api/pagos?usuario=TODOS&contribuyente=${cuit}&estado=seticommon.todos.rotulo&tipoDePago=TODOS&mes=-&anio=-&ultimosMeses=12&orden=${orden}&pagina=1&totalPagina=20&cantTotal=0`,
  );

  if (!listResponse.ok()) {
    throw new Error(`No se pudo obtener la lista de pagos: ${listResponse.status()}`);
  }

  const { data } = await listResponse.json();
  const veps: Vep[] = data?.vepsConsultados ?? [];

  const hoy = new Date();
  const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
  const anioActual = String(hoy.getFullYear()).slice(-2);
  const descripcionBuscada = `MONOTR${mesActual}/${anioActual}`;

  console.log(`Descripción a buscar: ${descripcionBuscada}`);

  const vep = veps.find((v) => v.descripcion === descripcionBuscada) ?? null;

  if (!vep) {
    console.log(`No se encontró un pago de monotributo para ${descripcionBuscada}`);
    return null;
  }

  const ticketResponse = await context.request.get(
    `https://seti.afip.gob.ar/setiweb/api/pagos/${vep.nroVep}/ticket?formato=PDF`,
  );

  if (!ticketResponse.ok()) {
    throw new Error(`No se pudo descargar el comprobante de pago: ${ticketResponse.status()}`);
  }

  const buffer = await ticketResponse.body();
  const pdfPath = join(tmpdir(), `pago-monotributo-${vep.nroVep}.pdf`);

  await writeFile(pdfPath, buffer);

  return pdfPath;
}
