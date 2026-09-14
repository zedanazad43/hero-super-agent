import assert from 'node:assert/strict';
import test from 'node:test';

import { createHandler } from '../src/index.js';

const handler = createHandler();

test('serves an unauthenticated health response', async () => {
  const response = await handler.fetch(new Request('https://hero.example/health'), {});

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'hero-super-agent',
    backendConfigured: false,
  });
});

test('serves public agent metadata without a backend', async () => {
  const response = await handler.fetch(new Request('https://hero.example/api/agent'), {});
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.payload.name, 'Hero Super Agent');
});

test('returns a JSON 404 instead of proxying to localhost', async () => {
  const response = await handler.fetch(new Request('https://hero.example/api/tasks'), {});

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});

test('proxies only to an explicitly configured HTTPS backend', async () => {
  const calls = [];
  const proxyingHandler = createHandler({
    fetchImpl: async (request) => {
      calls.push(request.url);
      return new Response('proxied', { status: 201 });
    },
  });

  const response = await proxyingHandler.fetch(
    new Request('https://hero.example/api/tasks?limit=10'),
    { WORKER_BACKEND: 'https://backend.example' },
  );

  assert.equal(response.status, 201);
  assert.equal(await response.text(), 'proxied');
  assert.deepEqual(calls, ['https://backend.example/api/tasks?limit=10']);
});

test('rejects non-HTTPS backend configuration', async () => {
  const response = await handler.fetch(
    new Request('https://hero.example/api/tasks'),
    { WORKER_BACKEND: 'http://localhost:3001' },
  );

  assert.equal(response.status, 404);
});
