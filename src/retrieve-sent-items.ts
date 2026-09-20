import type { BrowserContext, Page } from 'playwright';
import { goToPageMyReceipts } from './go-to-page-my-receipts.js';
import { goToPageIssuedReceipts } from './go-to-page-issued-receipts.js';
import { selectLastMonth } from './select-last-month.js';
import { areThereNoReceiptsIssued } from './are-there-no-receipts-issued.js';
import { waitForAtLeastOneReceipt } from './wait-for-at-least-one-receipt.js';

export async function retrieveSentItems(context: BrowserContext, page: Page): Promise<string | null> {
  const mySendPage = await goToPageMyReceipts(context, page);

  await goToPageIssuedReceipts(mySendPage);

  await selectLastMonth(mySendPage);

  await mySendPage.locator('#buscarComprobantes').click();

  await mySendPage.waitForLoadState('networkidle');

  if (await areThereNoReceiptsIssued(mySendPage)) {
    await mySendPage.close();
    return null;
  }

  await waitForAtLeastOneReceipt(mySendPage);

  const downloadPromise = mySendPage.waitForEvent('download');

  await mySendPage.getByRole('button', { name: 'PDF' }).click();

  const download = await downloadPromise;

  const pdfPath = await download.path();

  console.log(pdfPath);

  await mySendPage.close();

  return pdfPath;
}

