'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bee2Bee</h1>
          <p className="text-gray-600 dark:text-gray-300">IT Procurement Portal</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={origin ? `${origin}/api/auth/callback` : undefined}
          view="sign_in"
          showLinks={false}
        />
        <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold mb-2">Test Accounts:</p>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p><strong>Employee:</strong> employee@test.com</p>
            <p><strong>Manager:</strong> manager@test.com</p>
            <p className="text-gray-500 dark:text-gray-400 italic">Password: Test123456!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
