import type { Page } from 'playwright';

export async function goToPageReceivedReceipts(page: Page): Promise<void> {
  try {
    await page.locator('#btnRecibidos').click();

    await page.locator('#titulo', { hasText: 'Comprobantes Recibidos' }).waitFor({
      state: 'visible',
    });

    console.log('Comprobantes Recibidos abierto');
  } catch (error) {
    console.error('No se pudo abrir Comprobantes Recibidos', error);
    throw new Error('No se pudo abrir Comprobantes Recibidos');
  }
}
