const JSON_HEADERS = { 'content-type': 'application/json; charset=UTF-8' };

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function getBackendOrigin(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function createHandler({ fetchImpl = fetch } = {}) {
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url);
      const backendOrigin = getBackendOrigin(env.WORKER_BACKEND);

      if (url.pathname === '/health') {
        return json({
          status: 'ok',
          service: 'hero-super-agent',
          backendConfigured: Boolean(backendOrigin),
        });
      }

      if (url.pathname === '/' || url.pathname === '/api/agent') {
        return json({
          success: true,
          payload: {
            name: 'Hero Super Agent',
            description: 'Cloudflare Worker edge service',
            features: ['health', 'metadata', 'optional-https-proxy'],
          },
        });
      }

      if (!backendOrigin) {
        return json({ error: 'Not found' }, 404);
      }

      try {
        const backendUrl = `${backendOrigin}${url.pathname}${url.search}`;
        return await fetchImpl(new Request(backendUrl, request));
      } catch {
        return json({ error: 'Configured backend is unavailable' }, 502);
      }
    },
  };
}

export default createHandler();
