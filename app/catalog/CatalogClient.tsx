'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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

export default function CatalogClient({ products: initialProducts }: CatalogClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [updatedProducts, setUpdatedProducts] = useState<Set<string>>(new Set())
  const [pendingProductIds, setPendingProductIds] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  // Fetch user's pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: pendingRequests } = await supabase
        .from('purchase_requests')
        .select('product_id')
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      if (pendingRequests) {
        setPendingProductIds(new Set(pendingRequests.map(r => r.product_id)))
      }
    }

    fetchPendingRequests()
  }, [supabase])

  // Set up real-time subscription with polling fallback
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for it_products...')

    let pollInterval: NodeJS.Timeout | null = null
    let isSubscribed = false

    const channel = supabase
      .channel('catalog-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'it_products'
        },
        (payload) => {
          console.log('📡 Real-time event received:', payload)

          if (payload.eventType === 'UPDATE') {
            const updatedProduct = payload.new as Product
            console.log('✏️ Product updated:', updatedProduct)

            // If product went out of stock, remove it from employee view
            if (!updatedProduct.in_stock) {
              console.log('🚫 Product out of stock, removing from catalog')
              setProducts(prev => prev.filter(p => p.id !== updatedProduct.id))
            } else {
              setProducts(prev =>
                prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
              )
              // Mark product as recently updated
              setUpdatedProducts(prev => new Set(prev).add(updatedProduct.id))
              // Remove the badge after 5 seconds
              setTimeout(() => {
                setUpdatedProducts(prev => {
                  const next = new Set(prev)
                  next.delete(updatedProduct.id)
                  return next
                })
              }, 5000)
            }
          } else if (payload.eventType === 'INSERT') {
            const newProduct = payload.new as Product
            console.log('➕ Product added:', newProduct)
            // Only add if in stock (employees should only see in-stock products)
            if (newProduct.in_stock) {
              setProducts(prev => [...prev, newProduct])
              setUpdatedProducts(prev => new Set(prev).add(newProduct.id))
              setTimeout(() => {
                setUpdatedProducts(prev => {
                  const next = new Set(prev)
                  next.delete(newProduct.id)
                  return next
                })
              }, 5000)
            }
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Product deleted:', payload.old)
            setProducts(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Subscription status:', status)

        if (status === 'SUBSCRIBED') {
          isSubscribed = true
          console.log('✅ Real-time enabled!')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Real-time failed, fall back to polling
          if (!isSubscribed && !pollInterval) {
            console.log('⚠️ Real-time unavailable, using polling fallback (checking every 5 seconds)')

            pollInterval = setInterval(async () => {
              console.log('🔄 Polling for product updates...')
              const { data: latestProducts, error } = await supabase
                .from('it_products')
                .select('*')
                .eq('in_stock', true) // Only fetch in-stock products for employees
                .order('category', { ascending: true })

              if (error) {
                console.error('❌ Polling error:', error)
                return
              }

              if (latestProducts) {
                console.log('📦 Fetched products:', latestProducts.length)

                setProducts(prevProducts => {
                  // Check for changes
                  const changedProducts = latestProducts.filter(latest => {
                    const prev = prevProducts.find(p => p.id === latest.id)
                    if (!prev) {
                      console.log('➕ New product detected:', latest.name)
                      return true
                    }

                    const hasChanged =
                      prev.price !== latest.price ||
                      prev.name !== latest.name ||
                      prev.in_stock !== latest.in_stock ||
                      prev.description !== latest.description

                    if (hasChanged) {
                      console.log('🔄 Change detected:', {
                        product: latest.name,
                        oldPrice: prev.price,
                        newPrice: latest.price,
                        priceChanged: prev.price !== latest.price
                      })
                    }

                    return hasChanged
                  })

                  // Mark changed products
                  if (changedProducts.length > 0) {
                    console.log(`✨ ${changedProducts.length} product(s) updated`)
                    changedProducts.forEach(changed => {
                      setUpdatedProducts(prev => new Set(prev).add(changed.id))
                      setTimeout(() => {
                        setUpdatedProducts(prev => {
                          const next = new Set(prev)
                          next.delete(changed.id)
                          return next
                        })
                      }, 5000)
                    })
                  }

                  return latestProducts
                })
              }
            }, 5000) // Poll every 5 seconds
          }
        }
      })

    return () => {
      console.log('🔌 Cleaning up real-time subscription')
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const refreshProducts = async () => {
    console.log('🔄 Manual refresh triggered')
    const { data: latestProducts, error } = await supabase
      .from('it_products')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('❌ Refresh error:', error)
      return
    }

    if (latestProducts) {
      console.log('✅ Refreshed products:', latestProducts.length)
      setProducts(latestProducts)
    }
  }

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

  const handleRequest = async (product: Product, quantity: number, justification: string): Promise<{ success: boolean; error?: string }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Check if user already has a pending request for this product
    const { data: existingRequest, error: existingError } = await supabase
      .from('purchase_requests')
      .select('id, status')
      .eq('product_id', product.id)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing requests:', existingError)
      return { success: false, error: 'Failed to check existing requests.' }
    }

    if (existingRequest) {
      return { success: false, error: 'You already have a pending request for this product. Please wait for it to be reviewed before submitting another.' }
    }

    // Check if product still exists before submitting
    const { data: productCheck, error: checkError } = await supabase
      .from('it_products')
      .select('id, in_stock')
      .eq('id', product.id)
      .single()

    if (checkError || !productCheck) {
      return { success: false, error: 'This product is no longer available. It may have been removed from the catalog.' }
    }

    // Note: We don't check in_stock here because the UI already prevents submission
    // if the product goes out of stock (via the red banner and disabled button)

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
      return { success: false, error: 'Failed to submit request. Please try again.' }
    }

    // Add product to pending list
    setPendingProductIds(prev => new Set(prev).add(product.id))

    return { success: true }
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
            <Button
              onClick={refreshProducts}
              variant="outline"
              className="whitespace-nowrap"
            >
              🔄 Refresh
            </Button>
            <Select value={priceFilter} onValueChange={(value) => setPriceFilter(value || 'all')}>
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
            <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'name')}>
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
            <ProductCard
              key={product.id}
              product={product}
              onRequest={handleRequest}
              isUpdated={updatedProducts.has(product.id)}
              hasPendingRequest={pendingProductIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
