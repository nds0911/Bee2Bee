import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import AdminClient from './AdminClient'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    redirect('/catalog')
  }

  // Get initial stats
  const [productsResult, requestsResult, profilesResult] = await Promise.all([
    supabase.from('it_products').select('*', { count: 'exact' }),
    supabase.from('purchase_requests').select('*', { count: 'exact' }),
    supabase.from('profiles').select('*', { count: 'exact' })
  ])

  const stats = {
    totalProducts: productsResult.count || 0,
    totalRequests: requestsResult.count || 0,
    totalUsers: profilesResult.count || 0,
    inStockProducts: productsResult.data?.filter(p => p.in_stock).length || 0,
    pendingRequests: requestsResult.data?.filter(r => r.status === 'pending').length || 0,
    approvedRequests: requestsResult.data?.filter(r => r.status === 'approved').length || 0,
    rejectedRequests: requestsResult.data?.filter(r => r.status === 'rejected').length || 0,
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Run health checks and view system statistics</p>
          </div>
          <AdminClient initialStats={stats} />
        </div>
      </div>
    </>
  )
}
