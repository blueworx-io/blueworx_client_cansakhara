// Runs once before the suite. Creates a "guest" subscriber account (the kind
// of account Can Sakhara's visitors are given) and saves a signed-in browser
// state for it, so specs that visit the private pages can start already
// signed in without each one going through wp-login.php.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { GUEST, GUEST_STATE, loginAsAdmin, loginAsGuest } from './helpers/wp.js';

export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL;
  const browser = await chromium.launch();

  // As admin: create the guest if it does not exist yet.
  const admin = await browser.newPage({ baseURL });
  await loginAsAdmin(admin);
  await admin.goto('/wp-admin/');
  const nonce = await admin.evaluate(() => window.wpApiSettings.nonce);
  const created = await admin.request.post('/wp-json/wp/v2/users', {
    headers: { 'X-WP-Nonce': nonce },
    data: { username: GUEST.user, email: GUEST.email, password: GUEST.pass, roles: ['subscriber'] },
  });
  if (!created.ok()) {
    const body = await created.json();
    if (body.code !== 'existing_user_login' && body.code !== 'existing_user_email') {
      throw new Error(`Could not create the guest account: ${JSON.stringify(body)}`);
    }
  }
  await admin.context().close();

  // As the guest: sign in once and keep the cookies.
  const guest = await browser.newPage({ baseURL });
  await loginAsGuest(guest);
  mkdirSync(dirname(GUEST_STATE), { recursive: true });
  await guest.context().storageState({ path: GUEST_STATE });
  await browser.close();
}
