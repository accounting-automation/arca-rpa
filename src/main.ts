import { chromium } from 'playwright';
import 'dotenv/config';
import { activarLogEnCarpeta } from './instrument/console-logger.js';
import { login } from './common/login/login.js';
import { goToPageARCA } from './common/login/go-to-page-arca.js';
import { goToPageMyServices } from './common/mis-services/go-to-page-my-services.js';
import { printPdf } from './common/print/print-pdf.js';
import { retrieveSentItems } from './modules/issued-receipts/retrieve-sent-items.js';
import { retrieveReceivedItems } from './modules/vouchers-received/retrieve-received-items.js';
import { obtainWithholdings } from './modules/withholdings/obtain-withholdings.js';
import { obtainAcknowledgmentOfReceipt } from './modules/acknowledgment-of-receipt/obtain-acknowledgment-of-receipt.js';
import { obtainMonotributoPayment } from './modules/simplified-tax-regime/obtain-monotributo-payment.js';
import { obtainCmSopPayment } from './modules/multilateral-agreement/obtain-cm-sop-payment.js';
import { obtainSwornStatement } from './modules/sworn-declaration/obtain-sworn-statement.js';

const ARCA_USERNAME = process.env.ARCA_USERNAME;
const ARCA_PASSWORD = process.env.ARCA_PASSWORD;

if (!ARCA_USERNAME) {
  throw new Error('Falta la variable de entorno ARCA_USERNAME');
}

if (!ARCA_PASSWORD) {
  throw new Error('Falta la variable de entorno ARCA_PASSWORD');
}

async function main(username: string, password: string) {
  const inicio = Date.now();

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  await goToPageARCA(page);

  const nombre = await login(page, username, password);

  await activarLogEnCarpeta(nombre);

  await goToPageMyServices(page);

  console.log();

  const pdfPathSentItems = await retrieveSentItems(context, page);

  if (pdfPathSentItems) {
    console.log(`PDF de comprobantes emitidos descargado en: ${pdfPathSentItems}`);
    await printPdf(pdfPathSentItems, nombre);
  } else {
    console.log('No se encontraron comprobantes emitidos');
  }

  console.log();

  const pdfPathReceivedItems = await retrieveReceivedItems(context, page);

  if (pdfPathReceivedItems) {
    console.log(`PDF de comprobantes recibidos descargado en: ${pdfPathReceivedItems}`);
    await printPdf(pdfPathReceivedItems, nombre);
  } else {
    console.log('No se encontraron comprobantes recibidos');
  }

  console.log();

  const pdfWithholdingsPath = await obtainWithholdings(context, page);

  if (pdfWithholdingsPath) {
    console.log(`PDF de retenciones descargado en: ${pdfWithholdingsPath}`);
    await printPdf(pdfWithholdingsPath, nombre);
  } else {
    console.log('No se encontraron retenciones');
  }

  console.log();

  const pdfAcknowledgmentOfReceiptPath = await obtainAcknowledgmentOfReceipt(context, page);

  if (pdfAcknowledgmentOfReceiptPath) {
    console.log(`PDF de acuse de recibo descargado en: ${pdfAcknowledgmentOfReceiptPath}`);
    await printPdf(pdfAcknowledgmentOfReceiptPath, nombre);
  } else {
    console.log('No se encontró el acuse de recibo');
  }

  console.log();

  const pdfMonotributoPaymentPath = await obtainMonotributoPayment(context, page);

  if (pdfMonotributoPaymentPath) {
    console.log(`PDF de pago de monotributo descargado en: ${pdfMonotributoPaymentPath}`);
    await printPdf(pdfMonotributoPaymentPath, nombre);
  } else {
    console.log('No se encontró el pago de monotributo');
  }

  console.log();

  const pdfCmSopPaymentPath = await obtainCmSopPayment(context, page);

  if (pdfCmSopPaymentPath) {
    console.log(`PDF de pago CM-SOP descargado en: ${pdfCmSopPaymentPath}`);
    await printPdf(pdfCmSopPaymentPath, nombre);
  } else {
    console.log('No se encontró el pago CM-SOP');
  }

  console.log();

  const pdfSwornStatementPath = await obtainSwornStatement(context, page);

  if (pdfSwornStatementPath) {
    console.log(`PDF de declaración jurada descargado en: ${pdfSwornStatementPath}`);
    await printPdf(pdfSwornStatementPath, nombre);
  } else {
    console.log('No se encontró la declaración jurada');
  }

  await page.waitForTimeout(1000);

  await browser.close();

  console.log();

  const duracionSegundos = Math.round((Date.now() - inicio) / 1000);
  const minutos = Math.floor(duracionSegundos / 60);
  const segundos = duracionSegundos % 60;

  console.log(`Ejecución completa en ${minutos}m ${segundos}s`);
}

main(ARCA_USERNAME, ARCA_PASSWORD);