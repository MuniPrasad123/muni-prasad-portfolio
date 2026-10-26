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

export const draftArticles = [
  { slug: 'reliable-order-events-with-kafka', category: 'Distributed systems', title: 'Reliable order events with Kafka', summary: 'How to keep order events useful when several downstream teams need to act on them.', reading: 'Unpublished working draft', paragraphs: ['An order event rarely has one audience. Notifications, fulfilment, and analytics each need room to evolve without making checkout wait for every downstream consumer. Separate consumer groups help isolate processing and scaling, while a stable event contract keeps the meaning of the order consistent.', 'The design still needs explicit choices: ordering, delivery guarantees, retries, idempotency, and what happens when a consumer falls behind. Those decisions should follow the business behavior, not the novelty of the broker.'] },
  { slug: 'payment-tokenization-in-commerce', category: 'Payments', title: 'Payment tokenization in commerce systems', summary: 'The integration details that keep card data out of places it does not belong.', reading: 'Unpublished working draft', paragraphs: ['Tokenization changes more than the value stored after checkout. It affects capture, authorization, redirects, retries, and the boundary between the storefront and payment provider. A sound integration makes those states visible without spreading raw card data through the commerce stack.', 'The exact flow depends on the provider and current requirements, but the engineering questions stay familiar: where is sensitive data handled, how is a retry recognized, and what does the order system do when authorization succeeds but the next step fails?'] },
  { slug: 'spring-boot-service-design', category: 'Backend', title: 'Spring Boot service design', summary: 'API boundaries and failure behavior matter more than the framework label.', reading: 'Unpublished working draft', paragraphs: ['A useful service boundary follows a business responsibility that can be explained clearly. Keep the contract explicit, make downstream failures observable, and test the behavior at the boundaries where real systems tend to break.', 'Operational needs belong in the design too: timeouts, retries, traceable logs, and a safe way to roll out changes. Small choices here make an on-call investigation far less mysterious.'] },
  { slug: 'postgresql-indexing', category: 'Data', title: 'PostgreSQL indexing', summary: 'A short exploration of query plans, index choices, and measurement.', reading: 'Unpublished working draft', paragraphs: ['Index choices should follow the actual query shape and workload. Inspect plans, check whether an index supports the predicates and ordering that matter, and consider write cost alongside read benefit.', 'No benchmark results are claimed in this draft. Measure against a representative workload before drawing performance conclusions.'] },
]

export const skillGroups = skillCategories
export const siteFacts = [
  { label: 'Software engineering', value: '10+ years' },
  { label: 'Payment & checkout workflows', value: '4+' },
  { label: 'Engineers led and mentored', value: '5–6' },
]
export const personProfile = profile

