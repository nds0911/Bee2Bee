import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import RequestCard from '@/components/RequestCard'

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-600 mt-2">Track the status of your purchase requests</p>
          </div>

          {!requests || requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">You haven't made any requests yet</p>
              <a href="/catalog" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
                Browse the catalog
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
