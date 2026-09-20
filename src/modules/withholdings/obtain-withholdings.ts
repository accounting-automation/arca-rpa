import type { BrowserContext, Page } from 'playwright';
import { goToPageSifereInquiries } from './go-to-page-sifere-inquiries.js';
import { goToPageInclusionsAndWithholdings } from './go-to-page-inclusions-and-withholdings.js';

export async function obtainWithholdings(context: BrowserContext, page: Page): Promise<string | null> {
    const sifereInquiriesPage = await goToPageSifereInquiries(context, page);

    await goToPageInclusionsAndWithholdings(sifereInquiriesPage);

    await sifereInquiriesPage.getByRole('button', { name: 'Buscar' }).click();

    await sifereInquiriesPage.waitForLoadState('networkidle');

    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - 1);

    const mesPasado = String(fecha.getMonth() + 1).padStart(2, '0');
    const anioPasado = fecha.getFullYear();

    const periodo = `${mesPasado}/${anioPasado}`;

    console.log(`Periodo a buscar: ${periodo}`);

    const row = sifereInquiriesPage.locator('#inclusion tr').filter({
    hasText: periodo,
    });

    if (await row.count() === 0) {
        console.log(`No existe el período ${periodo}`);
        await sifereInquiriesPage.close();
        return null;
    }

    if (await row.locator('img[title="Ver Retenciones y Coeficientes"]').count() === 0) {
        console.log(`No existe el detalle para ${periodo}`);
        await sifereInquiriesPage.close();
        return null;
    }

    await row.locator('img[title="Ver Retenciones y Coeficientes"]').click();

    console.log(`Detalle abierto para el período ${periodo}`);

    const downloadPromise = sifereInquiriesPage.waitForEvent('download');

    await sifereInquiriesPage.getByRole('link', { name: 'Retenciones y coeficientes' }).click();

    const download = await downloadPromise;

    const pdfPath = await download.path();

    await sifereInquiriesPage.close();

    return pdfPath;
}