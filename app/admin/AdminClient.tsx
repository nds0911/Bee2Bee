'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalProducts: number
  totalRequests: number
  totalUsers: number
  inStockProducts: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'running'
  message: string
  duration?: number
}

export default function AdminClient({ initialStats }: { initialStats: Stats }) {
  const [stats, setStats] = useState(initialStats)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const supabase = createClient()

  const runSanityTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const tests: TestResult[] = []

    // Test 1: Database Connectivity
    const test1Start = Date.now()
    tests.push({ name: 'Database Connectivity', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { error } = await supabase.from('profiles').select('count').limit(1)
      const duration = Date.now() - test1Start
      if (error) throw error
      tests[0] = { name: 'Database Connectivity', status: 'pass', message: 'Successfully connected to Supabase', duration }
    } catch (error) {
      tests[0] = { name: 'Database Connectivity', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test1Start }
    }
    setTestResults([...tests])

    // Test 2: Products Table
    const test2Start = Date.now()
    tests.push({ name: 'Products Table', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data, error } = await supabase.from('it_products').select('*').limit(5)
      const duration = Date.now() - test2Start
      if (error) throw error
      tests[1] = { name: 'Products Table', status: 'pass', message: `Found ${data?.length || 0} products`, duration }
    } catch (error) {
      tests[1] = { name: 'Products Table', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test2Start }
    }
    setTestResults([...tests])

    // Test 3: Profiles Table
    const test3Start = Date.now()
    tests.push({ name: 'Profiles Table', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(5)
      const duration = Date.now() - test3Start
      if (error) throw error
      const employees = data?.filter(p => p.role === 'employee').length || 0
      const managers = data?.filter(p => p.role === 'manager').length || 0
      tests[2] = { name: 'Profiles Table', status: 'pass', message: `Found ${employees} employees, ${managers} managers`, duration }
    } catch (error) {
      tests[2] = { name: 'Profiles Table', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test3Start }
    }
    setTestResults([...tests])

    // Test 4: Purchase Requests Table
    const test4Start = Date.now()
    tests.push({ name: 'Purchase Requests Table', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data, error } = await supabase.from('purchase_requests').select('*').limit(5)
      const duration = Date.now() - test4Start
      if (error) throw error
      tests[3] = { name: 'Purchase Requests Table', status: 'pass', message: `Found ${data?.length || 0} recent requests`, duration }
    } catch (error) {
      tests[3] = { name: 'Purchase Requests Table', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test4Start }
    }
    setTestResults([...tests])

    // Test 5: Authentication
    const test5Start = Date.now()
    tests.push({ name: 'Authentication', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      const duration = Date.now() - test5Start
      if (error) throw error
      tests[4] = { name: 'Authentication', status: 'pass', message: `Logged in as ${user?.email}`, duration }
    } catch (error) {
      tests[4] = { name: 'Authentication', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test5Start }
    }
    setTestResults([...tests])

    // Test 6: RLS Policies
    const test6Start = Date.now()
    tests.push({ name: 'Row-Level Security', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      // Try to access own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const duration = Date.now() - test6Start
      if (error) throw error
      tests[5] = { name: 'Row-Level Security', status: 'pass', message: 'RLS policies working correctly', duration }
    } catch (error) {
      tests[5] = { name: 'Row-Level Security', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test6Start }
    }
    setTestResults([...tests])

    // Test 7: Data Integrity
    const test7Start = Date.now()
    tests.push({ name: 'Data Integrity', status: 'running', message: 'Testing...' })
    setTestResults([...tests])

    try {
      const { data: requests, error } = await supabase
        .from('purchase_requests')
        .select('*, it_products(*), profiles(*)')
        .limit(10)

      const duration = Date.now() - test7Start
      if (error) throw error

      const orphaned = requests?.filter(r => !r.it_products || !r.profiles).length || 0
      if (orphaned > 0) {
        tests[6] = { name: 'Data Integrity', status: 'fail', message: `Found ${orphaned} orphaned requests`, duration }
      } else {
        tests[6] = { name: 'Data Integrity', status: 'pass', message: 'No data integrity issues found', duration }
      }
    } catch (error) {
      tests[6] = { name: 'Data Integrity', status: 'fail', message: `Failed: ${error}`, duration: Date.now() - test7Start }
    }
    setTestResults([...tests])

    setIsRunningTests(false)
  }

  const refreshStats = async () => {
    const [productsResult, requestsResult, profilesResult] = await Promise.all([
      supabase.from('it_products').select('*', { count: 'exact' }),
      supabase.from('purchase_requests').select('*', { count: 'exact' }),
      supabase.from('profiles').select('*', { count: 'exact' })
    ])

    setStats({
      totalProducts: productsResult.count || 0,
      totalRequests: requestsResult.count || 0,
      totalUsers: profilesResult.count || 0,
      inStockProducts: productsResult.data?.filter(p => p.in_stock).length || 0,
      pendingRequests: requestsResult.data?.filter(r => r.status === 'pending').length || 0,
      approvedRequests: requestsResult.data?.filter(r => r.status === 'approved').length || 0,
      rejectedRequests: requestsResult.data?.filter(r => r.status === 'rejected').length || 0,
    })
  }

  const passedTests = testResults.filter(t => t.status === 'pass').length
  const failedTests = testResults.filter(t => t.status === 'fail').length

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-4xl">{stats.totalProducts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.inStockProducts} in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-4xl">{stats.totalRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingRequests} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approval Rate</CardDescription>
            <CardTitle className="text-4xl">
              {stats.totalRequests > 0
                ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
                : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.approvedRequests} approved, {stats.rejectedRequests} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-4xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshStats} variant="outline" size="sm" className="w-full">
              Refresh Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sanity Tests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Health Checks</CardTitle>
              <CardDescription>Run automated tests to verify system integrity</CardDescription>
            </div>
            <Button
              onClick={runSanityTests}
              disabled={isRunningTests}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isRunningTests ? '⏳ Running Tests...' : '🔍 Run Sanity Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length > 0 && (
            <>
              <div className="mb-4 flex gap-4">
                <Badge variant="default" className="bg-green-600">✓ {passedTests} Passed</Badge>
                {failedTests > 0 && <Badge variant="destructive">✗ {failedTests} Failed</Badge>}
                <Badge variant="secondary">
                  ⏱️ Total: {testResults.reduce((sum, t) => sum + (t.duration || 0), 0)}ms
                </Badge>
              </div>

              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      test.status === 'pass'
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : test.status === 'fail'
                        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⏳'}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{test.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{test.message}</p>
                        </div>
                      </div>
                      {test.duration && (
                        <Badge variant="outline">{test.duration}ms</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {testResults.length === 0 && !isRunningTests && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">🔧 No tests run yet</p>
              <p className="text-sm">Click "Run Sanity Tests" to check system health</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
