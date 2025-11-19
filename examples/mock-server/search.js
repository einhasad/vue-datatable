/**
 * Mock GitHub Search Logic
 * Implements search, filtering, sorting, and pagination for mock repositories
 */

/**
 * Search repositories by query string
 * Searches in: name, owner, full_name, description, language
 */
function searchRepositories(repositories, query) {
  if (!query || query.trim() === '') {
    return repositories
  }

  const searchTerm = query.toLowerCase().trim()
  const terms = searchTerm.split(/\s+/)

  return repositories.filter(repo => {
    const searchableText = [
      repo.name,
      repo.owner.login,
      repo.full_name,
      repo.description || '',
      repo.language || '',
      ...(repo.topics || [])
    ].join(' ').toLowerCase()

    // All terms must match
    return terms.every(term => searchableText.includes(term))
  })
}

/**
 * Sort repositories by the given field and order
 * Supported fields: stars, forks, updated, help-wanted-issues
 */
function sortRepositories(repositories, sortBy, order = 'desc') {
  const sorted = [...repositories]

  const compareFn = (a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'stars':
        aValue = a.stargazers_count
        bValue = b.stargazers_count
        break
      case 'forks':
        aValue = a.forks_count
        bValue = b.forks_count
        break
      case 'updated':
        aValue = new Date(a.updated_at).getTime()
        bValue = new Date(b.updated_at).getTime()
        break
      case 'help-wanted-issues':
        // Simulate help-wanted issues count (use open_issues as proxy)
        aValue = a.open_issues_count
        bValue = b.open_issues_count
        break
      default:
        // Default to stars
        aValue = a.stargazers_count
        bValue = b.stargazers_count
    }

    if (order === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  }

  return sorted.sort(compareFn)
}

/**
 * Paginate results
 */
function paginateResults(repositories, page = 1, perPage = 30) {
  const pageNum = Math.max(1, parseInt(page, 10))
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(perPage, 10)))

  const startIndex = (pageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return {
    items: repositories.slice(startIndex, endIndex),
    total: repositories.length,
    page: pageNum,
    perPage: itemsPerPage
  }
}

/**
 * Process search request with all filters, sorting, and pagination
 */
function processSearchRequest(allRepositories, params) {
  const {
    q = '',
    sort = 'stars',
    order = 'desc',
    page = 1,
    per_page = 30
  } = params

  // Step 1: Search/Filter
  let results = searchRepositories(allRepositories, q)

  // Step 2: Sort
  results = sortRepositories(results, sort, order)

  // Step 3: Paginate
  const paginated = paginateResults(results, page, per_page)

  return {
    total_count: paginated.total,
    incomplete_results: false,
    items: paginated.items
  }
}

export {
  searchRepositories,
  sortRepositories,
  paginateResults,
  processSearchRequest
}
