export interface Repository {
  id: number
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  updatedAt: string
}

export interface RepositoryQuery {
  search: string
  sortField?: string
  sortOrder: 'asc' | 'desc' | null
  page: number
  perPage: number
}

export interface RepositoryPage {
  items: Repository[]
  total: number
}

const OWNERS = ['acme', 'northwind', 'bluefin', 'gridworks', 'lumen', 'quarry']

const PROJECTS: [name: string, description: string, language: string][] = [
  ['vue-table', 'Headless vue table primitives with sorting and filtering', 'TypeScript'],
  ['vue-table-kit', 'Batteries-included vue table components', 'TypeScript'],
  ['react-datatable', 'Accessible react datatable with virtual rows', 'JavaScript'],
  ['chart-studio', 'Composable charts for dashboards', 'TypeScript'],
  ['form-wizard', 'Multi-step forms with validation', 'JavaScript'],
  ['api-mock', 'Mock HTTP APIs for local development', 'Go'],
  ['cli-tools', 'Small command-line utilities', 'Rust'],
]

const LATENCY_MS = 250
const DAY_MS = 24 * 60 * 60 * 1000
const LAST_UPDATE = Date.UTC(2026, 0, 31)

export const repositories: Repository[] = OWNERS.flatMap((owner, ownerIndex) =>
  PROJECTS.map(([name, description, language], projectIndex) => {
    const id = ownerIndex * PROJECTS.length + projectIndex + 1
    const stars = ((id * 7919) % 48000) + 120
    return {
      id,
      fullName: `${owner}/${name}`,
      description,
      language,
      stars,
      forks: Math.floor(stars / (3 + (id % 5))),
      updatedAt: new Date(LAST_UPDATE - ((id * 37) % 365) * DAY_MS).toISOString().slice(0, 10),
    }
  })
)

const SORT_VALUES: Record<string, (repo: Repository) => number | string> = {
  name: (repo) => repo.fullName,
  stars: (repo) => repo.stars,
  forks: (repo) => repo.forks,
  updated: (repo) => repo.updatedAt,
}

function matches(repo: Repository, terms: string[]): boolean {
  const text = `${repo.fullName} ${repo.description} ${repo.language}`.toLowerCase()
  return terms.every((term) => text.includes(term))
}

function sortRepositories(list: Repository[], field: string | undefined, order: 'asc' | 'desc' | null): Repository[] {
  const valueOf = field ? SORT_VALUES[field] : undefined
  if (!valueOf || !order) return list
  const direction = order === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const left = valueOf(a)
    const right = valueOf(b)
    if (left === right) return a.id - b.id
    return (left < right ? -1 : 1) * direction
  })
}

export async function fetchRepositories(query: RepositoryQuery): Promise<RepositoryPage> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  const terms = query.search.toLowerCase().split(/\s+/).filter(Boolean)
  const found = sortRepositories(repositories.filter((repo) => matches(repo, terms)), query.sortField, query.sortOrder)
  const start = (query.page - 1) * query.perPage
  return { items: found.slice(start, start + query.perPage), total: found.length }
}
