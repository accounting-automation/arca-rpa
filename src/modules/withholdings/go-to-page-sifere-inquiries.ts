import type { BrowserContext, Page } from 'playwright';
import { goToPageComarbService } from './go-to-page-comarb-service.js';

export async function goToPageSifereInquiries(context: BrowserContext, page: Page): Promise<Page> {
  const sifereWebConsultas = page.locator('a[title="comarb_sifereweb_consultas"]');
  const useSifereWebConsultas = await sifereWebConsultas.isVisible();
  const serviceName = useSifereWebConsultas ? 'comarb_sifereweb_consultas' : 'comarb_sircreb_contrib';

  return goToPageComarbService(context, page, serviceName);
}
