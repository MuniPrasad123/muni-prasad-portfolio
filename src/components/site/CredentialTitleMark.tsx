const tones: Record<string, string> = {
  Oracle: 'oracle',
  Confluent: 'confluent',
  IBM: 'ibm',
  AWS: 'aws',
  Google: 'google',
  'Linux Foundation': 'linux',
  OpenAI: 'openai',
  Kibo: 'kibo',
}

export function CredentialTitleMark({ title, issuer, mark }: { title: string; issuer: string; mark: string }) {
  return <div className={`credential-title-mark tone-${tones[issuer] || 'default'}`} role="img" aria-label={`${title} credential title mark`}>
    <span className="credential-mark-overline">Professional credential</span>
    <strong className="credential-mark-code">{mark}</strong>
    <span className="credential-mark-title">{title}</span>
  </div>
}
