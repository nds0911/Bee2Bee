'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApprovalCardProps {
  request: {
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
}

export default function ApprovalCard({ request }: ApprovalCardProps) {
  const [comment, setComment] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const product = request.it_products
  const requester = request.profiles

  if (!product || !requester) return null

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('purchase_requests')
        .update({
          status,
          manager_id: user.id,
          manager_comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (error) throw error

      alert(`Request ${status} successfully!`)
      router.refresh()
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Failed to update request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-start flex-1">
            {product.image_url && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <Badge variant="secondary" className="mt-2">{product.category}</Badge>
              <div className="flex gap-6 mt-3 text-sm">
                <span className="text-gray-600">Quantity: <strong>{request.quantity}</strong></span>
                <span className="text-gray-600">Total Cost: <strong className="text-indigo-600">${(product.price * request.quantity).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-700">Requested by:</p>
          <p className="text-sm text-gray-900 font-medium mt-1">{requester.full_name}</p>
          <p className="text-xs text-gray-600">{requester.email}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">Justification:</p>
          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">{request.justification}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Submitted on {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`comment-${request.id}`}>Manager Comment (Optional)</Label>
          <Textarea
            id={`comment-${request.id}`}
            placeholder="Add a comment about this decision..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          onClick={() => handleDecision('rejected')}
          variant="outline"
          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
          disabled={isProcessing}
        >
          Reject
        </Button>
        <Button
          onClick={() => handleDecision('approved')}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={isProcessing}
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
}
