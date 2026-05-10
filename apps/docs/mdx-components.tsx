/**
 * MDX components used across the Nextra 4 docs site.
 *
 * Nextra 4 requires this file at the project root so its catch-all page
 * route can wrap MDX content with theme-provided components (callouts,
 * tabs, links, code blocks, etc.).
 */
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

type MDXComponents = ReturnType<typeof getDocsMDXComponents>

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...docsComponents,
    ...components,
  }
}
