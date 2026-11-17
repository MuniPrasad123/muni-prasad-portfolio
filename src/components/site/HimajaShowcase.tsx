import { HimajaArchitecture } from './HimajaArchitecture'
import { HimajaTechStack } from './HimajaTechStack'

const tabs=[
  ['Products','Category and brand filters, name/SKU search, stock display and a browser-based quote draft.'],
  ['Quote cart','Quantity changes, a configured bulk-price threshold, and location-based tax and delivery estimates. A request is separate from a purchase.'],
  ['Customer account','Sign-in, Digital Quotes, Purchase Invoices and profile navigation. Personal profile fields and existing financial details are excluded from the recording.'],
  ['Support','An assistant entry screen backed by a Gemini integration and persisted chat history in the source. No live chat was created during recording.'],
  ['Contact','Business information and direct contact channels for customers.'],
  ['Partners','A brand directory, product links and partnership application form. No application was submitted.'],
  ['Blog','The business story and editorial content.'],
  ['Gallery','Store photographs with a click-to-zoom interaction.'],
]
const erp=[
  ['Dashboard','Sales and purchase totals, product counts and outstanding ledger balances.'],
  ['Master Info','Product maintenance, inventory adjustments and spreadsheet/CSV imports.'],
  ['Ledgers','Customer, supplier and other account records with balances.'],
  ['Sales Entry','Invoice and item records, stock deductions and receivable postings grouped in a Prisma transaction.'],
  ['Purchase Entry','Purchase items, incoming stock and supplier payable updates.'],
  ['Receipts','Customer collection entries through the shared voucher route.'],
  ['Payments','Supplier payment entries through the shared voucher route.'],
  ['Vouchers','References, particulars, debit/credit movement and ledger updates.'],
  ['Stock Summary','Current stock grouped by brand; some historical movement columns are generated illustrations.'],
]

export function HimajaShowcase(){return <section className="detail-block" aria-labelledby="himaja-demo-title">
  <div className="eyebrow">Wholesale commerce · Operational workflows</div><h2 id="himaja-demo-title">From product discovery to a wholesale quote</h2><p>Explore the live storefront, the customer journey, and the ERP implementation behind stock and account records.</p>
  <video controls playsInline preload="metadata" poster="/demo/himaja/himaja-poster.jpg" aria-label="Himaja Communications narrated walkthrough" style={{width:'100%',borderRadius:14,background:'#0b1729'}}><source src="/demo/himaja/himaja-walkthrough.mp4" type="video/mp4"/><track kind="captions" src="/demo/himaja/himaja-captions.vtt" srcLang="en" label="English narration"/><track kind="chapters" src="/demo/himaja/himaja-chapters.vtt" srcLang="en" label="Walkthrough chapters"/>Your browser does not support video. <a href="/demo/himaja/himaja-walkthrough.mp4">Download the walkthrough</a>.</video>
  <p style={{fontSize:13}}>A six-minute, 20-chapter walkthrough with the same Indian English male narration as DharmaAI. Public pages were recorded and customer navigation was verified on 17 November 2026. Account and ERP sections use explanatory diagrams; personal account fields and live financial actions are not recorded.</p>
  <p><a className="text-link" href="https://www.himajacommunications.com/" target="_blank" rel="noreferrer">Visit the live storefront ↗</a>{' · '}<a className="text-link" href="https://github.com/MuniPrasad123/b2b-wholesale" target="_blank" rel="noreferrer">Project repository ↗</a></p>
  <HimajaTechStack/>
  <h3>Explore each customer-facing tab</h3><div style={{display:'grid',gap:6}}>{tabs.map(([name,description])=><details key={name} style={{borderBottom:'1px solid #385344',padding:'10px 0'}}><summary style={{cursor:'pointer',color:'#ddc17d',fontWeight:600}}>{name}</summary><p style={{fontSize:14,margin:'10px 0'}}>{description}</p></details>)}</div>
  <HimajaArchitecture/>
  <h3>Inside the ERP module</h3><p style={{fontSize:14}}>These screen responsibilities were reviewed in the source. No administrator access was supplied, and no live sales, purchases, receipts, payments or invoice emails were created for this case study.</p><div style={{display:'grid',gap:6}}>{erp.map(([name,description])=><details key={name} style={{borderBottom:'1px solid #385344',padding:'10px 0'}}><summary style={{cursor:'pointer',color:'#ddc17d',fontWeight:600}}>{name}</summary><p style={{fontSize:14,margin:'10px 0'}}>{description}</p></details>)}</div>
  <h3 style={{marginTop:24}}>What the walkthrough verified</h3><ul className="case-decisions"><li>Public navigation, category filtering and an exact SKU search.</li><li>Add-to-quote, quantity changes, configured bulk pricing and a changing delivery estimate. The temporary draft was removed; no quote was submitted.</li><li>Customer sign-in and separate quote-history and invoice tabs, using the owner-provided account.</li><li>The blog, partner directory, contact page, support entry screen and gallery zoom.</li></ul>
</section>}
