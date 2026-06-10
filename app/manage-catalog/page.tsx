import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ManageCatalogClient from './ManageCatalogClient'
import { redirect } from 'next/navigation'

export default async function ManageCatalogPage() {
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

  const { data: products } = await supabase
    .from('it_products')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Catalog</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Add, edit, or remove products from the IT equipment catalog</p>
          </div>
          <ManageCatalogClient products={products || []} />
        </div>
      </div>
    </>
  )
}
