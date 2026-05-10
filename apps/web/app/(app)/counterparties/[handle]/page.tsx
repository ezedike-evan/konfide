/**
 * Counterparty profile page — surfaces trust score and trade history.
 *
 * Placeholder route.
 */
import type { ReactElement } from 'react'

export default async function CounterpartyPage({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<ReactElement> {
  const { handle } = await params
  return (
    <section className="px-6 py-12">
      <h1 className="text-2xl font-semibold">@{handle}</h1>
    </section>
  )
}
