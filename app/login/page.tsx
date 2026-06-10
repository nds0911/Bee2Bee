'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/catalog')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bee2Bee</h1>
          <p className="text-gray-600">IT Procurement Portal</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={`${window.location.origin}/api/auth/callback`}
        />
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700 font-semibold mb-2">Test Accounts:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Employee:</strong> employee@test.com</p>
            <p><strong>Manager:</strong> manager@test.com</p>
            <p className="text-gray-500 italic">Password: Test123456!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
