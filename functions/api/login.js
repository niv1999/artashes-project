import { makeToken, safeEq, json } from '../_shared.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'not_configured' }, 500);
  let body = {};
  try { body = await request.json(); } catch {}
  const given = await makeToken(String(body.password || ''));
  const real = await makeToken(env.ADMIN_PASSWORD);
  if (!safeEq(given, real)) {
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'bad_password' }, 401);
  }
  return json({ token: real });
}
