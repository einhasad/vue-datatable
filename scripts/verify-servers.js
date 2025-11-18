#!/usr/bin/env node

/**
 * Verify that all required servers can start and respond to health checks
 * Run this before playwright tests to diagnose server issues
 */

async function checkEndpoint(url, name, maxRetries = 30) {
  console.log(`\n[Verify] Checking ${name}...`)
  console.log(`[Verify] URL: ${url}`)

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        console.log(`[Verify] ✓ ${name} is responding (${response.status})`)
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          console.log(`[Verify] Response data:`, JSON.stringify(data, null, 2))
        }
        return true
      } else {
        console.log(`[Verify] ✗ ${name} returned ${response.status}`)
        const text = await response.text()
        console.log(`[Verify] Response:`, text.substring(0, 200))
      }
    } catch (error) {
      if (i === 0) {
        console.log(`[Verify] Waiting for ${name} to start... (attempt ${i + 1}/${maxRetries})`)
      }
      if (i === maxRetries - 1) {
        console.error(`[Verify] ✗ ${name} failed after ${maxRetries} attempts`)
        console.error(`[Verify] Error:`, error.message)
        return false
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

async function main() {
  console.log('='.repeat(80))
  console.log('[Verify] Server Health Check Diagnostic')
  console.log('='.repeat(80))

  const checks = [
    {
      url: 'http://localhost:3001/api/health',
      name: 'Mock API Server',
    },
    {
      url: 'http://localhost:3000/vue-datatable/',
      name: 'Examples Dev Server',
    }
  ]

  const results = []

  for (const check of checks) {
    const success = await checkEndpoint(check.url, check.name)
    results.push({ ...check, success })
  }

  console.log('\n' + '='.repeat(80))
  console.log('[Verify] Summary:')
  console.log('='.repeat(80))

  let allPassed = true
  for (const result of results) {
    const status = result.success ? '✓ PASS' : '✗ FAIL'
    console.log(`${status} - ${result.name}`)
    if (!result.success) {
      allPassed = false
      console.log(`       URL: ${result.url}`)
      console.log(`       Check if server is running: lsof -i :${new URL(result.url).port}`)
    }
  }

  console.log('='.repeat(80))

  if (!allPassed) {
    console.error('\n[Verify] ✗ Some servers are not responding')
    console.error('[Verify] Make sure all servers are started before running tests')
    process.exit(1)
  } else {
    console.log('\n[Verify] ✓ All servers are responding correctly')
    process.exit(0)
  }
}

main().catch(error => {
  console.error('[Verify] ✗ Unexpected error:', error)
  process.exit(1)
})
