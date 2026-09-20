import type { BrowserContext, Page } from 'playwright';

export async function goToPageDdjjAndPayments(context: BrowserContext, page: Page): Promise<Page> {
  try {
    const [ddjjPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a[title="setidj"]').click(),
    ]);

    await ddjjPage.bringToFront();

    await ddjjPage.waitForLoadState('domcontentloaded');

    // El modal de "Novedades del servicio" solo aparece la primera vez (o si
    // no se tildó "No volver a mostrar"), así que lo cerramos solo si sale.
    const entendidoButton = ddjjPage.getByRole('button', { name: 'Entendido' });

    if (await entendidoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await entendidoButton.click();
    }

    console.log('Presentación de DDJJ y Pagos abierto');

    return ddjjPage;
  } catch (error) {
    console.error('No se pudo abrir Presentación de DDJJ y Pagos', error);
    throw new Error('No se pudo abrir Presentación de DDJJ y Pagos');
  }
}
