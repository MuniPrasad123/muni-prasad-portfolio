import { CqrsContext, CqrsLesson } from './CqrsLesson'
import { PracticeFrame } from './PracticeFrame'

export function CqrsLessonWindow({ src }: { src: string }) {
  return <>
    <CqrsContext/>
    <section id="interactive-lab" className="lesson-panel">
      <h2>Try the failure and recovery lab</h2>
      <p>Change the controls and follow the explanation to compare the problem with the proposed solution.</p>
      <a className="text-link" href={src} target="_blank" rel="noreferrer">Open full lab ↗</a>
      <PracticeFrame title="Architecture in Motion · Episode 014 interactive lab" src={src}/>
    </section>
    <details className="lesson-panel" data-cqrs-extended>
      <summary>Explore the extended nine-step journey and eight failure scenarios</summary>
      <CqrsLesson withContext={false} labId="interactive-lab-enhanced"/>
    </details>
  </>
}
