export function PageHero({ label, title, description, children }: { label: string; title: React.ReactNode; description: string; children?: React.ReactNode }) {
  return <header className="page-hero"><div className="eyebrow"><span className="eyebrow-line"/>{label}</div><h1>{title}</h1><p>{description}</p>{children}</header>
}
