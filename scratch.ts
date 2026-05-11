async function tryAutoCheckout() {
  const playwrightPkg = 'playwright'
  const playwright = (await import(playwrightPkg).catch(() => null)) as any
}
