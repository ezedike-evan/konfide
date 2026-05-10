/**
 * Indexer entrypoint.
 *
 * For now this just logs a startup line and exits cleanly so deployment
 * pipelines can verify the binary boots. Real worker scheduling lands when
 * the adapters are no longer stubs.
 */
async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('konfide indexer started')
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('indexer crashed:', err)
  process.exit(1)
})
