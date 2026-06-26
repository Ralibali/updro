import LeadGuaranteeAdminPanel from '@/components/admin/LeadGuaranteeAdminPanel'
import MarketplaceHealthPanel from '@/components/admin/MarketplaceHealthPanel'
import ProjectQualityPanel from '@/components/admin/ProjectQualityPanel'
import { AdminLayout } from './AdminDashboard'

const AdminMarketplaceHealth = () => (
  <AdminLayout>
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-bold mb-6">Marketplace health</h1>
      <MarketplaceHealthPanel />
      <ProjectQualityPanel />
      <LeadGuaranteeAdminPanel />
    </div>
  </AdminLayout>
)

export default AdminMarketplaceHealth
