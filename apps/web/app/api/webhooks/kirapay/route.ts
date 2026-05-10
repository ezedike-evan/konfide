/**
 * Kirapay webhook handler.
 *
 * Stub: returns 200 OK and logs the inbound payload. Signature verification
 * (using `KIRAPAY_WEBHOOK_SECRET`) lands when the adapter is wired.
 */
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const _body = await request.text()
  return NextResponse.json({ ok: true })
}
