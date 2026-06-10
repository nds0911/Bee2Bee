'use client'

import { useState } from 'react'
import RequestCard from '@/components/RequestCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Request {
  id: string
  quantity: number
  justification: string
  status: 'pending' | 'approved' | 'rejected'
  manager_comment: string | null
  created_at: string
  it_products: {
    name: string
    category: string
    price: number
    image_url: string | null
  } | null
  profiles: {
    full_name: string
  } | null
}

export default function RequestsClient({ requests }: { requests: Request[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  let filteredRequests = [...requests]

  // Status filter
  if (statusFilter !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.status === statusFilter)
  }

  // Search filter
  if (searchQuery) {
    filteredRequests = filteredRequests.filter(r =>
      r.it_products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.justification.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort
  filteredRequests.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
              placeholder="🔍 Search your requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Highest Cost</SelectItem>
                <SelectItem value="price-low">Lowest Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
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
              ? "You haven't made any requests yet"
              : "No requests found matching your filters"
            }
          </p>
          {requests.length === 0 ? (
            <a href="/catalog" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
              Browse the catalog
            </a>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
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
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
