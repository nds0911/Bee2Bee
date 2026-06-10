import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import RequestsClient from './RequestsClient'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: requests } = await supabase
    .from('purchase_requests')
    .select(`
      *,
      it_products (
        name,
        category,
        price,
        image_url
      ),
      profiles!purchase_requests_manager_id_fkey (
        full_name
      )
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track the status of your purchase requests</p>
          </div>
          <RequestsClient requests={requests || []} />
        </div>
      </div>
    </>
  )
}
