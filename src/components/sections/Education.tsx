import { education } from '@/data/profile'

export function Education() {
  return <section className="section py-24" id="education">
    <div className="container max-w-7xl mx-auto px-6">
      <span className="section__eyebrow">Foundations</span>
      <h2 className="section__title mb-10">Education &amp; <strong>Recognition</strong></h2>
      <div className="grid md:grid-cols-3 gap-6">
        {education.map(item => <article key={item.title} className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-white mb-3">{item.title}</h3>
          <p className="text-sm text-slate-300">{item.institution}</p>
          <p className="text-sm text-slate-400 mt-3">{item.detail}</p>
        </article>)}
        <article className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-white mb-3">High Performance &amp; Client Contribution</h3>
          <p className="text-sm text-slate-300">OLR · Certificate of Appreciation</p>
          <p className="text-sm text-slate-400 mt-3">September 2025 · Shared on LinkedIn</p>
        </article>
      </div>
    </div>
  </section>
}
