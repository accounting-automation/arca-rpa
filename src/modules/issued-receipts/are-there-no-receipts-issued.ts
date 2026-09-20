import type { Page } from 'playwright';

export async function areThereNoReceiptsIssued(page: Page): Promise<boolean> {
  const noExisteInformacion = page.locator('td.dataTables_empty', {
    hasText: 'No existe información para los filtros ingresados',
  });

  const infoSinRegistros = page.locator('#tablaDataTables_info', {
    hasText: 'Mostrando 0 registros de un total de 0',
  });

  const atLeastOneReceipt = page.locator('#tablaDataTables tbody tr[role="row"]').first();

  const noReceipts = Promise.all([
    noExisteInformacion.waitFor({ state: 'visible' }),
    infoSinRegistros.waitFor({ state: 'visible' }),
  ]).then(() => true as const);

  const hasReceipts = atLeastOneReceipt.waitFor({ state: 'visible' }).then(() => false as const);

  // evita "unhandled rejection" de la promesa que pierde la carrera
  noReceipts.catch(() => {});
  hasReceipts.catch(() => {});

  const result = await Promise.race([noReceipts, hasReceipts]);

  if (result) {
    console.log(await noExisteInformacion.innerText());
    console.log(await infoSinRegistros.innerText());
  }

  return result;
}
