import type { Page } from 'playwright';

export async function selectLastMonth(page: Page): Promise<void> {
  await page.locator('#fechaEmision').click();

  await page.locator('li[data-range-key="Mes Pasado"]').click();

  const rangoFechas = await page.locator('#fechaEmision').inputValue();

  checkLastMonth(rangoFechas);

  console.log('Rango de fechas seleccionado:', rangoFechas);
}

function checkLastMonth(rangoFechas: string): void {
  const hoy = new Date();
  const primerDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const ultimoDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const formatearFecha = (fecha: Date) =>
    `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;

  const rangoEsperado = `${formatearFecha(primerDiaMesPasado)} - ${formatearFecha(ultimoDiaMesPasado)}`;

  if (rangoFechas !== rangoEsperado) {
    console.error(`El rango de fechas (${rangoFechas}) no corresponde al mes pasado (${rangoEsperado})`);
    throw new Error(`El rango de fechas (${rangoFechas}) no corresponde al mes pasado (${rangoEsperado})`);
  }
}
