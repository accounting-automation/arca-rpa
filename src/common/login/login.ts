import type { Page } from 'playwright';

export async function login(page: Page, username: string, password: string): Promise<string> {
  await page.goto('https://auth.afip.gob.ar/contribuyente_/login.xhtml');

  await page.locator('[id="F1:username"]').fill(username);

  await page.locator('[id="F1:btnSiguiente"]').click();

  await page.locator('[id="F1:password"]').fill(password);

  await page.locator('[id="F1:btnIngresar"]').click();

  const nombre = await isLoginOk(page, username);

  if (nombre) return nombre;

  await verifyErrorLogin(page);

  throw new Error('No se pudo confirmar el login');
}

async function isLoginOk(page: Page, username: string): Promise<string | null> {
  try {
    const nameLocator = page.locator('#usernav strong.text-primary');
    const cuitLocator = page.locator('#usernav .numeroCuit');

    await nameLocator.waitFor({ state: 'visible' });

    const nombre = (await nameLocator.innerText()).trim();
    const cuit = (await cuitLocator.innerText()).trim().replace(/-/g, '').replace(/[\[\]]/g, '');

    if (cuit !== username) {
      throw new Error(`El CUIT logueado (${cuit}) no coincide con el username (${username})`);
    }

    console.log('Login exitoso');
    console.log("Nombre: ", nombre);
    console.log("CUIT: ", cuit);
    return nombre;
  } catch (error) {
    console.error('No se pudo confirmar el login', error);
    return null;
  }

}

async function verifyErrorLogin(page: Page): Promise<void> {
  const errorMsg = page.locator('#F1\\:msg');
  if (await errorMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
    const text = await errorMsg.innerText();
    
    if (text.trim() === 'Clave o usuario incorrecto') {
      console.error('Clave o usuario incorrecto');
      throw new Error('Clave o usuario incorrecto');
    }

    throw new Error('Error de login desconocido: ' + text);
  }
}

