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

    // La pantalla de confirmación tarda un instante en terminar de renderizar
    // después de "Seleccionar" (el input readonly no está listo apenas
    // termina networkidle); sin esta espera el paso siguiente da timeout.
    await ddjjPage.waitForTimeout(1500);

    const cuitConfirmInput = ddjjPage.locator('input[name="cuit"][readonly]');
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
