'use client'
import { useState } from 'react'
export function ArticleContent({ html }: { html: string }) {
  const [status, setStatus] = useState('')
  return <><div className="article-prose" onClick={async event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-copy-code]')
    if (!button) return
    const code = button.closest('.code-block')?.querySelector('code')?.textContent
    if (!code) return
    try { await navigator.clipboard.writeText(code); setStatus('Code copied to clipboard.') }
    catch { setStatus('Could not copy. Select the code and copy it manually.') }
  }} dangerouslySetInnerHTML={{ __html: html }}/><p className="copy-feedback" role="status">{status}</p></>
}
