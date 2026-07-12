import { AdminLayout } from './AdminDashboard'
import AcquisitionFunnel from '@/components/admin/AcquisitionFunnel'
import VisitorAnalytics from '@/components/admin/VisitorAnalytics'

const AdminVisitors = () => (
  <AdminLayout>
    <h1 className="font-display text-2xl font-bold mb-6">Besöksanalys</h1>
    <AcquisitionFunnel />
    <VisitorAnalytics />
  </AdminLayout>
)

export default AdminVisitors
