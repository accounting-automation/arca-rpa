import type { Page } from 'playwright';

export async function goToPageInclusionsAndWithholdings(page: Page): Promise<void> {
  try {
    await page.bringToFront();

    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('heading', { name: 'DEDUCCIONES' }).hover();

    await page
      .locator('a[href="srbPadron.do?method=buscarIn"]', { hasText: 'Inclusiones y Retenciones' })
      .click();

    console.log('Inclusiones y Retenciones abierto');
  } catch (error) {
    console.error('No se pudo abrir Inclusiones y Retenciones', error);
    throw new Error('No se pudo abrir Inclusiones y Retenciones');
  }
}
