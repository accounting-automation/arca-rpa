import type { BrowserContext, Page } from 'playwright';
import { goToPageMyReceipts } from './go-to-page-my-receipts.js';
import { goToPageReceivedReceipts } from './go-to-page-received-receipts.js';
import { selectLastMonth } from './select-last-month.js';
import { areThereNoReceiptsIssued } from './are-there-no-receipts-issued.js';
import { waitForAtLeastOneReceipt } from './wait-for-at-least-one-receipt.js';

export async function retrieveReceivedItems(context: BrowserContext, page: Page): Promise<string | null> {
  const myReceiptsPage = await goToPageMyReceipts(context, page);

  await goToPageReceivedReceipts(myReceiptsPage);

  await selectLastMonth(myReceiptsPage);

  await myReceiptsPage.locator('#buscarComprobantes').click();

  await myReceiptsPage.waitForLoadState('networkidle');

  if (await areThereNoReceiptsIssued(myReceiptsPage)) {
    await myReceiptsPage.close();
    return null;
  }

  await waitForAtLeastOneReceipt(myReceiptsPage);

  const downloadPromise = myReceiptsPage.waitForEvent('download');

  await myReceiptsPage.getByRole('button', { name: 'PDF' }).click();

  const download = await downloadPromise;

  const pdfPath = await download.path();

  console.log(pdfPath);

  await myReceiptsPage.close();

  return pdfPath;
}
