import LeadGuaranteeAdminPanel from '@/components/admin/LeadGuaranteeAdminPanel'
import MarketplaceHealthPanel from '@/components/admin/MarketplaceHealthPanel'
import MarketplaceLiquidityPanel from '@/components/admin/MarketplaceLiquidityPanel'
import ProjectQualityPanel from '@/components/admin/ProjectQualityPanel'
import ProjectOutcomesPanel from '@/components/admin/ProjectOutcomesPanel'
import { AdminLayout } from './AdminDashboard'

const AdminMarketplaceHealth = () => (
  <AdminLayout>
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold mb-6">Marketplace health</h1>
      <MarketplaceHealthPanel />
      <MarketplaceLiquidityPanel />
      <ProjectQualityPanel />
      <ProjectOutcomesPanel />
      <LeadGuaranteeAdminPanel />
    </div>
  </AdminLayout>
)

export default AdminMarketplaceHealth
