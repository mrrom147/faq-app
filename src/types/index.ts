export interface Faq {
  id: string
  question: string
  answer: string
  category: string
  viewCount: number
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface FaqInput {
  question: string
  answer: string
  category: string
}

export interface SearchStat {
  term: string
  count: number
  updatedAt: number
}

export interface UserProfile {
  uid: string
  email: string
  role: 'admin' | 'viewer'
}
