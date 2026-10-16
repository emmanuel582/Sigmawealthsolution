import { NextRequest, NextResponse } from 'next/server';

const attempts = new Map<string, { count: number; expires: number }>();
let active = 0;

// This bounds each server instance; platform WAF limits are still required across instances.
export function beginPublicRequest(req: NextRequest): NextResponse | (() => void) {
  const origin = req.headers.get('origin');
  if (origin && ![new URL(req.url).origin, 'https://sigmawealthsolution.com', 'https://www.sigmawealthsolution.com'].includes(origin)) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  }
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${new URL(req.url).pathname}:${ip.slice(0, 100)}`;
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || entry.expires <= now) {
    if (attempts.size >= 5000) attempts.delete(attempts.keys().next().value!);
    entry = { count: 0, expires: now + 60_000 };
    attempts.set(key, entry);
  }
  if (++entry.count > 12 || active >= 16) {
    return NextResponse.json({ error: 'Too many requests. Please retry shortly.' }, { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } });
  }
  active++;
  let released = false;
  return () => { if (!released) { released = true; active--; } };
}

export async function boundedJson(req: NextRequest): Promise<any> {
  if (Number(req.headers.get('content-length')) > 8192) throw new Error('Invalid request body');
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Invalid request body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = AbortSignal.timeout(10_000);
  const cancel = () => { void reader.cancel().catch(() => {}); };
  deadline.addEventListener('abort', cancel, { once: true });
  try {
    while (true) {
      if (deadline.aborted) throw new Error('Request timed out');
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) throw new Error('Invalid request body');
      chunks.push(value);
    }
    if (deadline.aborted) throw new Error('Request timed out');
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body');
    return body;
  } finally { deadline.removeEventListener('abort', cancel); cancel(); }
}
