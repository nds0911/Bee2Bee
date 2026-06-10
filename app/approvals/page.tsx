import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ApprovalsClient from './ApprovalsClient'
import { redirect } from 'next/navigation'

export default async function ApprovalsPage() {
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
      profiles!purchase_requests_requester_id_fkey (
        full_name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review and approve purchase requests from your team</p>
          </div>
          <ApprovalsClient requests={requests || []} />
        </div>
      </div>
    </>
  )
}
