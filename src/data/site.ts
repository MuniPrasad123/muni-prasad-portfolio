import { experiences, projects, profile, skillCategories, certifications } from '@/data/profile'

export function experienceLabel(now = new Date()) {
  const start = new Date(2016, 4, 1)
  const months = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth())
  const years = Math.floor(months / 12)
  return `${years} years`
}

export const pillars = [
  { n: '01', title: 'Backend ownership', text: 'Shape a business need into clear service behavior, build the integration, and keep the change understandable for the engineers who support it.' },
  { n: '02', title: 'Commerce workflow engineering', text: 'Follow the customer journey across cart, checkout, payment, and order, so changes work across the hand-offs and business rules.' },
  { n: '03', title: 'Dependable delivery', text: 'Pair implementation with practical testing, release checks, and production investigation to help teams ship with confidence.' },
]

const projectProfiles: Record<string, { slug: string; category: string; diagram: string; approach: string }> = {
  'Java & Spring Boot Service Engineering': { slug: 'java-spring-boot-services', category: 'Java & Spring Boot', diagram: 'service', approach: 'Built an internal application around practical operational needs, combining a Spring Boot backend, Angular interface, and Sales Hub APIs.' },
  'Kafka Order-Event Workflows': { slug: 'kafka-order-events', category: 'Event-driven workflows', diagram: 'kafka', approach: 'Used Kafka to distribute order information for customer email, OMS processing, and post-order analytics at Bed Bath & Beyond.' },
  'PostgreSQL Query & Audit Improvements': { slug: 'postgresql-query-audit', category: 'Data engineering', diagram: 'database', approach: 'Worked on query tuning, relevant-column indexes, and triggers for audit-record updates.' },
  'Enterprise Checkout & Payments': { slug: 'enterprise-checkout-payments', category: 'Payments & checkout', diagram: 'checkout', approach: 'Connected payment choices, authorization, and order submission across checkout paths, with attention to the hand-offs between storefront, payment provider, and commerce services.' },
  'Oracle ATG Commerce Modernization': { slug: 'oracle-atg-modernization', category: 'Commerce modernization', diagram: 'modernization', approach: 'Helped untangle order-flow dependencies by building ATG REST capabilities and contributing to modular services for authentication, payment, shipping, tax, and validation.' },
  'Salesforce & Commerce Integrations': { slug: 'salesforce-commerce-integrations', category: 'Enterprise integrations', diagram: 'integration', approach: 'Connected commerce features with Salesforce CRM through REST integrations, feature validation, and cross-system troubleshooting.' },
  'Shipping Estimate Service': { slug: 'shipping-estimate-service', category: 'Commerce services', diagram: 'shipping', approach: 'Supported a shipping-estimate service within a distributed order journey, working across API behavior, validation, and production troubleshooting.' },
  MuniAI: { slug: 'muniai', category: 'Applied AI', diagram: 'local-chat', approach: 'Connected a React and TypeScript chat interface with a Java 21 / Spring Boot backend and Ollama for local model inference.' },
  DharmaAI: { slug: 'dharmaai', category: 'Applied AI', diagram: 'voice', approach: 'Built a voice-based book assistant using OpenAI file retrieval and speech-to-text / text-to-speech. A custom RAG pipeline and agent-based features are roadmap items.' },
  HelpCorner: { slug: 'helpcorner', category: 'Full-stack & AWS', diagram: 'helpcorner', approach: 'Combined donation coordination with MongoDB records, SQS location messages, containerization, and practical AWS setup.' },
  'Himaja Communication ERP': { slug: 'himaja-communication-erp', category: 'Business workflows', diagram: 'workflow', approach: 'Mapped customer and service-tracking needs into connected operational workflows.' },
  'Cloud & DevOps Portfolio': { slug: 'cloud-devops-portfolio', category: 'Cloud & DevOps', diagram: 'cicd', approach: 'Hands-on Spring Boot examples around containerization, CI/CD, Kubernetes, and cloud deployment; these are technical demonstrations rather than client systems.' },
}
export const portfolioProjects = projects.map(project => ({
  ...project,
  ...(projectProfiles[project.title] || { slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), category: 'Other work', diagram: 'workflow', approach: project.role }),
  context: project.category,
  stack: project.techStack || [],
}))

export const careerHistory = experiences.map(item => ({
  ...item,
  employer: item.company.split(' · ')[0],
  client: item.company.includes(' · ') ? item.company.split(' · ').slice(1).join(' · ') : undefined,
  clientLabel: item.company.startsWith('Ilabz') ? 'Engagement through' : 'Client',
}))

const credentialType: Record<string, string> = {
  'Oracle Cloud Infrastructure Certified Architect Associate': 'Certification',
  'Agentic AI Certified Foundations Associate': 'Certification',
  'Oracle Cloud Infrastructure Certified AI Foundations Associate': 'Certification',
  'Confluent Apache Kafka Fundamentals Accreditation': 'Accreditation',
  'Containers & Kubernetes Essentials': 'Training badge',
  'Docker Essentials: A Developer Introduction': 'Training badge',
  'From Relational Model (SQL) to MongoDBs Document Model': 'Course badge',
  'Generative AI Essentials': 'Training badge',
  'LFEL1011: OpenAPI Fundamentals': 'Course badge',
  'MongoDB Overview: Core Concepts and Architecture': 'Course badge',
  'Kibo Ecomm Certification': 'Certification',
  'Kibo Developers Certification': 'Certification',
}
export const credentials = certifications.map(item => ({ ...item, category: credentialType[item.title] || 'Credential' }))

export const profiles = [
  { key: 'backend', label: 'Senior Java / Backend Engineer', intro: 'Java and Spring Boot engineering for reliable enterprise services.', focus: ['Java / J2EE', 'Spring / Spring Boot', 'REST APIs', 'Microservices', 'Web Services / JAX-RS', 'JMS'], roles: ['Senior Java Engineer', 'Senior Backend Engineer', 'Lead Software Engineer'] },
  { key: 'commerce', label: 'Oracle ATG Commerce Consultant', intro: 'Hands-on enterprise commerce engineering across the customer order journey.', focus: ['Oracle ATG', 'Cart & checkout', 'Pricing & promotions', 'Payments & orders', 'Tax & shipping', 'Kibo Commerce'], roles: ['Oracle ATG Developer', 'Commerce Consultant', 'Commerce Integration Engineer'] },
  { key: 'integration', label: 'Backend Lead / Integration Engineer', intro: 'Service integration and delivery across enterprise platforms and cloud environments.', focus: ['REST / JAX-RS', 'CyberSource & APIGEE', 'Salesforce CRM', 'Docker & Kubernetes', 'AWS & GCP', 'CI/CD & Jenkins'], roles: ['Backend Lead', 'Integration Engineer', 'Technical Consultant'] },
]


export const skillGroups = skillCategories
export const siteFacts = [
  { label: 'Software engineering', value: '10+ years' },
  { label: 'Payment & checkout workflows', value: '4+' },
  { label: 'Engineers led and mentored', value: '5–6' },
]
export const personProfile = profile

