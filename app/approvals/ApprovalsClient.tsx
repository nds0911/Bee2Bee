'use client'

import { useState } from 'react'
import ApprovalCard from '@/components/ApprovalCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Request {
  id: string
  quantity: number
  justification: string
  status: string
  created_at: string
  it_products: {
    name: string
    category: string
    price: number
    image_url: string | null
  } | null
  profiles: {
    full_name: string
    email: string
  } | null
}

export default function ApprovalsClient({ requests }: { requests: Request[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('oldest')

  const categories = ['all', ...Array.from(new Set(requests.map(r => r.it_products?.category).filter(Boolean)))]

  let filteredRequests = [...requests]

  // Category filter
  if (categoryFilter !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.it_products?.category === categoryFilter)
  }

  // Search filter
  if (searchQuery) {
    filteredRequests = filteredRequests.filter(r =>
      r.it_products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.justification.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort
  filteredRequests.sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortBy === 'price-high') return (b.it_products?.price || 0) * b.quantity - (a.it_products?.price || 0) * a.quantity
    if (sortBy === 'price-low') return (a.it_products?.price || 0) * a.quantity - (b.it_products?.price || 0) * b.quantity
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="🔍 Search by product, employee, or justification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c !== 'all').map(category => (
                  <SelectItem key={category} value={category as string}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-high">Highest Cost</SelectItem>
                <SelectItem value="price-low">Lowest Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRequests.length} pending request{filteredRequests.length !== 1 ? 's' : ''}
          </p>
          {(searchQuery || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('all')
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-xl mb-2">🔍</p>
          <p className="text-gray-500 dark:text-gray-400">
            {requests.length === 0
              ? "No pending requests at this time"
              : "No requests found matching your filters"
            }
          </p>
          {requests.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('all')
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <ApprovalCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
