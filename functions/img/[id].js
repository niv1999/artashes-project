export async function onRequestGet({ params, env }) {
  const id = String(params.id || '');
  if (!/^[a-f0-9]{8,32}$/.test(id)) return new Response('not found', { status: 404 });
  const { value, metadata } = await env.KITCHEN.getWithMetadata('img:' + id, { type: 'arrayBuffer' });
  if (!value) return new Response('not found', { status: 404 });
  return new Response(value, {
    headers: {
      'Content-Type': metadata?.type || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
