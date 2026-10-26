const flows: Record<string, { title: string; steps: string[] }> = {
  service: { title: 'Simplified application integration', steps: ['Angular utility', 'Spring Boot backend', 'Sales Hub APIs'] },
  checkout: { title: 'Simplified checkout workflow', steps: ['Customer checkout', 'Payment integration', 'Authorization', 'Order submission'] },
  modernization: { title: 'Simplified modernization responsibilities', steps: ['Existing ATG capabilities', 'REST service interfaces', 'Authentication, payment, shipping & tax'] },
  integration: { title: 'Simplified integration workflow', steps: ['Commerce activity', 'REST mapping & validation', 'Salesforce CRM'] },
  shipping: { title: 'Simplified service interaction', steps: ['Order journey', 'Shipping estimate service', 'Estimate response'] },
  'local-chat': { title: 'Simplified application flow', steps: ['React / TypeScript chat', 'Java 21 / Spring Boot', 'Ollama local inference'] },
  voice: { title: 'Simplified voice and retrieval workflow', steps: ['Spoken question', 'Speech-to-text', 'OpenAI file retrieval', 'Text-to-speech answer'] },
  workflow: { title: 'Simplified business workflow', steps: ['Customer records', 'Service tracking', 'Operational coordination'] },
  database: { title: 'Documented implementation areas', steps: ['Query tuning', 'Relevant-column indexes', 'Audit-update triggers'] },
  cicd: { title: 'Conceptual delivery illustration', steps: ['Spring Boot application', 'Container image', 'CI/CD tooling', 'Cloud runtime'] },
}
export function ArchitectureDiagram({type,compact=false}:{type:string;compact?:boolean}) {
  if(type === 'helpcorner') return <div className={compact?'workflow-diagram compact':'workflow-diagram'} aria-hidden={compact || undefined}><p className="diagram-label">Documented components · not a deployment topology</p><div className="component-map">{[['Application','React · Spring Boot · Docker'],['Data','MongoDB · donor & distributor records'],['Location messages','AWS SQS'],['AWS setup','EC2 instances · IAM roles'],['Artifact storage','S3 · application JARs']].map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></div>
  if(type === 'kafka') return <div className={compact?'workflow-diagram compact':'workflow-diagram'} aria-hidden={compact || undefined}><p className="diagram-label">Simplified order-event responsibilities</p><div className="event-source">Order information → Kafka</div><div className="event-consumers">{[['Customer email','Order communications'],['OMS','Order processing'],['Business analytics','Post-order analysis']].map(([label,value])=><div key={label}><span aria-hidden="true">↓</span><strong>{label}</strong><small>{value}</small></div>)}</div></div>
  const flow = flows[type] || flows.workflow
  return <div className={compact?'workflow-diagram compact':'workflow-diagram'} aria-hidden={compact || undefined}><p className="diagram-label">{flow.title}</p><ol className="workflow-steps">{flow.steps.map((step,index)=><li key={step}><span className="workflow-step-number">0{index+1}</span>{step}</li>)}</ol></div>
}
export function ProjectDetails({type,title}:{type:string;title:string}) {
  return <figure className="detail-block architecture-panel"><ArchitectureDiagram type={type}/><figcaption>{title}: {type === 'helpcorner' ? 'component responsibilities supplied for this project.' : type === 'cicd' ? 'conceptual demonstration, not a client deployment.' : 'simplified illustration of the documented workflow or implementation areas.'} Infrastructure and confidential implementation details are intentionally omitted.</figcaption></figure>
}

