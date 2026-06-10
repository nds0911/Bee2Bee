'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const supabase = createClient()
  const router = useRouter()

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  // Apply all filters
  let filteredProducts = products

  // Category filter
  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory)
  }

  // Search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Price filter
  if (priceFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => {
      if (priceFilter === 'under500') return p.price < 500
      if (priceFilter === '500to1000') return p.price >= 500 && p.price < 1000
      if (priceFilter === '1000to2000') return p.price >= 1000 && p.price < 2000
      if (priceFilter === 'over2000') return p.price >= 2000
      return true
    })
  }

  // Sort
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'category') return a.category.localeCompare(b.category)
    return 0
  })

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

    router.push('/requests')
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="🔍 Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under500">Under $500</SelectItem>
                <SelectItem value="500to1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000to2000">$1,000 - $2,000</SelectItem>
                <SelectItem value="over2000">Over $2,000</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || priceFilter !== 'all' || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPriceFilter('all')
                setSelectedCategory('All')
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-2">🔍</p>
          <p className="text-gray-500 dark:text-gray-400">No products found matching your filters</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setPriceFilter('all')
              setSelectedCategory('All')
            }}
            className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Clear all filters
          </button>
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
