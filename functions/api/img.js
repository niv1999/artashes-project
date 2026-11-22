import { isAdmin, json } from '../_shared.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: 'unauthorized' }, 401);
  const type = (request.headers.get('Content-Type') || '').split(';')[0];
  if (!TYPES.includes(type)) return json({ error: 'bad_type' }, 400);
  const buf = await request.arrayBuffer();
  if (buf.byteLength === 0 || buf.byteLength > 1_500_000) return json({ error: 'bad_size' }, 400);
  const id = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
  await env.KITCHEN.put('img:' + id, buf, { metadata: { type } });
  return json({ id });
}
