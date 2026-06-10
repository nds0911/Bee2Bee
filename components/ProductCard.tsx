'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  image_url: string | null
  in_stock: boolean
}

interface ProductCardProps {
  product: Product
  onRequest: (product: Product, quantity: number, justification: string) => Promise<void>
}

export default function ProductCard({ product, onRequest }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [justification, setJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async () => {
    if (quantity < 1 || justification.length < 20) {
      return
    }

    setIsSubmitting(true)
    try {
      await onRequest(product, quantity, justification)
      setIsOpen(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 2500)
      setQuantity(1)
      setJustification('')
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-100">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-indigo-600">${product.price.toLocaleString()}</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full"
            disabled={!product.in_stock}
          >
            {product.in_stock ? 'Request' : 'Out of Stock'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">Request Equipment</DialogTitle>
            <DialogDescription className="text-base">
              Let's get you set up with {product.name}
            </DialogDescription>
          </DialogHeader>

          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
            {product.image_url && (
              <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">${product.price.toLocaleString()} each</p>
            </div>
          </div>

          <div className="space-y-5 py-2">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-semibold text-gray-700">
                How many do you need?
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-lg h-12"
              />
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <Label htmlFor="justification" className="text-base font-semibold text-gray-700">
                Why do you need this? 💬
              </Label>
              <Textarea
                id="justification"
                placeholder="Share your reason (e.g., 'My current laptop is 5 years old and can't handle the new dev tools we're using...')"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className={`text-xs ${justification.length >= 20 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {justification.length >= 20 ? "✓ Great! You're good to go" : `${justification.length}/20 characters minimum`}
                </p>
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Request Cost</p>
                  <p className="text-3xl font-bold mt-1">
                    ${(product.price * quantity).toLocaleString()}
                  </p>
                </div>
                <div className="text-right opacity-90">
                  <p className="text-xs">{quantity} × ${product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || justification.length < 20}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Submitting...</span>
                </>
              ) : (
                'Submit Request 🚀'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center pt-4">
              🎉 Request Submitted!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6 space-y-3">
            <p className="text-lg">Your request for <strong>{product.name}</strong> has been sent to your manager for approval.</p>
            <p className="text-sm text-gray-600">You can track the status in "My Requests"</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
