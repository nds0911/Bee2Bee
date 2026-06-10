'use client'

import { useState, useEffect } from 'react'
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
  onRequest: (product: Product, quantity: number, justification: string) => Promise<{ success: boolean; error?: string }>
  isUpdated?: boolean
  hasPendingRequest?: boolean
}

export default function ProductCard({ product, onRequest, isUpdated = false, hasPendingRequest = false }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [justification, setJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [initialPrice, setInitialPrice] = useState(product.price)
  const [initialStock, setInitialStock] = useState(product.in_stock)
  const [priceChanged, setPriceChanged] = useState(false)
  const [stockChanged, setStockChanged] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate max quantity based on price
  const getMaxQuantity = (price: number) => {
    if (price < 100) return 50        // Cheap items: max 50
    if (price < 500) return 25        // Accessories: max 25
    if (price < 1000) return 10       // Mid-range: max 10
    if (price < 2000) return 5        // Expensive: max 5
    return 3                          // Premium items: max 3
  }

  const maxQuantity = getMaxQuantity(product.price)

  // Track when modal opens and detect changes
  useEffect(() => {
    if (isOpen) {
      setInitialPrice(product.price)
      setInitialStock(product.in_stock)
      setPriceChanged(false)
      setStockChanged(false)
      setErrorMessage(null)
    }
  }, [isOpen]) // Remove product.price and product.in_stock from dependencies

  // Detect price change while modal is open
  useEffect(() => {
    if (isOpen && initialPrice !== product.price) {
      setPriceChanged(true)
    }
  }, [product.price, initialPrice, isOpen])

  // Detect stock change while modal is open
  useEffect(() => {
    if (isOpen && initialStock && !product.in_stock) {
      setStockChanged(true)
    }
  }, [product.in_stock, initialStock, isOpen])

  const handleSubmit = async () => {
    if (quantity < 1 || justification.length < 20) {
      return
    }

    // Validate quantity doesn't exceed maximum
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity)
      return
    }

    // Block if out of stock - UI already shows this with the banner and disabled button
    if (stockChanged || !product.in_stock) {
      return
    }

    // If price changed, the UI already shows the yellow banner
    // User is aware and can proceed

    setIsSubmitting(true)
    setErrorMessage(null) // Clear any previous errors

    const result = await onRequest(product, quantity, justification)

    if (result.success) {
      setIsOpen(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 2500)
      setQuantity(1)
      setJustification('')
    } else {
      setErrorMessage(result.error || 'Failed to submit request. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <>
      <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${isUpdated ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          {isUpdated && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 text-white">🔄 Updated</Badge>
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">{product.name}</CardTitle>
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
            disabled={!product.in_stock || hasPendingRequest}
          >
            {!product.in_stock ? 'Out of Stock' : hasPendingRequest ? '⏳ Pending Request' : 'Request'}
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

          {/* Error Alert */}
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-1">
                  <p className="font-bold text-red-900 dark:text-red-200">Request Failed</p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stock Change Alert */}
          {stockChanged && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div className="flex-1">
                  <p className="font-bold text-red-900 dark:text-red-200">Out of Stock!</p>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    This product went out of stock while you were viewing. You cannot submit this request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Change Alert */}
          {priceChanged && !stockChanged && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-yellow-900 dark:text-yellow-200">Price Updated!</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    The price changed from <span className="line-through">${initialPrice.toLocaleString()}</span> to{' '}
                    <span className="font-bold">${product.price.toLocaleString()}</span> while you were viewing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg border border-indigo-100 dark:border-indigo-800">
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ${product.price.toLocaleString()} each
                {priceChanged && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Updated)</span>}
              </p>
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
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setQuantity(Math.min(val, maxQuantity))
                }}
                className="text-lg h-12"
              />
              <p className="text-xs text-gray-500">
                Maximum {maxQuantity} units for items at this price point
              </p>
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
                onChange={(e) => setJustification(e.target.value.slice(0, 500))}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className={`text-xs ${justification.length >= 20 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {justification.length >= 20 ? "✓ Great! You're good to go" : `${justification.length}/20 characters minimum`}
                </p>
                <p className="text-xs text-gray-400">
                  {justification.length}/500 characters
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
              disabled={isSubmitting || justification.length < 20 || stockChanged || !product.in_stock}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {stockChanged || !product.in_stock ? (
                '🚫 Out of Stock'
              ) : isSubmitting ? (
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
