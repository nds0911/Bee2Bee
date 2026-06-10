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

  const handleSubmit = async () => {
    if (quantity < 1 || justification.length < 20) {
      alert('Please enter a valid quantity and justification (min 20 characters)')
      return
    }

    setIsSubmitting(true)
    try {
      await onRequest(product, quantity, justification)
      setIsOpen(false)
      setQuantity(1)
      setJustification('')
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request {product.name}</DialogTitle>
            <DialogDescription>
              Fill out the details for your purchase request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="justification">Justification (min 20 characters)</Label>
              <Textarea
                id="justification"
                placeholder="Explain why you need this equipment..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                {justification.length}/20 characters
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-semibold">Total Cost</p>
              <p className="text-xl font-bold text-indigo-600">
                ${(product.price * quantity).toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
