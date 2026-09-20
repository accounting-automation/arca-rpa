import type { BrowserContext, Page } from 'playwright';
import { goToPageSifereDdjj } from './go-to-page-sifere-ddjj.js';

export async function obtainSwornStatement(context: BrowserContext, page: Page): Promise<string | null> {
  const cuit = (await page.locator('#usernav .numeroCuit').innerText())
    .trim()
    .replace(/-/g, '')
    .replace(/[[\]]/g, '');

  const ddjjPage = await goToPageSifereDdjj(context, page, cuit);

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const mesPasadoFecha = new Date(hoy);
  mesPasadoFecha.setMonth(mesPasadoFecha.getMonth() - 1);
  const anticipoBuscado = `${mesPasadoFecha.getFullYear()}${String(mesPasadoFecha.getMonth() + 1).padStart(2, '0')}`;

  console.log(`Anticipo a buscar: ${anticipoBuscado}, fecha de creación del mes ${mesActual}/${anioActual}`);

  const rows = ddjjPage.locator('#tableMensualDj tbody tr');
  const count = await rows.count();

  let matchedRowIndex = -1;

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    const anticipoTexto = (await row.locator('td').nth(1).innerText()).trim();
    const fechaCreacionTexto = (await row.locator('td').nth(3).innerText()).trim();

    const anticipoYYYYMM = (anticipoTexto.split(' - ')[0] ?? '').trim();
    const [, mesStr, anioStr] = fechaCreacionTexto.split('/');

    const esMesActual = Number(mesStr) === mesActual && Number(anioStr) === anioActual;
    const esAnticipoMesPasado = anticipoYYYYMM === anticipoBuscado;

    if (esMesActual && esAnticipoMesPasado) {
      matchedRowIndex = i;
      break;
    }
  }

  if (matchedRowIndex === -1) {
    console.log('No se encontró una DDJJ mensual para el período buscado');
    await ddjjPage.close();
    return null;
  }

  const downloadPromise = ddjjPage.waitForEvent('download');

  await rows.nth(matchedRowIndex).locator('a[title="Reporte de DJ"]').click();

  const download = await downloadPromise;

  const pdfPath = await download.path();

  await ddjjPage.close();

  return pdfPath;
}
