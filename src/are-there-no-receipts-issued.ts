import type { Page } from 'playwright';

export async function areThereNoReceiptsIssued(page: Page): Promise<boolean> {
  const noExisteInformacion = page.locator('td.dataTables_empty', {
    hasText: 'No existe información para los filtros ingresados',
  });

  const infoSinRegistros = page.locator('#tablaDataTables_info', {
    hasText: 'Mostrando 0 registros de un total de 0',
  });

  try {
    await Promise.all([
      noExisteInformacion.waitFor({ state: 'visible' }),
      infoSinRegistros.waitFor({ state: 'visible' }),
    ]);
  } catch {
    return false;
  }

  console.log(await noExisteInformacion.innerText());
  console.log(await infoSinRegistros.innerText());

  return true;
}
