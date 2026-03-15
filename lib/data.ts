export type Priority = "high" | "medium" | "low"
export type Status = "to-reach-out" | "reached-out" | "waiting" | "scheduled" | "done"

export interface Activity {
  id: string
  date: string
  note: string
}

export interface Contact {
  id: string
  name: string
  company: string
  title: string
  email: string
  linkedinUrl: string
  notes: string
  priority: Priority
  status: Status
  lastContact: string | null
  nextFollowUp: string | null
  activities: Activity[]
}

export const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const statusLabels: Record<Status, string> = {
  "to-reach-out": "To Reach Out",
  "reached-out": "Reached Out",
  waiting: "Waiting",
  scheduled: "Scheduled",
  done: "Done",
}

export const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "Stripe",
    title: "Engineering Manager",
    email: "sarah.chen@stripe.com",
    linkedinUrl: "https://linkedin.com/in/sarahchen",
    notes: "Met at ReactConf 2024. Very interested in my background in payments.",
    priority: "high",
    status: "scheduled",
    lastContact: "2024-03-10",
    nextFollowUp: "2024-03-20",
    activities: [
      { id: "a1", date: "2024-03-10", note: "Had coffee chat, discussed open roles" },
      { id: "a2", date: "2024-03-05", note: "Connected on LinkedIn after conference" },
    ],
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    company: "Vercel",
    title: "Senior Software Engineer",
    email: "m.rodriguez@vercel.com",
    linkedinUrl: "https://linkedin.com/in/mrodriguez",
    notes: "Former colleague from TechCorp. Now at Vercel on the DX team.",
    priority: "high",
    status: "waiting",
    lastContact: "2024-03-08",
    nextFollowUp: "2024-03-15",
    activities: [
      { id: "a3", date: "2024-03-08", note: "Sent follow-up email about referral" },
    ],
  },
  {
    id: "3",
    name: "Emily Watson",
    company: "Notion",
    title: "Product Designer",
    email: "emily.w@notion.so",
    linkedinUrl: "https://linkedin.com/in/emilywatson",
    notes: "Great connection for product roles. Works closely with engineering.",
    priority: "medium",
    status: "to-reach-out",
    lastContact: null,
    nextFollowUp: "2024-03-18",
    activities: [],
  },
  {
    id: "4",
    name: "James Liu",
    company: "Linear",
    title: "Co-Founder",
    email: "james@linear.app",
    linkedinUrl: "https://linkedin.com/in/jamesliu",
    notes: "Investor connection intro. Building great product team.",
    priority: "high",
    status: "reached-out",
    lastContact: "2024-03-12",
    nextFollowUp: "2024-03-19",
    activities: [
      { id: "a4", date: "2024-03-12", note: "Sent intro email via mutual connection" },
    ],
  },
  {
    id: "5",
    name: "Amanda Foster",
    company: "Figma",
    title: "Tech Lead",
    email: "amanda.f@figma.com",
    linkedinUrl: "https://linkedin.com/in/amandafoster",
    notes: "Met at design systems meetup. Very technical background.",
    priority: "medium",
    status: "done",
    lastContact: "2024-03-01",
    nextFollowUp: null,
    activities: [
      { id: "a5", date: "2024-03-01", note: "Call completed. No current openings but will keep in touch." },
      { id: "a6", date: "2024-02-25", note: "Scheduled call for next week" },
    ],
  },
  {
    id: "6",
    name: "David Park",
    company: "Airbnb",
    title: "Staff Engineer",
    email: "dpark@airbnb.com",
    linkedinUrl: "https://linkedin.com/in/davidpark",
    notes: "Alumni network connection. Focus on infrastructure.",
    priority: "low",
    status: "to-reach-out",
    lastContact: null,
    nextFollowUp: "2024-03-25",
    activities: [],
  },
  {
    id: "7",
    name: "Rachel Green",
    company: "Shopify",
    title: "Director of Engineering",
    email: "rachel.g@shopify.com",
    linkedinUrl: "https://linkedin.com/in/rachelgreen",
    notes: "Conference speaker connection. Building out e-commerce platform team.",
    priority: "medium",
    status: "waiting",
    lastContact: "2024-03-07",
    nextFollowUp: "2024-03-21",
    activities: [
      { id: "a7", date: "2024-03-07", note: "Applied through her referral. Waiting for recruiter." },
    ],
  },
  {
    id: "8",
    name: "Kevin Zhang",
    company: "OpenAI",
    title: "Research Engineer",
    email: "kzhang@openai.com",
    linkedinUrl: "https://linkedin.com/in/kevinzhang",
    notes: "PhD connection from Stanford. Working on API team.",
    priority: "high",
    status: "to-reach-out",
    lastContact: null,
    nextFollowUp: "2024-03-16",
    activities: [],
  },
  {
    id: "9",
    name: "Lisa Thompson",
    company: "Datadog",
    title: "VP of Product",
    email: "lisa.t@datadog.com",
    linkedinUrl: "https://linkedin.com/in/lisathompson",
    notes: "Mentor from previous company. Great for advice and intros.",
    priority: "low",
    status: "done",
    lastContact: "2024-02-28",
    nextFollowUp: null,
    activities: [
      { id: "a8", date: "2024-02-28", note: "Monthly mentor call. Got great advice on negotiation." },
    ],
  },
  {
    id: "10",
    name: "Carlos Martinez",
    company: "Coinbase",
    title: "Engineering Manager",
    email: "carlos.m@coinbase.com",
    linkedinUrl: "https://linkedin.com/in/carlosmartinez",
    notes: "Recruiter intro. Interested in my crypto background.",
    priority: "medium",
    status: "scheduled",
    lastContact: "2024-03-11",
    nextFollowUp: "2024-03-18",
    activities: [
      { id: "a9", date: "2024-03-11", note: "Phone screen scheduled for next week" },
    ],
  },
]
