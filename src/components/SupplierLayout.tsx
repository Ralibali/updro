import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardLayout from '@/components/DashboardLayout'
import LeadGuaranteeCard from '@/components/supplier/LeadGuaranteeCard'
import { Home, Search, FileText, MessageCircle, UserCircle, CreditCard, Gift } from 'lucide-react'

const navItems = [
  { label: 'Översikt', href: '/dashboard/supplier', icon: Home },
  { label: 'Uppdrag', href: '/dashboard/supplier/uppdrag', icon: Search },
  { label: 'Offerter', href: '/dashboard/supplier/offerter', icon: FileText },
  { label: 'Meddelanden', href: '/dashboard/supplier/chatt', icon: MessageCircle },
  { label: 'Profil', href: '/dashboard/supplier/profil', icon: UserCircle },
  { label: 'Fakturering', href: '/dashboard/supplier/fakturering', icon: CreditCard },
  { label: 'Bjud in', href: '/dashboard/supplier/bjud-in', icon: Gift },
]

const SupplierLayout = () => {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const projectId = parts.length === 4 && parts[0] === 'dashboard' && parts[1] === 'supplier' && parts[2] === 'uppdrag' ? parts[3] : null

  return (
    <DashboardLayout navItems={navItems}>
      <Suspense fallback={<div className="animate-pulse h-40 bg-muted rounded-xl" />}>
        <Outlet />
        {projectId && <div className="max-w-3xl mt-6"><LeadGuaranteeCard projectId={projectId} /></div>}
      </Suspense>
    </DashboardLayout>
  )
}

export default SupplierLayout
