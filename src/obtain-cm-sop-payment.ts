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

export async function obtainCmSopPayment(context: BrowserContext, page: Page): Promise<string | null> {
  // Abrir el tile de DDJJ y Pagos ya deja la sesión de seti.afip.gob.ar
  // seteada, así que vamos directo a la API igual que con el monotributo.
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

  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - 1);

  const mesPasado = String(fecha.getMonth() + 1).padStart(2, '0');
  const anioPasado = String(fecha.getFullYear()).slice(-2);
  const descripcionBuscada = `CM-SOP${mesPasado}/${anioPasado}`;

  console.log(`Descripción a buscar: ${descripcionBuscada}`);

  const vep = veps.find((v) => v.descripcion === descripcionBuscada) ?? null;

  if (!vep) {
    console.log(`No se encontró un pago para ${descripcionBuscada}`);
    return null;
  }

  const ticketResponse = await context.request.get(
    `https://seti.afip.gob.ar/setiweb/api/pagos/${vep.nroVep}/ticket?formato=PDF`,
  );

  if (!ticketResponse.ok()) {
    throw new Error(`No se pudo descargar el comprobante de pago: ${ticketResponse.status()}`);
  }

  const buffer = await ticketResponse.body();
  const pdfPath = join(tmpdir(), `pago-cm-sop-${vep.nroVep}.pdf`);

  await writeFile(pdfPath, buffer);

  return pdfPath;
}
