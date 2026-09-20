import type { Page } from 'playwright';

export async function goToPageARCA(page: Page): Promise<void> {
  try {
    await page.goto('https://www.arca.gob.ar/');

    await page.getByRole('link', { name: 'Iniciar sesión' }).waitFor({ state: 'visible' });

    console.log('Página de ARCA abierta');
  } catch (error) {
    console.error('No se pudo abrir ARCA', error);
    throw new Error('No se pudo abrir ARCA');
  }
}
