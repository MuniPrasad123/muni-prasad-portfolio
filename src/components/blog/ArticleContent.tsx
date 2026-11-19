'use client'
import { useEffect, useState } from 'react'
export function ArticleContent({ html, collapseAdvanced = false }: { html: string; collapseAdvanced?: boolean }) {
  const [status, setStatus] = useState('')
  // Only Episode 014 opts in; sanitized Markdown remains the source of every section.
  const displayed = collapseAdvanced ? html.replace(/(<h2 id="section-(?:9|10)-[^"]+">[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2 |$)/g,
    '$1<details class="article-advanced"><summary>Explore the implementation and failure cases</summary>$2</details>') : html
  useEffect(() => {
    if (!collapseAdvanced) return
    function revealAnchor() {
      const id = window.location.hash.slice(1)
      const target = document.getElementById(id)
      const details = target?.closest('details')
      if (details) { details.open = true; target?.scrollIntoView() }
    }
    revealAnchor(); window.addEventListener('hashchange', revealAnchor)
    return () => window.removeEventListener('hashchange', revealAnchor)
  }, [collapseAdvanced])
  return <><div className="article-prose" onClick={async event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-copy-code]')
    if (!button) return
    const code = button.closest('.code-block')?.querySelector('code')?.textContent
    if (!code) return
    try { await navigator.clipboard.writeText(code); setStatus('Code copied to clipboard.') }
    catch { setStatus('Could not copy. Select the code and copy it manually.') }
  }} dangerouslySetInnerHTML={{ __html: displayed }}/><p className="copy-feedback" role="status">{status}</p></>
}
