import type { BrowserContext, Page } from 'playwright';
import { goToPageComarbService } from './go-to-page-comarb-service.js';

export async function goToPageSifereDdjj(context: BrowserContext, page: Page, cuit: string): Promise<Page> {
  const ddjjPage = await goToPageComarbService(context, page, 'comarb_sifereweb_ddjj');

  try {
    const cuitSelect = ddjjPage.locator('select#cuit');
    const cuitSeleccionado = await cuitSelect.inputValue();

    if (cuitSeleccionado !== cuit) {
      throw new Error(`El CUIT seleccionado (${cuitSeleccionado}) no coincide con el esperado (${cuit})`);
    }

    await ddjjPage.locator('input[value="Seleccionar"]').click();
    await ddjjPage.waitForLoadState('networkidle');

    // Después de "Seleccionar", el portal a veces pide confirmar el CUIT y a
    // veces va directo al inicio. networkidle no garantiza que renderice, así
    // que esperamos la condición real (lo que aparezca primero) con un timeout
    // generoso, igual que en go-to-page-comarb-service.ts para este mismo sitio.
    const confirmButton = ddjjPage.locator('input[value="Si. Confirmar Ingreso al Sistema"]');
    const listadoLink = ddjjPage.locator('#INICIO_listado_ddjj_mensuales');

    await confirmButton.or(listadoLink).waitFor({ state: 'visible', timeout: 60000 });

    if (await confirmButton.isVisible()) {
      const cuitConfirmado = await ddjjPage.locator('input[name="cuit"][readonly]').inputValue();

      if (cuitConfirmado !== cuit) {
        throw new Error(`El CUIT a confirmar (${cuitConfirmado}) no coincide con el esperado (${cuit})`);
      }

      await confirmButton.click();
      await ddjjPage.waitForLoadState('networkidle');
    }

    await listadoLink.click();
    await ddjjPage.waitForLoadState('networkidle');

    await ddjjPage.locator('#tableMensualDj tbody tr').first().waitFor({ state: 'visible' });

    console.log('Listado de DDJJ mensuales abierto');

    return ddjjPage;
  } catch (error) {
    console.error('No se pudo abrir el listado de DDJJ mensuales', error);
    throw new Error('No se pudo abrir el listado de DDJJ mensuales');
  }
}
