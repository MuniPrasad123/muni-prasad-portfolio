'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
export function CopyEmail({email}:{email:string}) {
  const [status,setStatus]=useState('')
  async function copy(){
    try { await navigator.clipboard.writeText(email); setStatus('Email copied to clipboard.') }
    catch { setStatus('Copy is unavailable in this browser. Select the email address above to copy it.') }
  }
  return <div className="copy-email"><button className="button button-outline" type="button" onClick={copy}>{status.startsWith('Email copied')?<Check size={15}/>:<Copy size={15}/>} Copy email</button><p role="status" aria-live="polite">{status}</p></div>
}

