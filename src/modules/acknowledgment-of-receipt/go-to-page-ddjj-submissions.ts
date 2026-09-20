import type { Page } from 'playwright';

export async function goToPageDdjjSubmissions(page: Page): Promise<void> {
  try {
    await page.bringToFront();

    await page.getByRole('heading', { name: 'Presentaciones' }).waitFor({ state: 'visible' });

    await page.locator('#menuConsultaDDJJ-link').click();

    console.log('Consulta de DDJJ presentadas abierto');
  } catch (error) {
    console.error('No se pudo abrir Consulta de DDJJ presentadas', error);
    throw new Error('No se pudo abrir Consulta de DDJJ presentadas');
  }
}
