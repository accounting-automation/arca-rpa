import type { BrowserContext, Page } from 'playwright';

// Los servicios de Comisión Arbitral (comarb.gob.ar) se abren con el mismo
// handshake SSO: pedimos el servicio, pedimos la autorización (sign/token),
// posteamos eso contra la URL del servicio y navegamos a donde nos redirija.
// El window.open propio del portal para estos servicios no llega a abrirse
// en este entorno, así que lo hacemos nosotros directo por la API.
export async function goToPageComarbService(context: BrowserContext, page: Page, serviceName: string): Promise<Page> {
  try {
    const cuit = (await page.locator('#usernav .numeroCuit').innerText())
      .trim()
      .replace(/-/g, '')
      .replace(/[[\]]/g, '');

    const servicioResponse = await context.request.get(
      `https://portalcf.cloud.afip.gob.ar/portal/api/servicios/${cuit}/servicio/${serviceName}`,
    );

    if (!servicioResponse.ok()) {
      throw new Error(`No se pudo obtener el servicio ${serviceName}: ${servicioResponse.status()}`);
    }

    const { servicio } = await servicioResponse.json();

    const autorizacionResponse = await context.request.get(
      `https://portalcf.cloud.afip.gob.ar/portal/api/servicios/${cuit}/servicio/${serviceName}/autorizacion`,
    );

    if (!autorizacionResponse.ok()) {
      throw new Error(`No se pudo obtener la autorización para ${serviceName}: ${autorizacionResponse.status()}`);
    }

    const { sign, token } = await autorizacionResponse.json();

    const ssoResponse = await context.request.post(servicio.url, {
      form: { sign, token },
      maxRedirects: 0,
    });

    const servicePage = await context.newPage();

    if (ssoResponse.status() === 302 || ssoResponse.status() === 303) {
      const redirectUrl = ssoResponse.headers()['location'];

      if (!redirectUrl) {
        throw new Error('El POST de autenticación SSO no devolvió una URL de redirección');
      }

      // El redirect legado a veces apunta a http:// (sin TLS), que se cuelga
      // sin respuesta en esta red; https:// al mismo host/path funciona.
      const secureRedirectUrl = redirectUrl.replace(/^http:\/\//, 'https://');

      await servicePage.goto(secureRedirectUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else if (ssoResponse.ok()) {
      // Algunos servicios (ej. comarb_sifereweb_ddjj) no redirigen: el POST
      // ya devuelve directamente la página autenticada en el body. Pedirla
      // de nuevo con un GET sin el sign/token la rompe ("No se ha recibido
      // Token"), así que en vez de repetir la petición le servimos a
      // Playwright la respuesta que ya tenemos para esa navegación puntual,
      // preservando la URL/origen reales para que la sesión funcione bien.
      const body = await ssoResponse.body();
      const contentType = ssoResponse.headers()['content-type'] ?? 'text/html; charset=utf-8';

      await servicePage.route(servicio.url, async (route) => {
        await route.fulfill({ status: 200, headers: { 'content-type': contentType }, body });
        await servicePage.unroute(servicio.url);
      });

      await servicePage.goto(servicio.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else {
      throw new Error(`Respuesta inesperada del POST de autenticación SSO: ${ssoResponse.status()}`);
    }

    console.log(`${serviceName} abierto (autenticación directa vía SSO)`);

    return servicePage;
  } catch (error) {
    console.error(`No se pudo abrir el servicio ${serviceName}`, error);
    throw new Error(`No se pudo abrir el servicio ${serviceName}`);
  }
}
