export type BuyerContact = {
  full_name?: string | null
  company_name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
}

export const getProjectBuyerContact = (project: {
  profiles?: BuyerContact | null
  guest_leads?: BuyerContact | null
}): BuyerContact | null => project.profiles || project.guest_leads || null
