import type { Page } from 'playwright';

export async function waitForAtLeastOneReceipt(page: Page): Promise<void> {
  await page.locator('#tablaDataTables tbody tr[role="row"]').first().waitFor({
    state: 'visible',
  });
}
