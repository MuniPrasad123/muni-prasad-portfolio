import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound(){return <section className="page" style={{paddingTop:110}}><div className="eyebrow"><span className="eyebrow-line"/>404 · Page not found</div><h1 style={{font:'46px Georgia,serif',lineHeight:1.2}}>This page took<br/><em style={{color:'var(--gold)'}}>a different route.</em></h1><p className="body-copy">The page may have moved, or the address may be incomplete.</p><Link className="button button-gold" href="/"><ArrowLeft size={15}/> Return home</Link></section>}
