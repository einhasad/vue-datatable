/**
 * Mock GitHub Repository Data Generator
 * Generates realistic-looking repository data for testing purposes
 */

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', null]
const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', null]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPick<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

function randomDate(): string {
  const now = new Date()
  const pastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  const timestamp = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime())
  return new Date(timestamp).toISOString()
}

// Fixed list of 43 repositories for consistent test results
// First 23 repos contain "vue" and "table" in name/owner to match default search "vue table"
// Remaining 20 repos do NOT contain "vue table" - only shown when search is cleared
// 4 repos contain "react" and "datatable" for search test
// Repos are ordered by stars (descending) for consistent test results
const FIXED_REPOS = [
  // Repos matching "vue table" search (23 total)
  { owner: 'einhasad', name: 'vue-datatable', stars: 100000 },
  { owner: 'tanstack', name: 'vue-table', stars: 96000 },
  { owner: 'ag-grid', name: 'vue-grid-table', stars: 92000 },
  { owner: 'handsontable', name: 'vue-table-handsontable', stars: 88000 },
  { owner: 'datatables', name: 'vue-table-datatables', stars: 84000 },
  { owner: 'primevue', name: 'vue-table-primevue', stars: 80000 },
  { owner: 'shadcn-ui', name: 'vue-table-ui', stars: 76000 },
  { owner: 'radix-ui', name: 'vue-table-primitives', stars: 72000 },
  { owner: 'headlessui', name: 'vue-table-headlessui', stars: 68000 },
  { owner: 'floating-ui', name: 'vue-table-floating-ui', stars: 64000 },
  { owner: 'react-hook-form', name: 'vue-table-hook-form', stars: 60000 },
  { owner: 'formik', name: 'vue-table-formik', stars: 56000 },
  { owner: 'vuelidate', name: 'vue-table-vuelidate', stars: 52000 },
  { owner: 'react-query', name: 'vue-table-query', stars: 48000 },
  { owner: 'swr-vercel', name: 'vue-table-swr', stars: 44000 },
  { owner: 'reduxjs', name: 'vue-table-redux', stars: 40000 },
  { owner: 'mobxjs', name: 'vue-table-mobx', stars: 36000 },
  { owner: 'vuex', name: 'vue-table-vuex', stars: 32000 },
  { owner: 'pinia', name: 'vue-table-pinia', stars: 28000 },
  { owner: 'vuejs', name: 'vue-table-core', stars: 24000 },
  { owner: 'database', name: 'vue-database-table', stars: 20000 },
  { owner: 'vue', name: 'router-table', stars: 16000 },
  { owner: 'vue', name: 'test-utils-table', stars: 12000 },
  // Repos matching "react datatable" search (4 total)
  { owner: 'facebook', name: 'react-datatable', stars: 95000 },
  { owner: 'reactjs', name: 'react-datatable-core', stars: 90000 },
  { owner: 'tanstack', name: 'react-datatable-table', stars: 85000 },
  { owner: 'mbrn', name: 'react-datatable-material', stars: 80000 },
  // Additional repos (only shown when search is cleared - 16 more to reach 43 total)
  { owner: 'angular', name: 'angular-material', stars: 75000 },
  { owner: 'microsoft', name: 'fluentui', stars: 70000 },
  { owner: 'tailwindlabs', name: 'tailwindcss', stars: 65000 },
  { owner: 'vercel', name: 'next.js', stars: 60000 },
  { owner: 'sveltejs', name: 'svelte', stars: 55000 },
  { owner: 'solidjs', name: 'solid', stars: 50000 },
  { owner: 'preactjs', name: 'preact', stars: 45000 },
  { owner: 'alpinejs', name: 'alpine', stars: 40000 },
  { owner: 'htmx', name: 'htmx', stars: 35000 },
  { owner: 'stimulus', name: 'stimulus', stars: 30000 },
  { owner: 'turbo', name: 'turbo', stars: 25000 },
  { owner: 'hotwired', name: 'turbo-rails', stars: 20000 },
  { owner: 'livewire', name: 'livewire', stars: 18000 },
  { owner: 'inertiajs', name: 'inertia', stars: 16000 },
  { owner: 'adonisjs', name: 'adonis', stars: 14000 },
  { owner: 'nestjs', name: 'nest', stars: 11000 },
]

const DESCRIPTIONS = [
  'A vue table component for building user interfaces',
  'The Progressive Vue Table Framework',
  'A modern vue table framework for building fast applications',
  'Cybernetically enhanced vue table apps',
  'A powerful, fast, and lightweight vue table tool',
  'Next generation vue table tooling',
  'Modern vue table database access for TypeScript & Node.js',
  'A Node.js vue table web application framework',
  'Delightful Vue Table Testing',
  'Fast, easy and reliable vue table testing',
  'End-to-end vue table testing framework',
  'Beautiful, fast and modern vue table UI library',
  'A utility-first vue table CSS framework',
  'Type-safe vue table GraphQL client for TypeScript',
  'Blazing fast, instant vue table search and analytics',
  'The most popular vue table database for modern apps',
  'Open source headless vue table CMS',
  'Build vue table forms in React, without the tears',
  'Performant, flexible and extensible vue table forms library',
  'Simple and complete vue table routing solution',
  'Vue table state management made simple',
  'Predictable vue table state container',
  'A lightweight vue table state management library',
  'Vue table data fetching library for React',
  null
]

function generateRepository(template: { owner: string; name: string; stars?: number }, index: number) {
  const id = index + 1
  // Use provided stars from template, or calculate deterministically
  const stars = template.stars ?? (100000 - (index * 4000))
  const forks = Math.floor(stars * 0.2)
  const watchers = Math.floor(stars * 0.1)
  const issues = Math.floor(stars / 1000)
  const language = randomPick(LANGUAGES)
  const license = randomPick(LICENSES)

  // Generate description based on repo type (first 23 are vue table repos)
  let description: string | null
  if (index < 23) {
    // Vue table repos - description contains "vue table"
    description = randomPick(DESCRIPTIONS.filter(d => d && d.includes('vue table')))
  } else if (index < 27) {
    // React datatable repos - description contains "react" and "datatable"
    description = `A powerful ${template.name} library for React applications`
  } else {
    // Other repos - no "vue table" or "react datatable" in description
    description = `A modern ${template.name} library for building applications`
  }

  return {
    id,
    node_id: `MDEwOlJlcG9zaXRvcnk${id}`,
    name: template.name,
    full_name: `${template.owner}/${template.name}`,
    owner: {
      login: template.owner,
      id: randomInt(1000, 99999),
      node_id: `MDQ6VXNlcjEyMzQ1Njc4${id}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${randomInt(1000, 99999)}?v=4`,
      gravatar_id: '',
      url: `https://api.github.com/users/${template.owner}`,
      html_url: `https://github.com/${template.owner}`,
      type: 'User',
      site_admin: false
    },
    private: false,
    html_url: `https://github.com/${template.owner}/${template.name}`,
    description,
    fork: randomInt(0, 10) < 2,
    url: `https://api.github.com/repos/${template.owner}/${template.name}`,
    created_at: randomDate(),
    updated_at: randomDate(),
    pushed_at: randomDate(),
    homepage: randomInt(0, 10) < 5 ? `https://${template.name}.dev` : null,
    size: randomInt(100, 50000),
    stargazers_count: stars,
    watchers_count: watchers,
    language,
    forks_count: forks,
    open_issues_count: issues,
    master_branch: 'main',
    default_branch: 'main',
    score: Math.random(),
    archived: false,
    disabled: false,
    license: license ? {
      key: license.toLowerCase(),
      name: license,
      url: `https://api.github.com/licenses/${license.toLowerCase()}`,
      spdx_id: license,
      node_id: `MDc6TGljZW5zZTEz${id}`
    } : null,
    topics: [],
    visibility: 'public',
    forks,
    open_issues: issues,
    watchers,
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: randomInt(0, 10) < 3,
    has_discussions: randomInt(0, 10) < 2
  }
}

export function generateMockRepositories() {
  return FIXED_REPOS.map((template, index) => generateRepository(template, index))
}
