import type { Page } from 'playwright';

export async function goToPageMyServices(page: Page): Promise<void> {
  try {
    await page.locator('a[href="/portal/app/mis-servicios"]').click();

    await page.getByRole('heading', { level: 3, name: 'Mis servicios', exact: true }).waitFor({ state: 'visible' });

    await page.waitForLoadState('networkidle');

    console.log('Mis servicios abierto');
  } catch (error) {
    console.error('No se pudo abrir Mis servicios', error);
    throw new Error('No se pudo abrir Mis servicios');
  }
}
