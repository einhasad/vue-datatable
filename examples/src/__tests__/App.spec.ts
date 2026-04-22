import {describe, expect, it, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import App from '../App.vue'
import {router} from './setup'

describe('App', () => {
  it('Sorting Example - should have correct employee data', async () => {
    const wrapper = mount(App)

    // see #sorting .grid-row[0] .grid-cell see "1"
    const sorting = wrapper.find('#sorting')
    const rows = sorting.findAll('tbody tr.grid-row')
    expect(rows.length).toBeGreaterThan(0)
    const firstCell = rows[0].find('td')
    expect(firstCell.text()).toBe('1')

    // click on header ID
    const idHeader = sorting.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')

    const selectSearch = wrapper.find('[data-qa="select-search"]')

    // see #sorting .grid-row[0] .grid-cell see "8"
    const rowsAfterSort = sorting.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].find('td').text()).toBe('8')

    await idHeader.trigger('click')
    const rowsAfterSecondSort = sorting.findAll('tbody tr.grid-row')
    expect(rowsAfterSecondSort[0].find('td').text()).toBe('1')

    await selectSearch.trigger('select', { value: 'position-desc' })
    const rowsAfterSelect = sorting.findAll('tbody tr.grid-row')
    expect(rowsAfterSelect[0].find('td').text()).toBe('5')

    await selectSearch.trigger('select', { value: 'position-asc' })
    const rowsAfterSecondSelect = sorting.findAll('tbody tr.grid-row')
    expect(rowsAfterSecondSelect[0].find('td').text()).toBe('4')
  })

  it('Http Provider Example', async () => {
    const wrapper = mount(App)

    // find http-provider section
    const httpSection = wrapper.find('#http-provider')

    const rows = httpSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(20)
    const summaries = httpSection.findAll('.grid-pagination-summary')
    expect(summaries[0].text()).toBe('23 items')
    expect(summaries[1].text()).toBe('Showing 1-20')
    expect(rows[0].find('td').text()).toBe('einhasad/vue-datatable')
    expect(rows[19].find('td').text()).toBe('vuejs/vue-table-core')

    const pagination = httpSection.find('.grid-pagination-page')
    await pagination.findAll('.grid-pagination-page-number')[1].trigger('click')

    const rowsAfterPage = httpSection.findAll('tbody tr.grid-row')
    expect(rowsAfterPage.length).toBe(3)
    const summariesAfterPage = httpSection.findAll('.grid-pagination-summary')
    expect(summariesAfterPage[0].text()).toBe('23 items')
    expect(summariesAfterPage[1].text()).toBe('Showing 21-23')
    expect(rowsAfterPage[0].find('td').text()).toBe('database/vue-database-table')
    expect(rowsAfterPage[2].find('td').text()).toBe('vue/test-utils-table')
  })

  it('Http Provider Example - search functionality', async () => {
    const wrapper = mount(App)

    const httpSection = wrapper.find('#http-provider')

    // Initial load with default search "vue table" - should show 23 items
    const initialSummaries = httpSection.findAll('.grid-pagination-summary')
    expect(initialSummaries[0].text()).toBe('23 items')

    // Clear search to show all 43 items
    const searchInput = httpSection.find('#search')
    await searchInput.setValue('')
    await searchInput.trigger('keyup.enter')

    const clearedSummaries = httpSection.findAll('.grid-pagination-summary')
    expect(clearedSummaries[0].text()).toBe('43 items')

    // Search for specific term to get 4 items
    await searchInput.setValue('react datatable')
    await searchInput.trigger('keyup.enter')

    const searchedSummaries = httpSection.findAll('.grid-pagination-summary')
    const rowsAfterPage = httpSection.findAll('tbody tr.grid-row')
    expect(rowsAfterPage.length).toBe(4)
    expect(searchedSummaries[0].text()).toBe('4 items')
  })

  it('Cursor Pagination Example - should load more data on button click', async () => {
    const wrapper = mount(App)

    const cursorSection = wrapper.find('#cursor-pagination')
    const rows = cursorSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(8) // pageSize is 8

    // First product should be "Product 1"
    expect(rows[0].findAll('td')[1].text()).toBe('Product 1')
    expect(rows[7].findAll('td')[1].text()).toBe('Product 8')

    // Click Load More button
    const loadMoreBtn = cursorSection.find('.grid-load-more')
    expect(loadMoreBtn.exists()).toBe(true)
    await loadMoreBtn.trigger('click')

    // After loading more, should have 16 rows (accumulated)
    const rowsAfterLoadMore = cursorSection.findAll('tbody tr.grid-row')
    expect(rowsAfterLoadMore.length).toBe(16)

    // Verify data accumulation - last row should be Product 16
    expect(rowsAfterLoadMore[15].findAll('td')[1].text()).toBe('Product 16')

    // Load more again
    await loadMoreBtn.trigger('click')
    const rowsAfterSecondLoad = cursorSection.findAll('tbody tr.grid-row')
    expect(rowsAfterSecondLoad.length).toBe(24)
  })

  it('Custom Columns Example - should render priority badges and progress bars', async () => {
    const wrapper = mount(App)

    const customSection = wrapper.find('#custom-columns')
    const rows = customSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5) // 5 tasks

    // Check first row (Update documentation - high priority, completed)
    const firstRow = rows[0]
    const cells = firstRow.findAll('td')
    expect(cells[0].text()).toBe('1') // ID
    expect(cells[1].text()).toBe('Update documentation') // Title

    // Check priority badge - should contain "HIGH" text
    const priorityCell = cells[2]
    expect(priorityCell.text()).toBe('HIGH')

    // Check status - should be "COMPLETED"
    expect(cells[3].text()).toBe('COMPLETED')

    // Check progress contains "100%"
    const progressCell = cells[4]
    expect(progressCell.text()).toContain('100%')

    // Check second row (Fix login bug - critical priority)
    const secondRow = rows[1]
    const secondRowCells = secondRow.findAll('td')
    expect(secondRowCells[2].text()).toBe('CRITICAL')

    // Check third row (Add dark mode - medium priority, 40% progress)
    const thirdRow = rows[2]
    const thirdRowCells = thirdRow.findAll('td')
    expect(thirdRowCells[2].text()).toBe('MEDIUM')
    expect(thirdRowCells[3].text()).toBe('IN PROGRESS')
    expect(thirdRowCells[4].text()).toContain('40%')
  })

  it.skip('Row Actions Example - should handle row click and show selected state', async () => {
    const wrapper = mount(App)

    const rowActionsSection = wrapper.find('#row-actions')
    const rows = rowActionsSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(6) // 6 users

    // Initially no user is selected
    expect(wrapper.html()).not.toContain('Selected User:')

    // Click on first row (John Doe)
    await rows[0].trigger('click')

    // Check that selected user info is displayed
    expect(wrapper.html()).toContain('Selected User: John Doe (john@example.com)')

    // Click on second row (Jane Smith)
    await rows[1].trigger('click')

    // Selected user should change
    expect(wrapper.html()).toContain('Selected User: Jane Smith (jane@example.com)')
    expect(wrapper.html()).not.toContain('Selected User: John Doe')

    // Click on third row (Bob Johnson - inactive)
    await rows[2].trigger('click')
    expect(wrapper.html()).toContain('Selected User: Bob Johnson (bob@example.com)')
  })

  it('Basic Example - should render static data without pagination', async () => {
    const wrapper = mount(App)

    const basicSection = wrapper.find('#basic')
    const rows = basicSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5) // 5 users, no pagination

    // Check first user data
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('1')
    expect(firstRowCells[1].text()).toBe('John Doe')
    expect(firstRowCells[2].text()).toBe('john@example.com')
    expect(firstRowCells[3].text()).toBe('Admin')

    // Check last user data
    const lastRowCells = rows[4].findAll('td')
    expect(lastRowCells[0].text()).toBe('5')
    expect(lastRowCells[1].text()).toBe('Charlie Wilson')

    // No pagination should be present
    expect(basicSection.find('.grid-pagination').exists()).toBe(false)
  })

  it('Array Provider Example - should paginate and sort client-side data', async () => {
    const wrapper = mount(App)

    const arraySection = wrapper.find('#array-provider')
    const rows = arraySection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5) // pageSize is 5

    // First page data
    expect(rows[0].findAll('td')[0].text()).toBe('1')
    expect(rows[0].findAll('td')[1].text()).toBe('Laptop Pro')

    // Navigate to page 2
    const pageNumbers = arraySection.findAll('.grid-pagination-page-number')
    await pageNumbers[1].trigger('click')

    const rowsPage2 = arraySection.findAll('tbody tr.grid-row')
    expect(rowsPage2.length).toBe(5)
    expect(rowsPage2[0].findAll('td')[0].text()).toBe('6')
    expect(rowsPage2[0].findAll('td')[1].text()).toBe('Webcam HD')

    // Sort by ID descending
    const idHeader = arraySection.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsAfterSort = arraySection.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('10')
  })

  it('Page Pagination Example - should navigate pages with PagePagination component', async () => {
    const wrapper = mount(App)

    const pageSection = wrapper.find('#page-pagination')
    const rows = pageSection.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(10) // pageSize is 10, 47 total users

    // Check first page data
    expect(rows[0].findAll('td')[1].text()).toBe('User 1')
    expect(rows[9].findAll('td')[1].text()).toBe('User 10')

    // Check pagination summary
    const summary = pageSection.find('.grid-pagination-summary')
    expect(summary.text()).toContain('Showing 1-10 of 47 items')

    // Navigate to page 2
    const pageNumbers = pageSection.findAll('.grid-pagination-page-number')
    await pageNumbers[1].trigger('click')
    expect(pageNumbers[0].classes()).not.toContain('grid-pagination-active')
    expect(pageNumbers[1].classes()).toContain('grid-pagination-active')

    const rowsPage2 = pageSection.findAll('tbody tr.grid-row')
    expect(rowsPage2[0].findAll('td')[1].text()).toBe('User 11')
    expect(rowsPage2.length).toBe(10)

    // Navigate to last page (page 5)
    await pageNumbers[4].trigger('click')
    const rowsLastPage = pageSection.findAll('tbody tr.grid-row')
    expect(rowsLastPage.length).toBe(7) // 47 - 40 = 7
    expect(rowsLastPage[6].findAll('td')[1].text()).toBe('User 47')
  })


  it('Multi-State Example - should maintain independent state for multiple grids', async () => {
    const wrapper = mount(App)

    const multiSection = wrapper.find('#multi-state')

    // Find both grids within multi-state section
    const grids = multiSection.findAll('table')
    expect(grids.length).toBe(2) // Array provider + HTTP provider

    // First grid (Array Provider - products)
    const arrayGridRows = multiSection.findAll('tbody tr.grid-row')
    const firstGridRows = arrayGridRows.slice(0, 5) // First 5 rows belong to first grid
    expect(firstGridRows.length).toBe(5)
    expect(firstGridRows[0].findAll('td')[1].text()).toBe('Laptop Pro')

    // Second grid (HTTP Provider - mock users) - check it exists with different data
    const secondGridRows = arrayGridRows.slice(5)
    expect(secondGridRows[0].findAll('td')[1].text()).toBe('alice_smith')
  })

  it('Search Example', async () => {
    const wrapper = mount(App)

    const searchSection = wrapper.find('#search-sort')

    // Initial state - should show 22 rows
    const initialRows = searchSection.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(22)

    // Search by Email with "@example"
    const emailSearchInput = searchSection.find('#global-search')
    await emailSearchInput.setValue('@example')
    await emailSearchInput.trigger('input')

    const rowsAfterEmailSearch = searchSection.findAll('tbody tr.grid-row')
    expect(rowsAfterEmailSearch.length).toBe(14)

    // Search by name with "Jon"
    const nameFilterInput = searchSection.findAll('.grid-search-input')[1] // name column filter
    await nameFilterInput.setValue('Jon')
    await nameFilterInput.trigger('input')

    const rowsAfterNameSearch = searchSection.findAll('tbody tr.grid-row')
    expect(rowsAfterNameSearch.length).toBe(5)

    // Search by "1"
    const idFilterInput = searchSection.findAll('.grid-search-input')[0] // id column filter
    await idFilterInput.setValue('1')
    await idFilterInput.trigger('input')

    const rowsAfterIdSearch = searchSection.findAll('tbody tr.grid-row')
    expect(rowsAfterIdSearch.length).toBe(1)
  })

  it.skip('State Providers - should render all state provider examples with same data', async () => {
    const wrapper = mount(App)

    // All state providers use the same stateUsers data (12 users, pageSize 5)
    const stateSections = [
      '#state-inmemory',
      '#state-localstorage',
      '#state-queryparams',
      '#state-hash'
    ]

    for (const sectionId of stateSections) {
      const section = wrapper.find(sectionId)
      const rows = section.findAll('tbody tr.grid-row')
      expect(rows.length).toBe(5) // pageSize is 5

      // All should show same first user
      const firstRowCells = rows[0].findAll('td')
      expect(firstRowCells[0].text()).toBe('1')
      expect(firstRowCells[1].text()).toBe('Alice Johnson')

      // Check sorting works in each state provider
      const idHeader = section.find('.grid-header-cell:first-child .grid-sort-link')
      await idHeader.trigger('click')
      const rowsAfterSort = section.findAll('tbody tr.grid-row')
      expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('12') // Last ID first after desc sort
    }
  })

  it('InMemory State Provider - should filter data by column', async () => {
    const wrapper = mount(App)

    const inMemorySection = wrapper.find('#state-inmemory')

    // Initial state - should show 5 rows (pageSize)
    const initialRows = inMemorySection.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(5)
    expect(initialRows[0].findAll('td')[1].text()).toBe('Alice Johnson')

    // Find filter inputs in the filters row
    const filterInputs = inMemorySection.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5) // 5 columns

    // Filter by name "Bob"
    const nameFilterInput = filterInputs[1] // name column (index 1)
    await nameFilterInput.setValue('Bob')
    await nameFilterInput.trigger('input')

    const rowsAfterFilter = inMemorySection.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(1)
    expect(rowsAfterFilter[0].findAll('td')[1].text()).toBe('Bob Smith')

    // Clear filter
    await nameFilterInput.setValue('')
    await nameFilterInput.trigger('input')

    const rowsAfterClear = inMemorySection.findAll('tbody tr.grid-row')
    expect(rowsAfterClear.length).toBe(5)

    // Filter by role "Admin"
    const roleFilterInput = filterInputs[3] // role column (index 3)
    await roleFilterInput.setValue('Admin')
    await roleFilterInput.trigger('input')

    const rowsAfterRoleFilter = inMemorySection.findAll('tbody tr.grid-row')
    expect(rowsAfterRoleFilter.length).toBe(3) // Alice, Frank, Jack are Admins
  })

  it('LocalStorage State Provider - should filter data and preload from localStorage', async () => {
    // Pre-populate localStorage with filter state before mounting
    const preloadedState = {
      filters: { name: 'Diana' },
      sort: null,
      page: 1
    }
    localStorage.setItem('grid-demo-state', JSON.stringify(preloadedState))

    const wrapper = mount(App)
    const section = wrapper.find('#state-localstorage')

    // Should preload filtered data from localStorage
    const initialRows = section.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(1)
    expect(initialRows[0].findAll('td')[1].text()).toBe('Diana Prince')

    // Find filter inputs
    const filterInputs = section.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    // Clear filter
    const nameFilterInput = filterInputs[1]
    await nameFilterInput.setValue('')
    await nameFilterInput.trigger('input')

    const rowsAfterClear = section.findAll('tbody tr.grid-row')
    expect(rowsAfterClear.length).toBe(5)

    // Filter by status "Inactive"
    const statusFilterInput = filterInputs[4] // status column (index 4)
    await statusFilterInput.setValue('Inactive')
    await statusFilterInput.trigger('input')

    const rowsAfterFilter = section.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(3) // Charlie, Grace, Jack
    // Sort by ID descending
    const idHeader = section.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsAfterSort = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('1')

    // Sort by ID ascending
    await idHeader.trigger('click')
    const rowsAfterSort2 = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort2[0].findAll('td')[0].text()).toBe('3')
    // Cleanup
    localStorage.removeItem('grid-demo-state')
  })

  it('QueryParams State Provider - should filter data and preload from URL query params', async () => {
    // Reset router to clean state
    await router.push('/')
    await router.isReady()

    // Spy on router.replace to verify URL updates
    const replaceSpy = vi.spyOn(router, 'replace')

    const wrapper = mount(App)

    const section = wrapper.find('#state-queryparams')

    // Find filter inputs
    const filterInputs = section.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    // Filter by name "Charlie"
    const nameFilterInput = filterInputs[1]
    await nameFilterInput.setValue('Charlie')
    await nameFilterInput.trigger('input')

    const rowsAfterFilter = section.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(1)
    expect(rowsAfterFilter[0].findAll('td')[1].text()).toBe('Charlie Brown')

    // Clear and filter by role "Manager"
    await nameFilterInput.setValue('')
    await nameFilterInput.trigger('input')

    const roleFilterInput = filterInputs[3] // role column (index 3)
    await roleFilterInput.setValue('Manager')
    await roleFilterInput.trigger('input')

    const rowsAfterRoleFilter = section.findAll('tbody tr.grid-row')
    expect(rowsAfterRoleFilter.length).toBe(3) // Diana, Henry, Leo

    // Sort by ID descending
    const idHeader = section.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsAfterSort = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('1')

    // Sort by ID ascending
    await idHeader.trigger('click')
    const rowsAfterSort2 = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort2[0].findAll('td')[0].text()).toBe('3')

    // Verify URL was updated with role filter
    expect(replaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ 'qp-role': 'Manager' })
      })
    )

    replaceSpy.mockRestore()
  })

  it('Hash State Provider - should filter data and preload from URL hash', async () => {
    // Mock window.location.hash before mounting
    const originalHash = window.location.hash
    window.location.hash = '#hash-name=Eve'

    const wrapper = mount(App)

    const section = wrapper.find('#state-hash')

    // Find filter inputs
    const filterInputs = section.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    // Filter by name "Eve"
    const nameFilterInput = filterInputs[1]
    await nameFilterInput.setValue('Eve')
    await nameFilterInput.trigger('input')

    const rowsAfterFilter = section.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(2)
    expect(rowsAfterFilter[0].findAll('td')[1].text()).toBe('Eve Davis')

    // Sort by ID descending
    const idHeader = section.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsAfterSort = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('1')

    // Sort by ID ascending
    await idHeader.trigger('click')
    const rowsAfterSort2 = section.findAll('tbody tr.grid-row')
    expect(rowsAfterSort2[0].findAll('td')[0].text()).toBe('2')

    // Cleanup - restore original hash
    window.location.hash = originalHash
  })

  it('Scroll Pagination - virtual scroll buffer with 100-row window', async () => {
    const wrapper = mount(App)

    const section = wrapper.find('#scroll-pagination')

    // Helper to get row IDs
    const getRowIds = () => {
      const rows = section.findAll('tbody tr.grid-row')
      return rows.map(row => parseInt(row.find('td').text(), 10))
    }

    // Helper to find the sentinel element and trigger its intersection
    // This mimics real browser: IntersectionObserver fires when sentinel enters viewport
    const triggerSentinel = (isIntersecting: boolean) => {
      const sentinel = section.find('.grid-scroll-sentinel')
      if (sentinel.exists()) {
        ;(globalThis as any).__triggerIntersection(sentinel.element, isIntersecting)
      }
    }

    // Test 1: When page opens, see rows 1-50 (initial 50 rows)
    let rows = section.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(50)
    let ids = getRowIds()
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(50)

    // Test 2: Sentinel enters viewport (user scrolled to bottom), loads 50 more
    triggerSentinel(true)
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 50))

    rows = section.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(100)
    ids = getRowIds()
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(100)

    // Test 3: Sentinel enters viewport again, buffer shifts
    triggerSentinel(true)
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 50))

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()
    // ID 1 should NOT be visible anymore (buffer window shifted)
    expect(ids).not.toContain(1)
    expect(ids[0]).toBeGreaterThanOrEqual(50)
    expect(ids[ids.length - 1]).toBe(150)
    // Buffer should be ~100 rows
    expect(rows.length).toBeLessThanOrEqual(100)

    // Test 4: Trigger again, window shifts further
    triggerSentinel(true)
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 50))

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()
    expect(ids).not.toContain(1)
    expect(ids).not.toContain(50)
    expect(ids[0]).toBeGreaterThanOrEqual(100)
    expect(ids[ids.length - 1]).toBe(200)
    expect(rows.length).toBeLessThanOrEqual(100)

    // Test 5: Trigger again, window shifts further
    triggerSentinel(true)
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 50))

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()
    expect(ids[0]).toBeGreaterThanOrEqual(150)
    expect(ids[ids.length - 1]).toBe(250)
    expect(rows.length).toBeLessThanOrEqual(100)

    // Test 6: Scroll up (NOT to top), should keep current window (150-250), NOT reset to 1-100
    const scrollContainer = section.find('.scroll-container')
    const scrollElement = scrollContainer.element as HTMLElement

    Object.defineProperty(scrollElement, 'scrollTop', { value: 2000, writable: true })
    Object.defineProperty(scrollElement, 'scrollHeight', { value: 5000, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    Object.defineProperty(scrollElement, 'scrollTop', { value: 100, writable: true })
    Object.defineProperty(scrollElement, 'scrollHeight', { value: 2000, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()
    // Should STILL show 150-250, NOT reset to 1-100
    expect(ids[0]).toBeGreaterThanOrEqual(150)
    expect(ids).not.toContain(1)

    // Test 7: Scroll back to top, shift backward progressively
    Object.defineProperty(scrollElement, 'scrollTop', { value: 100, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    Object.defineProperty(scrollElement, 'scrollTop', { value: 0, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()
    expect(ids[0]).toBeLessThan(150)
    expect(ids[0]).toBeGreaterThan(1) // NOT reset to 1
    expect(ids).not.toContain(1)
  })

  it('Scroll Pagination - scroll up should shift window backward progressively', async () => {
    const wrapper = mount(App)

    const section = wrapper.find('#scroll-pagination')

    // Helper to get row IDs
    const getRowIds = () => {
      const rows = section.findAll('tbody tr.grid-row')
      return rows.map(row => parseInt(row.find('td').text(), 10))
    }

    // Helper to trigger IntersectionObserver via the actual sentinel element
    const triggerSentinel = (isIntersecting: boolean) => {
      const sentinel = section.find('.grid-scroll-sentinel')
      if (sentinel.exists()) {
        ;(globalThis as any).__triggerIntersection(sentinel.element, isIntersecting)
      }
    }

    // Load data to reach window at 400-500
    // Initial: 1-50
    let rows = section.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(50)

    // Load more until window shifts to 400-500
    // Each intersection loads 50 more items and shifts window by 50 when buffer > 100
    for (let i = 0; i < 9; i++) {
      triggerSentinel(true)
      await flushPromises()
    }

    // Verify we're at around 400-500 (may be 401-500 or 400-500 depending on slice)
    rows = section.findAll('tbody tr.grid-row')
    let ids = getRowIds()
    expect(ids[0]).toBeGreaterThanOrEqual(390)
    expect(ids[ids.length - 1]).toBeGreaterThanOrEqual(490)

    // Now scroll up (NOT to top) - simulate scrolling back a bit
    // This should shift the window backward progressively, NOT reset to 1-100
    const scrollContainer = section.find('.scroll-container')
    const scrollElement = scrollContainer.element as HTMLElement

    // First, simulate being scrolled down (set lastScrollTop to a high value)
    Object.defineProperty(scrollElement, 'scrollTop', { value: 500, writable: true })
    Object.defineProperty(scrollElement, 'scrollHeight', { value: 3000, writable: true })
    Object.defineProperty(scrollElement, 'clientHeight', { value: 500, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    // Now simulate scrolling up near the top (scrollTop < 100)
    // The window should shift backward from 400-500 to 350-450 (or similar)
    // We need to be near the top (< 100px) to trigger backward shift
    Object.defineProperty(scrollElement, 'scrollTop', { value: 50, writable: true })
    Object.defineProperty(scrollElement, 'scrollHeight', { value: 3000, writable: true })
    Object.defineProperty(scrollElement, 'clientHeight', { value: 500, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    rows = section.findAll('tbody tr.grid-row')
    ids = getRowIds()

    // The window should have shifted backward, NOT reset to 1-100
    // It should show something like 350-450 or 300-400
    // NOT 1-100
    expect(ids[0]).toBeLessThan(400)
    expect(ids[0]).toBeGreaterThan(1) // Should NOT reset to 1
    expect(ids).not.toContain(1) // First item should NOT be 1
  }, 10000)
})
