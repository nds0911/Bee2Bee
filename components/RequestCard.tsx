import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface RequestCardProps {
  request: {
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
}

export default function RequestCard({ request }: RequestCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const product = request.it_products

  if (!product) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-start flex-1">
            {product.image_url && (
              <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-gray-600">Quantity: <strong>{request.quantity}</strong></span>
                <span className="text-gray-600">Total: <strong>${(product.price * request.quantity).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
          <Badge className={statusColors[request.status]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Justification:</p>
          <p className="text-sm text-gray-600 mt-1">{request.justification}</p>
        </div>

        {request.manager_comment && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-semibold text-gray-700">Manager Comment:</p>
            <p className="text-sm text-gray-600 mt-1">{request.manager_comment}</p>
            {request.profiles && (
              <p className="text-xs text-gray-500 mt-1">- {request.profiles.full_name}</p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Submitted {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
