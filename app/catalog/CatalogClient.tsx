'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  image_url: string | null
  in_stock: boolean
}

interface CatalogClientProps {
  products: Product[]
}

export default function CatalogClient({ products }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const supabase = createClient()
  const router = useRouter()

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const handleRequest = async (product: Product, quantity: number, justification: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('purchase_requests')
      .insert({
        product_id: product.id,
        requester_id: user.id,
        quantity,
        justification,
        status: 'pending'
      })

    if (error) {
      console.error('Error creating request:', error)
      throw error
    }

    // Success is now handled by ProductCard's success dialog
    router.push('/requests')
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onRequest={handleRequest} />
          ))}
        </div>
      )}
    </div>
  )
}
