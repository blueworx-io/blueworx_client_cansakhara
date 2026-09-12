// Shared WordPress helpers for the Playwright suite. Every test that needs a
// signed-in admin goes through here, so the credentials live in one place.
const ADMIN_USER = process.env.WP_ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS ?? 'admin';

export async function loginAsAdmin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/);
}

export async function logout(page) {
  await page.context().clearCookies();
}

// The admin's email address, read from the profile screen rather than assumed.
export async function adminEmail(page) {
  await page.goto('/wp-admin/profile.php');
  return page.inputValue('#email');
}

export function adminPassword() {
  return ADMIN_PASS;
}

// Saves the plugin's settings screen with the given values. `loginRedirect`
// is an option label in the page dropdown ('Home page' or a page title).
export async function setSettings(page, { loginRedirect }) {
  await page.goto('/wp-admin/options-general.php?page=cansakhara');
  await page.selectOption('#cansakhara-login-redirect', { label: loginRedirect });
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/settings-updated=true/);
}
