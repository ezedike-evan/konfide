import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const _body = await request.text()
  return NextResponse.json({ ok: true })
}
