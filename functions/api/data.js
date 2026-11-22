import { isAdmin, json } from '../_shared.js';

const ID_RE = /^[a-z0-9]{4,32}$/;
const IMG_RE = /^[a-f0-9]{8,32}$/;
const str = (v, max) => String(v ?? '').trim().slice(0, max);

function clean(input) {
  const out = { categories: [] };
  const cats = Array.isArray(input?.categories) ? input.categories.slice(0, 60) : [];
  let total = 0;
  for (const c of cats) {
    if (!ID_RE.test(String(c?.id))) throw new Error('bad category id');
    const iconType = c?.icon?.type === 'img' ? 'img' : 'emoji';
    let iconValue = str(c?.icon?.value, 16);
    if (iconType === 'img' && !IMG_RE.test(iconValue)) iconValue = '';
    const cat = { id: c.id, name: str(c.name, 60), icon: { type: iconType, value: iconValue }, products: [] };
    for (const p of (Array.isArray(c.products) ? c.products.slice(0, 300) : [])) {
      if (!ID_RE.test(String(p?.id))) throw new Error('bad product id');
      if (++total > 600) throw new Error('too many products');
      const img = p.img && IMG_RE.test(String(p.img)) ? String(p.img) : null;
      cat.products.push({ id: p.id, name: str(p.name, 80), img });
    }
    out.categories.push(cat);
  }
  return out;
}

export async function onRequestGet({ env }) {
  const raw = await env.KITCHEN.get('data');
  return new Response(raw || JSON.stringify({ version: 0, categories: [] }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: 'unauthorized' }, 401);
  let data;
  try { data = clean(await request.json()); } catch (e) { return json({ error: String(e.message || e) }, 400); }
  data.version = Date.now();
  await env.KITCHEN.put('data', JSON.stringify(data));

  // remove images that are no longer referenced
  const used = new Set();
  for (const c of data.categories) {
    if (c.icon.type === 'img' && c.icon.value) used.add(c.icon.value);
    for (const p of c.products) if (p.img) used.add(p.img);
  }
  let cursor;
  do {
    const page = await env.KITCHEN.list({ prefix: 'img:', cursor });
    for (const k of page.keys) if (!used.has(k.name.slice(4))) await env.KITCHEN.delete(k.name);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return json(data);
}
