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

    // La pantalla de confirmación puede tardar en renderizar después de
    // "Seleccionar" (networkidle no lo garantiza en este portal). En vez de
    // dormir un tiempo fijo, esperamos la condición real con un timeout
    // generoso, igual que en go-to-page-comarb-service.ts para este mismo sitio.
    const cuitConfirmInput = ddjjPage.locator('input[name="cuit"][readonly]');
    await cuitConfirmInput.waitFor({ state: 'visible', timeout: 60000 });
    const cuitConfirmado = await cuitConfirmInput.inputValue();

    if (cuitConfirmado !== cuit) {
      throw new Error(`El CUIT a confirmar (${cuitConfirmado}) no coincide con el esperado (${cuit})`);
    }

    await ddjjPage.locator('input[value="Si. Confirmar Ingreso al Sistema"]').click();
    await ddjjPage.waitForLoadState('networkidle');

    await ddjjPage.locator('#INICIO_listado_ddjj_mensuales').click();
    await ddjjPage.waitForLoadState('networkidle');

    await ddjjPage.locator('#tableMensualDj tbody tr').first().waitFor({ state: 'visible' });

    console.log('Listado de DDJJ mensuales abierto');

    return ddjjPage;
  } catch (error) {
    console.error('No se pudo abrir el listado de DDJJ mensuales', error);
    throw new Error('No se pudo abrir el listado de DDJJ mensuales');
  }
}
