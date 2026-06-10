'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
    manager_comment?: string | null
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const product = request.it_products
  const requester = request.profiles

  if (!product || !requester) return null

  const handleDecisionClick = (status: 'approved' | 'rejected') => {
    setPendingDecision(status)
    setShowConfirmDialog(true)
  }

  const handleConfirmDecision = async () => {
    if (!pendingDecision) return

    setIsProcessing(true)
    setShowConfirmDialog(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if request is still pending before updating
      const { data: currentRequest, error: checkError } = await supabase
        .from('purchase_requests')
        .select('status')
        .eq('id', request.id)
        .single()

      if (checkError) throw checkError

      if (currentRequest.status !== 'pending') {
        throw new Error(`This request has already been ${currentRequest.status}. Another manager may have processed it.`)
      }

      const { error } = await supabase
        .from('purchase_requests')
        .update({
          status: pendingDecision,
          manager_id: user.id,
          manager_comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .eq('status', 'pending') // Only update if still pending

      if (error) throw error

      setSuccessMessage(
        pendingDecision === 'approved'
          ? `✅ Request approved! ${requester.full_name} will be notified.`
          : `❌ Request rejected. ${requester.full_name} will be notified.`
      )
      setShowSuccessDialog(true)

      setTimeout(() => {
        setShowSuccessDialog(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error updating request:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update request. Please try again.'
      alert(errorMessage)
      router.refresh() // Refresh to show updated state
    } finally {
      setIsProcessing(false)
      setPendingDecision(null)
    }
  }

  return (
    <>
      <Card className="border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              {product.image_url && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-md ring-2 ring-indigo-100">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900">{product.name}</CardTitle>
                <Badge variant="secondary" className="mt-2">{product.category}</Badge>
                <div className="flex gap-6 mt-3 text-sm">
                  <span className="text-gray-600">Qty: <strong className="text-gray-900">{request.quantity}</strong></span>
                  <span className="text-gray-600">Total: <strong className="text-indigo-600 text-lg">${(product.price * request.quantity).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <p className="text-sm font-semibold text-gray-700">Requested by</p>
            </div>
            <p className="text-base text-gray-900 font-semibold">{requester.full_name}</p>
            <p className="text-sm text-gray-600">{requester.email}</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💬</span>
              <p className="text-sm font-semibold text-gray-700">Business Justification</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{request.justification}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
            <span>🕐</span>
            <span>Submitted {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor={`comment-${request.id}`} className="text-base font-semibold text-gray-700">
              Your Comments (Optional) 📝
            </Label>
            <Textarea
              id={`comment-${request.id}`}
              placeholder="Add feedback or conditions for your decision..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 300))}
              rows={3}
              className="resize-none"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 text-right">
              {comment.length}/300 characters
            </p>
          </div>
        </CardContent>
        {request.status === 'pending' ? (
          <CardFooter className="flex gap-3 bg-gray-50 pt-6">
            <Button
              onClick={() => handleDecisionClick('rejected')}
              variant="outline"
              className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold h-12"
              disabled={isProcessing}
            >
              ❌ Reject
            </Button>
            <Button
              onClick={() => handleDecisionClick('approved')}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold h-12 shadow-md"
              disabled={isProcessing}
            >
              ✅ Approve
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="bg-gray-50 pt-4">
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Status:</p>
                <Badge variant={request.status === 'approved' ? 'default' : 'destructive'} className="text-sm">
                  {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </Badge>
              </div>
              {request.manager_comment && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Manager Comment:</p>
                  <p className="text-sm text-gray-600 italic">&quot;{request.manager_comment}&quot;</p>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {pendingDecision === 'approved' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {pendingDecision === 'approved'
                ? `Are you sure you want to approve this $${(product.price * request.quantity).toLocaleString()} request from ${requester.full_name}?`
                : `Are you sure you want to reject this request from ${requester.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-gray-700">Request Summary:</p>
              <p className="text-sm text-gray-600">{product.name} × {request.quantity}</p>
              {comment && (
                <>
                  <p className="text-sm font-semibold text-gray-700 pt-2">Your Comment:</p>
                  <p className="text-sm text-gray-600 italic">&quot;{comment}&quot;</p>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDecision}
              className={pendingDecision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {pendingDecision === 'approved' ? 'Yes, Approve' : 'Yes, Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center pt-4">
              {pendingDecision === 'approved' ? '🎉 Success!' : '✓ Complete'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-lg">{successMessage}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
