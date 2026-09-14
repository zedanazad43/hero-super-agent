const base = process.env.HERO_WORKER_URL;

if (!base) {
  console.error('HERO_WORKER_URL must be set.');
  process.exit(1);
}

let origin;
try {
  origin = new URL(base);
  if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('unsupported protocol');
} catch {
  console.error('HERO_WORKER_URL must be an absolute HTTP(S) URL.');
  process.exit(1);
}

async function expectJson(path, validate) {
  const target = new URL(path, origin).toString();
  const response = await fetch(target, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error(`${path} did not return JSON`);

  const body = await response.json();
  validate(body);
}

try {
  await expectJson('/health', (body) => {
    if (body.status !== 'ok' || body.service !== 'hero-super-agent') {
      throw new Error('/health payload is invalid');
    }
  });

  await expectJson('/', (body) => {
    if (body.success !== true || body.payload?.name !== 'Hero Super Agent') {
      throw new Error('/ payload is invalid');
    }
  });

  console.log(`Hero Worker smoke checks passed for ${origin.origin}.`);
} catch (error) {
  console.error(`Hero Worker smoke checks failed: ${error.message}`);
  process.exit(1);
}
