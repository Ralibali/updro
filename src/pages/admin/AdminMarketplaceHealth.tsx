import LeadGuaranteeAdminPanel from '@/components/admin/LeadGuaranteeAdminPanel'
import MarketplaceHealthPanel from '@/components/admin/MarketplaceHealthPanel'
import MarketplaceLiquidityPanel from '@/components/admin/MarketplaceLiquidityPanel'
import { Link } from 'react-router-dom'
import ProjectOutcomesPanel from '@/components/admin/ProjectOutcomesPanel'
import { AdminLayout } from './AdminDashboard'

const AdminMarketplaceHealth = () => (
  <AdminLayout>
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold mb-6">Utbud och efterfrågan</h1>
      <MarketplaceHealthPanel />
      <MarketplaceLiquidityPanel />
      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Granska inkomna uppdrag</h2>
        <p className="mt-2 text-sm text-muted-foreground">Kontrollera beställarens uppgifter, behov och budget innan du godkänner ett uppdrag.</p>
        <Link className="mt-4 inline-block font-medium underline underline-offset-4" to="/admin/uppdrag?status=pending">Öppna uppdrag som väntar på granskning</Link>
      </section>
      <ProjectOutcomesPanel />
      <LeadGuaranteeAdminPanel />
    </div>
  </AdminLayout>
)

export default AdminMarketplaceHealth
